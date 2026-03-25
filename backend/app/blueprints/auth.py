from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
import os

from app.core.database import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student') # Default to student
        
        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400
        
        db = get_db()
        if db.users.find_one({"username": username}):
            return jsonify({"error": "User already exists"}), 400
        
        user_id = db.users.insert_one({
            "username": username,
            "email": email,
            "password": generate_password_hash(password),
            "is_admin": False,
            "role": role
        }).inserted_id
        
        access_token = create_access_token(identity=str(user_id))
        refresh_token = create_refresh_token(identity=str(user_id))
        
        return jsonify({
            "access": access_token,
            "refresh": refresh_token,
            "user": {"username": username, "email": email, "id": str(user_id), "role": role}
        }), 201
    except Exception as e:
        print(f"Registration Error: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        db = get_db()
        user = db.users.find_one({"username": username})
        
        if user and check_password_hash(user['password'], password):
            access_token = create_access_token(identity=str(user['_id']))
            refresh_token = create_refresh_token(identity=str(user['_id']))
            return jsonify({
                "access": access_token,
                "refresh": refresh_token,
                "user": {
                    "username": user['username'], 
                    "email": user['email'],
                    "id": str(user['_id']),
                    "is_admin": user.get('is_admin', False),
                    "role": user.get('role', 'student')
                }
            }), 200
        
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login Error: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

@auth_bp.route('/token/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access": access_token}), 200

# Email Verification & Password Reset Boilerplate
@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    # Placeholder for actual SMTP integration
    return jsonify({"message": "Verification email sent (Simulated)"}), 200

@auth_bp.route('/reset-password-request', methods=['POST'])
def reset_password_request():
    # Placeholder for OTP generation and mailing
    return jsonify({"message": "OTP sent to email (Simulated)"}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')
    
    # Placeholder logic
    return jsonify({"message": "Password reset successful"}), 200
