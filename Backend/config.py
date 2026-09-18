import os
from dotenv import load_dotenv

# Load root .env or local .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
load_dotenv()

class Config:
    MONGO_URI = os.getenv('MONGO_URI', "mongodb://localhost:27017/freshchain")
    # Ensure database name is explicitly added if missing
    if '?' in MONGO_URI and not MONGO_URI.split('?')[0].split('/')[-1]:
        parts = MONGO_URI.split('?')
        MONGO_URI = parts[0].rstrip('/') + '/freshchain?' + parts[1]
    
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-secret-key')
    PORT = int(os.getenv('PORT', 5002)) # Running on 5002 to avoid conflict with Node 5001 or standard 5000
