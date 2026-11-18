# EMAA · Version 2

نسخة إيماء الثانية. النسخة الأصلية باقية كما هي في جذر الريبو، وهذا المجلد مستقل عنها.

## الجديد في هذه النسخة
- **من الإشارة إلى نص:** موديل CNN على داتا سيت ArASL (32 حرف عربي)، والكاميرا تجمع الحروف في كلمات مع اقتراحات وتصحيح.
- **لغة الإشارة الأمريكية (ASL):** زر ع / ASL في شاشة الكاميرا، والموديل يقرأ نقاط اليد (`model/asl_landmarks.py`).
- **الأفاتار:** يتهجى النص بأصابعه بأشكال يد مأخوذة من صور حقيقية، ويرمش ويحرك فمه مع الصوت.
- **شات بوت:** يساعد الصم والبكم ويرد بالعربي والإنجليزي (`model/chatbot.py`).
- **مقارنة الموديلات:** `model/benchmark.py` و `model/plot_results.py` بأرقام حقيقية على نفس صور الاختبار.

## التشغيل
ترمنال للموديل:
```
cd version-2/model
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn api:app --port 8000
```
ترمنال للواجهة:
```
cd version-2
npm install
npm run dev
```
ثم افتح `http://localhost:8080`. تفاصيل الموديلات والشات بوت في `model/README.md`.
