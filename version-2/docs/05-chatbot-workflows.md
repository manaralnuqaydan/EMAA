# EMAA – Phase 5: Chatbot and Bidirectional Communication

Date: 2026-11-18

## What the chatbot is

- `model/chatbot.py` calls Claude (`claude-opus-5-5`) through the Anthropic SDK with a JSON schema, so every reply has `ar`, `en` and `sign` (1–4 key words for the avatar to fingerspell).
- The request tells the model the interface language and the selected sign language; `sign` is in Arabic letters for Arabic Sign Language and Latin letters for ASL, never mixed.
- Without an API key or on an API error it falls back to the **canned** replies in `public/data/dataset.json` (4 greetings, from the original project). The UI labels every reply with its source: "AI reply (Claude)", "Offline canned reply", or "Assistant offline".
- Errors are logged by type only; message text is not written to the server log.

## Workflow A – Sign → chatbot

| Step | Input | Component | Output | Error handling | Status |
|---|---|---|---|---|---|
| 1 | Sign language choice | `SignLanguagePicker` (Modes / Live) | `arsl` or `asl` | – | Implemented and tested |
| 2 | Camera | `getUserMedia` in `CameraScreen.tsx` | video frames (stay in browser) | visible "allow camera" message | Implemented, not tested with a real camera here |
| 3 | Frames | MediaPipe Hands / Holistic (browser) | landmarks + 64×64 hand crop (Arabic letters) | "show your hand" status | Implemented, not tested with a real camera here |
| 4 | Crop / landmarks / sequence | `/predict-image`, `/predict-phrase`, `/predict-asl`, `/predict-asl-word` | label + confidence | low confidence rejected; ASL shows "not trained" | Arabic letters: tested offline (96.8 %). ASL: model pending |
| 5 | Letters | `arasl.ts` stable-read filter, word grouping, suggestions | recognised text (editable) | user can edit/delete | Implemented |
| 6 | Recognised text | "Send to assistant" → `/chat` | contextual reply (ar + en + sign) | server-down message, text kept | Tested with a mock Claude server (Playwright) |
| 7 | Reply | partner panel + TTS + avatar fingerspells `sign` | text, voice, signing | – | Tested with mock |

## Workflow B – Text → sign

| Step | Input | Component | Output | Error handling | Status |
|---|---|---|---|---|---|
| 1 | Typed (or dictated) text | Assistant screen (`ChatScreen.tsx`) | message bubble | empty input blocked | Implemented and tested |
| 2 | Conversation history (last 20) | `/chat` | `{ar, en, sign, source}` | on failure the message returns to the input box | Tested with mock (≈1.4 s round trip through the browser with the mock; real latency **not measured**) |
| 3 | Reply | chat bubble in UI language + other language below | text | – | Tested |
| 4 | `sign` | `AvatarViewer` fingerspelling (hand shapes per sign language) | avatar letters + live caption | letters without a hand shape are skipped (fallback text stays) | Arabic: implemented; ASL: no hand shapes yet |
| 5 | Reply | TTS (Arabic or English voice by text) | speech | – | Implemented, not tested with real voices |
| Alt | Live screen partner box | typed text → avatar fingerspells it directly (no chatbot) | – | – | Implemented (original behaviour kept) |

## What the avatar does (honest description)

Procedural **fingerspelling** of letters: each letter's hand shape comes from real ArASL photos via MediaPipe, solved onto the rig with inverse kinematics. It is not word-level signing, not motion capture and not AI-generated sign language. The chatbot only chooses which words to fingerspell.

## Not done / not measured

- Real Claude latency and reply quality: **Not measured** (no API key in this environment).
- Chatbot replies are not translated into sign-language grammar; only key words are fingerspelled.
