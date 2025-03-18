import os
import logging
from logging.handlers import RotatingFileHandler
import time
from functools import wraps

def setup_logger(name, log_file, level=logging.INFO):
    """Function to set up a logger with specific configuration"""
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)
    
    # Create handlers
    file_handler = RotatingFileHandler(
        f'logs/{log_file}', 
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    console_handler = logging.StreamHandler()
    
    # Create formatters
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Add formatters to handlers
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Create application loggers
app_logger = setup_logger('app', 'app.log')
model_logger = setup_logger('model', 'model_training.log')
api_logger = setup_logger('api', 'api_requests.log')

# Performance logging decorator
def log_execution_time(logger):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            result = func(*args, **kwargs)
            end_time = time.time()
            logger.info(f"{func.__name__} executed in {end_time - start_time:.2f}s")
            return result
        return wrapper
    return decorator

# Example usage in app.py:
# from utils.logging_utils import app_logger, log_execution_time
# 
# @log_execution_time(app_logger)
# def some_expensive_operation():
#     ...