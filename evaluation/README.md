# Evaluation Directory Overview

This directory contains evaluation metrics and methodological details for the Freshy computer vision pipeline.

## Files
- `grading_metrics.json`: Contains raw performance metrics for the object detection and classification models, including the soft voting ensemble.
- `evaluation_notes.md`: Detailed notes on dataset collection, augmentation, training hyperparameters, and model limitations.

## Methodology
The pipeline consists of:
1. **Object Detection and Segmentation:** YOLOv11-Seg isolates the food items from the background.
2. **Freshness Classification:** A tri-model ensemble consisting of Swin Transformer, ConvNeXt, and ViT evaluates the segmented items.
3. **Voting Mechanism:** Soft voting probability averaging is used to combine the predictions of the three classification models, improving overall robustness and accuracy.

## Reproducibility
To reproduce the evaluation:
1. Ensure the dataset is located in `data/test/`.
2. Run the evaluation script (e.g., `python evaluate.py`).
3. Results will be saved to this directory.
