from pymongo import MongoClient
import os
import time

mongo_client = None

def get_db():
    global mongo_client
    if mongo_client is None:
        init_db()
    return mongo_client.get_default_database()

def init_db(uri=None):
    global mongo_client
    if mongo_client is not None:
        return
    
    if uri is None:
        uri = os.getenv('MONGODB_URI', "mongodb://mongodb:27017/coderunner")
        
    print(f"Connecting to MongoDB at {uri}...")
    
    retries = 15
    while retries > 0:
        try:
            mongo_client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            mongo_client.server_info()
            print("Successfully connected to MongoDB")
            return
        except Exception as e:
            print(f"Failed to connect to MongoDB: {str(e)}. Retrying... ({retries} left)")
            time.sleep(3)
            retries -= 1
    
    print("CRITICAL: Could not connect to MongoDB.")
