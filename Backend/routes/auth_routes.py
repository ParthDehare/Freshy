import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify
from config import Config
from models.user import UserModel

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        email = data.get('email', '').lower().strip()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        user = UserModel.find_by_email(email)
        if not user:
            return jsonify({'message': 'No account found with this email'}), 401

        # Verify password with bcrypt
        stored_hash = user.get('password_hash', '')
        if not stored_hash:
            return jsonify({'message': 'Account has no password set. Re-run seed script.'}), 401

        if not bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8')):
            return jsonify({'message': 'Incorrect password'}), 401

        clean_user = UserModel.to_dict(user)

        payload = {
            'sub': clean_user['_id'],
            'email': clean_user['email'],
            'role': clean_user['role'],
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }
        token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')

        return jsonify({'token': token, 'user': clean_user}), 200
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'message': f'Login failed: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    try:
        auth_header = request.headers.get('Authorization', '')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Unauthorized'}), 401

        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        user = UserModel.find_by_id(payload['sub'])
        if not user:
            return jsonify({'message': 'User not found'}), 404
        return jsonify(user), 200
    except Exception as e:
        return jsonify({'message': 'Invalid or expired token'}), 401
