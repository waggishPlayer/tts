import cv2
import numpy as np
import os
import tempfile
from pydub import AudioSegment
from pydub.silence import detect_nonsilent

def extract_audio(video_path, output_audio_path):
    """Extract audio from video using pydub (requires ffmpeg)"""
    video = AudioSegment.from_file(video_path)
    video.export(output_audio_path, format="wav")
    return output_audio_path

def detect_voice(audio_path, silence_thresh=-45, min_voice_len=1000, min_db=-30):
    """
    Improved voice detection that:
    - Requires louder audio (higher threshold)
    - Needs longer voice segments
    - Checks overall volume
    """
    audio = AudioSegment.from_wav(audio_path)
    
    if audio.dBFS < min_db:
        return False
    
    non_silent = detect_nonsilent(
        audio,
        min_silence_len=500,
        silence_thresh=silence_thresh
    )
    
    voice_duration = sum(end-start for start,end in non_silent)
    return voice_duration >= min_voice_len

def detect_faces_opencv(video_path, sample_every_n_frames=10):
    """Detect faces using OpenCV's Haar Cascade"""
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print("Error: Could not open video file")
        return False
    
    frame_count = 0
    face_detected = False
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        if frame_count % sample_every_n_frames != 0:
            continue
            
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) > 0:
            face_detected = True
            break
    
    cap.release()
    return face_detected

def analyze_video(video_path):
    """Main function to analyze video for faces and voice"""
    print(f"Analyzing video file: {video_path}")
    
    # Detect faces
    print("Detecting faces...")
    faces_detected = detect_faces_opencv(video_path)
    print(f"Faces detected: {faces_detected}")
    
    # Detect voice
    print("Extracting and analyzing audio...")
    try:
        temp_audio = os.path.join(tempfile.gettempdir(), "temp_audio.wav")
        extract_audio(video_path, temp_audio)
        voice_detected = detect_voice(temp_audio)
        os.remove(temp_audio)  # Clean up temp file
    except Exception as e:
        print(f"Audio analysis error: {e}")
        voice_detected = False
    
    print(f"Voice detected: {voice_detected}")
    
    # Final result
    if faces_detected and voice_detected:
        print("RESULT: Both face and voice detected in the video.")
    elif faces_detected:
        print("RESULT: Only face detected in the video.")
    elif voice_detected:
        print("RESULT: Only voice detected in the video.")
    else:
        print("RESULT: Neither face nor voice detected in the video.")
    
    return faces_detected, voice_detected

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python video_analyzer.py <video_file_path>")
        sys.exit(1)
    
    video_path = sys.argv[1]
    analyze_video(video_path)