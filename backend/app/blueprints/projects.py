from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from datetime import datetime
import os
import io
import zipfile

from app.core.database import get_db

projects_bp = Blueprint('projects', __name__)

# ... existing code ...

@projects_bp.route('/<project_id>/snapshots', methods=['POST'])
@jwt_required()
def create_snapshot(project_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    code = data.get('code')
    language = data.get('language')
    message = data.get('message', 'Manual Snapshot')
    
    if not code or not language:
        return jsonify({"error": "Code and language required"}), 400
        
    db = get_db()
    # Verify ownership or editor role
    project = db.projects.find_one({"_id": ObjectId(project_id)})
    if not project or (project.get('owner_id') != user_id and user_id not in project.get('editors', [])):
        return jsonify({"error": "Unauthorized"}), 403
        
    snapshot = {
        "id": str(ObjectId()),
        "code": code,
        "language": language,
        "message": message,
        "created_at": datetime.now(),
        "user_id": user_id
    }
    
    db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$push": {"snapshots": snapshot}}
    )
    return jsonify(snapshot), 201

@projects_bp.route('/<project_id>/snapshots', methods=['GET'])
@jwt_required()
def get_snapshots(project_id):
    user_id = get_jwt_identity()
    db = get_db()
    project = db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        return jsonify({"error": "Project not found"}), 404
        
    # Check access
    if not project.get('is_public') and project.get('owner_id') != user_id and user_id not in project.get('editors', []) and user_id not in project.get('viewers', []):
        return jsonify({"error": "Unauthorized"}), 403
        
    return jsonify(project.get('snapshots', [])), 200

@projects_bp.route('/<project_id>/invite', methods=['POST'])
@jwt_required()
def invite_user(project_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    email = data.get('email')
    role = data.get('role', 'viewer') # 'editor' or 'viewer'
    
    db = get_db()
    project = db.projects.find_one({"_id": ObjectId(project_id), "owner_id": user_id})
    if not project:
        return jsonify({"error": "Project not found or unauthorized"}), 404
        
    target_user = db.users.find_one({"email": email})
    if not target_user:
        return jsonify({"error": "User not found"}), 404
        
    target_id = str(target_user['_id'])
    field = "editors" if role == "editor" else "viewers"
    
    db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$addToSet": {field: target_id}}
    )
    return jsonify({"message": f"User invited as {role}"}), 200

@projects_bp.route('/<project_id>/export', methods=['GET'])
@jwt_required()
def export_project(project_id):
    user_id = get_jwt_identity()
    db = get_db()
    project = db.projects.find_one({"_id": ObjectId(project_id), "owner_id": user_id})
    
    if not project:
        return jsonify({"error": "Project not found"}), 404
        
    # Create zip in memory
    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w') as zf:
        for file in project.get('files', []):
            zf.writestr(file['name'], file['content'])
            
    memory_file.seek(0)
    return send_file(
        memory_file,
        mimetype='application/zip',
        as_attachment=True,
        download_name=f"{project['name']}.zip"
    )

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = get_jwt_identity()
    db = get_db()
    projects = list(db.projects.find({"owner_id": user_id}))
    for project in projects:
        project['id'] = str(project['_id'])
        del project['_id']
    return jsonify(projects), 200

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    description = data.get('description', '')
    
    if not name:
        return jsonify({"error": "Project name is required"}), 400
    
    db = get_db()
    project_id = db.projects.insert_one({
        "name": name,
        "description": description,
        "owner_id": user_id,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "files": []
    }).inserted_id
    
    return jsonify({"id": str(project_id), "name": name, "description": description}), 201

@projects_bp.route('/<project_id>', methods=['GET'])
def get_project(project_id):
    # Try to get user identity, but don't require it
    from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except Exception:
        pass

    db = get_db()
    project = db.projects.find_one({"_id": ObjectId(project_id)})
    
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    # Check if public or owned by user or user is an editor/viewer
    is_owner = str(project.get('owner_id')) == user_id
    is_collaborator = user_id in project.get('editors', []) or user_id in project.get('viewers', [])
    
    if not project.get('is_public') and not is_owner and not is_collaborator:
        return jsonify({"error": "Unauthorized"}), 403

    project['id'] = str(project['_id'])
    del project['_id']
    if 'owner_id' in project:
        project['owner_id'] = str(project['owner_id'])
    return jsonify(project), 200

