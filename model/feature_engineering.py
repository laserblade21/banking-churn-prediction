import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

def prepare_features(df):
    """
    Full preparation of features for model training
    
    Args:
        df: Raw banking customer DataFrame
        
    Returns:
        tuple: (engineered DataFrame, feature preprocessing pipeline)
    """
    # First, save the CustomerID if it exists
    customer_ids = None
    if 'CustomerID' in df.columns:
        customer_ids = df['CustomerID'].copy()
        df_without_id = df.drop('CustomerID', axis=1)
    else:
        df_without_id = df.copy()
    
    # Engineer features without CustomerID
    df_engineered = engineer_features(df_without_id)
    
    # Add CustomerID back to the engineered data
    if customer_ids is not None:
        df_engineered.insert(0, 'CustomerID', customer_ids)
    
    # Create preprocessing pipeline (explicitly excluding CustomerID)
    pipeline = create_feature_pipeline(df_engineered)
    
    return df_engineered, pipeline

def engineer_features(df):
    """
    Create new features to improve churn prediction model.
    
    Args:
        df: DataFrame containing banking customer data (without CustomerID)
        
    Returns:
        DataFrame with original and engineered features
    """
    # Create a copy to avoid modifying the original
    df_new = df.copy()
    
    # 1. Age-based features
    if 'Age' in df_new.columns:
        df_new['AgeGroup'] = pd.cut(
            df_new['Age'], 
            bins=[18, 30, 40, 50, 60, 100],
            labels=['18-30', '31-40', '41-50', '51-60', '60+']
        )
    
    # 2. Balance features
    if 'Balance' in df_new.columns:
        df_new['HasBalance'] = (df_new['Balance'] > 0).astype(int)
        
        if 'Transactions' in df_new.columns:
            df_new['BalancePerTransaction'] = df_new.apply(
                lambda x: x['Balance'] / x['Transactions'] if x['Transactions'] > 0 else 0, 
                axis=1
            )
    
    # 3. Transaction intensity relative to tenure
    if all(col in df_new.columns for col in ['Transactions', 'Tenure']):
        df_new['TransactionsPerMonth'] = df_new.apply(
            lambda x: x['Transactions'] / max(x['Tenure'], 1), 
            axis=1
        )
    
    # 4. Credit risk categories
    if 'CreditScore' in df_new.columns:
        df_new['CreditScoreGroup'] = pd.qcut(
            df_new['CreditScore'], 
            q=4, 
            labels=['Low', 'Medium', 'Good', 'Excellent']
        )
    
    # 5. Tenure-based features
    if 'Tenure' in df_new.columns:
        df_new['NewCustomer'] = (df_new['Tenure'] <= 1).astype(int)
        df_new['LoyalCustomer'] = (df_new['Tenure'] >= 5).astype(int)
    
    # 6. Product density
    if all(col in df_new.columns for col in ['NumProducts', 'Tenure']):
        df_new['ProductDensity'] = df_new.apply(
            lambda x: x['NumProducts'] / max(x['Tenure'], 1),
            axis=1
        )
    
    # 7. Income features
    if 'Income' in df_new.columns:
        df_new['IncomeGroup'] = pd.qcut(
            df_new['Income'], 
            q=5, 
            labels=['Very Low', 'Low', 'Medium', 'High', 'Very High']
        )
    
    # 8. Customer value features
    if all(col in df_new.columns for col in ['Balance', 'Transactions', 'Income']):
        df_new['CustomerValue'] = (df_new['Balance'] * 0.3 + df_new['Transactions'] * 0.3 + 
                                  df_new['Income'] * 0.4) / 1000
        df_new['ValueSegment'] = pd.qcut(
            df_new['CustomerValue'], 
            q=3, 
            labels=['Standard', 'Plus', 'Premium']
        )
    
    # 9. Important interaction features
    if all(col in df_new.columns for col in ['Balance', 'NumProducts']):
        df_new['Balance_x_Products'] = df_new['Balance'] * df_new['NumProducts']
    
    if all(col in df_new.columns for col in ['Balance', 'IsActiveMember']):
        df_new['Balance_x_IsActive'] = df_new['Balance'] * df_new['IsActiveMember']
    
    # 10. Risk factors
    if all(col in df_new.columns for col in ['NumProducts', 'Balance']):
        # High products + low balance = risk
        df_new['ProductBalanceRisk'] = ((df_new['NumProducts'] > 1) & 
                                      (df_new['Balance'] < df_new['Balance'].quantile(0.3))).astype(int)
    
    if all(col in df_new.columns for col in ['IsActiveMember', 'HasCreditCard']):
        # Inactive with credit card = risk
        df_new['InactiveWithCCRisk'] = ((df_new['IsActiveMember'] == 0) & 
                                       (df_new['HasCreditCard'] == 1)).astype(int)
    
    # 11. Ratio features
    if all(col in df_new.columns for col in ['Balance', 'Income']):
        df_new['BalanceToIncome'] = df_new.apply(
            lambda x: x['Balance'] / max(x['Income'], 1), 
            axis=1
        )
    
    return df_new

