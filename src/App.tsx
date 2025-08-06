import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ToolPage } from './components/ToolPage';
import TtsPage from './components/TtsPage';
import SttPage from './components/SttPage';
import ConfidenceAnalyzerPage from './components/ConfidenceAnalyzerPage';
import FaceVoiceDetectorPage from './components/FaceVoiceDetectorPage';
// New utility components
import ObjectDetectionPage from './components/ObjectDetectionPage';
import TextTranslatorPage from './components/TextTranslatorPage';
import TextToImageGeneratorPage from './components/TextToImageGeneratorPage';
import VideoToProfilePage from './components/VideoToProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/tts" element={<TtsPage />} />
        <Route path="/stt" element={<SttPage />} />
        <Route path="/confidence-analyzer" element={<ConfidenceAnalyzerPage />} />
        <Route path="/face-voice-detector" element={<FaceVoiceDetectorPage />} />
        {/* New utility routes */}
        <Route path="/object-detection" element={<ObjectDetectionPage />} />
        <Route path="/text-translator" element={<TextTranslatorPage />} />
        <Route path="/text-to-image-generator" element={<TextToImageGeneratorPage />} />
        <Route path="/video-to-profile" element={<VideoToProfilePage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/:toolId" element={<ToolPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;