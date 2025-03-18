import pandas as pd
import numpy as np
import random
from faker import Faker
import os

fake = Faker()
np.random.seed(42)
random.seed(42)

def generate_banking_data(num_records: int, churn_rate: float = 0.2):
    data = []  # Indented
    
    for _ in range(num_records):  # Indented
        customer_id = fake.uuid4()  # Indented
        age = np.random.randint(18, 80)  # Indented
        balance = round(np.random.uniform(100, 100000), 2)  # Indented
        transactions = np.random.randint(1, 500)  # Indented
        credit_score = np.random.randint(300, 850)  # Indented
        tenure = np.random.randint(1, 30)  # Indented
        income = round(np.random.uniform(20000, 200000), 2)  # Indented
        num_products = np.random.randint(1, 5)  # Indented
        has_credit_card = np.random.choice([0, 1])  # Indented
        is_active_member = np.random.choice([0, 1])  # Indented
        
        
        churn = np.random.choice([0, 1], p=[1-churn_rate, churn_rate])  # Indented
        
        data.append([  # Indented
            customer_id, age, balance, transactions, credit_score, tenure, income,  # Indented
            num_products, has_credit_card, is_active_member, churn  # Indented
        ])  # Indented
    
    columns = [  # Indented
        "CustomerID", "Age", "Balance", "Transactions", "CreditScore", "Tenure", "Income",  # Indented
        "NumProducts", "HasCreditCard", "IsActiveMember", "Churn"  # Indented
    ]  # Indented
    
    return pd.DataFrame(data, columns=columns)  # Indented

# Generate sample and full datasets
small_sample = generate_banking_data(500, churn_rate=0.25)
full_dataset = generate_banking_data(5000, churn_rate=0.20)

folder_path = r"C:\Users\User\OneDrive\Desktop\banking_dataset"


if not os.path.exists(folder_path):
    os.makedirs(folder_path)

small_sample.to_csv(os.path.join(folder_path, "sample_banking_data.csv"), index=False)
full_dataset.to_csv(os.path.join(folder_path, "full_banking_data.csv"), index=False)

print("Datasets generated and saved successfully!")