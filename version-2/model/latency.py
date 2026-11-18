"""يقيس زمن الموديلات المحلية على هذا الجهاز (بدون إنترنت) ويحفظه في results/latency.json.

    python latency.py            # 300 تكرار لكل قياس بعد 20 تكرار تسخين
يقيس شيئين لكل موديل: الموديل وحده (forward)، والطلب كامل عبر الـ API (تحويل الصورة/JSON + الموديل).
زمن المساعد (Claude) ما يُقاس هنا لأنه يعتمد على الشبكة؛ يُسجّل "Not Measured".
"""
import base64
import json
import os
import platform
import statistics
import time

import cv2
import numpy as np

os.environ.pop('ANTHROPIC_API_KEY', None)
from fastapi.testclient import TestClient  # noqa: E402

import api  # noqa: E402

N, WARM = 300, 20
rng = np.random.default_rng(0)


def measure(fn):
    for _ in range(WARM):
        fn()
    times = []
    for _ in range(N):
        t = time.perf_counter()
        fn()
        times.append((time.perf_counter() - t) * 1000)
    times.sort()
    return {'mean_ms': round(statistics.mean(times), 2), 'median_ms': round(statistics.median(times), 2),
            'p95_ms': round(times[int(0.95 * N) - 1], 2), 'runs': N}


client = TestClient(api.app)
img = rng.integers(0, 255, (64, 64), dtype=np.uint8)
ok, buf = cv2.imencode('.jpg', img)
image_body = {'image': 'data:image/jpeg;base64,' + base64.b64encode(buf.tobytes()).decode()}
results = {}


def cnn_forward():
    api.net.setInput(img[None, ..., None].astype(np.float32))
    api.net.forward()


results['arsl_letters_cnn'] = {'model_only': measure(cnn_forward),
                               'api_request': measure(lambda: client.post('/predict-image', json=image_body))}

if api.phrase_model is not None:
    pts = rng.random((21, 3)).tolist()
    flat = np.array(pts).reshape(1, -1)
    results['arsl_phrases_rf'] = {
        'model_only': measure(lambda: api.phrase_model.predict_proba(flat)),
        'api_request': measure(lambda: client.post('/predict-phrase', json={'landmarks': pts}))}
else:
    results['arsl_phrases_rf'] = 'Not Measured (scikit-learn not installed)'

for name, net, path in [('asl_letters', api.asl_net, '/predict-asl'), ('asl_words', api.asl_words_net, '/predict-asl-word')]:
    results[name] = 'Not Measured (model not trained yet)' if net is None else 'run again after training'

results['chatbot_claude'] = 'Not Measured (depends on network and API; only a local mock was tested)'
results['browser_mediapipe'] = 'Not Measured (runs on the user device)'
results['hardware'] = {'cpu': platform.processor() or platform.machine(), 'cores': os.cpu_count(),
                       'python': platform.python_version(), 'opencv': cv2.__version__,
                       'note': 'cloud container CPU, no GPU'}
os.makedirs('results', exist_ok=True)
json.dump(results, open('results/latency.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(results, indent=1, ensure_ascii=False))
