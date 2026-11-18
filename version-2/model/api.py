import base64
import json
import os
from typing import Literal

import cv2
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# الملفات تنقرأ بمسارات نسبية، فنشتغل دايمًا من مجلد model مهما كان مكان التشغيل
os.chdir(os.path.dirname(os.path.abspath(__file__)))

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


# موديل كلمات ASL (تسلسل نقاط Holistic) من asl_words_train.py، إذا كان موجود
asl_words_net, asl_words_classes = None, []
if os.path.exists('asl_words.onnx'):
    from asl_words_features import FEATURES, FRAMES, normalize_sequence
    asl_words_net = cv2.dnn.readNetFromONNX('asl_words.onnx')
    with open('asl_words_classes.json', encoding='utf-8') as f:
        asl_words_classes = json.load(f)


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
    ui_lang: Literal["ar", "en"] = "ar"
    sign_lang: Literal["arsl", "asl"] = "arsl"


@app.post("/chat")
def chat(data: ChatInput):
    # يرجع: {"ar": ..., "en": ..., "sign": كلمات يتهجاها الأفاتار, "source": claude|dataset|offline}
    if not data.messages or data.messages[-1].role != "user":
        return {"ar": "", "en": "", "sign": "", "source": "empty"}
    return chatbot.reply([m.model_dump() for m in data.messages], data.ui_lang, data.sign_lang)


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


class SequenceInput(BaseModel):
    frames: list[list[float]]  # 32 لقطة × 153 قيمة (أعلى الجسم + اليدين) بإحداثيات الصورة


@app.post("/predict-asl-word")
def predict_asl_word(data: SequenceInput):
    # يرجع أفضل 3 كلمات مع الثقة؛ الواجهة ترفض الثقة المنخفضة بدل ما تخمّن
    if asl_words_net is None:
        return {"prediction": "", "confidence": 0, "top": []}
    seq = np.array(data.frames, dtype=np.float32)
    if seq.shape != (FRAMES, FEATURES):
        return {"prediction": "", "confidence": 0, "top": []}
    asl_words_net.setInput(normalize_sequence(seq)[None])
    prob = asl_words_net.forward()[0]
    top = np.argsort(prob)[::-1][:3]
    return {"prediction": asl_words_classes[int(top[0])], "confidence": float(prob[top[0]]) * 100,
            "top": [{"word": asl_words_classes[int(i)], "confidence": float(prob[i]) * 100} for i in top]}


@app.get("/")
def root():
    # الواجهة تقرأ هذا عشان تعرف وش المتاح فعلًا وما تدّعي شي غير موجود
    return {
        "status": "EEMAA API running ✅",
        "models": {"arsl_letters": True, "arsl_phrases": phrase_model is not None,
                   "asl_letters": asl_net is not None, "asl_words": asl_words_net is not None},
        "chatbot": chatbot._client is not None,
    }
