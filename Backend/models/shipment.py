from datetime import datetime
from bson import ObjectId
from db import shipments_collection

class ShipmentModel:
    @staticmethod
    def to_dict(shipment):
        if not shipment:
            return None
        shipment['_id'] = str(shipment['_id'])
        return shipment

    @staticmethod
    def find_all(filters=None):
        query = {}
        if filters:
            if 'status' in filters and filters['status']:
                query['status'] = filters['status'].upper()
            if 'producer_email' in filters and filters['producer_email']:
                query['producer_email'] = filters['producer_email'].lower().strip()
            if 'retailer_email' in filters and filters['retailer_email']:
                query['retailer_email'] = filters['retailer_email'].lower().strip()
            if 'driver_email' in filters and filters['driver_email']:
                query['driver_email'] = filters['driver_email'].lower().strip()
        
        shipments = list(shipments_collection.find(query).sort('createdAt', -1))
        return [ShipmentModel.to_dict(s) for s in shipments]

    @staticmethod
    def find_by_id(shipment_id):
        try:
            shipment = shipments_collection.find_one({'_id': ObjectId(shipment_id)})
            if not shipment:
                # Also try lookup by tracking_id
                shipment = shipments_collection.find_one({'tracking_id': shipment_id})
            return ShipmentModel.to_dict(shipment)
        except Exception:
            # Fallback lookup by tracking_id string
            shipment = shipments_collection.find_one({'tracking_id': str(shipment_id)})
            return ShipmentModel.to_dict(shipment)

    @staticmethod
    def create(data):
        doc = {
            'tracking_id': data.get('tracking_id', f"BATCH_{int(datetime.utcnow().timestamp())}"),
            'producer_name': data.get('producer_name', 'Nagpur Orange Farms'),
            'producer_email': data.get('producer_email', 'producer@freshy.com').lower().strip(),
            'retailer_name': data.get('retailer_name', 'BigBasket Hub Mumbai'),
            'retailer_email': data.get('retailer_email', 'retailer@freshy.com').lower().strip(),
            'driver_name': data.get('driver_name', 'Rajesh Driver'),
            'driver_email': data.get('driver_email', 'driver@freshy.com').lower().strip(),
            'status': data.get('status', 'SCHEDULED').upper(),
            'pickup_address': data.get('pickup_address', 'Nagpur Orchards, Maharashtra'),
            'pickup_coords': data.get('pickup_coords', {'lat': 21.1458, 'lng': 79.0882}), # Nagpur
            'delivery_address': data.get('delivery_address', 'Vashi APMC Market, Navi Mumbai'),
            'delivery_coords': data.get('delivery_coords', {'lat': 19.0760, 'lng': 72.8777}), # Mumbai
            'pickup_date': data.get('pickup_date', datetime.utcnow().strftime('%Y-%m-%d %H:%M')),
            'estimated_delivery': data.get('estimated_delivery', 'In 2 days'),
            'batch_size': data.get('batch_size', '500 kg (approx. 2500 apples)'),
            'temp_threshold': data.get('temp_threshold', '2.0°C - 4.0°C'),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        res = shipments_collection.insert_one(doc)
        doc['_id'] = str(res.inserted_id)
        return doc

    @staticmethod
    def update_status(shipment_id, new_status):
        try:
            new_status = new_status.upper()
            res = shipments_collection.find_one_and_update(
                {'$or': [{'_id': ObjectId(shipment_id)}, {'tracking_id': shipment_id}]},
                {'$set': {'status': new_status, 'updatedAt': datetime.utcnow()}},
                return_document=True
            )
            return ShipmentModel.to_dict(res)
        except Exception as e:
            print(f"Error updating status: {e}")
            return None
