from flask import Blueprint, jsonify
from db import users_collection, shipments_collection, scans_collection

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('', methods=['GET'])
def get_system_stats():
    try:
        total_users = users_collection.count_documents({})
        total_shipments = shipments_collection.count_documents({})
        total_scans = scans_collection.count_documents({})

        return jsonify({
            'totalUsers': total_users,
            'totalShipments': total_shipments,
            'totalScans': total_scans
        }), 200
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({'message': 'Server Error fetching stats'}), 500
