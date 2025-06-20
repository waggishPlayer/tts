import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ToolPage } from './components/ToolPage';
import TtsPage from './components/TtsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/tts" element={<TtsPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/:toolId" element={<ToolPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;