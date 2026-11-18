"""مقارنة عدة موديلات على نفس تقسيم ArASL ونفس صور الاختبار.

يحفظ النتائج الحقيقية (الدقة، Precision، Recall، F1، زمن الاستجابة، الحجم)
في results/ مع رسوم جاهزة للبوستر.

    python benchmark.py                 # كل الموديلات
    python benchmark.py --only cnn svm  # موديلات محددة
"""
import argparse
import json
import os
import time

import numpy as np
import tensorflow as tf
from skimage.feature import hog
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, classification_report, confusion_matrix,
                             precision_recall_fscore_support, top_k_accuracy_score)
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC

import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))  # labels.py في مجلد model
from labels import ARASL_LABELS

SEED = 42
OUT = 'results'

parser = argparse.ArgumentParser()
parser.add_argument('--only', nargs='*')
parser.add_argument('--epochs', type=int, default=25)
args = parser.parse_args()
os.makedirs(OUT, exist_ok=True)
tf.keras.utils.set_random_seed(SEED)

dataset = np.load('data.npz')
x, y = dataset['x'], dataset['y']
classes = list(dataset['classes'])
letters = [ARASL_LABELS[c] for c in classes]

# نفس التقسيم المستخدم في train.py: 80% تدريب و20% اختبار، و10% من التدريب للتحقق
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=SEED, stratify=y)
x_train, x_val, y_train, y_val = train_test_split(
    x_train, y_train, test_size=0.1, random_state=SEED, stratify=y_train)
print(f"train {len(x_train)}  val {len(x_val)}  test {len(x_test)}")


# ---------- موديلات تقليدية على خصائص HOG ----------
def hog_features(images):
    return np.array([hog(im, orientations=9, pixels_per_cell=(8, 8), cells_per_block=(2, 2))
                     for im in images], dtype=np.float32)


def run_classic(name, make):
    t = time.time()
    f_train, f_test = hog_features(x_train), hog_features(x_test)
    clf = make().fit(f_train, y_train)
    train_time = time.time() - t
    if hasattr(clf, 'predict_proba'):
        prob = clf.predict_proba(f_test)
    else:
        prob = clf.decision_function(f_test)
    sample = x_test[:200]
    t = time.time()
    for im in sample:
        clf.predict(hog_features([im]))
    latency = (time.time() - t) / len(sample) * 1000
    import pickle
    size = len(pickle.dumps(clf)) / 1e6
    if hasattr(clf, 'estimators_'):  # الغابة: عدد العقد في كل الأشجار
        params = int(sum(t.tree_.node_count for t in clf.estimators_))
    else:
        params = int(np.size(clf.coef_) + np.size(clf.intercept_))
    return prob, train_time, latency, size, params


# ---------- شبكات عصبية ----------
augment_layers = lambda: [  # noqa: E731
    tf.keras.layers.RandomFlip('horizontal'),
    tf.keras.layers.RandomRotation(0.08),
    tf.keras.layers.RandomZoom(0.1),
    tf.keras.layers.RandomTranslation(0.08, 0.08),
    tf.keras.layers.RandomContrast(0.3),
]


def conv_block(filters):
    return [
        tf.keras.layers.Conv2D(filters, 3, padding='same', use_bias=False),
        tf.keras.layers.BatchNormalization(), tf.keras.layers.ReLU(),
        tf.keras.layers.Conv2D(filters, 3, padding='same', use_bias=False),
        tf.keras.layers.BatchNormalization(), tf.keras.layers.ReLU(),
        tf.keras.layers.MaxPooling2D(),
    ]


def emaa_cnn():
    return tf.keras.Sequential([
        tf.keras.Input((64, 64, 1)), tf.keras.layers.Rescaling(1 / 255), *augment_layers(),
        *conv_block(32), *conv_block(64), *conv_block(128),
        tf.keras.layers.GlobalAveragePooling2D(), tf.keras.layers.Dropout(0.4),
        tf.keras.layers.Dense(len(classes), activation='softmax'),
    ]), None


def mlp():
    return tf.keras.Sequential([
        tf.keras.Input((64, 64, 1)), tf.keras.layers.Rescaling(1 / 255), tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(512, use_bias=False), tf.keras.layers.BatchNormalization(),
        tf.keras.layers.ReLU(), tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(256, use_bias=False), tf.keras.layers.BatchNormalization(),
        tf.keras.layers.ReLU(), tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(len(classes), activation='softmax'),
    ]), None


