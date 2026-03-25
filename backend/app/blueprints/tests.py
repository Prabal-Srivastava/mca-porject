from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import os

from app.core.database import get_db

tests_bp = Blueprint('tests', __name__)

@tests_bp.route('/suites', methods=['POST'])
@jwt_required()
def create_suite():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    language = data.get('language')
    repo_url = data.get('repo_url', '')
    env_vars = data.get('env_vars', {})
    parallel = data.get('parallel', False)
    tags = data.get('tags', [])
    
    if not name or not language:
        return jsonify({"error": "Name and language required"}), 400
        
    db = get_db()
    suite_id = db.test_suites.insert_one({
        "name": name,
        "language": language,
        "owner_id": user_id,
        "repo_url": repo_url,
        "env_vars": env_vars,
        "parallel": parallel,
        "tags": tags,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }).inserted_id
    
    return jsonify({"id": str(suite_id), "message": "Test suite created"}), 201

@tests_bp.route('/analytics/trends/<suite_id>', methods=['GET'])
@jwt_required()
def get_suite_trends(suite_id):
    user_id = get_jwt_identity()
    db = get_db()
    runs = list(db.test_runs.find({"suite_id": suite_id, "owner_id": user_id}).sort("created_at", 1).limit(50))
    
    trends = []
    for r in runs:
        trends.append({
            "date": r['created_at'].strftime("%Y-%m-%d %H:%M"),
            "passed": r.get('summary', {}).get('passed', 0),
            "failed": r.get('summary', {}).get('failed', 0),
            "duration": (r['finished_at'] - r['started_at']).total_seconds() if r.get('finished_at') and r.get('started_at') else 0
        })
        
    return jsonify(trends), 200

@tests_bp.route('/history/<suite_id>', methods=['GET'])
@jwt_required()
def get_suite_history(suite_id):
    user_id = get_jwt_identity()
    db = get_db()
    runs = list(db.test_runs.find({"suite_id": suite_id, "owner_id": user_id}).sort("created_at", -1).limit(50))
    for r in runs:
        r['id'] = str(r['_id'])
        del r['_id']
    return jsonify(runs), 200

@tests_bp.route('/analytics/flaky/<suite_id>', methods=['GET'])
@jwt_required()
def get_flaky_tests(suite_id):
    # Mock flaky test detection
    return jsonify([
        {"name": "test_code_execution_node", "failure_rate": 0.15, "last_failed": datetime.now()},
        {"name": "test_db_connection", "failure_rate": 0.05, "last_failed": datetime.now()}
    ]), 200

@tests_bp.route('/suites', methods=['GET'])
@jwt_required()
def get_suites():
    user_id = get_jwt_identity()
    db = get_db()
    suites = list(db.test_suites.find({"owner_id": user_id}))
    for s in suites:
        s['id'] = str(s['_id'])
        del s['_id']
    return jsonify(suites), 200

@tests_bp.route('/run', methods=['POST'])
@jwt_required()
def run_tests():
    user_id = get_jwt_identity()
    data = request.get_json()
    suite_id = data.get('suite_id')
    branch = data.get('branch', 'main')
    
    db = get_db()
    suite = db.test_suites.find_one({"_id": ObjectId(suite_id), "owner_id": user_id})
    if not suite:
        return jsonify({"error": "Suite not found"}), 404
        
    # Create a test run record
    run_id = db.test_runs.insert_one({
        "suite_id": suite_id,
        "owner_id": user_id,
        "status": "queued",
        "branch": branch,
        "results": [],
        "created_at": datetime.now(),
        "started_at": None,
        "finished_at": None,
        "summary": {"passed": 0, "failed": 0, "skipped": 0, "total": 0}
    }).inserted_id
    
    # Trigger CodeForge Worker via Redis
    from app.services.execution_service import submit_test_job
    submit_test_job(str(run_id), {
        "suite_id": suite_id,
        "branch": branch,
        "repo_url": suite.get('repo_url'),
        "language": suite.get('language')
    })
    
    return jsonify({"run_id": str(run_id), "status": "queued"}), 202

@tests_bp.route('/runs/<run_id>', methods=['GET'])
@jwt_required()
def get_run_status(run_id):
    user_id = get_jwt_identity()
    db = get_db()
    run = db.test_runs.find_one({"_id": ObjectId(run_id), "owner_id": user_id})
    if not run:
        return jsonify({"error": "Run not found"}), 404
        
    run['id'] = str(run['_id'])
    del run['_id']
    return jsonify(run), 200

@tests_bp.route('/history/<suite_id>', methods=['GET'])
@jwt_required()
def get_suite_history(suite_id):
    user_id = get_jwt_identity()
    db = get_db()
    runs = list(db.test_runs.find({"suite_id": suite_id, "owner_id": user_id}).sort("created_at", -1).limit(20))
    for r in runs:
        r['id'] = str(r['_id'])
        del r['_id']
    return jsonify(runs), 200

@tests_bp.route('/analytics/flaky/<suite_id>', methods=['GET'])
@jwt_required()
def get_flaky_tests(suite_id):
    user_id = get_jwt_identity()
    db = get_db()
    
    # Analyze the last 20 runs for this suite
    runs = list(db.test_runs.find({"suite_id": suite_id, "owner_id": user_id}).sort("created_at", -1).limit(20))
    
    test_results = {} # { test_name: [status1, status2, ...] }
    for run in runs:
        for result in run.get('results', []):
            name = result['name']
            if name not in test_results:
                test_results[name] = []
            test_results[name].append(result['status'])
            
    flaky = []
    for name, statuses in test_results.items():
        if 'passed' in statuses and 'failed' in statuses:
            flaky.append({
                "name": name,
                "failure_rate": f"{(statuses.count('failed') / len(statuses)) * 100:.1f}%",
                "total_runs": len(statuses)
            })
            
    return jsonify(flaky), 200
