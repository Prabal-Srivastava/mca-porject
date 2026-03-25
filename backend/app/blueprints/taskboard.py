from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import os

from app.core.database import get_db

taskboard_bp = Blueprint('taskboard', __name__)

@taskboard_bp.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    user_id = get_jwt_identity()
    data = request.get_json()
    project_id = data.get('project_id')
    title = data.get('title')
    status = data.get('status', 'Todo') # Todo, In Progress, Done
    priority = data.get('priority', 'medium') # low, medium, high
    file_id = data.get('file_id') # Link task to file
    
    db = get_db()
    task_id = db.tasks.insert_one({
        "project_id": ObjectId(project_id),
        "owner_id": ObjectId(user_id),
        "title": title,
        "status": status,
        "priority": priority,
        "file_id": ObjectId(file_id) if file_id else None,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }).inserted_id
    
    return jsonify({"id": str(task_id), "message": "Task created"}), 201

@taskboard_bp.route('/tasks/<project_id>', methods=['GET'])
@jwt_required()
def get_project_tasks(project_id):
    user_id = get_jwt_identity()
    db = get_db()
    tasks = list(db.tasks.find({"project_id": ObjectId(project_id)}))
    for t in tasks:
        t['id'] = str(t['_id'])
        del t['_id']
        t['project_id'] = str(t['project_id'])
        t['owner_id'] = str(t['owner_id'])
        if t.get('file_id'): t['file_id'] = str(t['file_id'])
    return jsonify(tasks), 200

@taskboard_bp.route('/tasks/<task_id>', methods=['PATCH'])
@jwt_required()
def update_task_status(task_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    status = data.get('status')
    
    db = get_db()
    db.tasks.update_one(
        {"_id": ObjectId(task_id), "owner_id": ObjectId(user_id)},
        {"$set": {"status": status, "updated_at": datetime.now()}}
    )
    return jsonify({"message": "Task status updated"}), 200
