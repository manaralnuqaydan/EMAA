# EMAA – Phase 2: Dataset Research and License Verification

Date: 2026-11-18. Facts below come from the official pages/repositories listed for each dataset, read on this date. Anything a source does not state is marked **Not stated**. Nothing was downloaded except the WLASL annotation JSON (12 MB, from the official GitHub repo) to verify its statistics. No dataset is committed to Git.

> Not legal advice. Licence wording should be read by a person on the official page before relying on it.

## 1. Comparison

| Dataset | Sign type | Classes | Size | Signers | Signer-independent split | License | Emaa suitability |
|---|---|---|---|---|---|---|---|
| **ASL Citizen** | Isolated (word) | 2,731 | 83,399 videos, one 42.8 GB zip | 52 Deaf/HoH | **Yes** (35 train / 6 val / 11 test signers) | Microsoft Research License: non-commercial research only, no redistribution, no stand-alone hosted service | **Recommended** for ASL words |
| **WLASL** | Isolated (word) | 2,000 (subsets 100/300/1000/2000) | 21,083 instances in `WLASL_v0.3.json`; videos must be fetched from source sites, links expire | 119 (counted from the JSON) | **No** – WLASL100 test signers overlap train signers (52 of 56, counted from the JSON) | C-UDA 1.0; README: "academic and computational use only. No commercial usage" | Usable as a fallback; accuracy would not be signer-independent |
| **MS-ASL** | Isolated (word) | 100 / 200 / 500 / 1000 | 25,513 samples; the official download (`MS-ASL.zip`, 1.9 MB) cannot hold videos, so it is presumably links/annotations only (zip contents not verified) | 189–222 per subset | Stated as supported ("signer-independent test"); split details not stated | **Not stated** on the official pages (prompt says C-UDA; unverified) | Not recommended: licence unverified and YouTube videos may be gone |
| **How2Sign** | Continuous sentences | Open (English translations) | >80 h; RGB clips 31 GB (train front); 2D keypoints 21 GB (train) | Not stated (signer page lists 11) | Not stated (follows How2 splits) | CC BY-NC 4.0; "research purposes only"; original How2 data not redistributed | Not for now: too large for CPU training; gloss/3D not yet released |
| **KArSL** (Arabic) | Isolated (word) | 502 (letters, numbers, health, verbs, family, …) | 75,300 samples (502 × 3 signers × 50) | 3 professional | Not stated (only 3 signers, so true signer-independence is limited) | **Not stated**; contact author hluqman@kfupm.edu.sa | Best candidate for Arabic word signs. "ArSL dictionary"; pages do **not** say Saudi |
| **KSU-ArSL** (Arabic) | Isolated | 80 (letters, numbers, common words) | 16,000 samples per camera | 40 | Not stated | **Not stated** (licence field blank) | Download link not found; skip unless obtained from KSU |
| ArASL (in use) | Static letters | 32 | 54,049 images | 40+ | n/a | CC BY 4.0 | Already integrated (Arabic fingerspelling) |

## 2. Per-dataset detail

### ASL Citizen
- Pages: microsoft.com/en-us/research/project/asl-citizen/ (+ dataset-license, dataset-description tabs); download page id=105253.
- Files: `ASL_Citizen.zip` 42.8 GB, `Demographics.zip` 5 KB. Version 1.0 (download page dated 10/15/2024; description table says June 2023).
- Vocabulary from ASL-LEX; gloss metadata file provided (name not stated). Video format, resolution, fps, CSV columns: **Not stated** on the pages.
- Splits: train 40,154 · val 10,304 · test 32,941 videos; "Splits are user-independent".
- Licence key terms (Microsoft Research License Terms): use "solely for non-commercial, non-revenue generating, research purposes"; "you may not distribute the data or your modifications"; may not "provide the Materials as a stand-alone hosted solution for others to use"; personal data must be destroyed at the end of the research; results may be published "provided that no material or substantial portion of the Materials is included". Commercial contact: ASL_Citizen@microsoft.com.
- **Public exhibition is not addressed** → flag for review (see §4).
- Access from this cloud environment: download.microsoft.com is blocked by the network proxy, so the download must happen on a team member's computer.

