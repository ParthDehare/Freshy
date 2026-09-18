import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

import bcrypt
from models.user import UserModel
from models.shipment import ShipmentModel
from models.quality_scan import QualityScanModel
from db import users_collection, shipments_collection, scans_collection

def hash_pw(plain):
    return bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_database():
    print("[SEED] Clearing old demo entries...")
    users_collection.delete_many({'email': {'$in': ['admin@freshy.com', 'producer@freshy.com', 'driver@freshy.com', 'retailer@freshy.com']}})
    shipments_collection.delete_many({'tracking_id': {'$in': ['BATCH_NAGPUR_01', 'BATCH_NASHIK_02', 'BATCH_KASHMIR_03', 'BATCH_SHIMLA_04']}})
    scans_collection.delete_many({'apple_id': {'$in': ['APL_NAG_101', 'APL_NAG_102', 'APL_NAG_103', 'APL_KSH_301', 'APL_KSH_302', 'APL_KSH_303']}})

    # 1. USERS with real bcrypt passwords
    demo_pw = hash_pw('pass123')
    users = [
        {'name': 'Vikram Singh', 'email': 'admin@freshy.com', 'password_hash': demo_pw, 'role': 'ADMIN', 'status': 'ACTIVE', 'phone': '+91-9876543210', 'company': 'FreshChain Technologies Pvt. Ltd.'},
        {'name': 'Ramesh Patel', 'email': 'producer@freshy.com', 'password_hash': demo_pw, 'role': 'PRODUCER', 'status': 'ACTIVE', 'phone': '+91-9123456780', 'company': 'Patel Apple Orchards, Nagpur'},
        {'name': 'Suresh Kumar', 'email': 'driver@freshy.com', 'password_hash': demo_pw, 'role': 'DRIVER', 'status': 'ACTIVE', 'phone': '+91-9988776655', 'company': 'LogiFast Cold Chain Transit'},
        {'name': 'Ananya Sharma', 'email': 'retailer@freshy.com', 'password_hash': demo_pw, 'role': 'RETAILER', 'status': 'ACTIVE', 'phone': '+91-9112233445', 'company': 'FreshMart Retail Hub, Mumbai'}
    ]
    for u in users:
        UserModel.create(u)
    print("[SEED] 4 users created with bcrypt password (pass123)")

    # 2. SHIPMENTS with real GPS coordinates
    shipments = [
        {
            'tracking_id': 'BATCH_NAGPUR_01',
            'producer_name': 'Ramesh Patel',
            'producer_email': 'producer@freshy.com',
            'retailer_name': 'Ananya Sharma',
            'retailer_email': 'retailer@freshy.com',
            'driver_name': 'Suresh Kumar',
            'driver_email': 'driver@freshy.com',
            'status': 'IN_TRANSIT',
            'pickup_address': 'APMC Fruit Market, Nagpur, Maharashtra',
            'pickup_coords': {'lat': 21.1458, 'lng': 79.0882},
            'delivery_address': 'Vashi APMC Market, Navi Mumbai',
            'delivery_coords': {'lat': 19.0760, 'lng': 72.8777},
            'pickup_date': '2026-07-19 08:30',
            'estimated_delivery': '2026-07-20 18:00',
            'batch_size': 1200,
            'apple_count': 6000,
            'variety': 'Royal Gala',
            'temp_min': 2.0,
            'temp_max': 3.5,
        },
        {
            'tracking_id': 'BATCH_NASHIK_02',
            'producer_name': 'Ramesh Patel',
            'producer_email': 'producer@freshy.com',
            'retailer_name': 'FreshMart Delhi Hub',
            'retailer_email': 'retailer@freshy.com',
            'driver_name': 'Suresh Kumar',
            'driver_email': 'driver@freshy.com',
            'status': 'PICKED_UP',
            'pickup_address': 'Pimpalgaon APMC, Nashik, Maharashtra',
            'pickup_coords': {'lat': 20.1809, 'lng': 73.9872},
            'delivery_address': 'Azadpur Mandi, New Delhi',
            'delivery_coords': {'lat': 28.7041, 'lng': 77.1025},
            'pickup_date': '2026-07-20 06:00',
            'estimated_delivery': '2026-07-21 20:00',
            'batch_size': 2500,
            'apple_count': 12500,
            'variety': 'Golden Delicious',
            'temp_min': 1.5,
            'temp_max': 3.0,
        },
        {
            'tracking_id': 'BATCH_KASHMIR_03',
            'producer_name': 'Ramesh Patel',
            'producer_email': 'producer@freshy.com',
            'retailer_name': 'Ananya Sharma',
            'retailer_email': 'retailer@freshy.com',
            'driver_name': 'Suresh Kumar',
            'driver_email': 'driver@freshy.com',
            'status': 'DELIVERED',
            'pickup_address': 'Fruit Mandi, Sopore, J&K',
            'pickup_coords': {'lat': 34.3005, 'lng': 74.4716},
            'delivery_address': 'Vashi APMC Market, Navi Mumbai',
            'delivery_coords': {'lat': 19.0760, 'lng': 72.8777},
            'pickup_date': '2026-07-15 10:00',
            'estimated_delivery': '2026-07-18 14:00',
            'batch_size': 3000,
            'apple_count': 15000,
            'variety': 'Red Delicious',
            'temp_min': 1.0,
            'temp_max': 2.5,
        },
        {
            'tracking_id': 'BATCH_SHIMLA_04',
            'producer_name': 'Ramesh Patel',
            'producer_email': 'producer@freshy.com',
            'retailer_name': 'Ananya Sharma',
            'retailer_email': 'retailer@freshy.com',
            'driver_name': 'Suresh Kumar',
            'driver_email': 'driver@freshy.com',
            'status': 'SCHEDULED',
            'pickup_address': 'Bhattakuffar Mandi, Shimla, HP',
            'pickup_coords': {'lat': 31.1048, 'lng': 77.1734},
            'delivery_address': 'Vashi APMC Market, Navi Mumbai',
            'delivery_coords': {'lat': 19.0760, 'lng': 72.8777},
            'pickup_date': '2026-07-22 07:00',
            'estimated_delivery': '2026-07-24 16:00',
            'batch_size': 1800,
            'apple_count': 9000,
            'variety': 'Kinnauri',
            'temp_min': 2.0,
            'temp_max': 3.5,
        }
    ]

    inserted_ids = []
    for s in shipments:
        res = ShipmentModel.create(s)
        inserted_ids.append(res['_id'])
    print("[SEED] 4 shipments created with GPS coordinates")

    # 3. QUALITY SCANS with real XAI explanations
    scans = [
        {
            'shipment_id': inserted_ids[0],
            'apple_id': 'APL_NAG_101',
            'scan_context': 'AT_PICKUP',
            'visual_grade': 'Grade A',
            'visual_score': 0.96,
            'rsl_days': 26.0,
            'ml_model_weights': {'swin': 0.51, 'convnext': 0.32, 'vit': 0.17},
            'xai_explanation': 'Swin Transformer feature s2 had the highest positive SHAP value (0.48), detecting uniform deep-red skin coloration across all four quadrants. ConvNeXt feature c1 confirmed zero mechanical bruising. Combined confidence: 96%.',
            'recommended_action': 'Export quality. Route to premium retail.',
        },
        {
            'shipment_id': inserted_ids[0],
            'apple_id': 'APL_NAG_102',
            'scan_context': 'AT_PICKUP',
            'visual_grade': 'Grade B',
            'visual_score': 0.82,
            'rsl_days': 18.5,
            'ml_model_weights': {'swin': 0.44, 'convnext': 0.38, 'vit': 0.18},
            'xai_explanation': 'ConvNeXt feature c3 contributed negatively (SHAP value -0.21) due to slight discoloration on stem cavity. Surface russeting covers approximately 8% of area. ViT feature v2 detected minor firmness loss.',
            'recommended_action': 'Standard supermarket distribution.',
        },
        {
            'shipment_id': inserted_ids[0],
            'apple_id': 'APL_NAG_103',
            'scan_context': 'AT_PICKUP',
            'visual_grade': 'Grade A',
            'visual_score': 0.91,
            'rsl_days': 23.0,
            'ml_model_weights': {'swin': 0.48, 'convnext': 0.34, 'vit': 0.18},
            'xai_explanation': 'Swin feature s1 detected consistent color saturation (SHAP +0.39). ViT feature v1 confirmed intact cuticle with no water-core. Minor stem-end crack detected by c2 but below threshold.',
            'recommended_action': 'Premium retail distribution.',
        },
        {
            'shipment_id': inserted_ids[2],
            'apple_id': 'APL_KSH_301',
            'scan_context': 'AT_DELIVERY',
            'visual_grade': 'Grade A',
            'visual_score': 0.94,
            'rsl_days': 22.0,
            'ml_model_weights': {'swin': 0.49, 'convnext': 0.33, 'vit': 0.18},
            'xai_explanation': 'Post-transit scan at Vashi APMC. Swin s2 confirmed preserved firmness (SHAP +0.44). ViT v1 detected zero thermal degradation spots, confirming cold-chain integrity maintained at 1.8C average.',
            'recommended_action': 'Immediate dispatch to premium retail.',
        },
        {
            'shipment_id': inserted_ids[2],
            'apple_id': 'APL_KSH_302',
            'scan_context': 'AT_DELIVERY',
            'visual_grade': 'Grade C',
            'visual_score': 0.61,
            'rsl_days': 7.5,
            'ml_model_weights': {'swin': 0.40, 'convnext': 0.41, 'vit': 0.19},
            'xai_explanation': 'ConvNeXt c4 detected localized softening in lower hemisphere (SHAP -0.35). Swin s4 found water-soaked lesions covering 12% surface area. Beginning senescence pattern confirmed by ensemble.',
            'recommended_action': 'Route to juice/puree processing.',
        },
        {
            'shipment_id': inserted_ids[2],
            'apple_id': 'APL_KSH_303',
            'scan_context': 'AT_DELIVERY',
            'visual_grade': 'Grade B',
            'visual_score': 0.78,
            'rsl_days': 14.0,
            'ml_model_weights': {'swin': 0.46, 'convnext': 0.36, 'vit': 0.18},
            'xai_explanation': 'Swin s2 shows moderate color consistency (SHAP +0.29). ConvNeXt c2 detected minor bruising from transit handling on 5% of surface. ViT v3 confirmed no internal browning.',
            'recommended_action': 'Standard retail or bulk sale.',
        },
    ]

    for sc in scans:
        QualityScanModel.create(sc)
    print("[SEED] 6 quality scans created with SHAP explanations")
    print("[SEED] Done. Demo login: any role email + password 'pass123'")

if __name__ == '__main__':
    seed_database()
