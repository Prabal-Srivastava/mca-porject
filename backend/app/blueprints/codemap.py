from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import os

from app.core.database import get_db

codemap_bp = Blueprint('codemap', __name__)

@codemap_bp.route('/map/<project_id>', methods=['GET'])
@jwt_required()
def get_codebase_map(project_id):
    user_id = get_jwt_identity()
    db = get_db()
    files = list(db.files.find({"project_id": ObjectId(project_id)}))
    
    # Simple dependency extraction logic for CodeMap
    # In production, parse imports/requires from AST
    nodes = []
    edges = []
    
    for f in files:
        nodes.append({"id": str(f['_id']), "label": f['name'], "type": "file", "is_folder": f.get('is_folder', False)})
        content = f.get('content', '')
        # Simple string-based import detection for mapping
        for other_f in files:
            if other_f['name'] in content:
                edges.append({"source": str(f['_id']), "target": str(other_f['_id'])})
                
    return jsonify({"nodes": nodes, "edges": edges}), 200
