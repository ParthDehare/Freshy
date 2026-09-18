# 🍎 Freshy: Autonomous Agentic Supply Chain & AI Apple Grader

Welcome to **Freshy** (also known as FreshScan AI)! This repository houses an advanced, multi-agent artificial intelligence ecosystem designed to revolutionize agricultural supply chains. 

Instead of relying on static tracking and blind logistics, Freshy utilizes state-of-the-art Computer Vision, Explainable AI (XAI), and predictive IoT modeling to actively monitor, grade, and preserve the shelf life of fresh produce in transit.

---

## 🌟 Key Features

### 1. Vision AI & Soft Voting Ensemble
*   **Object Detection**: `YOLOv11` automatically isolates the apple from the background, ensuring the classification models only look at the fruit, not the farmer's hand or table.
*   **Tri-Model Ensemble**: We use three powerful deep learning architectures—`Swin Transformer`, `ConvNeXt`, and `Vision Transformer (ViT)`.
*   **Uncertainty Calibration**: Instead of a hard, brittle SVM, we implemented a robust **Soft Voting Probability Averaging** system. If the models are confused (e.g., by a pile of occluded apples), the confidence correctly drops to ~40%, preventing disastrous "confident mistakes".

### 2. Explainable AI (XAI)
*   **SHAP KernelExplainer**: We eliminated the "Black Box" problem. The dashboard doesn't just give a grade; it mathematically calculates which model influenced the decision (e.g., `Feature c2` pulling the grade down).
*   **OOD Shift Detection**: By exposing model uncertainty and feature importance, the system helps identify Out-of-Distribution (OOD) data, such as highly processed stock photos that confuse models trained on raw farm images.

### 3. Multi-Agent Architecture (Phase 7)
We transitioned from static equations to an autonomous multi-agent ecosystem:
*   🧑‍🌾 **Orchard Agent**: Grades the apple, sets the initial Remaining Shelf Life (RSL), and requests transport.
*   🚚 **Transit Agent**: Uses a **1D Kalman Filter** to smooth noisy IoT temperature sensor data (ignoring spikes from truck doors opening) and a **Bi-LSTM** to predict *Thermal Debt* and dynamic RSL.
*   ☁️ **Market Agent**: A cloud brain that cross-references the LSTM's predicted spoilage time against Google Maps ETAs. If the apples will rot before arrival, it triggers a **Single Vehicle Routing Problem with Time Windows (SVRPTW)** protocol and uses an **XGBoost Pricing Engine** to calculate salvage prices for nearby wholesale markets.

---

## 🛠️ Technology Stack

*   **Computer Vision**: PyTorch, YOLOv11, `timm` (Swin, ConvNeXt, ViT)
*   **Explainable AI**: SHAP
*   **Predictive Modeling**: Kalman Filters, Bi-LSTM, XGBoost
*   **Backend**: Flask (Python), JSON Web Tokens (JWT)
*   **Database**: MongoDB Atlas (NoSQL for flexible SHAP/Sensor data)
*   **Frontend**: React 19, Vite, Tailwind CSS, Zustand, Recharts, Leaflet (GPS Live Maps)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js & npm
*   Python 3.10+
*   MongoDB Atlas Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ParthDehare/Freshy.git
   cd Freshy
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   pip install -r requirements.txt
   # Set up your .env file with MONGODB_URI and JWT_SECRET
   python seed.py   # Seed the database
   python app.py    # Start the Flask server
   ```

3. **Frontend Setup**
   ```bash
   cd Frontend/major_project
   npm install
   npm run dev      # Start the Vite React server
   ```

*(Note: The heavy `.pth` PyTorch model weights are hosted separately due to GitHub size limits. Please download them from the provided Google Drive link and place them in the `MachineLearning/` directory).*

---

## 📈 Future Scope
Future iterations will expand the Market Agent to utilize Graph Neural Networks (GNN) for massive multi-fleet supply chain optimization.
