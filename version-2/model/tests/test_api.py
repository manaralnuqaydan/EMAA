"""اختبارات الـ API بدون اتصال بالإنترنت: المساعد مستبدل بدالة وهمية."""
import base64

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

import api
import chatbot

client = TestClient(api.app)


def png_b64(img):
    ok, buf = cv2.imencode('.png', img)
    assert ok
    return 'data:image/png;base64,' + base64.b64encode(buf.tobytes()).decode()


def test_root_reports_real_model_status():
    body = client.get('/').json()
    assert set(body['models']) == {'arsl_letters', 'arsl_phrases', 'asl_letters', 'asl_words'}
    assert body['models']['arsl_letters'] is True
    # الحالة لازم تطابق الملفات الموجودة فعلًا، ما ندّعي موديل غير موجود
    assert body['models']['asl_words'] == (api.asl_words_net is not None)
    assert body['models']['asl_letters'] == (api.asl_net is not None)


def test_predict_image_returns_known_class():
    img = np.random.default_rng(0).integers(0, 255, (120, 120), dtype=np.uint8)
    body = client.post('/predict-image', json={'image': png_b64(img)}).json()
    assert body['prediction'] in api.classes
    assert 0 <= body['confidence'] <= 100


def test_predict_image_bad_input_does_not_crash():
    body = client.post('/predict-image', json={'image': 'not-an-image'}).json()
    assert body['confidence'] == 0


def test_predict_asl_without_model_or_bad_shape_is_empty():
    body = client.post('/predict-asl', json={'landmarks': [[0, 0, 0]] * 5}).json()
    assert body == {'prediction': '', 'confidence': 0}


@pytest.mark.skipif(api.phrase_model is None, reason='scikit-learn غير مثبت')
def test_predict_phrase():
    pts = np.random.default_rng(1).random((21, 3)).tolist()
    body = client.post('/predict-phrase', json={'landmarks': pts}).json()
    assert body['prediction'] in [str(c).replace('_', ' ') for c in api.phrase_model.classes_]
    assert client.post('/predict-phrase', json={'landmarks': pts[:3]}).json()['prediction'] == ''


def test_predict_asl_word_rejects_wrong_shape():
    body = client.post('/predict-asl-word', json={'frames': [[0.0] * 10] * 4}).json()
    assert body['prediction'] == '' and body['top'] == []


def test_chat_requires_last_message_from_user():
    assert client.post('/chat', json={'messages': []}).json()['source'] == 'empty'
    msgs = [{'role': 'assistant', 'content': 'hi'}]
    assert client.post('/chat', json={'messages': msgs}).json()['source'] == 'empty'


def test_chat_passes_languages_to_chatbot(monkeypatch):
    seen = {}

    def fake(messages, ui_lang, sign_lang):
        seen.update(messages=messages, ui_lang=ui_lang, sign_lang=sign_lang)
        return {'ar': 'مرحبا', 'en': 'Hello', 'sign': 'HELLO', 'source': 'claude'}

    monkeypatch.setattr(chatbot, 'reply', fake)
    body = client.post('/chat', json={'messages': [{'role': 'user', 'content': 'hi'}],
                                      'ui_lang': 'en', 'sign_lang': 'asl'}).json()
    assert body['sign'] == 'HELLO'
    assert seen['ui_lang'] == 'en' and seen['sign_lang'] == 'asl'


def test_chat_rejects_unknown_sign_language():
    r = client.post('/chat', json={'messages': [{'role': 'user', 'content': 'hi'}], 'sign_lang': 'bsl'})
    assert r.status_code == 422  # لغات الإشارة المدعومة فقط: arsl و asl


def test_offline_reply_is_labelled_and_never_mixes_languages(monkeypatch):
    monkeypatch.setattr(chatbot, '_client', None)
    key = next(iter(chatbot._replies), None)
    if key:
        ar = chatbot.reply([{'role': 'user', 'content': key}], 'ar', 'arsl')
        assert ar['source'] == 'dataset' and ar['sign']
        # الردود الجاهزة عربية، فما نعطيها للأفاتار لما تكون لغة الإشارة ASL
        assert chatbot.reply([{'role': 'user', 'content': key}], 'en', 'asl')['sign'] == ''
    none = chatbot.reply([{'role': 'user', 'content': 'zzzz-unknown'}], 'en', 'asl')
    assert none['source'] == 'offline' and none['sign'] == ''


def test_context_names_selected_sign_language():
    assert 'American Sign Language' in chatbot._context('ar', 'asl')
    assert 'Arabic Sign Language' in chatbot._context('en', 'arsl')
