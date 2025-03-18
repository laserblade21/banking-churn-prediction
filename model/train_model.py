import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
import logging
from datetime import datetime
import shap

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report,
    roc_curve, precision_recall_curve, average_precision_score
)
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

# Import for handling class imbalance
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

# Assuming the feature engineering code is in a module called feature_engineering
from feature_engineering import prepare_features

# Setup logging
os.makedirs('logs', exist_ok=True)
os.makedirs('models', exist_ok=True)
os.makedirs('visualizations', exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/model_training.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('model_training')

def load_and_prepare_data(file_path):
    """
    Load data from CSV and apply feature engineering
    
    Args:
        file_path: Path to the CSV file containing banking data
        
    Returns:
        tuple: X_train, X_test, y_train, y_test, feature_names, preprocessing_pipeline, customer_ids_test
    """
    logger.info(f"Loading data from {file_path}")
    df = pd.read_csv(file_path)
    
    # Check class distribution
    if 'Churn' in df.columns:
        churn_counts = df['Churn'].value_counts()
        logger.info(f"Class distribution in original data: {churn_counts.to_dict()}")
        churn_ratio = churn_counts[1] / len(df) if 1 in churn_counts else 0
        logger.info(f"Churn ratio: {churn_ratio:.2%}")
    
    logger.info("Applying feature engineering")
    df_engineered, preprocessing_pipeline = prepare_features(df)
    
    # Save feature engineered data for reference
    df_engineered.to_csv('data/feature_engineered_data.csv', index=False)
    
    # Split into features and target
    logger.info("Splitting into features and target")
    X = df_engineered.copy()
    
    if 'Churn' not in X.columns:
        raise ValueError("Error: 'Churn' column not found in the dataset")
    
    y = X.pop('Churn')  # Extract target and remove from features
    
    # Extract and store CustomerIDs separately
    customer_ids = None
    if 'CustomerID' in X.columns:
        customer_ids = X.pop('CustomerID')  # Remove CustomerID from features
    
    # Split into training and testing sets
    logger.info("Splitting into training and testing sets")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Store customer IDs for test set if available
    customer_ids_test = None
    if customer_ids is not None:
        # Get the indices of the test set
        test_indices = y_test.index
        customer_ids_test = customer_ids.loc[test_indices].reset_index(drop=True)
    
    # Apply preprocessing
    logger.info("Applying preprocessing pipeline")
    X_train_processed = preprocessing_pipeline.fit_transform(X_train)
    X_test_processed = preprocessing_pipeline.transform(X_test)
    
    # Get feature names
    try:
        # Attempt to get feature names from pipeline
        numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
        categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
        
        cat_features = []
        if hasattr(preprocessing_pipeline, 'transformers_'):
            for name, transformer, features in preprocessing_pipeline.transformers_:
                if name == 'cat' and hasattr(transformer, 'named_steps') and 'onehot' in transformer.named_steps:
                    cat_features = transformer.named_steps['onehot'].get_feature_names_out(categorical_features).tolist()
        
        feature_names = numeric_features + cat_features
    except Exception as e:
        logger.warning(f"Could not extract feature names: {str(e)}")
        # Fallback to simple feature names
        feature_names = [f"feature_{i}" for i in range(X_train_processed.shape[1])]
    
    logger.info(f"Training data shape: {X_train_processed.shape}")
    logger.info(f"Testing data shape: {X_test_processed.shape}")
    
    return X_train_processed, X_test_processed, y_train, y_test, feature_names, preprocessing_pipeline, customer_ids_test, X_test

def evaluate_models_with_balanced_data(X_train, X_test, y_train, y_test):
    """
    Train and evaluate multiple models with balanced data approach
    
    Args:
        X_train, X_test, y_train, y_test: Training and testing data
        
    Returns:
        Best performing model
    """
    logger.info("Evaluating multiple models with handling for class imbalance")
    
    # Check class distribution in training data
    unique, counts = np.unique(y_train, return_counts=True)
    class_distribution = dict(zip(unique, counts))
    logger.info(f"Class distribution in training data: {class_distribution}")
    
    # Calculate class weights inversely proportional to class frequencies
    n_samples = len(y_train)
    n_classes = len(np.unique(y_train))
    class_weights = {c: n_samples / (n_classes * count) for c, count in class_distribution.items()}
    logger.info(f"Using class weights: {class_weights}")
    
    # Models with class weight or balanced options
    models = {
        "Logistic Regression": LogisticRegression(class_weight=class_weights, max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(class_weight=class_weights, n_estimators=100, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
        "XGBoost": XGBClassifier(
            scale_pos_weight=class_weights[1]/class_weights[0], 
            n_estimators=100, 
            random_state=42
        ),
        "LightGBM": LGBMClassifier(
            class_weight=class_weights,
            n_estimators=100, 
            random_state=42
        ),
        "SMOTE + Random Forest": ImbPipeline([
            ('smote', SMOTE(random_state=42)),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ]),
        "SMOTE + XGBoost": ImbPipeline([
            ('smote', SMOTE(random_state=42)),
            ('classifier', XGBClassifier(n_estimators=100, random_state=42))
        ])
    }
    
    results = {}
    
    for name, model in models.items():
        logger.info(f"Training {name}")
        model.fit(X_train, y_train)
        
        # Predict on test set
        y_pred = model.predict(X_test)
        y_prob = None
        
        # Handle different predict_proba implementations
        if hasattr(model, 'predict_proba'):
            y_prob = model.predict_proba(X_test)[:, 1]
        elif hasattr(model, 'named_steps') and hasattr(model.named_steps['classifier'], 'predict_proba'):
            y_prob = model.named_steps['classifier'].predict_proba(X_test)[:, 1]
        else:
            logger.warning(f"{name} does not support predict_proba, skipping ROC-AUC calculation")
            continue
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_prob)
        
        # Store results
        results[name] = {
            'model': model,
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'roc_auc': roc_auc
        }
        
        logger.info(f"{name} - Accuracy: {accuracy:.4f}, Precision: {precision:.4f}, "
                   f"Recall: {recall:.4f}, F1: {f1:.4f}, ROC-AUC: {roc_auc:.4f}")
        
        # Log confusion matrix for each model
        cm = confusion_matrix(y_test, y_pred)
        logger.info(f"{name} Confusion Matrix:\n{cm}")
    
    # Find best model based on F1 score (better for imbalanced data)
    best_model_name = max(results, key=lambda x: results[x]['f1'])
    logger.info(f"Best model: {best_model_name} with F1 Score: {results[best_model_name]['f1']:.4f}")
    
    # Create comparison dataframe
    comparison_df = pd.DataFrame({
        'Model': list(results.keys()),
        'Accuracy': [results[model]['accuracy'] for model in results],
        'Precision': [results[model]['precision'] for model in results],
        'Recall': [results[model]['recall'] for model in results],
        'F1 Score': [results[model]['f1'] for model in results],
        'ROC-AUC': [results[model]['roc_auc'] for model in results]
    })
    
    # Save comparison to CSV
    comparison_df.to_csv('models/model_comparison.csv', index=False)
    
    # Plot comparison
    plt.figure(figsize=(12, 6))
    comparison_df.set_index('Model')[['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC-AUC']].plot(kind='bar')
    plt.title('Model Performance Comparison')
    plt.ylabel('Score')
    plt.ylim(0, 1)
    plt.tight_layout()
    plt.savefig('visualizations/model_comparison.png')
    
    return results[best_model_name]['model'], best_model_name

def find_optimal_threshold(model, X_test, y_test):
    """
    Find the optimal threshold for classification based on F1 score
    
    Args:
        model: Trained model
        X_test, y_test: Test data
        
    Returns:
        Optimal threshold value
    """
    logger.info("Finding optimal classification threshold")
    
    # Get predicted probabilities
    if hasattr(model, 'predict_proba'):
        y_prob = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, 'named_steps') and hasattr(model.named_steps['classifier'], 'predict_proba'):
        y_prob = model.named_steps['classifier'].predict_proba(X_test)[:, 1]
    else:
        logger.warning("Model does not support predict_proba, using default threshold of 0.5")
        return 0.5
    
    # Try different thresholds
    thresholds = np.arange(0.1, 0.9, 0.05)
    f1_scores = []
    
    for threshold in thresholds:
        y_pred = (y_prob >= threshold).astype(int)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        f1_scores.append(f1)
        logger.info(f"Threshold: {threshold:.2f}, F1 Score: {f1:.4f}")
    
    # Find best threshold
    best_idx = np.argmax(f1_scores)
    best_threshold = thresholds[best_idx]
    best_f1 = f1_scores[best_idx]
    
    logger.info(f"Optimal threshold: {best_threshold:.2f} with F1 Score: {best_f1:.4f}")
    
    # Plot F1 scores vs thresholds
    plt.figure(figsize=(8, 6))
    plt.plot(thresholds, f1_scores, marker='o')
    plt.axvline(x=best_threshold, color='r', linestyle='--', label=f'Best threshold: {best_threshold:.2f}')
    plt.title('F1 Score vs Classification Threshold')
    plt.xlabel('Threshold')
    plt.ylabel('F1 Score')
    plt.grid(True)
    plt.legend()
    plt.tight_layout()
    plt.savefig('visualizations/threshold_optimization.png')
    
    return best_threshold

def detailed_model_evaluation(model, X_test, y_test, feature_names, best_threshold=0.5):
    """
    Perform detailed evaluation of the final model
    
    Args:
        model: Trained model
        X_test, y_test: Testing data
        feature_names: Names of features
        best_threshold: Optimal classification threshold
        
    Returns:
        Dictionary with evaluation metrics
    """
    logger.info(f"Performing detailed model evaluation with threshold {best_threshold}")
    
    # Get predicted probabilities
    if hasattr(model, 'predict_proba'):
        y_prob = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, 'named_steps') and hasattr(model.named_steps['classifier'], 'predict_proba'):
        y_prob = model.named_steps['classifier'].predict_proba(X_test)[:, 1]
    else:
        logger.warning("Model does not support predict_proba, using default predict method")
        y_pred = model.predict(X_test)
        y_prob = y_pred  # This won't be used for threshold-based predictions
    
    # Make predictions with custom threshold
    y_pred = (y_prob >= best_threshold).astype(int)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_test, y_prob)
    
    # Log results
    logger.info(f"Final model evaluation with threshold {best_threshold}:")
    logger.info(f"Accuracy: {accuracy:.4f}")
    logger.info(f"Precision: {precision:.4f}")
    logger.info(f"Recall: {recall:.4f}")
    logger.info(f"F1 Score: {f1:.4f}")
    logger.info(f"ROC-AUC: {roc_auc:.4f}")
    
    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    logger.info(f"Confusion Matrix:\n{cm}")
    
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title(f'Confusion Matrix (threshold={best_threshold:.2f})')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig('visualizations/confusion_matrix.png')
    
    # ROC curve
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    plt.figure(figsize=(8, 6))
    plt.plot(fpr, tpr, label=f'ROC curve (area = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic')
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig('visualizations/roc_curve.png')
    
    # Precision-Recall curve
    precision_curve, recall_curve, _ = precision_recall_curve(y_test, y_prob)
    average_precision = average_precision_score(y_test, y_prob)
    
    plt.figure(figsize=(8, 6))
    plt.plot(recall_curve, precision_curve, label=f'PR curve (AP = {average_precision:.3f})')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')
    plt.legend(loc="lower left")
    plt.tight_layout()
    plt.savefig('visualizations/precision_recall_curve.png')
    
    # Classification report
    report = classification_report(y_test, y_pred, output_dict=True)
    report_df = pd.DataFrame(report).transpose()
    report_df.to_csv('models/classification_report.csv')
    
    # Feature importance
    try:
        # For tree-based models, get feature importance
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            indices = np.argsort(importances)[::-1]
            
            # Plot feature importances
            plt.figure(figsize=(12, 8))
            plt.bar(range(len(indices)), importances[indices])
            plt.xticks(range(len(indices)), [feature_names[i] for i in indices], rotation=90)
            plt.tight_layout()
            plt.title('Feature Importances')
            plt.savefig('visualizations/feature_importance.png')
            
            # Save feature importances to CSV
            importance_df = pd.DataFrame({
                'Feature': [feature_names[i] for i in indices],
                'Importance': importances[indices]
            })
            importance_df.to_csv('models/feature_importance.csv', index=False)
        # For pipeline models, try to access the classifier's feature importances
        elif hasattr(model, 'named_steps') and hasattr(model.named_steps['classifier'], 'feature_importances_'):
            importances = model.named_steps['classifier'].feature_importances_
            indices = np.argsort(importances)[::-1]
            
            # Plot feature importances
            plt.figure(figsize=(12, 8))
            plt.bar(range(len(indices)), importances[indices])
            plt.xticks(range(len(indices)), [feature_names[i] for i in indices], rotation=90)
            plt.tight_layout()
            plt.title('Feature Importances')
            plt.savefig('visualizations/feature_importance.png')
            
            # Save feature importances to CSV
            importance_df = pd.DataFrame({
                'Feature': [feature_names[i] for i in indices],
                'Importance': importances[indices]
            })
            importance_df.to_csv('models/feature_importance.csv', index=False)
    except Exception as e:
        logger.warning(f"Could not generate feature importance: {str(e)}")
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'roc_auc': roc_auc,
        'threshold': best_threshold
    }

