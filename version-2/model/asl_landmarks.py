"""لغة الإشارة الأمريكية (ASL): يطلع نقاط اليد من صور ASL Alphabet ويدرّب عليها.

الموديل يتعلم من 21 نقطة لليد (مو من الصورة)، فما يتأثر بالخلفية ولا الإضاءة
ولا لون البشرة. يحفظ:
  asl_model.onnx + asl_classes.json      للتشغيل في api.py
  results/asl_summary.json               مقارنة الموديلات بأرقام حقيقية
  ../public/data/handshapes_en.json      أشكال اليد للأفاتار

    pip install mediapipe==0.10.14 tensorflow tf2onnx scikit-learn   # Python 3.12 أو أقل
    python asl_landmarks.py --data-dir ./asl_alphabet_train
"""
import argparse
import json
import os
import pickle
import time

import numpy as np

parser = argparse.ArgumentParser()
parser.add_argument('--data-dir', default='./asl_alphabet_train')
parser.add_argument('--per-class', type=int, default=3000)
parser.add_argument('--skip-extract', action='store_true')
args = parser.parse_args()
os.makedirs('results', exist_ok=True)
SEED = 42


def normalize(points):
    # الرسغ في الأصل، والمسافة للمفصل الأوسط = 1، وكلها يد يمنى
    points = points - points[0]
    return points / (np.linalg.norm(points[9]) + 1e-9)


if not args.skip_extract:
    import cv2
    import mediapipe as mp

    hands = mp.solutions.hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.3)
    xs, ys, files_kept = [], [], []
    classes = sorted(d for d in os.listdir(args.data_dir) if os.path.isdir(os.path.join(args.data_dir, d)))
    for label, cls in enumerate(classes):
        folder = os.path.join(args.data_dir, cls)
        names = sorted(os.listdir(folder))[:args.per_class]
        found_count = 0
        for name in names:
            img = cv2.imread(os.path.join(folder, name))
            if img is None:
                continue
            found = hands.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            if not found.multi_hand_world_landmarks:
                continue
            pts = np.array([[p.x, p.y, p.z] for p in found.multi_hand_world_landmarks[0].landmark])
            if found.multi_handedness[0].classification[0].label == 'Left':
                pts[:, 0] *= -1
            xs.append(normalize(pts))
            ys.append(label)
            found_count += 1
        print(f"✅ {cls}: {found_count}/{len(names)}", flush=True)
    np.savez_compressed('asl_landmarks.npz', x=np.array(xs, np.float32), y=np.array(ys), classes=np.array(classes))

import tensorflow as tf  # noqa: E402
from sklearn.ensemble import RandomForestClassifier  # noqa: E402
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, top_k_accuracy_score  # noqa: E402
from sklearn.model_selection import train_test_split  # noqa: E402
from sklearn.svm import SVC  # noqa: E402

data = np.load('asl_landmarks.npz')
x, y, classes = data['x'], data['y'], list(data['classes'])
flat = x.reshape(len(x), -1)
x_train, x_test, y_train, y_test = train_test_split(flat, y, test_size=0.2, random_state=SEED, stratify=y)
x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, test_size=0.1, random_state=SEED, stratify=y_train)
print(f"train {len(x_train)}  val {len(x_val)}  test {len(x_test)}")


def score(name, prob, train_time, latency, size, params):
    pred = prob.argmax(1)
    p, r, f1, _ = precision_recall_fscore_support(y_test, pred, average='macro', zero_division=0)
    return {'name': name, 'accuracy': accuracy_score(y_test, pred), 'precision_macro': p, 'recall_macro': r,
            'f1_macro': f1, 'top3_accuracy': top_k_accuracy_score(y_test, prob, k=3, labels=range(len(classes))),
            'latency_ms': latency, 'size_mb': size, 'params': int(params), 'train_time_min': train_time / 60,
            'test_images': int(len(y_test))}


def time_one(fn):
    n = min(200, len(x_test))
    t = time.time()
    for i in range(n):
        fn(x_test[i:i + 1])
    return (time.time() - t) / n * 1000


summary = {}
for key, name, clf in [('svm', 'Landmarks + SVM (RBF)', SVC(C=10, probability=True, random_state=SEED)),
                       ('rf', 'Landmarks + Random Forest', RandomForestClassifier(300, n_jobs=-1, random_state=SEED))]:
    t = time.time()
    clf.fit(x_train, y_train)
    params = sum(e.tree_.node_count for e in clf.estimators_) if key == 'rf' else clf.support_vectors_.size
    summary[key] = score(name, clf.predict_proba(x_test), time.time() - t, time_one(clf.predict),
                         len(pickle.dumps(clf)) / 1e6, params)
    print(json.dumps(summary[key], indent=1), flush=True)

tf.keras.utils.set_random_seed(SEED)
model = tf.keras.Sequential([
    tf.keras.Input((63,)),
    tf.keras.layers.GaussianNoise(0.02),  # تضخيم بسيط: اختلاف بسيط في مكان النقاط
    tf.keras.layers.Dense(256, use_bias=False), tf.keras.layers.BatchNormalization(), tf.keras.layers.ReLU(),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(128, use_bias=False), tf.keras.layers.BatchNormalization(), tf.keras.layers.ReLU(),
    tf.keras.layers.Dropout(0.3),
    tf.keras.layers.Dense(len(classes), activation='softmax'),
])
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
t = time.time()
model.fit(x_train, y_train, validation_data=(x_val, y_val), epochs=80, batch_size=256, verbose=2,
          callbacks=[tf.keras.callbacks.ReduceLROnPlateau(patience=4, factor=0.5),
                     tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True)])
train_time = time.time() - t
fn = tf.function(lambda a: model(a, training=False))
model.save('results/asl_mlp.keras')
summary['mlp'] = score('Landmarks + MLP (ours)', model.predict(x_test, verbose=0), train_time,
                       time_one(lambda a: fn(a.astype(np.float32))),
                       os.path.getsize('results/asl_mlp.keras') / 1e6, model.count_params())
print(json.dumps(summary['mlp'], indent=1))
json.dump(summary, open('results/asl_summary.json', 'w'), indent=1)

# نسخة ONNX للتشغيل في api.py
import tf2onnx  # noqa: E402

inference = tf.keras.Sequential([tf.keras.Input((63,))] + [l for l in model.layers if not isinstance(l, tf.keras.layers.GaussianNoise)])
spec = (tf.TensorSpec((None, 63), tf.float32, name='landmarks'),)
tf2onnx.convert.from_function(tf.function(lambda landmarks: inference(landmarks, training=False), input_signature=spec),
                              input_signature=spec, opset=13, output_path='asl_model.onnx')
json.dump(classes, open('asl_classes.json', 'w'))

# أشكال اليد للأفاتار: لكل حرف أقرب يد لمتوسط الحرف
shapes = {}
for label, cls in enumerate(classes):
    pts = x[y == label]
    if len(pts) and len(cls) == 1:
        median = np.median(pts, axis=0)
        shapes[cls] = {'landmarks': np.round(pts[np.argmin(((pts - median) ** 2).sum(axis=(1, 2)))], 4).tolist(),
                       'samples': int(len(pts))}
json.dump(shapes, open('../public/data/handshapes_en.json', 'w'))
print('✅ asl_model.onnx, asl_classes.json, handshapes_en.json')
