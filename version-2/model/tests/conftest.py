"""الـ API يقرأ ملفات الموديل بمسارات نسبية، فنشغّل الاختبارات من مجلد model."""
import os
import sys

MODEL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(MODEL_DIR)
sys.path.insert(0, MODEL_DIR)
os.environ.pop('ANTHROPIC_API_KEY', None)  # الاختبارات ما تتصل بـ Claude أبدًا
