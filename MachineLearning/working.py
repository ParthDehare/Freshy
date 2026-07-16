# import cv2
# import numpy as np
# import os
# from ultralytics import YOLO
# import torch
# import torch.nn as nn
# import numpy as np
# import os
# import csv
# import timm
# from PIL import Image
# from torchvision import transforms


# # 1. Configuration


# # --- 1. THE ARCHITECTURES (The Blueprints) ---

# class AppleSwin(nn.Module):
#     def __init__(self, num_classes=5):
#         super(AppleSwin, self).__init__()
#         self.model = timm.create_model('swin_tiny_patch4_window7_224', pretrained=False, num_classes=num_classes)
#     def forward(self, x):
#         x = self.model(x)
#         if len(x.shape) > 2: x = torch.mean(x, dim=[2, 3])
#         return x

# class AppleConvNeXt(nn.Module):
#     def __init__(self, num_classes=5):
#         super(AppleConvNeXt, self).__init__()
#         self.model = timm.create_model('convnext_tiny', pretrained=False, num_classes=num_classes)
#     def forward(self, x):
#         x = self.model(x)
#         if len(x.shape) > 2: x = torch.mean(x, dim=[2, 3])
#         return x

# class AppleViT(nn.Module):
#     def __init__(self, num_classes=5):
#         super(AppleViT, self).__init__()
#         # CHANGE THIS: from 'vit_tiny_patch16_224' to 'vit_base_patch16_224'
#         self.model = timm.create_model('vit_base_patch16_224', pretrained=False, num_classes=num_classes)
        
#     def forward(self, x):
#         x = self.model(x)
#         if len(x.shape) > 2:
#             x = torch.mean(x, dim=[2, 3]) 
#         return x

# # --- 2. THE UNIFIED ENSEMBLE CLASS ---

# DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# class AppleEnsemble:
#     def __init__(self, swin_path, conv_path, vit_path):
#         self.swin = AppleSwin(num_classes=5).to(DEVICE)
#         self.conv = AppleConvNeXt(num_classes=5).to(DEVICE)
#         self.vit = AppleViT(num_classes=5).to(DEVICE)
        
#         # Loading weights
#         self.swin.load_state_dict(torch.load(swin_path, map_location=DEVICE))
#         self.conv.load_state_dict(torch.load(conv_path, map_location=DEVICE))
        
#         # Direct backbone load for ViT to avoid the KeyMismatch
#         vit_ckpt = torch.load(vit_path, map_location=DEVICE)
#         self.vit.model.load_state_dict(vit_ckpt, strict=False)
        
#         self.swin.eval()
#         self.conv.eval()
#         self.vit.eval()
        
#         self.transform = transforms.Compose([
#             transforms.Resize((224, 224)),
#             transforms.ToTensor(),
#             transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
#         ])

#     def get_combined_matrix(self, image_path):
#         img = Image.open(image_path).convert('RGB')
#         img_tensor = self.transform(img).unsqueeze(0).to(DEVICE)
#         with torch.no_grad():
#             prob_s = torch.nn.functional.softmax(self.swin(img_tensor), dim=1).cpu().numpy().flatten()
#             prob_c = torch.nn.functional.softmax(self.conv(img_tensor), dim=1).cpu().numpy().flatten()
#             prob_v = torch.nn.functional.softmax(self.vit(img_tensor), dim=1).cpu().numpy().flatten()
#         return np.concatenate([prob_s, prob_c, prob_v])

# # --- 3. THE FOLDER-TO-CSV GENERATOR ---

# def generate_meta_dataset(root_dir, ensemble, output_csv="meta_data.csv"):
#     class_folders = sorted([f for f in os.listdir(root_dir) if os.path.isdir(os.path.join(root_dir, f))])
    
#     with open(output_csv, 'w', newline='') as f:
#         writer = csv.writer(f)
#         header = [f's{i}' for i in range(5)] + [f'c{i}' for i in range(5)] + [f'v{i}' for i in range(5)]
#         writer.writerow(header)

#         for class_index, folder_name in enumerate(class_folders):
#             folder_path = os.path.join(root_dir, folder_name)
#             print(f"Processing Index {class_index}: {folder_name}")
            
#             for img_name in os.listdir(folder_path):
#                 if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
#                     try:
#                         features = ensemble.get_combined_matrix(os.path.join(folder_path, img_name))
#                         writer.writerow(list(features) + [class_index])
#                     except Exception as e:
#                         print(f"Error at {img_name}: {e}")

#     print(f"CSV generated successfully as {output_csv}")

# # --- 4. RUNNING THE PROCESS ---