@projects_bp.route('/<project_id>/toggle-public', methods=['PATCH'])
@jwt_required()
def toggle_public(project_id):
    user_id = get_jwt_identity()
    db = get_db()
    project = db.projects.find_one({"_id": ObjectId(project_id), "owner_id": user_id})
    
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    new_status = not project.get('is_public', False)
    db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": {"is_public": new_status}})
    return jsonify({"is_public": new_status}), 200

@projects_bp.route('/portfolio/<username>', methods=['GET'])
def get_portfolio(username):
    db = get_db()
    user = db.users.find_one({"username": username})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    projects = list(db.projects.find({"owner_id": str(user['_id']), "is_public": True}))
    for p in projects:
        p['id'] = str(p['_id'])
        del p['_id']
        
    return jsonify({
        "user": {"username": user['username'], "email": user.get('email')},
        "projects": projects
    }), 200

@projects_bp.route('/<project_id>/files', methods=['POST'])
@jwt_required()
def create_file(project_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    content = data.get('content', '')
    language = data.get('language')
    
    if not name or not language:
        return jsonify({"error": "File name and language are required"}), 400
    
    db = get_db()
    file_id = ObjectId()
    new_file = {
        "id": str(file_id),
        "name": name,
        "content": content,
        "language": language,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    result = db.projects.update_one(
        {"_id": ObjectId(project_id), "owner_id": user_id},
        {"$push": {"files": new_file}, "$set": {"updated_at": datetime.now()}}
    )
    
    if result.matched_count == 0:
        return jsonify({"error": "Project not found or unauthorized"}), 404
    
    return jsonify(new_file), 201

# Snippet Manager: Create and manage reusable code snippets
@projects_bp.route('/snippets', methods=['GET'])
@jwt_required()
def get_snippets():
    user_id = get_jwt_identity()
    db = get_db()
    snippets = list(db.snippets.find({"owner_id": user_id}))
    for snippet in snippets:
        snippet['id'] = str(snippet['_id'])
        del snippet['_id']
    return jsonify(snippets), 200

@projects_bp.route('/snippets', methods=['POST'])
@jwt_required()
def create_snippet():
    user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    code = data.get('code')
    language = data.get('language')
    tags = data.get('tags', [])
    
    if not title or not code or not language:
        return jsonify({"error": "Title, code, and language are required"}), 400
    
    db = get_db()
    snippet_id = db.snippets.insert_one({
        "title": title,
        "code": code,
        "language": language,
        "tags": tags,
        "owner_id": user_id,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }).inserted_id
    
    return jsonify({"id": str(snippet_id), "title": title}), 201

@projects_bp.route('/snippets/<snippet_id>', methods=['DELETE'])
@jwt_required()
def delete_snippet(snippet_id):
    user_id = get_jwt_identity()
    db = get_db()
    db.snippets.delete_one({"_id": ObjectId(snippet_id), "owner_id": user_id})
    return jsonify({"message": "Snippet deleted"}), 200

# Execution History Improvements: Filter by language/date/status
@projects_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    language = request.args.get('language')
    status = request.args.get('status')
    search = request.args.get('search')
    
    query = {"user_id": user_id}
    if language:
        query["language"] = language
    if status:
        query["status"] = status
    if search:
        query["code"] = {"$regex": search, "$options": "i"}
        
    db = get_db()
    history = list(db.executions.find(query).sort("created_at", -1).limit(50))
    for entry in history:
        entry['id'] = str(entry['_id'])
        del entry['_id']
    return jsonify(history), 200

# Templates: Predefined boilerplate code per language
@projects_bp.route('/templates', methods=['GET'])
def get_templates():
    language = request.args.get('language')
    db = get_db()
    
    query = {}
    if language:
        query["language"] = language
        
    templates = list(db.templates.find(query))
    for t in templates:
        t['id'] = str(t['_id'])
        del t['_id']
    return jsonify(templates), 200

@projects_bp.route('/templates', methods=['POST'])
@jwt_required()
def create_template():
    user_id = get_jwt_identity()
    db = get_db()
    
    # Check if user is admin
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user or not user.get('is_admin', False):
        return jsonify({"error": "Admin access required"}), 403
        
    data = request.get_json()
    db.templates.insert_one({
        "name": data.get('name'),
        "language": data.get('language'),
        "code": data.get('code'),
        "created_at": datetime.now()
    })
    return jsonify({"message": "Template created"}), 201
