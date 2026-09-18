from datetime import datetime
from bson import ObjectId
from db import users_collection

class UserModel:
    @staticmethod
    def to_dict(user):
        if not user:
            return None
        user['_id'] = str(user['_id'])
        if 'password_hash' in user:
            del user['password_hash'] # Never return password hash
        return user

    @staticmethod
    def find_by_email(email):
        user = users_collection.find_one({'email': email.lower().strip()})
        return user # Raw dict containing password_hash for verification

    @staticmethod
    def find_by_id(user_id):
        try:
            user = users_collection.find_one({'_id': ObjectId(user_id)})
            return UserModel.to_dict(user)
        except Exception:
            return None

    @staticmethod
    def find_all(role=None):
        query = {}
        if role:
            query['role'] = role.upper()
        users = list(users_collection.find(query).sort('createdAt', -1))
        return [UserModel.to_dict(u) for u in users]

    @staticmethod
    def create(data):
        doc = {
            'name': data.get('name', '').strip(),
            'email': data.get('email', '').lower().strip(),
            'password_hash': data.get('password_hash'),
            'role': data.get('role', 'DRIVER').upper(),
            'status': data.get('status', 'ACTIVE').upper(),
            'phone': data.get('phone', ''),
            'company': data.get('company', ''),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        res = users_collection.insert_one(doc)
        doc['_id'] = str(res.inserted_id)
        if 'password_hash' in doc:
            del doc['password_hash']
        return doc