# if __name__ == "__main__":
#   model = YOLO("best.pt") 
#   input_folder = "./images" 
#   output_dir = "extracted_apples"
# os.makedirs(output_dir, exist_ok=True)

# apple_count = 1 
# valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
# image_files = sorted([f for f in os.listdir(input_folder) if f.lower().endswith(valid_extensions)])
# print(image_files)
# print(f"Starting sequential extraction for {len(image_files)} images...")

# # 2. Iterate through the folder
# for img_name in image_files:
#     img_path = os.path.join(input_folder, img_name)
#     results = model.predict(source=img_path, retina_masks=True, conf=0.8, verbose=False)
    
#     result = results[0]
#     original_img = result.orig_img
    
#     # Check if both masks and boxes exist
#     if result.masks is not None and result.boxes is not None:
#         h, w, _ = original_img.shape
        
#         # Zip masks and boxes together to get both shape and location
#         for mask_obj, box_obj in zip(result.masks, result.boxes):
#             # Mask processing for transparency
#             mask = mask_obj.data[0].cpu().numpy()
#             mask = cv2.resize(mask, (w, h))
#             mask_uint8 = (mask > 0.5).astype(np.uint8) * 255

#             # CORRECTED: Get bounding box from the box_obj, not the mask_obj
#             x1, y1, x2, y2 = box_obj.xyxy[0].cpu().numpy().astype(int)

#             # Create transparent BGRA image
#             b, g, r = cv2.split(original_img)
#             rgba = cv2.merge([b, g, r, mask_uint8])

#             # Crop the apple using coordinates from result.boxes
#             apple_crop = rgba[y1:y2, x1:x2]

#             # Set Sequential Name
#             file_name = f"a{apple_count}.png"
#             file_path = os.path.join(output_dir, file_name)
            
#             cv2.imwrite(file_path, apple_crop)
#             apple_count += 1
            
#         print(f"✅ Processed {img_name}")
#     else:
#         print(f"Skipping {img_name}: No detections.")

#     print(f"\nDone! Total apples: {apple_count - 1}")

#     # Ensure these paths are correct!
#     ensemble = AppleEnsemble('best_apple1_swin.pth', 'best_apple1_convnext.pth', 'best_apple1_vit.pth')
#     generate_meta_dataset("extracted_apples", ensemble)


# import pandas as pd
# import joblib

# # 1. Load the pre-trained SVM model
# # Ensure the path matches where your model is saved
# model = joblib.load('svm_model.pkl')

# # 2. Read the input CSV file
# # 'input_data.csv' should contain the features, but not the target label
# df = pd.read_csv('input_data.csv')

# # 3. Make Predictions
# # The model expects a 2D array-like structure (rows x features)
# predictions = model.predict(df)

# # 4. Handle the Output
# df['Predicted_Output'] = predictions
# df.to_csv('predictions_results.csv', index=False)

# results_df = pd.read_csv('predictions_results.csv')

# # Option 1: Print the first 10 rows (Apple ID and their Predicted Grade)
# print("--- Apple Grade Predictions ---")
# print(results_df[['Predicted_Output']].head(10))

# # Option 2: Get a count of how many apples fell into each grade category
# grade_counts = results_df['Predicted_Output'].value_counts()
# print("\n--- Grade Distribution ---")
# print(grade_counts)

# print("Predictions complete. Results saved to 'predictions_results.csv'.")



import cv2
import numpy as np
import os
import csv
import torch
import torch.nn as nn
import timm
import pandas as pd
import joblib
from ultralytics import YOLO
from PIL import Image
from torchvision import transforms

# --- 1. ARCHITECTURES ---

class AppleSwin(nn.Module):
    def __init__(self, num_classes=5):
        super(AppleSwin, self).__init__()
        self.model = timm.create_model('swin_tiny_patch4_window7_224', pretrained=False, num_classes=num_classes)
    def forward(self, x):
        return self.model(x)

class AppleConvNeXt(nn.Module):
    def __init__(self, num_classes=5):
        super(AppleConvNeXt, self).__init__()
        self.model = timm.create_model('convnext_tiny', pretrained=False, num_classes=num_classes)
    def forward(self, x):
        return self.model(x)

class AppleViT(nn.Module):
    def __init__(self, num_classes=5):
        super(AppleViT, self).__init__()
        self.model = timm.create_model('vit_base_patch16_224', pretrained=False, num_classes=num_classes)
    def forward(self, x):
        return self.model(x)

