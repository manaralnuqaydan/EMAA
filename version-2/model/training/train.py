import json

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))  # labels.py في مجلد model
from labels import ARASL_LABELS, IMG_SIZE

dataset = np.load('data.npz')
x = dataset['x'][..., None]
y = dataset['y']
classes = list(dataset['classes'])

x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42, stratify=y)
x_train, x_val, y_train, y_val = train_test_split(
    x_train, y_train, test_size=0.1, random_state=42, stratify=y_train
)
print(f"تدريب: {len(x_train)}، تحقق: {len(x_val)}، اختبار: {len(x_test)}")

# Data Augmentation: يد يمنى أو يسرى، ميلان بسيط، تقريب، إضاءة مختلفة
augment = tf.keras.Sequential([
    tf.keras.layers.RandomFlip('horizontal'),
    tf.keras.layers.RandomRotation(0.08),
    tf.keras.layers.RandomZoom(0.1),
    tf.keras.layers.RandomTranslation(0.08, 0.08),
    tf.keras.layers.RandomContrast(0.3),
    tf.keras.layers.RandomBrightness(0.2, value_range=(0, 1)),
])


def conv_block(filters):
    return [
        tf.keras.layers.Conv2D(filters, 3, padding='same', use_bias=False),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.ReLU(),
        tf.keras.layers.Conv2D(filters, 3, padding='same', use_bias=False),
        tf.keras.layers.BatchNormalization(),
        tf.keras.layers.ReLU(),
        tf.keras.layers.MaxPooling2D(),
    ]


model = tf.keras.Sequential([
    tf.keras.Input((IMG_SIZE, IMG_SIZE, 1)),
    tf.keras.layers.Rescaling(1 / 255),
    augment,
    *conv_block(32),
    *conv_block(64),
    *conv_block(128),
    tf.keras.layers.GlobalAveragePooling2D(),
    tf.keras.layers.Dropout(0.4),
    tf.keras.layers.Dense(len(classes), activation='softmax'),
])
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

model.fit(
    x_train, y_train,
    validation_data=(x_val, y_val),
    epochs=25,
    batch_size=128,
    callbacks=[
        tf.keras.callbacks.ReduceLROnPlateau(patience=2, factor=0.5),
        tf.keras.callbacks.EarlyStopping(patience=5, restore_best_weights=True),
    ],
)

_, accuracy = model.evaluate(x_test, y_test, verbose=0)
print(f"دقة الموديل على صور الاختبار: {accuracy * 100:.2f}%")
y_pred = model.predict(x_test, verbose=0).argmax(axis=1)
print(classification_report(y_test, y_pred, target_names=[ARASL_LABELS[c] for c in classes]))

model.save('model.keras')

# نسخة ONNX للتشغيل في api.py بدون tensorflow (بدون طبقات التضخيم)
import tf2onnx  # noqa: E402

inference = tf.keras.Sequential(
    [tf.keras.Input((IMG_SIZE, IMG_SIZE, 1))] + [l for l in model.layers if l is not augment]
)
spec = (tf.TensorSpec((None, IMG_SIZE, IMG_SIZE, 1), tf.float32, name='image'),)


@tf.function(input_signature=spec)
def serve(image):
    return inference(image, training=False)


tf2onnx.convert.from_function(serve, input_signature=spec, opset=13, output_path='model.onnx')
with open('classes.json', 'w', encoding='utf-8') as f:
    json.dump([ARASL_LABELS[c] for c in classes], f, ensure_ascii=False)

print("✅ تم حفظ الموديل في model.keras و model.onnx والحروف في classes.json")
