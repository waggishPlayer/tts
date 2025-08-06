import cv2
import numpy as np
import os
import time
import base64
from typing import Dict, List, Tuple, Optional
from PIL import Image, ImageEnhance, ImageFilter
import io

class VideoToProfilePictureConverter:
    def __init__(self):
        """Initialize the video to profile picture converter"""
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        self.supported_formats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', '3gp']
        self.output_sizes = {
            'small': (128, 128),
            'medium': (256, 256),
            'large': (512, 512),
            'xl': (1024, 1024)
        }
    
    def extract_frames(self, video_path: str, max_frames: int = 30) -> List[np.ndarray]:
        """Extract frames from video for analysis"""
        try:
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                return []
            
            # Get video properties
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            
            # Calculate frame sampling interval
            if total_frames <= max_frames:
                frame_interval = 1
            else:
                frame_interval = total_frames // max_frames
            
            frames = []
            frame_count = 0
            
            while len(frames) < max_frames:
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_count % frame_interval == 0:
                    frames.append(frame)
                
                frame_count += 1
            
            cap.release()
            return frames
            
        except Exception as e:
            print(f"Error extracting frames: {e}")
            return []
    
    def detect_faces_in_frame(self, frame: np.ndarray) -> List[Dict]:
        """Detect faces in a single frame"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect frontal faces
            faces = self.face_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(50, 50)
            )
            
            # Detect profile faces
            profile_faces = self.profile_cascade.detectMultiScale(
                gray, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(50, 50)
            )
            
            # Combine detections
            all_faces = []
            
            for (x, y, w, h) in faces:
                face_region = frame[y:y+h, x:x+w]
                
                # Calculate face quality score
                quality_score = self.calculate_face_quality(frame, (x, y, w, h))
                
                all_faces.append({
                    'bbox': (x, y, w, h),
                    'face_region': face_region,
                    'quality_score': quality_score,
                    'type': 'frontal'
                })
            
            for (x, y, w, h) in profile_faces:
                face_region = frame[y:y+h, x:x+w]
                quality_score = self.calculate_face_quality(frame, (x, y, w, h))
                
                all_faces.append({
                    'bbox': (x, y, w, h),
                    'face_region': face_region,
                    'quality_score': quality_score,
                    'type': 'profile'
                })
            
            return all_faces
            
        except Exception as e:
            print(f"Error detecting faces: {e}")
            return []
    
    def calculate_face_quality(self, frame: np.ndarray, bbox: Tuple[int, int, int, int]) -> float:
        """Calculate quality score for a detected face"""
        try:
            x, y, w, h = bbox
            face_region = frame[y:y+h, x:x+w]
            
            # Convert to grayscale for analysis
            gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
            
            # Check for blur (Laplacian variance)
            blur_score = cv2.Laplacian(gray_face, cv2.CV_64F).var()
            blur_score = min(blur_score / 500.0, 1.0)  # Normalize
            
            # Check brightness
            brightness = np.mean(gray_face) / 255.0
            brightness_score = 1.0 - abs(brightness - 0.5) * 2  # Prefer mid-range brightness
            
            # Size score (prefer larger faces)
            frame_area = frame.shape[0] * frame.shape[1]
            face_area = w * h
            size_score = min((face_area / frame_area) * 10, 1.0)
            
            # Eye detection score
            eyes = self.eye_cascade.detectMultiScale(gray_face, 1.1, 3)
            eye_score = min(len(eyes) / 2.0, 1.0)  # Prefer 2 eyes
            
            # Combine scores
            quality_score = (blur_score * 0.3 + brightness_score * 0.2 + 
                           size_score * 0.3 + eye_score * 0.2)
            
            return quality_score
            
        except Exception as e:
            return 0.0
    
    def select_best_faces(self, all_faces: List[Dict], top_n: int = 5) -> List[Dict]:
        """Select the best faces based on quality scores"""
        # Sort by quality score in descending order
        sorted_faces = sorted(all_faces, key=lambda f: f['quality_score'], reverse=True)
        return sorted_faces[:top_n]
    
    def enhance_face_image(self, face_image: np.ndarray) -> np.ndarray:
        """Enhance face image quality"""
        try:
            # Convert to PIL for better processing
            pil_image = Image.fromarray(cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB))
            
            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(pil_image)
            pil_image = enhancer.enhance(1.2)
            
            # Enhance contrast
            enhancer = ImageEnhance.Contrast(pil_image)
            pil_image = enhancer.enhance(1.1)
            
            # Enhance color
            enhancer = ImageEnhance.Color(pil_image)
            pil_image = enhancer.enhance(1.1)
            
            # Convert back to OpenCV format
            enhanced = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            
            return enhanced
            
        except Exception as e:
            print(f"Error enhancing image: {e}")
            return face_image
    
    def create_circular_crop(self, image: np.ndarray) -> np.ndarray:
        """Create a circular crop of the image"""
        try:
            height, width = image.shape[:2]
            size = min(height, width)
            
            # Create a square crop from center
            start_x = (width - size) // 2
            start_y = (height - size) // 2
            square_image = image[start_y:start_y+size, start_x:start_x+size]
            
            # Create circular mask
            mask = np.zeros((size, size), dtype=np.uint8)
            center = (size // 2, size // 2)
            radius = size // 2 - 2  # Slight padding
            cv2.circle(mask, center, radius, 255, -1)
            
            # Apply mask
            result = cv2.bitwise_and(square_image, square_image, mask=mask)
            
            # Add white background for transparent areas
            background = np.ones_like(square_image) * 255
            mask_inv = cv2.bitwise_not(mask)
            background = cv2.bitwise_and(background, background, mask=mask_inv)
            result = cv2.add(result, background)
            
            return result
            
        except Exception as e:
            print(f"Error creating circular crop: {e}")
            return image
    
    def resize_to_profile_size(self, image: np.ndarray, size: str = 'medium') -> np.ndarray:
        """Resize image to profile picture dimensions"""
        try:
            target_size = self.output_sizes.get(size, (256, 256))
            resized = cv2.resize(image, target_size, interpolation=cv2.INTER_LANCZOS4)
            return resized
            
        except Exception as e:
            print(f"Error resizing image: {e}")
            return image
    
    def image_to_base64(self, image: np.ndarray, format: str = 'PNG') -> str:
        """Convert OpenCV image to base64 string"""
        try:
            _, buffer = cv2.imencode(f'.{format.lower()}', image)
            image_base64 = base64.b64encode(buffer).decode('utf-8')
            return image_base64
            
        except Exception as e:
            print(f"Error converting to base64: {e}")
            return ""
    
    def process_video(self, video_path: str, output_size: str = 'medium', 
                     circular_crop: bool = True, enhance: bool = True) -> Dict:
        """Main method to process video and extract profile pictures"""
        try:
            if not os.path.exists(video_path):
                return {'success': False, 'error': 'Video file not found'}
            
            # Extract frames
            frames = self.extract_frames(video_path, max_frames=30)
            if not frames:
                return {'success': False, 'error': 'Could not extract frames from video'}
            
            # Detect faces in all frames
            all_faces = []
            for i, frame in enumerate(frames):
                faces_in_frame = self.detect_faces_in_frame(frame)
                for face in faces_in_frame:
                    face['frame_index'] = i
                    all_faces.append(face)
            
            if not all_faces:
                return {'success': False, 'error': 'No faces detected in video'}
            
            # Select best faces
            best_faces = self.select_best_faces(all_faces, top_n=5)
            
            # Process each selected face
            profile_pictures = []
            
            for i, face_data in enumerate(best_faces):
                face_image = face_data['face_region'].copy()
                
                # Enhance image quality
                if enhance:
                    face_image = self.enhance_face_image(face_image)
                
                # Create circular crop if requested
                if circular_crop:
                    face_image = self.create_circular_crop(face_image)
                
                # Resize to target size
                face_image = self.resize_to_profile_size(face_image, output_size)
                
                # Convert to base64
                image_base64 = self.image_to_base64(face_image)
                
                profile_pictures.append({
                    'id': i + 1,
                    'image_data': image_base64,
                    'quality_score': face_data['quality_score'],
                    'face_type': face_data['type'],
                    'frame_index': face_data['frame_index'],
                    'bbox': face_data['bbox'],
                    'size': output_size,
                    'circular': circular_crop,
                    'enhanced': enhance
                })
            
            return {
                'success': True,
                'profile_pictures': profile_pictures,
                'total_faces_found': len(all_faces),
                'best_faces_selected': len(best_faces),
                'video_info': {
                    'frames_processed': len(frames),
                    'video_path': video_path
                }
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Video processing failed: {str(e)}'}
    
    def get_supported_formats(self) -> List[str]:
        """Get list of supported video formats"""
        return self.supported_formats
    
    def get_output_sizes(self) -> Dict[str, Tuple[int, int]]:
        """Get available output sizes"""
        return self.output_sizes
    
    def save_profile_picture(self, image_data: str, filepath: str) -> bool:
        """Save base64 profile picture to file"""
        try:
            image_bytes = base64.b64decode(image_data)
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            return True
        except Exception as e:
            print(f"Error saving profile picture: {e}")
            return False

# Usage example
if __name__ == "__main__":
    converter = VideoToProfilePictureConverter()
    
    # Test with a video file
    result = converter.process_video(
        video_path="test_video.mp4",
        output_size="medium",
        circular_crop=True,
        enhance=True
    )
    
    print(result)
    
    if result.get('success'):
        profile_pics = result['profile_pictures']
        print(f"Generated {len(profile_pics)} profile pictures")
        
        # Save the best one
        if profile_pics:
            best_pic = profile_pics[0]  # Highest quality
            if converter.save_profile_picture(best_pic['image_data'], 'best_profile.png'):
                print("Best profile picture saved!")
    
    print("Supported formats:", converter.get_supported_formats())
    print("Available sizes:", converter.get_output_sizes())
