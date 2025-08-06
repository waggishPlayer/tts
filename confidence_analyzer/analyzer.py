import cv2
import mediapipe as mp
import numpy as np
import os
import librosa
import subprocess
import noisereduce as nr
import threading
import warnings
import whisper
import torch
import soundfile as sf

warnings.filterwarnings("ignore", category=UserWarning)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import absl.logging
absl.logging.set_verbosity(absl.logging.ERROR)

FRAME_SKIP = 3
WHISPER_MODEL = "tiny"

FILLER_WORDS = {"um", "uh", "ah", "hmm", "you know", "like", "basically", "literally"}
OPTIMAL_SPEECH_RATE = (140, 160)
MIN_VOLUME_DB = -55

mp_pose = mp.solutions.pose
mp_face_mesh = mp.solutions.face_mesh
mp_hands = mp.solutions.hands

def update_running_average(metrics_dict, key, value):
    if value is None: return
    if key not in metrics_dict:
        metrics_dict[key] = (value, 1)
    else:
        current_mean, count = metrics_dict[key]
        new_count = count + 1
        new_mean = (current_mean * count + value) / new_count
        metrics_dict[key] = (new_mean, new_count)

class AudioAnalyzer:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.whisper_model = whisper.load_model(WHISPER_MODEL, device=self.device)
        self.sample_rate = 16000

    def extract_and_preprocess_audio(self, video_path, temp_audio_path="temp_audio.wav"):
        try:
            command = ['ffmpeg', '-y', '-i', video_path, '-vn', '-ac', '1', '-ar', str(self.sample_rate), '-acodec', 'pcm_s16le', temp_audio_path]
            subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            y, sr = librosa.load(temp_audio_path, sr=self.sample_rate)
            y_clean = nr.reduce_noise(y=y, sr=sr)
            y_normalized = librosa.util.normalize(y_clean)
            sf.write(temp_audio_path, y_normalized, sr)
            return temp_audio_path, y_normalized, sr
        except Exception: return None, None, None

    def analyze_speech_content(self, audio_path):
        try:
            result = self.whisper_model.transcribe(audio_path, word_timestamps=True)
            words = [segment for segment in result['segments'] for segment in segment['words']]
            if not words: return None
            return {'words': words, 'word_count': len(words), 'filler_count': sum(1 for w in words if w['word'].strip().lower() in FILLER_WORDS)}
        except Exception: return None

    def analyze_acoustic_features(self, y, sr, words):
        speaking_duration, words_per_minute = 0, 0
        if words and len(words) > 1:
            speaking_duration = words[-1]['end'] - words[0]['start']
            if speaking_duration > 0: words_per_minute = (len(words) / speaking_duration) * 60
        
        f0 = librosa.yin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
        f0_valid = f0[~np.isnan(f0)]
        pitch_std = np.std(f0_valid) if len(f0_valid) > 0 else 0
        rms = librosa.feature.rms(y=y)
        volume_db = 20 * np.log10(np.mean(rms) + 1e-7)
        return {'words_per_minute': words_per_minute, 'pitch_std': pitch_std, 'volume_db': volume_db}

    def run_analysis(self, video_path):
        audio_path, y, sr = self.extract_and_preprocess_audio(video_path)
        if not audio_path: return None
        speech_content = self.analyze_speech_content(audio_path)
        if not speech_content:
            os.remove(audio_path)
            return {'error': 'No speech detected.'}
        features = self.analyze_acoustic_features(y, sr, speech_content['words'])
        os.remove(audio_path)
        return {'content': speech_content, 'features': features}


