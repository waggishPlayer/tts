from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
from werkzeug.utils import secure_filename
import random

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'wav', 'mp3', 'webm'}
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Health check
@app.route('/')
def health_check():
    return jsonify({"status": "running", "message": "AI Utilities Demo Server"})

# Confidence Analyzer - Mock Implementation
@app.route('/api/confidence/analyze', methods=['POST'])
def analyze_confidence_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported'}), 400
        
        # Simulate processing time
        time.sleep(2)
        
        # Generate mock analysis results
        result = {
            'overall_score': round(random.uniform(6.0, 9.0), 1),
            'audio_score': round(random.uniform(6.0, 9.0), 1),
            'visual_score': round(random.uniform(6.0, 9.0), 1),
            'detailed_scores': {
                'volume': round(random.uniform(6.0, 9.0), 1),
                'pitch_variation': round(random.uniform(5.0, 8.0), 1),
                'speech_rate': round(random.uniform(6.0, 9.0), 1),
                'filler_words': round(random.uniform(7.0, 9.5), 1),
                'eye_contact': round(random.uniform(5.0, 8.5), 1),
                'posture': round(random.uniform(6.0, 9.0), 1),
                'smile_quantity': round(random.uniform(4.0, 8.0), 1),
                'hand_gestures': round(random.uniform(6.0, 8.5), 1)
            },
            'message': 'Analysis completed successfully using demo data'
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Face and Voice Detector - Mock Implementation
@app.route('/api/detector/analyze', methods=['POST'])
def detect_face_and_voice():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400
        
        file = request.files['video']
        if file.filename == '':
            return jsonify({'error': 'No video file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not supported'}), 400
        
        # Simulate processing time
        time.sleep(1)
        
        # Generate random detection results
        faces_detected = random.choice([True, False])
        voice_detected = random.choice([True, False])
        
        result = {
            'faces_detected': faces_detected,
            'voice_detected': voice_detected,
            'status': 'success'
        }
        
        if faces_detected and voice_detected:
            result['message'] = 'Both face and voice detected in the video.'
        elif faces_detected:
            result['message'] = 'Only face detected in the video.'
        elif voice_detected:
            result['message'] = 'Only voice detected in the video.'
        else:
            result['message'] = 'Neither face nor voice detected in the video.'
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Speech to Text - Mock Implementation
@app.route('/api/stt/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        if audio_file.filename == '':
            return jsonify({'error': 'No audio file selected'}), 400
        
        # Simulate processing time
        time.sleep(1)
        
        # Generate mock transcription
        mock_texts = [
            "Hello, this is a sample transcription of your audio file.",
            "The speech to text service is working correctly and processing your audio.",
            "This is a demonstration of the automatic speech recognition capabilities.",
            "Your audio has been successfully converted to text using our AI system."
        ]
        
        detected_lang = random.choice(["english", "hindi"])
        
        return jsonify({
            "text": random.choice(mock_texts),
            "detected_language": detected_lang,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stt/transcribe/<lang>', methods=['POST'])
def transcribe_with_language(lang):
    try:
        if lang not in ['english', 'hindi']:
            return jsonify({"error": "Language must be 'english' or 'hindi'"}), 400
        
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        audio_file = request.files['audio']
        
        # Simulate processing time
        time.sleep(1)
        
        # Generate mock transcription based on language
        if lang == "english":
            mock_texts = [
                "This is an English transcription using the specified language model.",
                "Hello, your audio has been processed using the English language model.",
                "The English speech recognition is working correctly."
            ]
        else:
            mock_texts = [
                "यह हिंदी भाषा मॉडल का उपयोग करके एक नमूना प्रतिलेख है।",
                "आपका ऑडियो हिंदी भाषा मॉडल का उपयोग करके प्रसंस्कृत किया गया है।",
                "हिंदी वाक् पहचान सही तरीके से काम कर रही है।"
            ]
        
        return jsonify({
            "text": random.choice(mock_texts),
            "specified_language": lang,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting AI Utilities Demo Server...")
    print("This is a demo server that returns mock data for testing the frontend.")
    print("For full functionality, you would need to install the required Python packages.")
    app.run(host='0.0.0.0', port=5000, debug=True)
