from datetime import datetime
from bson import ObjectId
from db import scans_collection

class QualityScanModel:
    @staticmethod
    def to_dict(scan):
        if not scan:
            return None
        scan['_id'] = str(scan['_id'])
        if 'shipment_id' in scan and isinstance(scan['shipment_id'], ObjectId):
            scan['shipment_id'] = str(scan['shipment_id'])
        return scan

    @staticmethod
    def find_by_shipment(shipment_id):
        query = {}
        try:
            query['$or'] = [{'shipment_id': str(shipment_id)}, {'shipment_id': ObjectId(shipment_id)}]
        except Exception:
            query['shipment_id'] = str(shipment_id)
        
        scans = list(scans_collection.find(query).sort('createdAt', -1))
        return [QualityScanModel.to_dict(s) for s in scans]

    @staticmethod
    def find_all():
        scans = list(scans_collection.find().sort('createdAt', -1))
        return [QualityScanModel.to_dict(s) for s in scans]

    @staticmethod
    def create(data):
        doc = {
            'shipment_id': str(data.get('shipment_id', '')),
            'apple_id': data.get('apple_id', f"APPLE_{int(datetime.utcnow().timestamp())}"),
            'scan_context': data.get('scan_context', 'AT_PICKUP').upper(),
            'visual_grade': data.get('visual_grade', 'Grade A'),
            'visual_score': float(data.get('visual_score', 0.95)),
            'rsl_days': float(data.get('rsl_days', 24.5)),
            'ml_model_weights': data.get('ml_model_weights', {'swin': 0.45, 'resnet': 0.35, 'vit': 0.20}),
            'xai_explanation': data.get('xai_explanation', 'The model predicted Grade A. This decision was predominantly driven by visual features extracted by the Swin Transformer (Feature s2), indicating uniform redness and no surface defects.'),
            'recommended_action': data.get('recommended_action', 'Premium Export / High-End Retail'),
            'image_url': data.get('image_url', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop'),
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        res = scans_collection.insert_one(doc)
        doc['_id'] = str(res.inserted_id)
        return doc
