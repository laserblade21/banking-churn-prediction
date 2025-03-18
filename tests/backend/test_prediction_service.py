import pytest
import pandas as pd
import numpy as np
from backend.api.services.prediction_service import PredictionService

@pytest.fixture
def prediction_service():
    """Fixture to create a prediction service for testing"""
    return PredictionService()

@pytest.fixture
def sample_customer_data():
    """Fixture to create sample customer data for testing"""
    return {
        'customer_id': 'TEST001',
        'age': 35,
        'gender': 'M',
        'income': 75000,
        'account_age_months': 24,
        'balance': 5000,
        'num_products': 2,
        'has_credit_card': 1,
        'has_savings': 1,
        'has_loan': 0,
        'has_mortgage': 0,
        'has_investment': 0,
        'credit_score': 720,
        'months_inactive': 0,
        'transaction_count_12m': 45,
        'contacted_support': 0,
        'complaint_count': 0
    }

def test_predict_churn_probability(prediction_service, sample_customer_data):
    """Test that churn prediction returns expected format"""
    # Arrange
    customer_data = pd.DataFrame([sample_customer_data])
    
    # Act
    result = prediction_service.predict_churn_probability(customer_data)
    
    # Assert
    assert isinstance(result, float)
    assert 0 <= result <= 1

def test_generate_recommendations(prediction_service, sample_customer_data):
    """Test that recommendations are generated correctly"""
    # Arrange
    customer_data = pd.DataFrame([sample_customer_data])
    probability = 0.7  # High risk
    
    # Act
    recommendations = prediction_service.generate_recommendations(customer_data, probability)
    
    # Assert
    assert isinstance(recommendations, list)
    assert len(recommendations) > 0
    assert 'action' in recommendations[0]
    assert 'description' in recommendations[0]
    assert 'expected_impact' in recommendations[0]

def test_calculate_clv(prediction_service, sample_customer_data):
    """Test customer lifetime value calculation"""
    # Arrange
    customer_data = pd.DataFrame([sample_customer_data])
    
    # Act
    clv = prediction_service.calculate_clv(customer_data)
    
    # Assert
    assert isinstance(clv, float)
    assert clv > 0