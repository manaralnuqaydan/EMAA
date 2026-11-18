# EMAA – Phase 4: ASL Recognition (status: in development)

Date: 2026-11-18. Dataset chosen by the team: **ASL Citizen** (see `02-dataset-research.md`).

## Pipeline

```
ASL_Citizen.zip (team computer, 42.8 GB, never uploaded)
  └─ model/training/asl_citizen_extract.py   MediaPipe Holistic per frame → 9 upper-body points + 2 × 21 hand points (x, y, z)
                                    trimmed to the hand-visible part, resampled to 32 frames → (32, 153)
       └─ asl_citizen_landmarks.npz (small; derived data, not committed to Git)
            └─ model/training/asl_words_train.py     normalise (shoulder centre / shoulder width), augment (scale, shift, mirror L↔R),
                                            1D-CNN, official signer-independent splits, metrics → results/
                 └─ asl_words.onnx + asl_words_classes.json → api.py POST /predict-asl-word (OpenCV DNN)
Browser: Live screen → ASL → "Words": MediaPipe Holistic in the browser collects frames while the hands are visible,
         sends the 32-frame sequence when the hands drop for 0.5 s; low-confidence results show the top-3 instead of guessing.
```

The same normalisation code (`model/training/asl_words_features.py`) is used in training and in the API.

## Status

| Item | Status | Evidence |
|---|---|---|
| Extraction script (reads the zip directly, resumable, parallel) | Implemented; tested on a synthetic zip with the official CSV layout (`splits/{train,val,test}.csv`, `videos/`) | 8/8 videos → npz `(8, 32, 153)` |
| Training script + ONNX export | Implemented; tested end-to-end on synthetic data | ONNX loads in OpenCV DNN and returns class probabilities |
| Signer leakage guard | Implemented (`assert` that no test signer is in train) | `asl_words_train.py` |
| API `/predict-asl-word` with top-3 and confidence | Implemented; tested with the synthetic model | `GET /` reports `asl_words` |
| Browser "Words" mode (Holistic, sequence capture, unsure → top-3) | Implemented; UI tested without a model (shows "not trained yet") | Playwright, no page errors |
| Real ASL word model | **Not implemented yet** – waiting for `asl_citizen_landmarks.npz` from the team | – |
| Accuracy / latency on real data | **Not measured yet** | – |
| ASL letters (ASL Alphabet, `asl_landmarks.py`) | Partially implemented – no dataset yet | – |
| Continuous ASL sentences | Not implemented (isolated words only) | – |

## Vocabulary

`asl_citizen_extract.py` picks up to 100 everyday conversation words (hello, thank you, help, doctor, water, …) that exist in ASL Citizen, and fills the rest with the most frequent glosses. The exact list is saved in `asl_words_classes.json` and `results/asl_words_config.json` after training.

## Licence handling

- Videos stay on the team computer; only landmark coordinates (no images) leave it.
- `asl_citizen_landmarks.npz`, the cache folder and the trained model's data are excluded from Git (`.gitignore`).
- Use is non-commercial research/education only (Microsoft Research License). The trained model must not be offered as a public hosted service.
