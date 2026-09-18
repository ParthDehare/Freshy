import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Ensure Backend root is in Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routes.auth_routes import auth_bp
from routes.shipment_routes import shipment_bp
from routes.scan_routes import scan_bp
from routes.stats_routes import stats_bp
from routes.user_routes import user_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS for our React frontend on port 5173 / any local dev port
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(shipment_bp, url_prefix='/api/shipments')
    app.register_blueprint(scan_bp, url_prefix='/api/scans')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(user_bp, url_prefix='/api/users')

    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'name': 'FreshChain Flask Backend API',
            'status': 'active',
            'version': '2.0.0-PROD',
            'endpoints': ['/api/auth/login', '/api/shipments', '/api/scans', '/api/stats', '/api/users']
        })

    return app

if __name__ == '__main__':
    app = create_app()
    print(f"FreshChain Flask Server starting on port {Config.PORT}...")
    app.run(host='0.0.0.0', port=Config.PORT, debug=True, use_reloader=False)

