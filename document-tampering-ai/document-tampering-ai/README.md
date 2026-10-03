# Document Tampering Detection — AI Model (Phase 1)

Academic/SIH project. This phase builds and evaluates **only** the AI model:

```
Document Image → U-Net (PyTorch) → Tampering Probability + Pixel-Level Mask + Heatmap
```

OCR, QR verification, face recognition, liveness, document classification, risk
scoring, evidence fusion, frontend, backend APIs, and databases are **out of
scope** for this phase and will be added later, after the model itself is
evaluated.

## Status

- [x] Step 1 — Project structure + environment
- [ ] Step 2 — Synthetic tampering generator
- [ ] Step 3 — Generate dataset
- [ ] Step 4 — Visualize images + ground-truth masks
- [ ] Step 5 — PyTorch Dataset/DataLoader
- [ ] Step 6 — U-Net implementation
- [ ] Step 7 — Forward-pass sanity test
- [ ] Step 8 — Tiny overfitting test
- [ ] Step 9 — Full training
- [ ] Step 10 — Test set evaluation
- [ ] Step 11 — Threshold analysis
- [ ] Step 12 — Per-tampering-type evaluation
- [ ] Step 13 — Heatmaps
- [ ] Step 14 — Failure case analysis
- [ ] Step 15 — Final evaluation report

## Setup

```bash
cd document-tampering-ai
python3 -m venv .venv
# Windows: .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
python check_environment.py
```

`check_environment.py` confirms every required library is installed and
prints whether PyTorch found a CUDA GPU or will fall back to CPU.

## Project layout

```
document-tampering-ai/
├── dataset/            # original, tampered, masks, train/val/test split files
├── data_generation/    # synthetic tampering generator
├── data/               # PyTorch Dataset/DataLoader code
├── models/             # U-Net architecture
├── training/           # training loop + loss functions
├── evaluation/         # metrics on held-out test set
├── inference/          # run the trained model on a new image
├── visualization/      # heatmap generation
├── weights/            # saved model checkpoints (best_model.pth)
├── outputs/            # predictions, heatmaps, evaluation reports
├── requirements.txt
└── README.md
```

## Important caveat

This model is trained on **synthetic** tampering generated from genuine
document images. It is a research prototype, not a certified forgery
detector. It does not guarantee detection of every real-world forgery
technique, and its output should be treated as an AI screening signal —
never as a legal determination of document fraud.
