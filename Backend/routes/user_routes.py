from flask import Blueprint, jsonify
from models.user import UserModel

user_bp = Blueprint('users', __name__)

@user_bp.route('', methods=['GET'])
def get_all_users():
    try:
        users = UserModel.find_all()
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'message': 'Server Error fetching users'}), 500
