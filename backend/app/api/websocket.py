from flask_socketio import SocketIO, emit
import redis
import os

socketio = SocketIO()
redis_host = os.getenv("REDIS_HOST", "redis")
r = redis.Redis(host=redis_host, port=6379)

@socketio.on("join_job")
def join_job(data):
    job_id = data["job_id"]
    pubsub = r.pubsub()
    pubsub.subscribe(f"job:{job_id}")

    for message in pubsub.listen():
        if message["type"] == "message":
            emit("job_update", message["data"].decode())
