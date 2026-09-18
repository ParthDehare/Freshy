from flask import Blueprint, request, jsonify
from models.shipment import ShipmentModel

shipment_bp = Blueprint('shipments', __name__)

@shipment_bp.route('', methods=['GET'])
def get_shipments():
    try:
        filters = {}
        status = request.args.get('status')
        producer_email = request.args.get('producer_email')
        retailer_email = request.args.get('retailer_email')
        driver_email = request.args.get('driver_email')

        if status:
            filters['status'] = status
        if producer_email:
            filters['producer_email'] = producer_email
        if retailer_email:
            filters['retailer_email'] = retailer_email
        if driver_email:
            filters['driver_email'] = driver_email

        shipments = ShipmentModel.find_all(filters)
        return jsonify(shipments), 200
    except Exception as e:
        print(f"Error fetching shipments: {e}")
        return jsonify({'message': 'Server Error fetching shipments'}), 500

@shipment_bp.route('/<shipment_id>', methods=['GET'])
def get_shipment_detail(shipment_id):
    try:
        shipment = ShipmentModel.find_by_id(shipment_id)
        if not shipment:
            return jsonify({'message': 'Shipment not found'}), 404
        return jsonify(shipment), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching shipment detail'}), 500

@shipment_bp.route('/add', methods=['POST'])
def add_shipment():
    try:
        data = request.get_json() or {}
        if not data.get('producer_name') or not data.get('retailer_name'):
            return jsonify({'message': 'Producer name and Retailer name are required'}), 400
        
        saved = ShipmentModel.create(data)
        return jsonify(saved), 201
    except Exception as e:
        print(f"Error creating shipment: {e}")
        return jsonify({'message': 'Server Error creating shipment'}), 500

@shipment_bp.route('/<shipment_id>/status', methods=['PATCH', 'PUT'])
def update_shipment_status(shipment_id):
    try:
        data = request.get_json() or {}
        new_status = data.get('status', '').upper()
        if new_status not in ['SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']:
            return jsonify({'message': 'Invalid status passed'}), 400
        
        updated = ShipmentModel.update_status(shipment_id, new_status)
        if not updated:
            return jsonify({'message': 'Shipment not found or update failed'}), 404
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({'message': 'Error updating shipment status'}), 500