def analyze_eye_contact(face_landmarks):
    LEFT_EYE_OUTLINE = [33, 160, 158, 133, 153, 144]
    RIGHT_EYE_OUTLINE = [362, 385, 387, 263, 373, 380]
    LEFT_IRIS = range(473, 478)
    RIGHT_IRIS = range(468, 473)

    left_eye_points = np.array([[face_landmarks.landmark[i].x, face_landmarks.landmark[i].y] for i in LEFT_EYE_OUTLINE])
    left_eye_left_x = np.min(left_eye_points[:, 0])
    left_eye_right_x = np.max(left_eye_points[:, 0])
    left_eye_width = left_eye_right_x - left_eye_left_x

    left_iris_points = np.array([[face_landmarks.landmark[i].x, face_landmarks.landmark[i].y] for i in LEFT_IRIS])
    left_iris_center_x = np.mean(left_iris_points[:, 0])
    
    left_ratio = 0.5
    if left_eye_width > 1e-6:
        left_ratio = (left_iris_center_x - left_eye_left_x) / left_eye_width

    right_eye_points = np.array([[face_landmarks.landmark[i].x, face_landmarks.landmark[i].y] for i in RIGHT_EYE_OUTLINE])
    right_eye_left_x = np.min(right_eye_points[:, 0])
    right_eye_right_x = np.max(right_eye_points[:, 0])
    right_eye_width = right_eye_right_x - right_eye_left_x

    right_iris_points = np.array([[face_landmarks.landmark[i].x, face_landmarks.landmark[i].y] for i in RIGHT_IRIS])
    right_iris_center_x = np.mean(right_iris_points[:, 0])
    
    right_ratio = 0.5
    if right_eye_width > 1e-6:
        right_ratio = (right_iris_center_x - right_eye_left_x) / right_eye_width

    penalty_multiplier = 2.5
    left_score = 1 - abs(left_ratio - 0.5) * penalty_multiplier
    right_score = 1 - abs(right_ratio - 0.5) * penalty_multiplier
    
    return max(0, (left_score + right_score) / 2.0)


def analyze_posture(pose_landmarks):
    left_shoulder = pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
    right_shoulder = pose_landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
    shoulder_y_diff = abs(left_shoulder.y - right_shoulder.y)
    level_score = 1 - min(shoulder_y_diff * 5, 1)
    return level_score

def analyze_hand_gestures(hand_landmarks, face_landmarks):
    is_touching_face = False
    if hand_landmarks and face_landmarks:
        for hand_lm in hand_landmarks.landmark:
            for face_lm in face_landmarks.landmark:
                if np.linalg.norm([hand_lm.x - face_lm.x, hand_lm.y - face_lm.y]) < 0.05:
                    is_touching_face = True
                    break
            if is_touching_face: break
    return 0.2 if is_touching_face else 0.8

def analyze_smile(face_landmarks):
    mouth_left = face_landmarks.landmark[61]
    mouth_right = face_landmarks.landmark[291]
    upper_lip = face_landmarks.landmark[13]
    lower_lip = face_landmarks.landmark[14]
    mouth_width = np.linalg.norm([mouth_right.x - mouth_left.x, mouth_right.y - mouth_left.y])
    mouth_height = np.linalg.norm([lower_lip.x - upper_lip.x, lower_lip.y - upper_lip.y])
    if mouth_height < 1e-6: return 0
    smile_ratio = mouth_width / mouth_height
    score = (smile_ratio - 2.0) / 2.5
    return max(0, min(1, score))

def calculate_scores(audio_results, visual_metrics):
    scores = {}
    audio_score = 0  # Default audio score to 0

    # Calculate audio scores only if analysis was successful
    if audio_results and 'features' in audio_results:
        f = audio_results['features']
        c = audio_results['content']
        rate = f['words_per_minute']
        scores['speech_rate'] = max(0, 10 - abs(rate - np.mean(OPTIMAL_SPEECH_RATE)) / 20)
        filler_ratio = c['filler_count'] / c['word_count'] if c['word_count'] > 0 else 0
        scores['filler_words'] = max(0, 10 * (1 - min(filler_ratio * 10, 1)))
        scores['pitch_variation'] = max(0, min(10, f['pitch_std'] / 5))
        scores['volume'] = max(0, min(10, (f['volume_db'] - MIN_VOLUME_DB) / 3))
        
        audio_keys = ['speech_rate', 'filler_words', 'pitch_variation', 'volume']
        audio_score = np.mean([scores.get(k, 5) for k in audio_keys])
    else:
        # If audio analysis failed, explicitly set all audio metrics to 0
        scores['speech_rate'] = 0
        scores['filler_words'] = 0
        scores['pitch_variation'] = 0
        scores['volume'] = 0

    # Calculate visual scores regardless of audio
    scores['eye_contact'] = (visual_metrics.get('eye_contact', (0.5, 1))[0]) * 10
    scores['posture'] = (visual_metrics.get('posture', (0.5, 1))[0]) * 10
    scores['hand_gestures'] = (visual_metrics.get('hand_gestures', (0.5, 1))[0]) * 10
    scores['smile_quantity'] = (visual_metrics.get('smile_quantity', (0.1, 1))[0]) * 10
    
    visual_keys = ['eye_contact', 'posture', 'hand_gestures', 'smile_quantity']
    visual_score = np.mean([scores.get(k, 5) for k in visual_keys])
    
    # MODIFICATION: If audio score is 0, the overall score is also 0.
    if audio_score == 0:
        overall_score = 0
    else:
        overall_score = (audio_score * 0.6) + (visual_score * 0.4)
    
    return {'overall_score': overall_score, 'audio_score': audio_score, 'visual_score': visual_score, 'detailed_scores': scores}

