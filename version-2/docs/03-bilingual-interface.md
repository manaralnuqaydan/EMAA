# EMAA – Phase 3: Bilingual Interface (Arabic / English)

Date: 2026-11-18

## What was built

| Item | Status | Where |
|---|---|---|
| Translation files `ar.json`, `en.json` (identical key sets) | Implemented and tested | `src/i18n/` |
| i18n context: `t()`, `lang`, `dir`, persisted in `localStorage` (`emaa.uiLang`) | Implemented and tested | `src/lib/i18n.tsx` |
| `<html lang dir>` and page title switch (ar/rtl ↔ en/ltr); stored choice applied before first paint | Implemented and tested (Playwright: all 4 screens, both languages, desktop 1280×800 and phone 390×844, no page errors) | `src/routes/__root.tsx` |
| Visible language switcher (العربية / English) on Home, Modes, Assistant, Live and Overview | Implemented and tested | `src/components/LanguageControls.tsx` |
| Sign-language selector (Arabic Sign Language / ASL), **independent** of the UI language, persisted (`emaa.signLang`), on the Modes screen and the Live screen header | Implemented and tested | `SignLanguagePicker` |
| Active sign language shown on the camera panel and on the avatar | Implemented and tested | `ChatScreen.tsx` |
| Honest ASL notice: the UI asks the API which models exist (`GET /` → `models`) and shows "ASL model not trained yet" instead of pretending | Implemented and tested | `model/api.py`, `ChatScreen.tsx` |
| Avatar hand shapes kept per sign language (no merging of Arabic and ASL hand shapes) | Implemented, not yet tested with ASL shapes (none exist yet) | `AvatarViewer.tsx` |
| Text-to-speech picks Arabic or English voice from the text itself; speech-to-text follows the UI language | Implemented but not fully tested (needs a real browser with voices) | `src/lib/speech.ts` |
| Camera permission error shown to the user | Implemented but not tested with a real camera | `ChatScreen.tsx` |
| Restored the original phrase recogniser (السلام عليكم، كيف حالك) as "Phrases" mode in Arabic | Implemented; API tested with samples from the original data | `model/api.py` `/predict-phrase`, `model/phrases_model.pkl` |

## Honesty fixes made while translating

- The Live screen used to set the confidence badge to a fixed **93 %** when the "proactive" mode fired. Removed; the badge now only shows the model's real confidence, and is labelled "Model confidence" (it was labelled "accuracy").
- The "proactive" banner said "Background Context Analyzer … semantic keyword matching". It is substring matching on a word list; the banner now says so.
- The proactive reply talked about "mandatory form fields", which had nothing to do with the conversation. Replaced with guidance about re-signing or typing.
- Mode 1 card said "type any text and the 3D avatar translates it"; that card opens the chatbot screen, so it now says what it does.

## Notes on the restored phrase model

The original model (`phrases_model.pkl`, RandomForest, 63 inputs) only knows two classes and always picks one of them, so the UI requires ≥80 % confidence and several stable readings. Its original accuracy figure is not reliable: `train.py` adds 9 noisy copies of every frame **before** the train/test split, so near-identical copies end up in both sets. It must be re-evaluated on held-out videos before any number is quoted.

## Remaining

- Brand words (إيماء / EEMAA) intentionally stay as they are in both languages.
- Chatbot replies come in both languages; the assistant screen shows the UI language first and the other below it.
- `dataset.json` offline replies are Arabic only.
