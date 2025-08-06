import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ToolPage } from './components/ToolPage';
import TtsPage from './components/TtsPage';
import SttPage from './components/SttPage';
import ConfidenceAnalyzerPage from './components/ConfidenceAnalyzerPage';
import FaceVoiceDetectorPage from './components/FaceVoiceDetectorPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/tts" element={<TtsPage />} />
        <Route path="/stt" element={<SttPage />} />
        <Route path="/confidence-analyzer" element={<ConfidenceAnalyzerPage />} />
        <Route path="/face-voice-detector" element={<FaceVoiceDetectorPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/:toolId" element={<ToolPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;