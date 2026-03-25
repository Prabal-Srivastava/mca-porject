from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import os

from app.core.database import get_db

codemetrics_bp = Blueprint('codemetrics', __name__)

@codemetrics_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_code():
    user_id = get_jwt_identity()
    data = request.get_json()
    code = data.get('code')
    language = data.get('language')
    
    # Mock analysis logic for CodeMetrics demonstration
    # In production, use libraries like radon (Python), escomplex (JS)
    lines = code.split('\n')
    loc = len(lines)
    complexity = 1 + code.count('if ') + code.count('for ') + code.count('while ') + code.count('case ')
    
    score = 'A'
    if complexity > 20: score = 'F'
    elif complexity > 15: score = 'D'
    elif complexity > 10: score = 'C'
    elif complexity > 5: score = 'B'
    
    metrics = {
        "loc": loc,
        "complexity": complexity,
        "score": score,
        "functions": 1 + code.count('def ') + code.count('function '),
        "comments": code.count('#') + code.count('//'),
        "analyzed_at": datetime.now()
    }
    
    return jsonify(metrics), 200

@codemetrics_bp.route('/history/<project_id>', methods=['GET'])
@jwt_required()
def get_metrics_history(project_id):
    db = get_db()
    # Logic to fetch historical metrics from a collection
    return jsonify([]), 200
