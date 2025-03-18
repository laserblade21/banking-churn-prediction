import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
import logging
from datetime import datetime
import shap

from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report,
    roc_curve, precision_recall_curve, average_precision_score
)
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

from model.feature_engineering import prepare_features

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/model_training.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('model_training')

# Create directories if they don't exist
os.makedirs('logs', exist_ok=True)
os.makedirs('models', exist_ok=True)
os.makedirs('visualizations', exist_ok=True)

def load_and_prepare_data(file_path):
    """Load data, apply feature engineering, and split into train/test."""
    logger.info(f"Loading data from {file_path}")
    df = pd.read_csv(file_path)

    logger.info("Applying feature engineering")
    df_engineered, preprocessing_pipeline = prepare_features(df)
    df_engineered.to_csv('data/feature_engineered_data.csv', index=False)

    logger.info("Splitting into features and target")
    X = df_engineered.drop(['Churn'], axis=1)
    y = df_engineered['Churn']

    customer_ids = None
    if 'CustomerID' in X.columns:
        customer_ids = X['CustomerID']
        X = X.drop('CustomerID', axis=1)

    original_feature_names = X.columns.tolist()

    logger.info("Splitting into training and testing sets")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    logger.info("Applying preprocessing pipeline")
    X_train_processed = preprocessing_pipeline.fit_transform(X_train)
    X_test_processed = preprocessing_pipeline.transform(X_test)

    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()

    try:
        feature_names = (
            numeric_features +
            preprocessing_pipeline.transformers_[1][1].named_steps['onehot'].get_feature_names_out(categorical_features).tolist()
        )
    except:
        feature_names = [f"feature_{i}" for i in range(X_train_processed.shape[1])]

    return X_train_processed, X_test_processed, y_train, y_test, feature_names, preprocessing_pipeline, customer_ids, X_test

def train_and_evaluate_model(X_train, X_test, y_train, y_test, model_name, model_class, param_grid):
    """Train and evaluate a specific model."""
    logger.info(f"Training {model_name}")

    grid_search = GridSearchCV(
        model_class,
        param_grid,
        cv=5,
        scoring='roc_auc',
        n_jobs=-1,
        verbose=1
    )
    grid_search.fit(X_train, y_train)

    best_model = grid_search.best_estimator_
    y_pred = best_model.predict(X_test)
    y_prob = best_model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)

    logger.info(f"{model_name} - Accuracy: {accuracy:.4f}, ROC-AUC: {roc_auc:.4f}")
    return best_model, roc_auc

def main():
    """Main function to run model training."""
    logger.info("Starting model training pipeline")

    X_train, X_test, y_train, y_test, feature_names, preprocessing_pipeline, customer_ids, X_test_orig = load_and_prepare_data('data/banking_customer_data.csv')

    models_to_train = {
        "Logistic Regression": (LogisticRegression(random_state=42, max_iter=1000), {
            'C': [0.001, 0.01, 0.1, 1, 10, 100],
            'penalty': ['l2'],
            'solver': ['liblinear', 'saga']
        }),
        "XGBoost": (XGBClassifier(random_state=42), {
            'n_estimators': [100, 200, 300],
            'learning_rate': [0.01, 0.1, 0.2],
            'max_depth': [3, 4, 5],
            'subsample': [0.8, 0.9, 1.0]
        })
    }

    best_model = None
    best_roc_auc = 0
    best_model_name = ""

    for model_name, (model_class, param_grid) in models_to_train.items():
        model, roc_auc = train_and_evaluate_model(X_train, X_test, y_train, y_test, model_name, model_class, param_grid)
        if roc_auc > best_roc_auc:
            best_roc_auc = roc_auc
            best_model = model
            best_model_name = model_name

    logger.info(f"Best model: {best_model_name} with ROC-AUC: {best_roc_auc:.4f}")

    # Detailed evaluation, SHAP, saving, and risk scores (as in your original code)
    detailed_model_evaluation(best_model, X_test, y_test, feature_names, best_model_name)
    calculate_shap_values(best_model, X_test, feature_names, best_model_name)
    save_models(best_model, preprocessing_pipeline)
    generate_risk_scores(best_model, X_test, X_test_orig, customer_ids)

    logger.info("Model training pipeline completed successfully")

if __name__ == "__main__":
    main()