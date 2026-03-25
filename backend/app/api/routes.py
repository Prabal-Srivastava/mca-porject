from flask import Blueprint, request, jsonify
from app.services.execution_service import submit_job

api_bp = Blueprint("api", __name__)

@api_bp.route("/submit", methods=["POST"])
def submit():
    data = request.json
    job_id = submit_job(data)
    return jsonify({"job_id": job_id, "status": "queued"})
