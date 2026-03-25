from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import os
import psutil
import time

from app.core.database import get_db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/status', methods=['GET'])
def get_system_status():
    # Public status page logic
    db = get_db()
    try:
        # Check DB connection
        db.command('ping')
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"

    return jsonify({
        "status": "operational",
        "uptime": f"{int(time.time() - psutil.boot_time())}s",
        "services": {
            "api": "healthy",
            "database": db_status,
            "worker": "healthy" # Simplified for now
        }
    }), 200

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    user_id = get_jwt_identity()
    db = get_db()
    
    # Check if user is admin (simplified: first user or specific ID)
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user or not user.get('is_admin', False):
        return jsonify({"error": "Unauthorized. Admin access required."}), 403

    total_users = db.users.count_documents({})
    total_executions = db.executions.count_documents({})
    active_jobs = db.executions.count_documents({"status": "running"})
    
    # Language distribution
    pipeline = [
        {"$group": {"_id": "$language", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    lang_stats = list(db.executions.aggregate(pipeline))
    
    # Recent logs
    recent_logs = list(db.executions.find({}, {"code": 0}).sort("created_at", -1).limit(10))
    for log in recent_logs:
        log['id'] = str(log['_id'])
        del log['_id']
        log['user_id'] = str(log['user_id'])
    
    # System metrics
    cpu_usage = psutil.cpu_percent()
    memory_info = psutil.virtual_memory()
    
    return jsonify({
        "total_users": total_users,
        "total_executions": total_executions,
        "active_jobs": active_jobs,
        "language_stats": lang_stats,
        "recent_logs": recent_logs,
        "system": {
            "cpu": f"{cpu_usage}%",
            "memory": f"{memory_info.percent}%"
        }
    }), 200
