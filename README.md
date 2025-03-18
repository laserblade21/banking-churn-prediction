# Banking Churn Prediction System

## 📌 Project Overview
The **Banking Churn Prediction System** is an advanced data-driven platform that helps financial institutions predict customer churn. It provides interactive visualizations, risk segmentation, and actionable insights to enhance customer retention strategies.

## 🚀 Features
- **Machine Learning Model**: XGBoost-based churn prediction.
- **Risk Segmentation**: Categorizes customers into Low, Medium, and High-risk groups.
- **Interactive Dashboard**: Visual insights into churn trends, risk distribution, and customer behavior.
- **Data Processing Pipeline**: Automated feature engineering and model training.
- **Full-Stack Implementation**: Flask backend with a React frontend.
- **CI/CD Integration**: Automates testing and deployment using GitHub Actions.

## 🏗️ Project Structure
```
banking-churn-prediction/
├── backend/                  # Flask backend
│   ├── app.py                # Main API logic
│   ├── models/               # Trained ML models
│   ├── routes/               # API endpoints
│   ├── data/                 # Processed customer data
│   ├── utils/                # Helper functions
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React frontend
│   ├── src/components/       # UI components
│   ├── src/pages/            # Page layouts
│   ├── src/services/         # API service calls
│   ├── src/styles/           # CSS styles
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
│
├── models/                   # Machine learning models
│   ├── model_latest.pkl      # Latest trained model
│   ├── pipeline_latest.pkl   # Data processing pipeline
│
├── data/                     # Raw and processed data
│   ├── banking_customer_data.csv
│   ├── feature_engineered_data.csv
│
├── visualizations/           # Model performance and insights
│   ├── model_comparison.png
│   ├── churn_trends.png
│   ├── feature_importance.png
│
├── README.md                 # Project documentation
└── .gitignore                # Files to exclude from version control
```

## ⚙️ Setup & Installation
### **1️⃣ Backend Setup**
```sh
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### **2️⃣ Frontend Setup**
```sh
cd frontend
npm install
npm run dev
```

### **3️⃣ Run the Full Project**
Ensure the **backend** is running before starting the frontend:
```sh
cd backend && python app.py  # Start Flask backend
cd frontend && npm run dev   # Start React frontend
```

## 🛠️ Key Technologies
- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Flask, FastAPI (for API endpoints)
- **Machine Learning**: XGBoost, Scikit-learn, Pandas, SHAP
- **Database**: PostgreSQL (or SQLite for development)
- **Deployment**: Docker, CI/CD with GitHub Actions

## 📊 Model Performance
- **Best Model**: XGBoost
- **F1 Score**: **48%**
- **ROC-AUC**: **63.99%**
- **Feature Importance**: Customer Tenure, Account Balance, Credit Score

## 🏆 Future Enhancements
- **Improve Model Performance** with hyperparameter tuning.
- **Enhance the Dashboard** with real-time customer segmentation.
- **Deploy on Cloud Platforms** like AWS or Azure.
- **Expand Data Sources** with transaction history for better insights.

## 📜 License
This project is open-source under the **MIT License**.

## 🤝 Contributing
Want to contribute? Fork this repo, create a feature branch, and submit a pull request!

---
### 💡 Need Help?
If you run into any issues, feel free to **open an issue** or reach out!

