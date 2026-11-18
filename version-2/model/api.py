import base64
import json
import os
from typing import Literal

import cv2
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import chatbot
from labels import IMG_SIZE

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# نسخة ONNX من model.keras تشتغل عن طريق OpenCV نفسه، بدون tensorflow ولا onnxruntime
net = cv2.dnn.readNetFromONNX('model.onnx')
with open('classes.json', encoding='utf-8') as f:
    classes = json.load(f)

NO_SIGN = {"prediction": "لم يتم التعرف على إشارة", "confidence": 0}

# موديل ASL الإنجليزي (على نقاط اليد) من asl_landmarks.py، إذا كان موجود
asl_net, asl_classes = None, []
if os.path.exists('asl_model.onnx'):
    asl_net = cv2.dnn.readNetFromONNX('asl_model.onnx')
    with open('asl_classes.json', encoding='utf-8') as f:
        asl_classes = json.load(f)


# موديل العبارات الأصلي من النسخة الأولى (السلام عليكم، كيف حالك): RandomForest على 21 نقطة يد
phrase_model = None
if os.path.exists('phrases_model.pkl'):
    try:
        import pickle

        with open('phrases_model.pkl', 'rb') as f:
            phrase_model = pickle.load(f)
    except Exception as e:  # scikit-learn مو مثبت مثلًا
        print(f"⚠️ موديل العبارات ما اشتغل: {e}")


class ImageInput(BaseModel):
    image: str  # صورة اليد المقصوصة كـ data URL أو base64


@app.post("/predict-image")
async def predict_image(data: ImageInput):
    try:
        raw = base64.b64decode(data.image.split(',')[-1])
        img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_GRAYSCALE)
        if img is None:
            return NO_SIGN
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE), interpolation=cv2.INTER_AREA)
        net.setInput(img[None, ..., None].astype(np.float32))
        probabilities = net.forward()[0]
        best = int(np.argmax(probabilities))
        return {"prediction": classes[best], "confidence": float(probabilities[best]) * 100}
    except Exception:
        return {"prediction": "خطأ في المعالجة", "confidence": 0}


class LandmarksInput(BaseModel):
    landmarks: list[list[float]]  # 21 نقطة (x, y, z) من multiHandWorldLandmarks
    handedness: str = "Right"


@app.post("/predict-asl")
def predict_asl(data: LandmarksInput):
    if asl_net is None or len(data.landmarks) != 21:
        return {"prediction": "", "confidence": 0}
    pts = np.array(data.landmarks, dtype=np.float32)
    if data.handedness == "Left":
        pts[:, 0] *= -1
    pts = pts - pts[0]
    pts = pts / (np.linalg.norm(pts[9]) + 1e-9)
    asl_net.setInput(pts.reshape(1, 63))
    probabilities = asl_net.forward()[0]
    best = int(np.argmax(probabilities))
    return {"prediction": asl_classes[best], "confidence": float(probabilities[best]) * 100}


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatInput(BaseModel):
    messages: list[ChatMessage]


@app.post("/chat")
def chat(data: ChatInput):
    # يرجع الرد بالعربي والإنجليزي: {"ar": ..., "en": ..., "source": ...}
    if not data.messages or data.messages[-1].role != "user":
        return {"ar": "", "en": "", "source": "empty"}
    return chatbot.reply([m.model_dump() for m in data.messages])


class PhraseInput(BaseModel):
    landmarks: list[list[float]]  # 21 نقطة (x, y, z) بإحداثيات الصورة من MediaPipe


@app.post("/predict-phrase")
def predict_phrase(data: PhraseInput):
    # نفس منطق /predict-landmarks في النسخة الأصلية، لكن باسم أوضح
    if phrase_model is None or len(data.landmarks) != 21:
        return {"prediction": "", "confidence": 0}
    flat = np.array(data.landmarks, dtype=np.float64).reshape(1, -1)
    prob = phrase_model.predict_proba(flat)[0]
    best = int(np.argmax(prob))
    return {"prediction": str(phrase_model.classes_[best]).replace('_', ' '),
            "confidence": float(prob[best]) * 100}


@app.get("/")
def root():
    # الواجهة تقرأ هذا عشان تعرف وش المتاح فعلًا وما تدّعي شي غير موجود
    return {
        "status": "EEMAA API running ✅",
        "models": {"arsl_letters": True, "arsl_phrases": phrase_model is not None,
                   "asl_letters": asl_net is not None},
        "chatbot": chatbot._client is not None,
    }
