// API Configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Backend URLs
// IMPORTANT: Replace this with your actual Render URL after deployment
export const API_BASE_URL = isProduction 
  ? 'https://your-backend-app-name.onrender.com'  // Replace with your actual Render URL
  : 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  CONFIDENCE_ANALYZE: `${API_BASE_URL}/api/confidence/analyze`,
  DETECTOR_ANALYZE: `${API_BASE_URL}/api/detector/analyze`,
  STT_TRANSCRIBE: `${API_BASE_URL}/api/stt/transcribe`,
  STT_TRANSCRIBE_LANG: (lang: string) => `${API_BASE_URL}/api/stt/transcribe/${lang}`,

  // New endpoints for the 4 utilities
  OBJECT_DETECTION_ANALYZE: `${API_BASE_URL}/api/object-detection/analyze`,
  TEXT_TRANSLATOR_TRANSLATE: `${API_BASE_URL}/api/text-translator/translate`,
  TEXT_TRANSLATOR_LANGUAGES: `${API_BASE_URL}/api/text-translator/languages`,
  TEXT_TO_IMAGE_GENERATE: `${API_BASE_URL}/api/text-to-image/generate`,
  TEXT_TO_IMAGE_OPTIONS: `${API_BASE_URL}/api/text-to-image/options`,
  VIDEO_TO_PROFILE_CONVERT: `${API_BASE_URL}/api/video-to-profile/convert`,
  VIDEO_TO_PROFILE_OPTIONS: `${API_BASE_URL}/api/video-to-profile/options`,
};

export { isDevelopment, isProduction };
