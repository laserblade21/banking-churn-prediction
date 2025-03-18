import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

def engineer_features(df):
    """
    Create new features for banking churn prediction.

    Args:
        df: DataFrame containing banking customer data.

    Returns:
        DataFrame with original and engineered features.
    """
    df_new = df.copy()

    # Remove CustomerID (not predictive)
    if 'CustomerID' in df_new.columns:
        customer_ids = df_new['CustomerID'].copy()
        df_new = df_new.drop('CustomerID', axis=1)

    # 1. Age-based features
    df_new['AgeGroup'] = pd.cut(
        df_new['Age'],
        bins=[18, 30, 40, 50, 60, 100],
        labels=['18-30', '31-40', '41-50', '51-60', '60+']
    )

    # print(df_new['AgeGroup'].value_counts())

    # 2. Balance features
    df_new['HasBalance'] = (df_new['Balance'] > 0).astype(int)
    df_new['BalancePerTransaction'] = df_new.apply(
        lambda x: x['Balance'] / x['Transactions'] if x['Transactions'] > 0 else 0,
        axis=1
    )

    # 3. Transaction intensity relative to tenure
    df_new['TransactionsPerMonth'] = df_new['Transactions'] / df_new['Tenure']

  
    # 4. Credit risk categories
    df_new['CreditScoreGroup'] = pd.qcut(
        df_new['CreditScore'],
        q=4,
        labels=['Low', 'Medium', 'Good', 'Excellent']
    )

   
    # 5. Tenure-based features
    df_new['NewCustomer'] = (df_new['Tenure'] <= 1).astype(int)
    df_new['LoyalCustomer'] = (df_new['Tenure'] >= 5).astype(int)

    # 6. Product density
    df_new['ProductDensity'] = df_new['NumProducts'] / df_new['Tenure']

    # 7. Income features
    df_new['IncomeGroup'] = pd.qcut(
        df_new['Income'],
        q=5,
        labels=['Very Low', 'Low', 'Medium', 'High', 'Very High']
    )

    # 8. Customer value features
    df_new['CustomerValue'] = (df_new['Balance'] * 0.3 + df_new['Transactions'] * 0.3 +
                                df_new['Income'] * 0.4) / 1000
    df_new['ValueSegment'] = pd.qcut(
        df_new['CustomerValue'],
        q=3,
        labels=['Standard', 'Plus', 'Premium']
    )

 

    # 9. Important interaction features
    df_new['Balance_x_Products'] = df_new['Balance'] * df_new['NumProducts']
    df_new['Balance_x_IsActive'] = df_new['Balance'] * df_new['IsActiveMember']

    # 10. Risk factors
    df_new['ProductBalanceRisk'] = ((df_new['NumProducts'] > 1) &
                                    (df_new['Balance'] < df_new['Balance'].quantile(0.3))).astype(int)
    df_new['InactiveWithCCRisk'] = ((df_new['IsActiveMember'] == 0) &
                                     (df_new['HasCreditCard'] == 1)).astype(int)

    # 11. Ratio features
    df_new['BalanceToIncome'] = df_new.apply(
        lambda x: x['Balance'] / x['Income'] if x['Income'] > 0 else 0,
        axis=1
    )

    # Add Customer ID back
    if 'CustomerID' in df.columns:
        df_new.insert(0, 'CustomerID', customer_ids)

    return df_new

def create_feature_pipeline(df):
    """Create a scikit-learn pipeline for preprocessing features."""
    numeric_features = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_features = df.select_dtypes(include=['object', 'category']).columns.tolist()

    if 'Churn' in numeric_features:
        numeric_features.remove('Churn')
    if 'CustomerID' in numeric_features:
        numeric_features.remove('CustomerID')

    numeric_transformer = Pipeline(steps=[('scaler', StandardScaler())])
    categorical_transformer = Pipeline(steps=[('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )

    return preprocessor

def prepare_features(df):
    """Full preparation of features for model training."""
    df_engineered = engineer_features(df)
    pipeline = create_feature_pipeline(df_engineered)
    return df_engineered, pipeline