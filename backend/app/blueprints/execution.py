from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import uuid
from datetime import datetime
from bson import ObjectId
import os

from app.core.database import get_db

execution_bp = Blueprint('execution', __name__)

def get_limiter():
    from app.main import limiter
    return limiter

@execution_bp.route('/submit', methods=['POST'])
@jwt_required()
def execute_code():
    user_id = get_jwt_identity()
    data = request.get_json()
    code = data.get('code')
    language = data.get('language')
    stdin = data.get('stdin', '')
    chaos_mode = data.get('chaos_mode', False) # New chaos mode flag
    
    if not code or not language:
        return jsonify({"error": "Code and language are required"}), 400
    
    # Zero-Latency Edge Runner: Cache lookups for identical code/lang/stdin/chaos
    import hashlib
    import redis
    import json
    
    cache_key = f"exec_cache:{hashlib.md5(f'{code}:{language}:{stdin}:{chaos_mode}'.encode()).hexdigest()}"
    r = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
    
    cached_result = r.get(cache_key)
    if cached_result:
        result = json.loads(cached_result)
        return jsonify({
            "job_id": "cached",
            "status": 'completed',
            "stdout": result.get('stdout'),
            "stderr": result.get('stderr'),
            "execution_time": 0.001, # Simulating zero latency
            "is_cached": True
        }), 200

    db = get_db()
    job_id = str(uuid.uuid4())
    execution_id = db.executions.insert_one({
        "user_id": user_id,
        "code": code,
        "language": language,
        "stdin": stdin,
        "job_id": job_id,
        "chaos_mode": chaos_mode,
        "status": 'pending',
        "stdout": "",
        "stderr": "",
        "execution_time": None,
        "created_at": datetime.now()
    }).inserted_id
    
    # ... increment metrics ...
    
    # Trigger CodeForge Worker via Redis
    from app.services.execution_service import submit_job
    submit_job({
        "code": code,
        "language": language,
        "stdin": stdin,
        "chaos_mode": chaos_mode
    })
    
    return jsonify({
        "job_id": job_id,
        "status": 'pending'
    }), 202

@execution_bp.route('/job/<job_id>', methods=['GET'])
@jwt_required()
def get_result(job_id):
    user_id = get_jwt_identity()
    db = get_db()
    execution = db.executions.find_one({"job_id": job_id, "user_id": user_id})
    
    if not execution:
        return jsonify({"error": "Execution not found"}), 404
    
    execution['id'] = str(execution['_id'])
    del execution['_id']
    return jsonify(execution), 200

# Developer API: Run code via API Key or JWT
@execution_bp.route('/api/run', methods=['POST'])
@jwt_required(optional=True)
def api_run_code():
    from app.main import limiter
    user_id = get_jwt_identity()
    
    # Manual rate limit check for API
    with limiter.limit("30 per minute", key_func=lambda: user_id or "anonymous"):
        # For now, we only allow execution for logged-in users via JWT
        # In the future, we will add API Keys for non-JWT access
        if not user_id:
            return jsonify({"error": "Unauthorized. Please provide a valid JWT token."}), 401

        data = request.get_json()
    code = data.get('code')
    language = data.get('language')
    stdin = data.get('stdin', '')
    
    if not code or not language:
        return jsonify({"error": "Code and language are required"}), 400
    
    db = get_db()
    job_id = str(uuid.uuid4())
    execution_id = db.executions.insert_one({
        "user_id": user_id,
        "code": code,
        "language": language,
        "stdin": stdin,
        "job_id": job_id,
        "status": 'pending',
        "stdout": "",
        "stderr": "",
        "execution_time": None,
        "created_at": datetime.now(),
        "is_api": True
    }).inserted_id
    
    # Trigger CodeForge Worker via Redis
    from app.services.execution_service import submit_job
    submit_job({
        "code": code,
        "language": language,
        "stdin": stdin,
        "chaos_mode": False
    })
    
    return jsonify({
        "job_id": job_id,
        "status": 'pending',
        "poll_url": f"/job/{job_id}"
    }), 202
