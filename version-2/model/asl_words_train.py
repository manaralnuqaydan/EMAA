"""يدرّب موديل كلمات ASL على نقاط ASL Citizen (الناتج من asl_citizen_extract.py).

التقسيم: نستخدم تقسيم ASL Citizen الرسمي (train / val / test) وهو بأشخاص مختلفين،
فالدقة على test هي دقة على أشخاص ما شافهم الموديل أبدًا.
يحفظ:
  asl_words.onnx + asl_words_classes.json         للتشغيل في api.py
  results/asl_words_summary.json                  الأرقام الحقيقية (accuracy, top-5, F1, ...)
  results/asl_words_config.json                   إعدادات التدريب

    python asl_words_train.py --data asl_citizen_landmarks.npz
"""
import argparse
import json
import os
import time

import numpy as np

from asl_words_features import FRAMES, FEATURES, normalize_sequence, mirror_sequence

p = argparse.ArgumentParser()
p.add_argument('--data', default='asl_citizen_landmarks.npz')
p.add_argument('--epochs', type=int, default=120)
p.add_argument('--seed', type=int, default=42)
args = p.parse_args()
os.makedirs('results', exist_ok=True)

import tensorflow as tf  # noqa: E402
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, top_k_accuracy_score  # noqa: E402

d = np.load(args.data)
x = np.stack([normalize_sequence(s.astype(np.float32)) for s in d['x']])
y, split, user, classes = d['y'], d['split'], d['user'], [str(c) for c in d['classes']]
tr, va, te = split == 'train', split == 'val', split == 'test'
overlap = set(user[tr]) & set(user[te])
assert not overlap, f"أشخاص مشتركين بين التدريب والاختبار: {overlap}"
print(f"{len(classes)} كلمة | train {tr.sum()} ({len(set(user[tr]))} شخص) | "
      f"val {va.sum()} ({len(set(user[va]))}) | test {te.sum()} ({len(set(user[te]))})")

tf.keras.utils.set_random_seed(args.seed)


def augment(seq, label):
    # تكبير/تصغير وإزاحة بسيطة، وأحيانًا مرآة (يد يسرى ↔ يمنى) لأن بعض الناس أعسر
    seq = tf.numpy_function(lambda s: mirror_sequence(s) if np.random.rand() < 0.5 else s,
                            [seq], tf.float32)
    seq = tf.reshape(seq, (FRAMES, FEATURES))
    scale = tf.random.uniform([], 0.85, 1.15)
    shift = tf.random.normal([1, FEATURES], 0, 0.03)
    mask = tf.cast(tf.not_equal(seq, 0), tf.float32)  # النقاط الناقصة تبقى صفر
    return (seq * scale + shift) * mask, label


train_ds = (tf.data.Dataset.from_tensor_slices((x[tr], y[tr])).shuffle(4096, seed=args.seed)
            .map(augment, num_parallel_calls=tf.data.AUTOTUNE).batch(64).prefetch(2))


def block(h, filters, k):
    h = tf.keras.layers.Conv1D(filters, k, padding='same', use_bias=False)(h)
    h = tf.keras.layers.BatchNormalization()(h)
    return tf.keras.layers.ReLU()(h)


inp = tf.keras.Input((FRAMES, FEATURES), name='sequence')
h = block(inp, 192, 5)
h = block(h, 192, 5)
h = tf.keras.layers.MaxPooling1D(2)(h)
h = block(h, 256, 3)
h = block(h, 256, 3)
h = tf.keras.layers.Concatenate()([tf.keras.layers.GlobalAveragePooling1D()(h),
                                   tf.keras.layers.GlobalMaxPooling1D()(h)])
h = tf.keras.layers.Dropout(0.4)(h)
out = tf.keras.layers.Dense(len(classes), activation='softmax')(h)
model = tf.keras.Model(inp, out)
model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])
t = time.time()
model.fit(train_ds, validation_data=(x[va], y[va]), epochs=args.epochs, verbose=2,
          callbacks=[tf.keras.callbacks.ReduceLROnPlateau(patience=6, factor=0.5),
                     tf.keras.callbacks.EarlyStopping(patience=15, restore_best_weights=True)])
train_time = time.time() - t

prob = model.predict(x[te], verbose=0)
pred = prob.argmax(1)
pr, rc, f1, _ = precision_recall_fscore_support(y[te], pred, average='macro', zero_division=0)
fn = tf.function(lambda a: model(a, training=False))
t = time.time()
n = min(200, int(te.sum()))
for i in range(n):
    fn(x[te][i:i + 1])
summary = {
    'name': 'Holistic landmarks + 1D-CNN (ours)', 'dataset': 'ASL Citizen (subset)',
    'classes': len(classes), 'test_videos': int(te.sum()), 'test_signers': len(set(user[te])),
    'signer_independent': True,
    'accuracy': accuracy_score(y[te], pred), 'top5_accuracy':
        top_k_accuracy_score(y[te], prob, k=min(5, len(classes)), labels=range(len(classes))),
    'precision_macro': pr, 'recall_macro': rc, 'f1_macro': f1,
    'val_accuracy': float(model.evaluate(x[va], y[va], verbose=0)[1]),
    'latency_ms': (time.time() - t) / max(n, 1) * 1000, 'params': int(model.count_params()),
    'train_time_min': train_time / 60,
}
print(json.dumps(summary, indent=1))
json.dump(summary, open('results/asl_words_summary.json', 'w'), indent=1)
json.dump({'frames': FRAMES, 'features': FEATURES, 'epochs_max': args.epochs, 'seed': args.seed,
           'classes': classes, 'split': 'official ASL Citizen splits (signer-independent)'},
          open('results/asl_words_config.json', 'w'), indent=1)
np.save('results/asl_words_confusion.npy',
        tf.math.confusion_matrix(y[te], pred, num_classes=len(classes)).numpy())

import tf2onnx  # noqa: E402

spec = (tf.TensorSpec((None, FRAMES, FEATURES), tf.float32, name='sequence'),)
tf2onnx.convert.from_function(tf.function(lambda sequence: model(sequence, training=False),
                                          input_signature=spec),
                              input_signature=spec, opset=13, output_path='asl_words.onnx')
json.dump(classes, open('asl_words_classes.json', 'w'))
print('✅ asl_words.onnx, asl_words_classes.json, results/asl_words_summary.json')