# --- 2. ENSEMBLE CLASS ---

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class AppleEnsemble:
    def __init__(self, swin_path, conv_path, vit_path):
        self.swin = AppleSwin(num_classes=5).to(DEVICE)
        self.conv = AppleConvNeXt(num_classes=5).to(DEVICE)
        self.vit = AppleViT(num_classes=5).to(DEVICE)
        
        # Load weights
        self.swin.load_state_dict(torch.load(swin_path, map_location=DEVICE))
        self.conv.load_state_dict(torch.load(conv_path, map_location=DEVICE))
        
        # ViT logic: strict=False is often needed for timm ViTs if the head was modified
        vit_ckpt = torch.load(vit_path, map_location=DEVICE)
        self.vit.load_state_dict(vit_ckpt, strict=False)
        
        self.swin.eval()
        self.conv.eval()
        self.vit.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def get_combined_matrix(self, image_path):
        img = Image.open(image_path).convert('RGB')
        img_tensor = self.transform(img).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            prob_s = torch.nn.functional.softmax(self.swin(img_tensor), dim=1).cpu().numpy().flatten()
            prob_c = torch.nn.functional.softmax(self.conv(img_tensor), dim=1).cpu().numpy().flatten()
            prob_v = torch.nn.functional.softmax(self.vit(img_tensor), dim=1).cpu().numpy().flatten()
        return np.concatenate([prob_s, prob_c, prob_v])

# --- 3. DATASET GENERATOR ---

def generate_meta_dataset(root_dir, ensemble, output_csv="meta_data.csv"):
    """Generates features from a directory of cropped images."""
    files = [f for f in os.listdir(root_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    with open(output_csv, 'w', newline='') as f:
        writer = csv.writer(f)
        # 15 features (5 from each model)
        header = [f's{i}' for i in range(5)] + [f'c{i}' for i in range(5)] + [f'v{i}' for i in range(5)]
        writer.writerow(header)

        for img_name in files:
            print(img_name)
            img_path = os.path.join(root_dir, img_name)
            try:
                features = ensemble.get_combined_matrix(img_path)
                writer.writerow(list(features))
            except Exception as e:
                print(f"Error processing {img_name}: {e}")

# --- 4. MAIN EXECUTION ---

if __name__ == "__main__":
    # Settings
    YOLO_MODEL_PATH = "best.pt"
    INPUT_FOLDER = "./images"
    OUTPUT_DIR = "extracted_apples"
    SVM_MODEL_PATH = "apple_grading_svm_model.pkl"
    META_CSV = "meta_data.csv"
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    yolo_model = YOLO(YOLO_MODEL_PATH) 

    # --- PHASE 1: Detection and Cropping ---
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    image_files = sorted([f for f in os.listdir(INPUT_FOLDER) if f.lower().endswith(valid_extensions)])
    
    apple_count = 1
    for img_name in image_files:
        img_path = os.path.join(INPUT_FOLDER, img_name)
        results = yolo_model.predict(source=img_path, retina_masks=True, conf=0.8, verbose=False)
        
        result = results[0]
        if result.masks is not None:
            original_img = result.orig_img
            h, w, _ = original_img.shape
            
            for mask_obj, box_obj in zip(result.masks, result.boxes):
                # Process mask
                mask = mask_obj.data[0].cpu().numpy()
                mask = cv2.resize(mask, (w, h))
                mask_uint8 = (mask > 0.5).astype(np.uint8) * 255

                # Coordinates
                x1, y1, x2, y2 = box_obj.xyxy[0].cpu().numpy().astype(int)

                # Transparency (BGRA)
                b, g, r = cv2.split(original_img)
                rgba = cv2.merge([b, g, r, mask_uint8])
                apple_crop = rgba[y1:y2, x1:x2]

                cv2.imwrite(os.path.join(OUTPUT_DIR, f"a{apple_count}.png"), apple_crop)
                apple_count += 1
            print(f"✅ Processed {img_name}")

    # --- PHASE 2: Feature Extraction ---
    # Update paths to your actual weight files
    ensemble = AppleEnsemble('best_apple1_swin.pth', 'best_apple1_convnext.pth', 'best_apple1_vit.pth')
    generate_meta_dataset(OUTPUT_DIR, ensemble, output_csv=META_CSV)

    # --- PHASE 3: SVM Grading ---
    if os.path.exists(SVM_MODEL_PATH):
        svm_clf = joblib.load(SVM_MODEL_PATH)
        df_features = pd.read_csv(META_CSV)
        
        if not df_features.empty:
            predictions = svm_clf.predict(df_features)
            df_features['Predicted_Grade'] = predictions
            
            # Save results
            df_features.to_csv('predictions_results.csv', index=False)
            
            print("\n--- Grade Distribution ---")
            print(df_features['Predicted_Grade'])
        else:
            print("No features extracted. Check your extraction step.")
    else:
        print(f"SVM model not found at {SVM_MODEL_PATH}")