def create_feature_pipeline(df):
    """
    Create a scikit-learn pipeline for preprocessing features
    
    Args:
        df: DataFrame with engineered features
        
    Returns:
        Pipeline for transforming features
    """
    # Identify feature types, explicitly excluding ID and target columns
    exclude_columns = ['CustomerID', 'Churn']
    feature_columns = [col for col in df.columns if col not in exclude_columns]
    
    # Identify numeric and categorical features among remaining columns
    numeric_features = df[feature_columns].select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = df[feature_columns].select_dtypes(include=['object', 'category']).columns.tolist()
    
    # Create transformers
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    # Create preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='drop'  # This will drop any columns not explicitly included
    )
    
    return preprocessor

# Fix in the train_model.py file:
def load_and_prepare_data(file_path):
    """
    Load data from CSV and apply feature engineering
    
    Args:
        file_path: Path to the CSV file containing banking data
        
    Returns:
        tuple: X_train, X_test, y_train, y_test, feature_names, preprocessing_pipeline
    """
    logger.info(f"Loading data from {file_path}")
    df = pd.read_csv(file_path)
    
    logger.info("Applying feature engineering")
    df_engineered, preprocessing_pipeline = prepare_features(df)
    
    # Save feature engineered data for reference
    df_engineered.to_csv('data/feature_engineered_data.csv', index=False)
    
    # Split into features and target
    logger.info("Splitting into features and target")
    X = df_engineered.copy()
    
    # Make sure Churn column exists
    if 'Churn' not in X.columns:
        raise ValueError("Error: 'Churn' column not found in the dataset. Cannot proceed with model training.")
    
    y = X.pop('Churn')  # Extract target and remove from features
    
    # Save CustomerID separately and remove from features
    customer_ids = None
    if 'CustomerID' in X.columns:
        customer_ids = X.pop('CustomerID')  # Extract and remove CustomerID
    
    # Get original feature names before preprocessing
    original_feature_names = X.columns.tolist()
    
    # Split into training and testing sets
    logger.info("Splitting into training and testing sets")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Keep a copy of X_test before preprocessing for later use
    X_test_orig = X_test.copy()
    
    # Apply preprocessing
    logger.info("Applying preprocessing pipeline")
    X_train_processed = preprocessing_pipeline.fit_transform(X_train)
    X_test_processed = preprocessing_pipeline.transform(X_test)
    
    # Get feature names after preprocessing
    numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
    
    try:
        # Get feature names after preprocessing
        cat_features = []
        if hasattr(preprocessing_pipeline, 'transformers_'):
            for name, transformer, features in preprocessing_pipeline.transformers_:
                if name == 'cat' and hasattr(transformer, 'named_steps') and 'onehot' in transformer.named_steps:
                    cat_features = transformer.named_steps['onehot'].get_feature_names_out(features).tolist()
            
        feature_names = numeric_features + cat_features
    except Exception as e:
        logger.warning(f"Could not extract feature names: {str(e)}")
        # Fallback to simple feature names
        feature_names = [f"feature_{i}" for i in range(X_train_processed.shape[1])]
    
    return X_train_processed, X_test_processed, y_train, y_test, feature_names, preprocessing_pipeline, customer_ids, X_test_orig