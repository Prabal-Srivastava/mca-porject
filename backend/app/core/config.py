import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "flask-secret-key-12345")
    JWT_SECRET_KEY = os.getenv("SECRET_KEY", "flask-secret-key-12345")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://mongodb:27017/coderunner")
    REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
    
    CORS_HEADERS = 'Content-Type'
