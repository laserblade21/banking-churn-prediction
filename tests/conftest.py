import pytest
import os
import sys

# Add the project root directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Create a test database fixture
@pytest.fixture(scope="session")
def test_db():
    """Create a test database for the test session"""
    # Here you would typically:
    # 1. Create a test database
    # 2. Run migrations
    # 3. Add test data
    # For simplicity, we'll just return a connection configuration
    from database.db_connection import Database
    
    # Override environment variables for testing
    os.environ['DB_NAME'] = 'test_bank_churn'
    os.environ['DB_USER'] = 'postgres'
    os.environ['DB_PASSWORD'] = 'postgres'
    os.environ['DB_HOST'] = 'localhost'
    
    # Return database instance
    return Database()

# Create a test app fixture
@pytest.fixture(scope="session")
def test_client():
    """Create a test client for the Flask app"""
    from backend.app import app
    
    # Configure the app for testing
    app.config.update({
        "TESTING": True,
    })
    
    # Create a test client
    with app.test_client() as client:
        yield client