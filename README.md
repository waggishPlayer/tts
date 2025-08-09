# 🤖 AI Toolbox Hub - Complete AI Assistant Suite

<div align="center">

![AI Toolbox Hub](https://img.shields.io/badge/AI-Toolbox%20Hub-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3.3-000000?style=for-the-badge&logo=flask)

**Your one-stop platform for powerful AI tools - from text processing to computer vision, all in a beautiful, easy-to-use interface.**

[🚀 Live Demo](#) | [📖 Documentation](#utilities-overview) | [🛠️ Setup Guide](#-quick-start)

</div>

---

## 📋 Table of Contents

- [✨ Overview](#-overview)
- [🎯 Utilities Overview](#-utilities-overview)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Installation Guide](#️-installation-guide)
- [📚 Detailed Usage Instructions](#-detailed-usage-instructions)
- [🔧 Configuration](#-configuration)
- [🌐 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Overview

AI Toolbox Hub is a comprehensive web-based platform that brings together 12 powerful AI utilities in one seamless interface. Built with React (frontend) and Flask (backend), it provides everything from text processing and translation to advanced computer vision and media generation.

### 🌟 Key Features

- **🎨 Beautiful UI** - Modern, responsive design with dark mode support
- **🔄 Real-time Processing** - Instant results with progress indicators
- **📱 Mobile Friendly** - Works perfectly on all devices
- **🔌 API-First Design** - RESTful APIs for all utilities
- **🛡️ Secure** - File validation, error handling, and safe processing
- **🌍 Multi-language** - Translation support for 70+ languages
- **📊 Analytics Ready** - Built-in usage tracking and monitoring

---

## 🎯 Utilities Overview

<table>
<tr>
<td align="center" width="33%">

### 🗣️ **Text & Language Processing**
- [Text to Speech](#text-to-speech-tts)
- [Speech to Text](#speech-to-text-stt)  
- [Smart Text Translator](#smart-text-translator)
- [AI Chatbot](#ai-chatbot)

</td>
<td align="center" width="33%">

### 🎨 **Media & Creative Tools**
- [AI Image Generator](#ai-image-generator)
- [Object Detection](#object-detection)
- [Video to Profile Picture](#video-to-profile-picture)
- [Face & Voice Detector](#face--voice-detector)

</td>
<td align="center" width="34%">

### 📊 **Analysis & Productivity**
- [Confidence Analyzer](#confidence-analyzer)
- [Text Summarizer](#text-summarizer)
- [Content Generator](#content-generator)
- [Code Assistant](#code-assistant)

</td>
</tr>
</table>

---

## 🚀 Quick Start

Get up and running in under 5 minutes!

### Prerequisites
- **Python 3.8+** 
- **Node.js 16+** 
- **npm or yarn**

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd tts

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies  
npm install
```

### 2. Start the Servers
```bash
# Terminal 1: Start Backend (Flask)
python backend/server.py

# Terminal 2: Start Frontend (React)
npm run dev
```

### 3. Open Your Browser
Visit `http://localhost:5173` and start using the AI tools! 🎉

---

## 🛠️ Installation Guide

### System Requirements

| Component | Requirement | Purpose |
|-----------|-------------|---------|
| **Python** | 3.8+ | Backend processing, AI models |
| **Node.js** | 16+ | Frontend build system |
| **RAM** | 4GB+ | Image/video processing |
| **Storage** | 2GB+ | Dependencies and temp files |
| **Internet** | Required | External AI services |

### Step-by-Step Installation

<details>
<summary><b>🐍 Backend Setup (Python/Flask)</b></summary>

1. **Create Virtual Environment** (Recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Dependencies**
```bash
pip install -r requirements.txt
```

3. **Test Backend**
```bash
cd backend
python server.py
```
✅ Server should start on `http://localhost:5000`

</details>

<details>
<summary><b>⚛️ Frontend Setup (React/TypeScript)</b></summary>

1. **Install Node Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```
✅ Frontend should open on `http://localhost:5173`

3. **Build for Production**
```bash
npm run build
```

</details>

<details>
<summary><b>🔧 Optional Enhancements</b></summary>

**Advanced Object Detection** (Download YOLO models):
```bash
mkdir -p ObjectDetection/models
wget -O ObjectDetection/models/yolov3.weights https://pjreddie.com/media/files/yolov3.weights
wget -O ObjectDetection/models/yolov3.cfg https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg
```

**Enhanced Image Generation** (Add Hugging Face API key):
```bash
export HUGGINGFACE_API_KEY="your_key_here"
```

</details>

---

## 📚 Detailed Usage Instructions

### Text to Speech (TTS)
**Convert text into natural-sounding speech**

<details>
<summary>📖 How to Use</summary>

**Route:** `/tts`

**Features:**
- 🎵 Multiple voice options (system voices)
- 🎚️ Adjustable speed, pitch, and volume
- ⏯️ Play, pause, stop controls
- 🌍 Multi-language support

**Usage Steps:**
1. Enter your text in the input field
2. Select voice, adjust speed/pitch/volume
3. Click "Speak" to hear the audio
4. Use controls to pause/resume/stop

**Supported Languages:** English, Spanish, French, German, Italian, Japanese, Korean, Chinese, Arabic, Hindi, and more (depends on your system)

**Best Practices:**
- Keep text under 500 words for best performance
- Use punctuation for natural pauses
- Test different voices to find your preferred one

</details>

### Speech to Text (STT)
**Transcribe audio recordings to text**

<details>
<summary>📖 How to Use</summary>

**Route:** `/stt`

**Features:**
- 🎤 Real-time microphone recording
- 📁 Audio file upload support
- 🌍 Multi-language transcription
- 📝 Editable transcription results

**Supported Formats:** WAV, MP3, M4A, WEBM
**Languages:** English, Hindi (with language auto-detection)

**Usage Steps:**
1. Click "Start Recording" or upload audio file
2. Speak clearly or wait for file processing
3. Review and edit transcription
4. Copy or save the text

**Tips for Better Results:**
- Speak clearly and at moderate pace
- Use good quality microphone
- Minimize background noise
- Keep recordings under 10 minutes

</details>

### Smart Text Translator
**Translate between 70+ languages with AI precision**

<details>
<summary>📖 How to Use</summary>

**Route:** `/text-translator`

**Features:**
- 🌍 70+ supported languages
- 🔄 Auto language detection
- ↔️ Language swap functionality
- 📋 One-click copy to clipboard
- 🔀 Multiple translation services with fallbacks

**Translation Services:**
1. **MyMemory API** (Primary)
2. **LibreTranslate** (Fallback)
3. **Simple Dictionary** (Offline fallback)

**Usage Steps:**
1. Enter text in the source box
2. Select source and target languages (or use auto-detect)
3. Click "Translate Text"
4. Copy result or swap languages for reverse translation

**Supported Languages Include:**
English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, Turkish, Polish, Dutch, Swedish, and 55+ more.

**Pro Tips:**
- Use auto-detect for unknown languages
- Break long texts into shorter paragraphs
- Use the swap button for quick conversations
- Copy results to clipboard for easy sharing

</details>

### AI Image Generator
**Create stunning images from text descriptions**

<details>
<summary>📖 How to Use</summary>

**Route:** `/text-to-image-generator`

**Features:**
- 🎨 Multiple art styles (Realistic, Artistic, Cartoon, Sketch, Digital Art)
- 📐 Various image sizes (Square, Landscape, Portrait, Wide, Tall)
- 💡 Built-in prompt examples
- 📥 Downloadable high-quality images
- 🔄 Multiple AI models with fallbacks

**AI Services:**
1. **Pollinations AI** (Free, no API key required)
2. **Hugging Face Stable Diffusion** (Optional, requires API key)
3. **Simple Text Generator** (Fallback)

**Usage Steps:**
1. Enter detailed description of desired image
2. Choose art style and size
3. Click "Generate Image"
4. Download result or try different settings

**Example Prompts:**
- "A majestic mountain landscape at sunset with golden light"
- "A cute robot sitting in a flower garden, cartoon style"
- "Professional headshot of a person, photorealistic"
- "Abstract digital art with vibrant colors and geometric shapes"

**Pro Tips:**
- Be specific about colors, lighting, and mood
- Include artistic styles or famous artists for reference
- Mention camera angles for better composition
- Add quality descriptors like "highly detailed" or "4K resolution"

</details>

### Object Detection
**Detect and identify objects in images using computer vision**

<details>
<summary>📖 How to Use</summary>

**Route:** `/object-detection`

**Features:**
- 🔍 Detects 80+ object classes
- 📊 Confidence scoring for each detection
- 📋 Bounding box visualization
- 📥 Downloadable annotated images
- ⚡ Fast processing with YOLO architecture

**Supported Image Formats:** JPEG, PNG, BMP, TIFF, WEBP (up to 10MB)

**Detectable Objects Include:**
- **People & Animals:** Person, cat, dog, horse, bird, elephant, etc.
- **Vehicles:** Car, truck, bus, bicycle, motorcycle, airplane, boat
- **Everyday Items:** Chair, table, laptop, phone, book, cup, bottle
- **Food:** Apple, banana, pizza, cake, sandwich, etc.

**Usage Steps:**
1. Upload or drag-drop an image
2. Click "Detect Objects"
3. View detected objects with confidence scores
4. Download annotated image with bounding boxes

**Best Results Tips:**
- Use clear, well-lit images
- Ensure objects are clearly visible
- Higher resolution images work better
- Multiple objects in one image are supported

</details>

### Video to Profile Picture
**Extract perfect profile pictures from videos using AI**

<details>
<summary>📖 How to Use</summary>

**Route:** `/video-to-profile`

**Features:**
- 👤 Smart face detection and quality assessment
- 📏 Multiple output sizes (128x128 to 1024x1024)
- ⭕ Circular cropping for social media
- ✨ Automatic image enhancement
- 📊 Quality scoring and ranking
- 🎯 Multiple options to choose from

**Supported Video Formats:** MP4, AVI, MOV, MKV, WEBM (up to 100MB)

**Usage Steps:**
1. Upload video file
2. Choose output size and options
3. Select circular cropping and enhancement
4. Click "Create Profile Pictures"
5. Download your favorites or all results

**Processing Features:**
- **Face Detection:** Finds both frontal and profile faces
- **Quality Scoring:** Rates by sharpness, lighting, composition
- **Enhancement:** Improves sharpness, contrast, and colors
- **Multiple Options:** Get 5 best profile pictures to choose from

**Best Results Tips:**
- Use videos with good lighting
- Face should be clearly visible
- Looking at camera works best
- Longer videos provide more options
- Avoid heavily filtered videos

</details>

### Face & Voice Detector
**Analyze videos for face and voice presence**

<details>
<summary>📖 How to Use</summary>

**Route:** `/face-voice-detector`

**Features:**
- 👁️ Advanced face detection
- 🔊 Voice activity detection
- 📊 Detailed analysis results
- ⏱️ Timeline-based detection

**Usage Steps:**
1. Upload video file
2. Click "Analyze Video"
3. View detection results
4. Get detailed report

</details>

### Confidence Analyzer
**Analyze speaking confidence and presentation skills**

<details>
<summary>📖 How to Use</summary>

**Route:** `/confidence-analyzer`

**Features:**
- 🎯 Overall confidence scoring
- 🔊 Audio analysis (volume, pitch, speech rate)
- 👁️ Visual analysis (eye contact, posture, gestures)
- 📊 Detailed metrics and recommendations

**Usage Steps:**
1. Upload presentation video
2. Wait for AI analysis
3. Review detailed scores
4. Get improvement recommendations

</details>

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# API Keys (Optional)
HUGGINGFACE_API_KEY=your_huggingface_key_here
OPENAI_API_KEY=your_openai_key_here

# File Upload Limits
MAX_CONTENT_LENGTH=104857600  # 100MB

# CORS Settings
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Backend Configuration

Edit `backend/server.py` for customization:

```python
# File size limits
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB

# Allowed file extensions
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm'}
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp'}

# API endpoints prefix
API_PREFIX = '/api'
```

### Frontend Configuration

Edit `src/config/api.ts`:

```typescript
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com'  // Your production URL
  : 'http://localhost:5000';
```

---

## 🌐 Deployment

### Production Deployment Options

<details>
<summary><b>🚀 Deploy to Render (Recommended)</b></summary>

**Backend Deployment:**
1. Push code to GitHub
2. Connect to Render
3. Set environment variables
4. Deploy with `render.yaml` configuration

**Frontend Deployment:**
1. Build: `npm run build`
2. Deploy `dist` folder to Netlify/Vercel
3. Configure redirects for SPA

**render.yaml example:**
```yaml
services:
  - type: web
    name: ai-toolbox-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python backend/server.py
    envVars:
      - key: FLASK_ENV
        value: production
```

</details>

<details>
<summary><b>🐳 Docker Deployment</b></summary>

**Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "backend/server.py"]
```

**Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
```

</details>

### Performance Optimization

**For Production:**
- Use Redis for caching
- Implement rate limiting
- Add CDN for static assets
- Enable gzip compression
- Use production WSGI server (Gunicorn)

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
python -m pytest tests/

# Frontend tests  
npm test

# End-to-end tests
npm run e2e
```

### Test Each Utility

| Utility | Test Input | Expected Output |
|---------|------------|----------------|
| **TTS** | "Hello World" | Audio playback |
| **STT** | Audio file/recording | Text transcription |
| **Translator** | "Hello" (en→es) | "Hola" |
| **Image Generator** | "A red car" | Generated image |
| **Object Detection** | Image with objects | Detected objects list |
| **Video to Profile** | Video with face | Profile picture options |

---

## 🚨 Troubleshooting

### Common Issues & Solutions

<details>
<summary><b>🐛 Backend Issues</b></summary>

**Issue:** `ModuleNotFoundError: No module named 'cv2'`
```bash
pip install opencv-python --no-cache-dir
```

**Issue:** `Memory Error during video processing`
- Reduce video file size
- Increase server RAM allocation
- Process shorter video segments

**Issue:** `Translation service not working`
- Check internet connection
- Services have fallback mechanisms
- Offline dictionary still works

</details>

<details>
<summary><b>🎨 Frontend Issues</b></summary>

**Issue:** `CORS errors`
- Check backend CORS configuration
- Ensure API_BASE_URL is correct
- Verify both servers are running

**Issue:** `Build fails`
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

</details>

<details>
<summary><b>🔧 Performance Issues</b></summary>

**Large file uploads:**
- Compress images/videos before upload
- Increase server timeout limits
- Use chunked upload for very large files

**Slow processing:**
- Enable GPU acceleration for computer vision
- Use production-grade AI model endpoints
- Implement caching for repeated requests

</details>

---

## 📊 API Documentation

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-domain.com/api`

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/object-detection/analyze` | Detect objects in image |
| `POST` | `/text-translator/translate` | Translate text |
| `GET` | `/text-translator/languages` | Get supported languages |
| `POST` | `/text-to-image/generate` | Generate image from text |
| `GET` | `/text-to-image/options` | Get generation options |
| `POST` | `/video-to-profile/convert` | Extract profile pictures |
| `GET` | `/video-to-profile/options` | Get processing options |

<details>
<summary><b>📝 Detailed API Examples</b></summary>

**Translate Text:**
```bash
curl -X POST http://localhost:5000/api/text-translator/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "source_lang": "en",
    "target_lang": "es"
  }'
```

**Generate Image:**
```bash
curl -X POST http://localhost:5000/api/text-to-image/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset",
    "style": "realistic",
    "size": "square"
  }'
```

</details>

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Workflow

1. **Fork the repository**
2. **Create feature branch:** `git checkout -b feature/amazing-feature`
3. **Make changes and test thoroughly**
4. **Commit changes:** `git commit -m 'Add amazing feature'`
5. **Push to branch:** `git push origin feature/amazing-feature`
6. **Open Pull Request**

### Code Standards

- **Python:** Follow PEP 8, use type hints
- **TypeScript/React:** Use ESLint, Prettier
- **Documentation:** Update README for new features
- **Testing:** Add tests for new functionality

---

### Version History

- **v2.0.0** - Added 4 new AI utilities (Current)
- **v1.5.0** - Enhanced existing tools, improved UI
- **v1.0.0** - Initial release with core utilities

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **OpenCV** - Computer vision capabilities
- **React & TypeScript** - Frontend framework
- **Flask** - Backend API framework
- **Hugging Face** - AI model hosting
- **Pollinations AI** - Free image generation
- **MyMemory & LibreTranslate** - Translation services

---

<div align="center">

**⭐ Star this repository if it helped you!**


[🔝 Back to Top](#-ai-toolbox-hub---complete-ai-assistant-suite)

</div>
