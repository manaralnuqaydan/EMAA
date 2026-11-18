# EMAA – Phase 8: Final Documentation

Date: 2026-11-18. Everything in this document refers to the `version-2/` folder. The original project in the repository root is untouched.

## 1. Where each required document lives

| # | Required document | Location |
|---|---|---|
| 1 | Technical audit | `docs/01-technical-audit.md` |
| 2 | Architecture | §2 below |
| 3 | Modified files report | §3 below |
| 4 | Dataset comparison | `docs/02-dataset-research.md` §1 |
| 5 | Dataset licence report | `docs/02-dataset-research.md` §2, §4 |
| 6 | ASL model | `docs/04-asl-model.md` |
| 7 | Arabic model | `model/README.md` |
| 8 | Bilingual implementation | `docs/03-bilingual-interface.md` |
| 9 | Language coverage matrix | `docs/07-testing-privacy-evaluation.md` §2 |
| 10 | Chatbot workflow | `docs/05-chatbot-workflows.md` |
| 11 | Avatar rigging and animation | `docs/06-avatar.md` |
| 12 | Avatar evaluation | `docs/06-avatar.md` (known limits) and `07` §4 |
| 13 | Recognition accuracy | `docs/07-testing-privacy-evaluation.md` §4 |
| 14 | Latency | `docs/07-testing-privacy-evaluation.md` §3 and `model/results/latency.json` |
| 15 | Privacy | `docs/07-testing-privacy-evaluation.md` §5 |
| 16 | Limitations | §5 below |
| 17 | Testing results | `docs/07-testing-privacy-evaluation.md` §1 |
| 18 | Local setup | §6 below |
| 19 | Deployment | §7 below |

## 2. Architecture

```
Browser (React 19 + TanStack Start + Vite, Tailwind 4)
 ├─ i18n: src/lib/i18n.tsx + src/i18n/{ar,en}.json
 │    UI language (ar/en, RTL/LTR) and sign language (ArSL/ASL) are chosen separately
 ├─ Live screen (/chat): webcam → MediaPipe (runs in the browser)
 │    ArSL letters  : cropped 64×64 grey hand image → POST /predict-image
 │    ArSL phrases  : 21 hand points                → POST /predict-phrase
 │    ASL letters   : 21 hand world points          → POST /predict-asl       (model not trained)
 │    ASL words     : 32 frames × 153 Holistic values → POST /predict-asl-word (model not trained)
 │    recognised text → "Send to assistant" → POST /chat   (Workflow A)
 ├─ Assistant screen (/camera): text or voice → POST /chat → reply {ar, en, sign, source}
 │    reply is spoken (Web Speech) and `sign` is fingerspelled by the avatar   (Workflow B)
 └─ Avatar: three.js / react-three-fiber, avatar.fbx
      procedural fingerspelling from public/data/handshapes_ar.json (32 ArSL handshapes)
      events: spellText, spellControl → spellProgress, spellState

Python API (model/api.py, FastAPI + OpenCV dnn, no TensorFlow at runtime)
 ├─ model.onnx           ArSL letters CNN
 ├─ phrases_model.pkl    original 2-phrase RandomForest (needs scikit-learn)
 ├─ asl_model.onnx       optional, appears after training
 ├─ asl_words.onnx       optional, appears after training on ASL Citizen
 └─ chatbot.py           Claude API (key only in model/.env); offline fallback = dataset.json
```

`GET /` reports which models are actually loaded. The interface reads it and shows a "not trained yet" notice instead of guessing.

## 3. Modified files report (version-2 only, phases 1 to 8)

| Area | Files |
|---|---|
| Docs | `docs/01` to `docs/08` |
| API and models | `model/api.py`, `chatbot.py`, `requirements.txt`, `phrases_model.pkl` (copied from the original `model/model.pkl`) |
| ASL pipeline | `model/asl_citizen_extract.py`, `asl_words_features.py`, `asl_words_train.py` |
| Tests and measurement | `model/tests/*`, `model/latency.py`, `model/results/latency.json`, `tests/fingerspell.test.ts`, `package.json` (`npm test`) |
| i18n | `src/lib/i18n.tsx`, `src/i18n/ar.json`, `src/i18n/en.json`, `src/components/LanguageControls.tsx`, `src/routes/__root.tsx`, `src/routes/overview.tsx` |
| Screens | `src/components/screens/{Splash,Home,Mode,Camera,Chat}Screen.tsx`, `ScreenStage.tsx`, `PhoneFrame.tsx` |
| Avatar | `src/components/ui/AvatarViewer.tsx`, `SpellCaption.tsx`, `src/lib/fingerspell.ts` |
| Privacy | `src/components/ui/CameraConsent.tsx` |
| Client libraries | `src/lib/assistant.ts`, `aslWords.ts`, `speech.ts`, `arasl.ts` (API URL from `VITE_SIGN_API_URL`) |
| Git hygiene | `.gitignore` (datasets, landmark files and `.env` are never committed) |

