from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import os

codevault_bp = Blueprint('codevault', __name__)

from app.core.database import get_db

@codevault_bp.route('/files', methods=['POST'])
@jwt_required()
def create_file():
    user_id = get_jwt_identity()
    data = request.get_json()
    project_id = data.get('project_id')
    name = data.get('name')
    content = data.get('content', '')
    is_folder = data.get('is_folder', False)
    parent_path = data.get('parent_path', '/')
    
    db = get_db()
    file_id = db.files.insert_one({
        "project_id": ObjectId(project_id),
        "owner_id": ObjectId(user_id),
        "name": name,
        "content": content,
        "is_folder": is_folder,
        "parent_path": parent_path,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }).inserted_id
    
    return jsonify({"id": str(file_id), "message": "File created"}), 201

@codevault_bp.route('/files/<project_id>', methods=['GET'])
@jwt_required()
def get_project_files(project_id):
    user_id = get_jwt_identity()
    db = get_db()
    files = list(db.files.find({"project_id": ObjectId(project_id)}))
    for f in files:
        f['id'] = str(f['_id'])
        del f['_id']
        f['project_id'] = str(f['project_id'])
        f['owner_id'] = str(f['owner_id'])
    return jsonify(files), 200

@codevault_bp.route('/files/<file_id>', methods=['PUT'])
@jwt_required()
def update_file(file_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    content = data.get('content')
    
    db = get_db()
    db.files.update_one(
        {"_id": ObjectId(file_id), "owner_id": ObjectId(user_id)},
        {"$set": {"content": content, "updated_at": datetime.now()}}
    )
    return jsonify({"message": "File updated"}), 200

@codevault_bp.route('/files/<file_id>', methods=['DELETE'])
@jwt_required()
def delete_file(file_id):
    user_id = get_jwt_identity()
    db = get_db()
    db.files.delete_one({"_id": ObjectId(file_id), "owner_id": ObjectId(user_id)})
    return jsonify({"message": "File deleted"}), 200
