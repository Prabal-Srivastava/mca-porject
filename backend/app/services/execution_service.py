import redis
import uuid
import os
import json

redis_host = os.getenv("REDIS_HOST", "redis")
r = redis.Redis(host=redis_host, port=6379)

def submit_job(data):
    job_id = str(uuid.uuid4())
    job_data = {"id": job_id, "data": data}
    r.lpush("job_queue", json.dumps(job_data))
    return job_id

def submit_test_job(run_id, data):
    job_data = {"id": str(run_id), "data": data}
    r.lpush("test_queue", json.dumps(job_data))
    return str(run_id)
