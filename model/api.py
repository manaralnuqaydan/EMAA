import base64
import json
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


@app.get("/")
def root():
    return {"status": "EEMAA API running ✅"}
