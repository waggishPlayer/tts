from flask import Flask, request, jsonify
import wave
from vosk import Model, KaldiRecognizer
import json
import io
import langdetect
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException

app = Flask(__name__)

# Load both models
model_en = Model("/app/model/english-model/vosk-model-small-en-us-0.15")
model_hi = Model("/app/model/hindi-model/vosk-model-small-hi-0.22")

def detect_language_from_audio(audio_data, sample_rate):
    """Detect language by doing quick transcription with both models"""
    # Create temporary recognizers for language detection
    rec_en = KaldiRecognizer(model_en, sample_rate)
    rec_hi = KaldiRecognizer(model_hi, sample_rate)
    
    # Process first 3 seconds for language detection
    chunk_size = 4000
    chunks_processed = 0
    max_chunks = 24  # Process ~3 seconds for detection (16000 Hz / 4000 * 3)
    
    audio_data.seek(0)  # Reset to beginning
    
    # Track confidence scores
    en_partial_results = []
    hi_partial_results = []
    
    while chunks_processed < max_chunks:
        data = audio_data.read(chunk_size)
        if len(data) == 0:
            break
        
        # Process with both models
        if rec_en.AcceptWaveform(data):
            en_result = json.loads(rec_en.Result())
            if 'text' in en_result and en_result['text'].strip():
                en_partial_results.append(en_result['text'].strip())
        
        if rec_hi.AcceptWaveform(data):
            hi_result = json.loads(rec_hi.Result())
            if 'text' in hi_result and hi_result['text'].strip():
                hi_partial_results.append(hi_result['text'].strip())
        
        chunks_processed += 1
    
    # Get final results
    result_en = json.loads(rec_en.FinalResult())["text"].strip()
    result_hi = json.loads(rec_hi.FinalResult())["text"].strip()
    
    # Count meaningful words (longer than 1 character)
    en_words = [word for word in result_en.split() if len(word) > 1]
    hi_words = [word for word in result_hi.split() if len(word) > 1]
    
    # Language detection logic with multiple factors
    en_score = 0
    hi_score = 0
    
    # Factor 1: Total text length
    en_score += len(result_en)
    hi_score += len(result_hi)
    
    # Factor 2: Number of meaningful words
    en_score += len(en_words) * 10
    hi_score += len(hi_words) * 10
    
    # Factor 3: Number of partial results (indicates better recognition)
    en_score += len(en_partial_results) * 5
    hi_score += len(hi_partial_results) * 5
    
    # Factor 4: Try text-based language detection if we have good results
    if result_en.strip() and len(en_words) > 0:
        try:
            detected = detect(result_en)
            if detected == "en":
                en_score += 20
            elif detected == "hi":
                hi_score += 10  # English model might pick up some Hindi
        except LangDetectException:
            pass
    
    if result_hi.strip() and len(hi_words) > 0:
        try:
            detected = detect(result_hi)
            if detected == "hi":
                hi_score += 20
            elif detected == "en":
                en_score += 10  # Hindi model might pick up some English
        except LangDetectException:
            pass
    
    # Decision based on scores
    if hi_score > en_score:
        return "hindi"
    else:
        return "english"

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    audio = request.files['audio']
    wf = wave.open(audio, "rb")

    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        wf.close()
        return jsonify({"error": "Audio must be mono, 16-bit PCM, 16000 Hz."})

    # Read all audio data
    audio_data = io.BytesIO()
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        audio_data.write(data)
    
    sample_rate = wf.getframerate()
    wf.close()
    
    # Detect language first
    detected_lang = detect_language_from_audio(audio_data, sample_rate)
    
    # Choose appropriate model based on detected language
    model = model_en if detected_lang == "english" else model_hi
    recognizer = KaldiRecognizer(model, sample_rate)
    
    # Transcribe with the selected model
    audio_data.seek(0)  # Reset to beginning
    while True:
        data = audio_data.read(4000)
        if len(data) == 0:
            break
        recognizer.AcceptWaveform(data)
    
    final_result = json.loads(recognizer.FinalResult())["text"]
    
    return jsonify({
        "text": final_result,
        "detected_language": detected_lang
    })

@app.route('/transcribe/<lang>', methods=['POST'])
def transcribe_with_lang(lang):
    """Transcribe with explicit language selection for testing"""
    if lang not in ['english', 'hindi']:
        return jsonify({"error": "Language must be 'english' or 'hindi'"})
    
    audio = request.files['audio']
    wf = wave.open(audio, "rb")

    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        wf.close()
        return jsonify({"error": "Audio must be mono, 16-bit PCM, 16000 Hz."})

    # Choose model based on specified language
    model = model_en if lang == "english" else model_hi
    recognizer = KaldiRecognizer(model, wf.getframerate())
    
    # Transcribe with the selected model
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        recognizer.AcceptWaveform(data)
    
    wf.close()
    final_result = json.loads(recognizer.FinalResult())["text"]
    
    return jsonify({
        "text": final_result,
        "specified_language": lang
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)