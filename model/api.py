from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import mediapipe as mp
import numpy as np
import pickle
import cv2
import tempfile
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

# استدعاء MediaPipe بالطريقة الأصلية والمستقرة
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.3)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    cap = cv2.VideoCapture(tmp_path)
    frame_landmarks = []
    
    # 1. متغير جديد لحساب رقم الفريم
    frame_count = 0 

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        
        # 2. ميزة تخطي الفريمات (Frame Skipping):
        # الكود هنا يحلل الفريمات الزوجية فقط ويتجاهل الفردية لتسريع المعالجة للضعف
        if frame_count % 2 != 0:
            continue

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)
        
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                lm = []
                for landmark in hand_landmarks.landmark:
                    lm.extend([landmark.x, landmark.y, landmark.z])
                frame_landmarks.append(lm)

    cap.release()
    os.unlink(tmp_path)

    if not frame_landmarks:
        return {"prediction": "لم يتم التعرف على إشارة", "confidence": 0}

    # حساب المتوسط والتنبؤ كالمعتاد
    avg = np.mean(frame_landmarks, axis=0).reshape(1, -1)
    prediction = model.predict(avg)[0]
    
    # حساب نسبة الثقة
    probabilities = model.predict_proba(avg)
    max_probability = np.max(probabilities)
    confidence = float(max_probability) * 100

    return {
        "prediction": str(prediction),
        "confidence": confidence
    }

@app.get("/")
def root():
    return {"status": "EEMAA API running ✅"}