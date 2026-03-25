import redis
import os

redis_client = None

def get_redis():
    global redis_client
    if redis_client is None:
        host = os.getenv("REDIS_HOST", "redis")
        redis_client = redis.Redis(host=host, port=6379, db=0)
    return redis_client
