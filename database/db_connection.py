import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from backend.utils.logging_utils import app_logger

class Database:
    def __init__(self):
        self.config = {
            'dbname': os.getenv('DB_NAME', 'bank_churn'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'postgres'),
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432')
        }
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = None
        try:
            conn = psycopg2.connect(**self.config)
            yield conn
        except Exception as e:
            app_logger.error(f"Database connection error: {str(e)}")
            raise
        finally:
            if conn is not None:
                conn.close()
    
    def execute_query(self, query, params=None, fetch=True):
        """Execute a database query and return results if needed"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params or ())
                if fetch:
                    return cur.fetchall()
                conn.commit()
                return None

# Usage example:
# db = Database()
# customers = db.execute_query("SELECT * FROM customers WHERE risk_score > %s", [0.7])