Commits on `main`: `a9561e06`, `2a04e249`, `4a93924e`, `fbd98003`, `53b89133`, `95cda544`, `4c0b2b38`, plus the Phase 8 commit.

## 4. Feature status

| Feature | Status | Evidence |
|---|---|---|
| Arabic interface | Implemented and tested | Playwright screenshots `phase3-live-ar.png` |
| English interface | Implemented and tested | `phase3-live-en.png`, `phase5-assistant-en.png` |
| Independent sign-language selector | Implemented and tested | `LanguageControls.tsx`, screenshots |
| ArSL letter recognition | Implemented and tested | pytest; 97.0% from the earlier training run, not re-measured here |
| ArSL phrase recognition (2 phrases) | Implemented but not fully tested | Accuracy unreliable (augmentation before split) |
| ASL letter recognition | In development | Script ready, no trained model |
| ASL word recognition (ASL Citizen) | In development | Extraction and training scripts tested on synthetic data; waiting for the landmark file |
| Continuous sentence recognition | Not implemented | Only isolated letters and signs |
| Chatbot, bilingual, with history | Implemented but not fully tested | Tested only against a local mock of the Claude API |
| Workflow A (sign → chatbot) | Implemented but not fully tested | Text path tested; not tested with a live camera |
| Workflow B (text → avatar) | Implemented and tested (ArSL) | `phase6-avatar-*.png` |
| Avatar ASL fingerspelling | Not implemented | No ASL handshape images yet; text fallback with notice |
| Avatar smooth transitions, controls | Implemented and tested | `06-avatar.md` |
| Avatar facial question markers | Implemented but not fully tested | Needs Deaf reviewer, especially for Saudi signing |
| Camera consent and privacy notice | Implemented and tested | `phase7-consent-ar.png` |
| Recognition latency | Measured (local CPU) | `model/results/latency.json` |
| Chatbot latency with real Claude | Not measured yet | |
| User evaluation with Deaf participants | Not measured yet | |

## 5. Limitations

1. ASL recognition models are not trained yet, so ASL currently works only through the chatbot (text) and as a text caption on the avatar.
2. The avatar fingerspells letters. It does not produce full signs, grammar or two-handed signs, and it is not motion capture.
3. Handshapes come from still photos, so ArSL letters that involve movement are shown as a static shape.
4. The ArSL letter accuracy comes from a random image split, not from new signers, so real-world accuracy can be lower.
5. Only the right hand is animated.
6. Facial expressions are limited to question brows and have not been validated by Deaf users.
7. The chatbot needs an internet connection and an API key. Without them it falls back to a small set of fixed Arabic replies, and every reply shows its source.
8. **ASL Citizen licence:** research and non-commercial use only, no redistribution, and no stand-alone hosted service. A model trained on it must not be deployed as a public service (see §7).
9. This is a communication aid, not a replacement for a certified interpreter.

## 6. Local setup

Requirements: Node 20 or newer, Python 3.10 or newer.

```bash
# API (terminal 1)
cd version-2/model
python -m venv .venv
.venv/bin/python -m pip install -r requirements.txt     # Windows: .venv\Scripts\python
echo ANTHROPIC_API_KEY=your-key > .env                  # optional; never commit this file
.venv/bin/python -m uvicorn api:app --port 8000

# Interface (terminal 2)
cd version-2
npm install
npm run dev            # http://localhost:8080
```

Run the tests:

```bash
cd version-2/model && .venv/bin/python -m pip install pytest httpx && .venv/bin/python -m pytest tests
cd version-2 && npm test
cd version-2/model && .venv/bin/python latency.py      # writes results/latency.json
```

Train ASL words (team computer, after downloading ASL Citizen):

```bash
cd version-2/model
python -m pip install -r requirements-train.txt
python asl_citizen_extract.py --zip path/to/ASL_Citizen.zip   # → asl_citizen_landmarks.npz
python asl_words_train.py --data asl_citizen_landmarks.npz    # → asl_words.onnx + results/asl_words_summary.json
```

## 7. Deployment

- **Interface:** `VITE_SIGN_API_URL=https://your-api.example npm run build`. The project already has `wrangler.jsonc` for Cloudflare Workers (`npx wrangler deploy`). Any Node host that runs TanStack Start also works.
- **API:** run `uvicorn api:app --host 0.0.0.0 --port 8000` behind HTTPS (for example a small VM or a container). Set `ANTHROPIC_API_KEY` as a server secret, never in the frontend.
- **Before going public:**
  - Restrict CORS in `api.py` (it currently allows `*`) to the real interface domain.
  - Add rate limiting on `/chat`.
- **Licences:**
  - The ArASL model (CC BY 4.0) can be deployed with attribution.
  - An ASL Citizen model may be shown only in a local research demo, such as an exhibition laptop. It must not be deployed as a hosted service.
- **Camera:** browsers allow the camera only on HTTPS or `localhost`.