def generate_risk_scores(model, X_test, customer_ids, best_threshold=0.5):
    """
    Generate risk scores for test customers
    
    Args:
        model: Trained model
        X_test: Test features (already preprocessed)
        customer_ids: Customer IDs for test data
        best_threshold: Optimal classification threshold
    """
    logger.info("Generating risk scores for test customers")
    
    # Verify dimensions
    logger.info(f"X_test shape: {X_test.shape}")
    if customer_ids is not None:
        logger.info(f"customer_ids shape: {customer_ids.shape}")
    
    if customer_ids is None or len(customer_ids) != X_test.shape[0]:
        logger.warning("CustomerID mismatch or not available. Using index as CustomerID.")
        customer_ids = pd.Series([f"CUST{i:06d}" for i in range(X_test.shape[0])])
    
    # Get predicted probabilities
    if hasattr(model, 'predict_proba'):
        y_prob = model.predict_proba(X_test)[:, 1]
    elif hasattr(model, 'named_steps') and hasattr(model.named_steps['classifier'], 'predict_proba'):
        y_prob = model.named_steps['classifier'].predict_proba(X_test)[:, 1]
    else:
        logger.warning("Model does not support predict_proba, using default predict method")
        y_pred = model.predict(X_test)
        y_prob = y_pred.astype(float)
    
    # Create risk categories
    risk_categories = pd.cut(
        y_prob,
        bins=[0, 0.3, 0.7, 1.0],
        labels=['Low', 'Medium', 'High']
    )
    
    # Create DataFrame with customer IDs and risk scores
    risk_df = pd.DataFrame({
        'CustomerID': customer_ids,
        'ChurnProbability': y_prob,
        'RiskCategory': risk_categories,
        'PredictedChurn': (y_prob >= best_threshold).astype(int)
    })
    
    # Save risk scores
    risk_df.to_csv('data/customer_risk_scores.csv', index=False)
    
    # Generate summary by risk category
    risk_summary = risk_df.groupby('RiskCategory').agg(
        CustomerCount=('CustomerID', 'count'),
        AverageChurnProbability=('ChurnProbability', 'mean')
    ).reset_index()
    
    # Save summary
    risk_summary.to_csv('data/risk_category_summary.csv', index=False)
    
    logger.info(f"Risk score generation complete: {len(risk_df)} customers scored")
    logger.info(f"Risk distribution: {risk_summary.to_dict('records')}")
    
    return risk_df

