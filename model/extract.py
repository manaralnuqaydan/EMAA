import cv2
import mediapipe as mp
import numpy as np
import os
import pickle

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.3)

DATA_DIR = './videos'

data = []
labels = []

for label in os.listdir(DATA_DIR):
    label_path = os.path.join(DATA_DIR, label)
    if not os.path.isdir(label_path):
        continue
    for video_file in os.listdir(label_path):
        video_path = os.path.join(label_path, video_file)
        cap = cv2.VideoCapture(video_path)
        frame_landmarks = []
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(frame_rgb)
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    lm = []
                    for landmark in hand_landmarks.landmark:
                        lm.extend([landmark.x, landmark.y, landmark.z])
                    frame_landmarks.append(lm)
        cap.release()
        if frame_landmarks:
            avg = np.mean(frame_landmarks, axis=0)
            data.append(avg)
            labels.append(label)
            print(f"✅ {label} - {video_file}")

with open('data.pkl', 'wb') as f:
    pickle.dump({'data': data, 'labels': labels}, f)

print(f"\nتم! عدد العينات: {len(data)}")