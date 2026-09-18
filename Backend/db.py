from pymongo import MongoClient
from config import Config

client = MongoClient(Config.MONGO_URI)
# Extract database name from URI or fallback to 'freshchain'
try:
    db = client.get_database()
except Exception:
    db = client['freshchain']

users_collection = db['users']
shipments_collection = db['shipments']
scans_collection = db['quality_scans']

# Create indexes for performance and uniqueness
try:
    users_collection.create_index('email', unique=True)
    shipments_collection.create_index('tracking_id', unique=True)
    scans_collection.create_index('shipment_id')
    scans_collection.create_index('apple_id')
except Exception as e:
    print(f"Index creation note: {e}")
