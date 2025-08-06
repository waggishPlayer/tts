import cv2
import numpy as np
import os
from typing import List, Dict, Tuple

class ObjectDetector:
    def __init__(self):
        """Initialize the object detector with COCO dataset classes and colors"""
        self.classes = [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
            'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
            'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
            'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
            'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
            'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
            'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
            'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
            'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
            'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
            'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
            'toothbrush'
        ]
        
        # Generate random colors for bounding boxes
        np.random.seed(42)
        self.colors = np.random.uniform(0, 255, size=(len(self.classes), 3))
        
        # Try to load YOLOv3 model (you can replace with other models)
        self.net = None
        self.output_layers = None
        self.load_model()
    
    def load_model(self):
        """Load YOLOv3 model - falls back to simple detection if model not available"""
        try:
            # You would typically download these files:
            # - yolov3.weights: https://pjreddie.com/media/files/yolov3.weights
            # - yolov3.cfg: https://github.com/pjreddie/darknet/blob/master/cfg/yolov3.cfg
            
            weights_path = "ObjectDetection/models/yolov3.weights"
            config_path = "ObjectDetection/models/yolov3.cfg"
            
            if os.path.exists(weights_path) and os.path.exists(config_path):
                self.net = cv2.dnn.readNet(weights_path, config_path)
                layer_names = self.net.getLayerNames()
                self.output_layers = [layer_names[i[0] - 1] for i in self.net.getUnconnectedOutLayers()]
                print("YOLOv3 model loaded successfully")
            else:
                print("YOLOv3 model files not found. Using basic detection method.")
                
        except Exception as e:
            print(f"Error loading model: {e}. Using basic detection method.")
    
    def detect_objects_basic(self, image_path: str) -> Dict:
        """Basic object detection using OpenCV's built-in methods"""
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                return {"error": "Could not read image"}
            
            # Convert to RGB for better processing
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Simple face detection as an example
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            detected_objects = []
            
            # Add detected faces
            for (x, y, w, h) in faces:
                detected_objects.append({
                    'class': 'person',
                    'confidence': 0.85,
                    'bbox': [int(x), int(y), int(w), int(h)]
                })
            
            # Basic color-based object detection for demonstration
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Detect red objects (could be cars, apples, etc.)
            red_lower = np.array([0, 50, 50])
            red_upper = np.array([10, 255, 255])
            red_mask = cv2.inRange(hsv, red_lower, red_upper)
            
            contours, _ = cv2.findContours(red_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for contour in contours:
                if cv2.contourArea(contour) > 500:  # Filter small areas
                    x, y, w, h = cv2.boundingRect(contour)
                    detected_objects.append({
                        'class': 'unknown_red_object',
                        'confidence': 0.6,
                        'bbox': [int(x), int(y), int(w), int(h)]
                    })
            
            return {
                'success': True,
                'objects': detected_objects,
                'image_shape': image.shape,
                'total_objects': len(detected_objects)
            }
            
        except Exception as e:
            return {"error": f"Detection failed: {str(e)}"}
    
    def detect_objects_yolo(self, image_path: str) -> Dict:
        """Advanced object detection using YOLOv3"""
        try:
            if self.net is None:
                return self.detect_objects_basic(image_path)
            
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                return {"error": "Could not read image"}
            
            height, width = image.shape[:2]
            
            # Prepare image for YOLO
            blob = cv2.dnn.blobFromImage(image, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
            self.net.setInput(blob)
            outputs = self.net.forward(self.output_layers)
            
            # Process detections
            class_ids = []
            confidences = []
            boxes = []
            
            for output in outputs:
                for detection in output:
                    scores = detection[5:]
                    class_id = np.argmax(scores)
                    confidence = scores[class_id]
                    
                    if confidence > 0.5:
                        # Get bounding box coordinates
                        center_x = int(detection[0] * width)
                        center_y = int(detection[1] * height)
                        w = int(detection[2] * width)
                        h = int(detection[3] * height)
                        
                        # Rectangle coordinates
                        x = int(center_x - w / 2)
                        y = int(center_y - h / 2)
                        
                        boxes.append([x, y, w, h])
                        confidences.append(float(confidence))
                        class_ids.append(class_id)
            
            # Apply Non-Maximum Suppression
            indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
            
            detected_objects = []
            if len(indices) > 0:
                for i in indices.flatten():
                    detected_objects.append({
                        'class': self.classes[class_ids[i]] if class_ids[i] < len(self.classes) else 'unknown',
                        'confidence': confidences[i],
                        'bbox': boxes[i]
                    })
            
            return {
                'success': True,
                'objects': detected_objects,
                'image_shape': image.shape,
                'total_objects': len(detected_objects)
            }
            
        except Exception as e:
            return {"error": f"YOLO detection failed: {str(e)}"}
    
    def detect_objects(self, image_path: str) -> Dict:
        """Main detection method that tries YOLO first, then falls back to basic detection"""
        if self.net is not None:
            return self.detect_objects_yolo(image_path)
        else:
            return self.detect_objects_basic(image_path)
    
    def draw_detections(self, image_path: str, output_path: str) -> bool:
        """Draw bounding boxes on image and save result"""
        try:
            detection_result = self.detect_objects(image_path)
            if 'error' in detection_result:
                return False
            
            image = cv2.imread(image_path)
            
            for obj in detection_result['objects']:
                x, y, w, h = obj['bbox']
                class_name = obj['class']
                confidence = obj['confidence']
                
                # Get color for this class
                color_idx = hash(class_name) % len(self.colors)
                color = [int(c) for c in self.colors[color_idx]]
                
                # Draw bounding box
                cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
                
                # Draw label
                label = f"{class_name}: {confidence:.2f}"
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
                cv2.rectangle(image, (x, y - label_size[1] - 10), (x + label_size[0], y), color, -1)
                cv2.putText(image, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
            
            # Save result
            cv2.imwrite(output_path, image)
            return True
            
        except Exception as e:
            print(f"Error drawing detections: {e}")
            return False

# Usage example
if __name__ == "__main__":
    detector = ObjectDetector()
    result = detector.detect_objects("test_image.jpg")
    print(result)
