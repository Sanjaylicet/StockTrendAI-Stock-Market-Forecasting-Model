# StockTrend: AI-Enabled Stock Market Forecasting Model

[![Infosys Springboard](https://img.shields.io/badge/Internship-Infosys%20Springboard-blue)](https://verify.onwingspan.com)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An interactive stock market forecasting dashboard and machine learning model built during the **Infosys Springboard Internship 6.0 (Batch 13)**. The project implements a **Long Short-Term Memory (LSTM)** neural network in Keras/TensorFlow to forecast stock closing prices using a historical lookback window.

---

## 🎓 Internship & Certification Details
- **Program:** Internship 6.0 (B 13) StockTrend: AI Enabled Stock Market Forecasting Model
- **Organization:** Infosys Springboard
- **Duration:** February 5, 2026 – April 3, 2026
- **Intern:** Sanjay J

---

## 📈 Project Overview
This repository contains the end-to-end implementation of an AI-driven stock price predictor. The model is trained on a 100-day time-series dataset of stock closing prices, utilizing a 60-day lookback window (prediction window) to forecast prices for the subsequent 40 days (days 61 to 100).

To make the findings accessible, a modern, highly interactive **Web Dashboard** is provided, displaying:
1. **Actual vs. Predicted Prices**: Visualized with Chart.js, highlighting the 60-day historical window vs. the forecast period.
2. **Model Training Performance**: Interactive loss curve tracking MSE across 100 epochs.
3. **Data Quality Analysis**: Outlier detection using the Interquartile Range (IQR) method and missing value checks.
4. **Model Architecture**: Visual layout of the layers, activation functions, and shape transformations.

---

## 🛠️ Model Architecture & Hyperparameters
The forecasting model is built using the **Keras Sequential API** with the following layout:

| Layer | Type | Output Shape | Parameters | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Input** | Time-Series | `(None, 60, 1)` | 0 | 60-day lookback, 1 feature (`Close` price) |
| **LSTM 1** | Recurrent | `(None, 60, 50)` | 10,400 | 50 hidden units, returns sequences |
| **Dropout 1**| Regularization | `(None, 60, 50)` | 0 | Dropout rate = `0.2` |
| **LSTM 2** | Recurrent | `(None, 50)` | 20,200 | 50 hidden units, sequence return disabled |
| **Dropout 2**| Regularization | `(None, 50)` | 0 | Dropout rate = `0.2` |
| **Dense 1** | Fully Connected| `(None, 25)` | 1,275 | 25 nodes, intermediate feature extraction |
| **Dense 2** | Output (Linear) | `(None, 1)` | 26 | 1 node, outputs predicted close price |

- **Total Trainable Parameters:** 31,901 (124.61 KB)
- **Optimizer:** Adam
- **Loss Function:** Mean Squared Error (MSE)
- **Scaling:** `MinMaxScaler` bound to `[0, 1]`

---

## 📊 Core Data Findings & Training Metrics
- **Dataset Properties (100 days):**
  - **Mean Price:** \$147.02
  - **Volatility (Std Dev):** \$29.75
  - **Range:** \$100.55 to \$198.69
- **Data Quality & Preprocessing:**
  - **Missing Values:** Checked and confirmed as 0 (no imputation required).
  - **Outliers (IQR Method):** Upper Bound \$253.57, Lower Bound \$38.77. No outliers detected.
- **Model Training Convergence:**
  - The model underwent **100 epochs** of training with a batch size of **32**.
  - **Initial Epoch Loss (MSE):** `0.4097`
  - **Final Epoch Loss (MSE):** `0.0926`
  - **Loss Reduction:** ~`77.4%` improvement showing stable convergence without overfitting.

---

## 📁 Repository Structure
```directory
.
├── Springboard_milestone.ipynb   # Main Jupyter Notebook containing model code & preprocessing
├── index.html                    # Frontend dashboard markup
├── style.css                     # Custom dashboard stylesheets (Dark/Glassmorphism design)
├── app.js                        # Dashboard logic & Chart.js configuration
├── vercel.json                   # Vercel deployment configuration
├── LICENSE                       # License information
└── README.md                     # Project documentation (this file)
```

---

## 🚀 How to Run Locally

### 1. View the Web Dashboard
You can run the interactive dashboard locally by opening the `index.html` file in your browser, or serving the directory:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (serve package)
npx serve .
```
Navigate to `http://localhost:8000` (or the port specified) to view the dashboard.

### 2. Run the Machine Learning Model
To run and modify the LSTM model, open the Jupyter notebook:
```bash
jupyter notebook Springboard_milestone.ipynb
```
Ensure you have the required Python libraries installed:
```bash
pip install numpy pandas scikit-learn tensorflow matplotlib
```

---

## ⚡ Deployment
The interactive dashboard is optimized for quick deployment. You can host it on Vercel or GitHub Pages instantly:
- **Vercel:** Run `vercel` in the root directory (configured via `vercel.json`).
- **GitHub Pages:** Enable GitHub Pages in your repository settings pointing to the `main` branch.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](file:///d:/infosys/LICENSE) file for details.