def transfer(app, preprocess, size=96):
    def build():
        base = app(include_top=False, weights='imagenet', input_shape=(size, size, 3))
        inp = tf.keras.Input((64, 64, 1))
        h = tf.keras.layers.Resizing(size, size)(inp)
        h = tf.keras.layers.Concatenate()([h, h, h])
        for layer in augment_layers():
            h = layer(h)
        h = tf.keras.layers.Lambda(preprocess)(h)
        h = base(h)
        h = tf.keras.layers.GlobalAveragePooling2D()(h)
        h = tf.keras.layers.Dropout(0.3)(h)
        out = tf.keras.layers.Dense(len(classes), activation='softmax')(h)
        return tf.keras.Model(inp, out), base
    return build


def run_keras(name, build):
    model, base = build()
    cbs = [tf.keras.callbacks.ReduceLROnPlateau(patience=2, factor=0.5),
           tf.keras.callbacks.EarlyStopping(patience=4, restore_best_weights=True)]
    t = time.time()
    if base is not None:
        # المرحلة الأولى: تدريب الرأس فقط، ثم فك تجميد الشبكة كاملة بمعدل تعلم صغير
        base.trainable = False
        model.compile(optimizer=tf.keras.optimizers.Adam(1e-3), loss='sparse_categorical_crossentropy', metrics=['accuracy'])
        model.fit(x_train[..., None], y_train, validation_data=(x_val[..., None], y_val),
                  epochs=3, batch_size=128, verbose=2)
        base.trainable = True
        model.compile(optimizer=tf.keras.optimizers.Adam(1e-4), loss='sparse_categorical_crossentropy', metrics=['accuracy'])
        epochs = max(args.epochs // 2, 4)
    else:
        model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
        epochs = args.epochs
    model.fit(x_train[..., None], y_train, validation_data=(x_val[..., None], y_val),
              epochs=epochs, batch_size=128, callbacks=cbs, verbose=2)
    train_time = time.time() - t
    prob = model.predict(x_test[..., None], batch_size=256, verbose=0)
    one = x_test[:1, ..., None].astype(np.float32)
    fn = tf.function(lambda a: model(a, training=False))
    for _ in range(10):
        fn(one)
    t = time.time()
    for i in range(200):
        fn(x_test[i:i + 1, ..., None].astype(np.float32))
    latency = (time.time() - t) / 200 * 1000
    path = f'{OUT}/{name}.keras'
    model.save(path)
    return prob, train_time, latency, os.path.getsize(path) / 1e6, model.count_params()


MODELS = {
    'svm': ('HOG + Linear SVM', lambda: run_classic('svm', lambda: LinearSVC(C=0.5, max_iter=5000))),
    'rf': ('HOG + Random Forest', lambda: run_classic(
        'rf', lambda: RandomForestClassifier(300, n_jobs=-1, random_state=SEED))),
    'mlp': ('MLP', lambda: run_keras('mlp', mlp)),
    'cnn': ('EMAA CNN (ours)', lambda: run_keras('cnn', emaa_cnn)),
    'mobilenet': ('MobileNetV2 (transfer)', lambda: run_keras('mobilenet', transfer(
        tf.keras.applications.MobileNetV2, tf.keras.applications.mobilenet_v2.preprocess_input))),
    'efficientnet': ('EfficientNetB0 (transfer)', lambda: run_keras('efficientnet', transfer(
        tf.keras.applications.EfficientNetB0, lambda a: a))),
}

summary_path = f'{OUT}/summary.json'
summary = json.load(open(summary_path)) if os.path.exists(summary_path) else {}
for key in args.only or MODELS:
    title, run = MODELS[key]
    print(f"\n===== {title} =====", flush=True)
    prob, train_time, latency, size, params = run()
    pred = prob.argmax(1)
    p, r, f1, _ = precision_recall_fscore_support(y_test, pred, average='macro', zero_division=0)
    summary[key] = {
        'name': title,
        'accuracy': accuracy_score(y_test, pred),
        'precision_macro': p, 'recall_macro': r, 'f1_macro': f1,
        'top3_accuracy': top_k_accuracy_score(y_test, prob, k=3, labels=range(len(classes))),
        'latency_ms': latency, 'size_mb': size, 'params': int(params),
        'train_time_min': train_time / 60, 'test_images': int(len(y_test)),
    }
    print(json.dumps(summary[key], indent=1), flush=True)
    report = classification_report(y_test, pred, target_names=letters, output_dict=True, zero_division=0)
    json.dump(report, open(f'{OUT}/{key}_report.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    np.save(f'{OUT}/{key}_confusion.npy', confusion_matrix(y_test, pred))
    json.dump(summary, open(summary_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
