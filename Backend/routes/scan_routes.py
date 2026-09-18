import os
import tempfile
from flask import Blueprint, request, jsonify
from models.quality_scan import QualityScanModel
from models.shipment import ShipmentModel

scan_bp = Blueprint('scans', __name__)

@scan_bp.route('', methods=['GET'])
def get_all_scans():
    try:
        scans = QualityScanModel.find_all()
        return jsonify(scans), 200
    except Exception as e:
        return jsonify({'message': 'Server Error fetching scans'}), 500

@scan_bp.route('/<shipment_id>', methods=['GET'])
def get_scans_by_shipment(shipment_id):
    try:
        scans = QualityScanModel.find_by_shipment(shipment_id)
        return jsonify(scans), 200
    except Exception as e:
        return jsonify({'message': 'Server Error fetching scans for shipment'}), 500

@scan_bp.route('/add', methods=['POST'])
def add_scan():
    try:
        data = request.get_json() or {}
        if not data.get('shipment_id') or not data.get('apple_id'):
            return jsonify({'message': 'shipment_id and apple_id are required'}), 400
        
        saved = QualityScanModel.create(data)
        return jsonify(saved), 201
    except Exception as e:
        return jsonify({'message': 'Server Error creating scan'}), 500


@scan_bp.route('/predict', methods=['POST'])
def predict_and_explain():
    """
    Real AI prediction endpoint.
    Accepts a multipart/form-data POST with an 'image' file.
    Runs the full pipeline:  YOLO crop → Ensemble features → SVM grade → SHAP XAI
    """
    try:
        # --- Validate image upload ---
        if 'image' not in request.files:
            return jsonify({'message': 'No image file provided. Send a file with key "image".'}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'message': 'Empty filename. Please select an image.'}), 400

        # --- Save uploaded image to a temp file ---
        suffix = os.path.splitext(image_file.filename)[1] or '.png'
        tmp_fd, tmp_path = tempfile.mkstemp(suffix=suffix, prefix='freshy_upload_')
        os.close(tmp_fd)
        image_file.save(tmp_path)

        try:
            # --- Run the real ML pipeline ---
            from services.ml_engine import get_engine
            engine = get_engine()
            result = engine.predict_from_image(tmp_path)

            return jsonify(result), 200
        finally:
            # --- Cleanup temp file ---
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Prediction error: {e}'}), 500