# --- MAIN ANALYSIS FUNCTION ---
def analyze_confidence(video_path):
    print("🚀 Starting analysis...")
    audio_results = {}
    def audio_task():
        nonlocal audio_results
        analyzer = AudioAnalyzer()
        audio_results = analyzer.run_analysis(video_path)
    
    audio_thread = threading.Thread(target=audio_task)
    audio_thread.start()

    cap = cv2.VideoCapture(video_path)
    visual_metrics = {}
    frame_count = 0

    with mp_pose.Pose(min_detection_confidence=0.5) as pose, \
         mp_face_mesh.FaceMesh(max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.5) as face_mesh, \
         mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.5) as hands:
        
        while cap.isOpened():
            success, frame = cap.read()
            if not success: break
            
            frame_count += 1
            if frame_count % FRAME_SKIP != 0: continue

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pose_results = pose.process(rgb_frame)
            face_results = face_mesh.process(rgb_frame)
            hands_results = hands.process(rgb_frame)
            
            if pose_results.pose_landmarks:
                update_running_average(visual_metrics, 'posture', analyze_posture(pose_results.pose_landmarks))
            
            if face_results.multi_face_landmarks:
                face_landmarks = face_results.multi_face_landmarks[0]
                update_running_average(visual_metrics, 'eye_contact', analyze_eye_contact(face_landmarks))
                update_running_average(visual_metrics, 'smile_quantity', analyze_smile(face_landmarks))
                
                first_hand = hands_results.multi_hand_landmarks[0] if hands_results.multi_hand_landmarks else None
                update_running_average(visual_metrics, 'hand_gestures', analyze_hand_gestures(first_hand, face_landmarks))

    cap.release()
    cv2.destroyAllWindows()
    audio_thread.join()
    print("✅ Analysis Complete!")

    final_report = calculate_scores(audio_results, visual_metrics)
    ds = final_report['detailed_scores']

    print("\n" + "="*45, "\n         ✨ CONFIDENCE SCORE REPORT ✨", "="*45, sep='\n')
    print(f"\n  OVERALL SCORE: {final_report['overall_score']:.1f} / 10.0")
    print(f"   Vocal Score:   {final_report['audio_score']:.1f} / 10.0")
    print(f"  Visual Score:  {final_report['visual_score']:.1f} / 10.0")
    print("\n" + "-"*45)

    print("\n📊 DETAILED SCORES:\n")
    print("  VOCAL METRICS:")
    print(f"    - Volume:          {ds.get('volume', 0):.1f} / 10")
    print(f"    - Pitch Variation: {ds.get('pitch_variation', 0):.1f} / 10")
    print(f"    - Speech Rate:     {ds.get('speech_rate', 0):.1f} / 10")
    print(f"    - Filler Words:    {ds.get('filler_words', 0):.1f} / 10\n")

    print("  VISUAL METRICS:")
    print(f"    - Eye Contact:     {ds.get('eye_contact', 0):.1f} / 10")
    print(f"    - Posture:         {ds.get('posture', 0):.1f} / 10")
    print(f"    - Smile Quantity:  {ds.get('smile_quantity', 0):.1f} / 10")
    print(f"    - Hand Gestures:   {ds.get('hand_gestures', 0):.1f} / 10")
    print("\n" + "="*45)

if __name__ == "__main__":
    video_path = r"C:\Users\DARKAVE\OneDrive\Pictures\Camera Roll\WIN_20250413_20_01_27_Pro.mp4" # <--- IMPORTANT: Change this path
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at '{video_path}'")
    else:
        analyze_confidence(video_path)