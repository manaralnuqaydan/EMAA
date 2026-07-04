from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.3)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    cap = cv2.VideoCapture(tmp_path)
    frame_landmarks = []
    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        frame_count += 1
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
    avg = np.mean(frame_landmarks, axis=0).reshape(1, -1)
    prediction = model.predict(avg)[0]
    probabilities = model.predict_proba(avg)
    confidence = float(np.max(probabilities)) * 100
    return {"prediction": str(prediction), "confidence": confidence}


class LandmarksInput(BaseModel):
    landmarks: list

@app.post("/predict-landmarks")
async def predict_landmarks(data: LandmarksInput):
    if not data.landmarks:
        return {"prediction": "لم يتم التعرف على إشارة", "confidence": 0}
    try:
        flat = np.array(data.landmarks).flatten().reshape(1, -1)
        prediction = model.predict(flat)[0]
        probabilities = model.predict_proba(flat)
        confidence = float(np.max(probabilities)) * 100
        return {"prediction": str(prediction), "confidence": confidence}
    except Exception as e:
        return {"prediction": "خطأ في المعالجة", "confidence": 0}


@app.get("/")
def root():
    return {"status": "EEMAA API running ✅"}