### WLASL
- Repo github.com/dxli94/WLASL; homepage dxli94.github.io/WLASL.
- `WLASL_v0.3.json` fields: gloss, bbox, fps (25), frame_start/end, instance_id, signer_id, source, split, url, variation_id, video_id. Splits in JSON: 14,289 train / 3,916 val / 2,878 test.
- Videos are scraped from 20+ dictionary sites and YouTube (4,321 YouTube URLs); missing videos are requested through a Google Form with terms of use.
- Licence: C-UDA 1.0 (`C-UDA-1.0.pdf` in the repo). The PDF could not be opened from this environment, so its clauses are **not verified**.

### MS-ASL
- Research page statistics table (classes/subjects/samples) as above. Download page: `MS-ASL.zip`, 1.9 MB, version August 2019.
- Annotation format, licence and split construction: **Not stated** on either page.

### How2Sign
- how2sign.github.io; download script `download_how2sign.sh` (Google Drive).
- Available: RGB front/side videos and clips, frontal 2D keypoints, English translations (original and re-aligned). Depth, 3D skeletons and gloss: "under construction".
- Licence: CC BY-NC 4.0 – attribution, indicate changes, non-commercial.

### KArSL
- hamzah-luqman.github.io/KArSL. Kinect V2: RGB, depth, skeleton. Downloads (Google Drive): KArSL-100, KArSL-190, KArSL-502 as raw videos and 256×256 RGB frames; depth/skeleton links are placeholders.
- Citation: Sidig, Luqman, Mahmoud, Mohandes, "KArSL: Arabic Sign Language Database", ACM TALLIP 20(1), 2021.

## 3. Compatibility with the current Emaa models

- Current Arabic model: single image → letter (CNN on 64×64 grey hand crops). It cannot recognise **movement**, so none of the word-level datasets above can be used with it.
- Word-level signs need a **temporal** pipeline: per-frame MediaPipe Holistic landmarks (hands + pose + some face points) → sequence model (small 1D-CNN/GRU/Transformer) → gloss with confidence. The same browser MediaPipe setup already used for letters can produce these landmarks live, so camera frames still never leave the device.
- This environment has no GPU. A landmark sequence model on ~100 signs is realistic on CPU; thousands of signs or raw-video models (I3D) are not.

## 4. Flags for review (not proceeding until answered)

1. **Exhibition use.** All ASL datasets are non-commercial/research licences. Showing a research prototype at an academic exhibition is plausibly "non-commercial research", but none of the licences mentions exhibitions. Emaa must not be sold, hosted as a public service, or ship the data. Recommended: confirm the exhibition is non-commercial, and for ASL Citizen optionally email ASL_Citizen@microsoft.com.
2. **KArSL licence is not stated** → email the author before use.
3. **"Saudi Sign Language" claim.** ArASL and KArSL are described as Arabic Sign Language (ArSL), not Saudi Sign Language specifically. Wording on the poster/UI should say "Arabic Sign Language (collected in Saudi Arabia)" unless a Saudi-specific source is confirmed.
4. **WLASL accuracy would not be signer-independent** with the official split; a custom split by `signer_id` would be needed.

## 5. Recommendation

| Need | Dataset | Plan |
|---|---|---|
| ASL words | **ASL Citizen**, subset of ~100 everyday conversational signs | Download on a team computer (42.8 GB), extract MediaPipe landmarks there (only small landmark files leave that computer), train a landmark sequence model, report accuracy on the official signer-independent test split |
| ASL letters | ASL Alphabet (Kaggle, already planned in `model/asl_landmarks.py`) | Licence must be checked on the Kaggle page before use |
| Arabic words | KArSL-100 or KArSL-190 | After the author confirms terms |
| Continuous sentences | – | Out of scope for this exhibition; documented as "Not implemented" |
