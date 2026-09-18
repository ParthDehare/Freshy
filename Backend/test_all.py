import sys
sys.path.insert(0, '.')
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from models.user import UserModel

# Test 1: Can we find the admin user?
u = UserModel.find_by_email('admin@freshy.com')
print("TEST 1 - find_by_email admin@freshy.com:")
print(f"  Found: {u is not None}")
if u:
    print(f"  Keys: {list(u.keys())}")
    print(f"  Has _id: {'_id' in u}, type: {type(u.get('_id'))}")
    print(f"  role: {u.get('role')}")
    print(f"  Has password_hash: {'password_hash' in u}")

# Test 2: Does to_dict work without crashing?
try:
    clean = UserModel.to_dict(u)
    print("\nTEST 2 - to_dict:")
    print(f"  Success: True")
    print(f"  clean _id type: {type(clean.get('_id'))}")
    print(f"  Has password_hash after to_dict: {'password_hash' in clean}")
except Exception as e:
    print(f"\nTEST 2 - to_dict FAILED: {e}")

# Test 3: JWT token generation
try:
    import jwt
    from datetime import datetime, timedelta
    from config import Config
    payload = {
        'sub': str(clean['_id']),
        'email': clean['email'],
        'role': clean['role'],
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    print(f"\nTEST 3 - JWT token: {token[:40]}...")
except Exception as e:
    print(f"\nTEST 3 - JWT FAILED: {e}")

# Test 4: find_all
users = UserModel.find_all()
print(f"\nTEST 4 - find_all: {len(users)} users")
for uu in users:
    print(f"  {uu.get('email')} | role={uu.get('role')} | company={uu.get('company')}")

# Test 5: Check shipments
from models.shipment import ShipmentModel
shipments = ShipmentModel.find_all()
print(f"\nTEST 5 - Shipments: {len(shipments)} found")
for s in shipments:
    print(f"  {s.get('tracking_id')} | status={s.get('status')} | has coords: {bool(s.get('pickup_coords'))}")

# Test 6: Check scans with XAI
from models.quality_scan import QualityScanModel
scans = QualityScanModel.find_all()
print(f"\nTEST 6 - QualityScans: {len(scans)} found")
for sc in scans:
    xai = sc.get('xai_explanation', '')
    print(f"  {sc.get('apple_id')} | grade={sc.get('visual_grade')} | xai_len={len(xai)} chars")
