"""يطلع شكل اليد لكل حرف من صور ArASL الحقيقية عشان الأفاتار يتهجى بنفس الشكل.

لكل حرف: يكشف نقاط اليد الـ21 (MediaPipe) في صور كثيرة، ويختار الصورة الأقرب
لمتوسط الأشكال (medoid) فيكون الشكل حقيقي من شخص فعلي، ويحفظها في
public/data/handshapes_ar.json بإحداثيات ثلاثية الأبعاد بالمتر.

    pip install mediapipe==0.10.14 opencv-python-headless   # Python 3.12 أو أقل
    python handshapes.py --data-dir ./ArASL_Database_54K_Final
"""
import argparse
import json
import os

import cv2
import mediapipe as mp
import numpy as np

from labels import ARASL_LABELS

parser = argparse.ArgumentParser()
parser.add_argument('--data-dir', default='./ArASL_Database_54K_Final')
parser.add_argument('--per-class', type=int, default=600)
parser.add_argument('--out', default='../public/data/handshapes_ar.json')
args = parser.parse_args()

hands = mp.solutions.hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=0.3)


CHAINS = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [0, 9, 10, 11, 12], [0, 13, 14, 15, 16], [0, 17, 18, 19, 20]]


def bends(points):
    # انثناء كل مفصل (جيب تمام الزاوية بين العقلتين) + انفراج الأصابع عن بعض
    out = []
    for chain in CHAINS:
        for a, b, c in zip(chain, chain[1:], chain[2:]):
            u, w = points[b] - points[a], points[c] - points[b]
            out.append(np.dot(u, w) / (np.linalg.norm(u) * np.linalg.norm(w) + 1e-9))
    tips = [points[i] - points[j] for i, j in ((4, 2), (8, 5), (12, 9), (16, 13), (20, 17))]
    for x, y in zip(tips, tips[1:]):
        out.append(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-9))
    return np.array(out)


def normalize(points):
    # نقطة الرسغ في الأصل، والمسافة من الرسغ لمفصل الإصبع الأوسط = 1
    points = points - points[0]
    return points / np.linalg.norm(points[9])


folders = {}
for root, _, files in os.walk(args.data_dir):
    if os.path.basename(root) in ARASL_LABELS:
        folders[os.path.basename(root)] = [os.path.join(root, f) for f in sorted(files)]

result = {}
for folder, files in sorted(folders.items()):
    rng = np.random.default_rng(0)
    samples, flips = [], []
    for path in rng.permutation(files)[:args.per_class]:
        img = cv2.imread(path)
        if img is None:
            continue
        big = cv2.resize(img, (256, 256), interpolation=cv2.INTER_CUBIC)
        canvas = np.full((480, 480, 3), int(np.median(big[0])), np.uint8)
        canvas[112:368, 112:368] = big
        found = hands.process(cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB))
        if not found.multi_hand_world_landmarks:
            continue
        pts = np.array([[p.x, p.y, p.z] for p in found.multi_hand_world_landmarks[0].landmark])
        # نوحّدها كلها يد يمنى من منظور الشخص نفسه
        is_left = found.multi_handedness[0].classification[0].label == 'Left'
        if is_left:
            pts[:, 0] *= -1
        samples.append(normalize(pts))
        flips.append(is_left)
    if not samples:
        print(f"⚠️ {folder}: ما انكشفت يد")
        continue
    stack = np.stack(samples)
    # نختار اليد الأقرب لشكل الأصابع الغالب (بالانثناءات) عشان أخطاء الكشف ما تأثر
    feats = np.stack([bends(p) for p in stack])
    median = np.median(feats, axis=0)
    best = int(np.argmin(np.abs(feats - median).sum(axis=1)))
    result[ARASL_LABELS[folder]] = {
        'landmarks': np.round(stack[best], 4).tolist(),
        'samples': len(samples),
    }
    print(f"✅ {folder} ({ARASL_LABELS[folder]}): {len(samples)} يد مكشوفة")

with open(args.out, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False)
print(f"حُفظ {len(result)} حرف في {args.out}")