import pickle

def main():
    """
    Main function to run the model training pipeline
    """
    logger.info("Starting model training pipeline")
    
    # Load and prepare data
    X_train, X_test, y_train, y_test, feature_names, preprocessing_pipeline, customer_ids_test, X_test_orig = load_and_prepare_data('data/feature_engineered_data.csv')
    
    # Train and evaluate models with balanced approach
    best_model, best_model_name = evaluate_models_with_balanced_data(X_train, X_test, y_train, y_test)
    
    # Find optimal classification threshold
    best_threshold = find_optimal_threshold(best_model, X_test, y_test)
    
    # Detailed evaluation of model with optimized threshold
    evaluation_metrics = detailed_model_evaluation(best_model, X_test, y_test, feature_names, best_threshold)
    
    # Save the model, preprocessing pipeline, and optimal threshold
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_info = {
        'model': best_model,
        'preprocessing_pipeline': preprocessing_pipeline,
        'threshold': best_threshold,
        'metrics': evaluation_metrics,
        'feature_names': feature_names,
        'timestamp': timestamp
    }
    joblib.dump(model_info, f'models/churn_model_full_{timestamp}.pkl')
    joblib.dump(model_info, 'models/churn_model_latest.pkl')
    
    logger.info(f"Model saved with optimal threshold: {best_threshold}")
    
    # Generate risk scores using the trained model
    risk_df = generate_risk_scores(best_model, X_test, customer_ids_test, best_threshold)
    
    logger.info("Model training pipeline completed successfully")
    with open('models/model_latest.pkl', 'wb') as file:
        pickle.dump(best_model, file)
    return best_model, preprocessing_pipeline, evaluation_metrics, risk_df

if __name__ == "__main__":
    main()

