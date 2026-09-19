# Evaluation Notes

## Dataset Description and Collection Methodology
- **Total Images:** 2,500 images of apples at various stages of aging.
- **Classes:** Fresh, Slightly_Aged, Moderately_Aged, Significantly_Aged, Spoiled.
- **Methodology:** Collected under various lighting conditions (natural, fluorescent, LED) and backgrounds to ensure robustness.

## Data Augmentation Strategy
- Random rotation, horizontal/vertical flips.
- Color jitter (brightness, contrast, saturation adjustments).
- Random cropping and scaling.

## Model Training Details
- **Epochs:** 100 epochs for classification models, 150 epochs for YOLOv11-Seg.
- **Optimizer:** AdamW.
- **Learning Rate:** 1e-4 with cosine annealing schedule.
- **Batch Size:** 32.

## Evaluation Methodology
- 70/15/15 train/validation/test split.
- Metrics computed on the test set.
- Detection metrics computed using standard object detection methodology (IoU > 0.5).
- Classification metrics computed using soft voting probabilities from the three models.

## Limitations and Known Failure Cases
- Performance degrades in extremely low light conditions.
- Struggles distinguishing between Moderately_Aged and Significantly_Aged if only internal bruising is present (not visible externally).

## Hardware Used for Training
- 4x NVIDIA RTX 3090 GPUs.
- 128 GB RAM.
- Intel Core i9-10900K CPU.
