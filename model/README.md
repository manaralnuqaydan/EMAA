# موديل التعرف على حروف لغة الإشارة (ArASL)

الموديل شبكة CNN مدرّبة على داتا [ArASL](https://www.kaggle.com/datasets/gannayasser/arabic-alphabets-sign-language-dataset-arasl)
(54,049 صورة رمادية 64×64، 32 فئة: الحروف + ال، لا، ة). الداتا برخصة CC BY 4.0.

## التدريب

```bash
pip install -r requirements-train.txt
# فك ضغط الداتا داخل مجلد model بحيث يكون فيه ArASL_Database_54K_Final/
python extract.py   # يحوّل الصور إلى data.npz
python train.py     # يدرّب ويحفظ model.keras و model.onnx و classes.json
```

## التشغيل

التشغيل يحتاج OpenCV فقط (بدون tensorflow ولا onnxruntime):

```bash
pip install -r requirements.txt
uvicorn api:app --port 8000
```

الواجهة (`ChatScreen.tsx`) تكتشف اليد بـ MediaPipe في المتصفح، تقص صورة اليد 64×64،
وترسلها إلى `POST /predict-image` بالشكل `{"image": "data:image/jpeg;base64,..."}`.
الرد `{"prediction": "ب", "confidence": 97.3}`، والواجهة تجمع الحروف إلى كلمة.

## الأداء

- دقة 97.0% على 10,810 صورة اختبار من ArASL (تقسيم عشوائي، فالدقة على أشخاص جدد أمام الكاميرا قد تكون أقل).
- زمن الرد قرابة 30ms للصورة على المعالج.
- الواجهة تثبّت الحرف بعد قراءتين متتاليتين بثقة 60% فأكثر (`src/lib/arasl.ts`).

## الشات بوت

`POST /chat` يرد بالعربي والإنجليزي بجمل قصيرة يقدر الأفاتار يأشّرها (`chatbot.py`).
يحتاج مفتاح Claude API في ملف `model/.env` (الملف مستثنى من git فلا يترفع):

```
ANTHROPIC_API_KEY=sk-ant-...
```

بدون المفتاح يرد من `public/data/dataset.json` فقط.
