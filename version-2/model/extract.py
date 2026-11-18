import argparse
import os

import cv2
import numpy as np

from labels import ARASL_LABELS, IMG_SIZE

# يحوّل صور ArASL (مجلد لكل فئة) إلى ملف data.npz واحد للتدريب
parser = argparse.ArgumentParser()
parser.add_argument('--data-dir', default='./ArASL_Database_54K_Final')
args = parser.parse_args()

images, labels = [], []
for root, _, files in os.walk(args.data_dir):
    folder = os.path.basename(root)
    if folder not in ARASL_LABELS:
        continue
    for name in files:
        img = cv2.imread(os.path.join(root, name), cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue
        images.append(cv2.resize(img, (IMG_SIZE, IMG_SIZE)))
        labels.append(folder)
    print(f"✅ {folder} ({ARASL_LABELS[folder]}): {len(files)} صورة")

classes = sorted(ARASL_LABELS)
y = np.array([classes.index(label) for label in labels], dtype=np.int64)
np.savez_compressed('data.npz', x=np.array(images, dtype=np.uint8), y=y, classes=np.array(classes))

print(f"\nتم! إجمالي الصور: {len(images)} في {len(set(labels))} فئة")
