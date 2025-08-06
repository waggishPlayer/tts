import React, { useState, useRef } from 'react';
import { Eye, Upload, Play, RotateCw, CheckCircle, XCircle, Info, Users, Volume2 } from 'lucide-react';

interface DetectionResult {
  faces_detected: boolean;
  voice_detected: boolean;
  status: string;
  message: string;
}

const FaceVoiceDetectorPage: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStatus = (message: string, type: string, duration: number = 5000) => {
    setStatus(message);
    setStatusType(type);
    if (type !== 'error') {
      setTimeout(() => setStatus(''), duration);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setDetectionResult(null);
        updateStatus(`Video "${file.name}" selected. Click analyze to process.`, 'success');
      } else {
        updateStatus('Please select a video file.', 'error');
      }
    }
  };

  const analyzeVideo = async () => {
    if (!videoFile) return;

    setLoading(true);
    updateStatus('Analyzing video for faces and voice...', 'info', 30000);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const response = await fetch('http://localhost:5000/api/detector/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setDetectionResult(data);
      updateStatus('Analysis completed successfully!', 'success');

    } catch (error) {
      console.error('Analysis error:', error);
      updateStatus(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (detected: boolean) => {
    return detected ? (
      <CheckCircle className="w-8 h-8 text-green-600" />
    ) : (
      <XCircle className="w-8 h-8 text-red-600" />
    );
  };

  const getResultBackground = (detected: boolean) => {
    return detected 
      ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
      : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700';
  };

  const getResultText = (detected: boolean) => {
    return detected 
      ? 'text-green-800 dark:text-green-200'
      : 'text-red-800 dark:text-red-200';
  };

  const getStatusColor = () => {
    switch (statusType) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
          <Eye className="inline-block w-10 h-10 mr-4" />
          Face & Voice Detector
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Upload className="w-6 h-6 mr-2" />
                Upload Video for Detection
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="videoInput"
              />
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  Choose Video File
                </button>
                {videoFile && (
                  <button
                    onClick={analyzeVideo}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <RotateCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    Analyze Video
                  </button>
                )}
              </div>
              {videoFile && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                  Selected: {videoFile.name}
                </p>
              )}
            </div>

            {/* Status */}
            {status && (
              <div className={`text-center p-3 rounded-lg transition-all duration-300 ${getStatusColor()}`}>
                {status}
              </div>
            )}

            {/* Results Section */}
            {detectionResult && (
              <div className="space-y-6 border-t pt-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-6">
                  Detection Results
                </h3>

                {/* Detection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Face Detection Card */}
                  <div className={`p-6 rounded-lg border-2 ${getResultBackground(detectionResult.faces_detected)}`}>
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <Users className="w-12 h-12 text-gray-600 dark:text-gray-300" />
                      </div>
                      <h4 className={`text-xl font-bold ${getResultText(detectionResult.faces_detected)} mb-2`}>
                        Face Detection
                      </h4>
                      <div className="flex justify-center mb-3">
                        {getResultIcon(detectionResult.faces_detected)}
                      </div>
                      <p className={`font-semibold ${getResultText(detectionResult.faces_detected)}`}>
                        {detectionResult.faces_detected ? 'Face Detected' : 'No Face Detected'}
                      </p>
                    </div>
                  </div>

                  {/* Voice Detection Card */}
                  <div className={`p-6 rounded-lg border-2 ${getResultBackground(detectionResult.voice_detected)}`}>
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <Volume2 className="w-12 h-12 text-gray-600 dark:text-gray-300" />
                      </div>
                      <h4 className={`text-xl font-bold ${getResultText(detectionResult.voice_detected)} mb-2`}>
                        Voice Detection
                      </h4>
                      <div className="flex justify-center mb-3">
                        {getResultIcon(detectionResult.voice_detected)}
                      </div>
                      <p className={`font-semibold ${getResultText(detectionResult.voice_detected)}`}>
                        {detectionResult.voice_detected ? 'Voice Detected' : 'No Voice Detected'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Message */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 text-center">
                    Summary
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-center text-lg">
                    {detectionResult.message}
                  </p>
                  
                  {/* Status Indicator */}
                  <div className="mt-4 flex justify-center">
                    {detectionResult.faces_detected && detectionResult.voice_detected ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Complete Detection</span>
                      </div>
                    ) : detectionResult.faces_detected || detectionResult.voice_detected ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-full">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Partial Detection</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-full">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">No Detection</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Details */}
                <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Technical Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Face Detection:</span>
                      <span className="ml-2 text-blue-600 dark:text-blue-400">
                        {detectionResult.faces_detected ? 'OpenCV Haar Cascade detected human faces' : 'No faces found in video frames'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">Voice Detection:</span>
                      <span className="ml-2 text-blue-600 dark:text-blue-400">
                        {detectionResult.voice_detected ? 'Audio analysis found speech patterns' : 'No significant speech detected in audio'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Info className="w-6 h-6 mr-3 text-indigo-500" />
            About this Tool
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This Face & Voice Detector analyzes video files to detect the presence of human faces and voice activity using advanced computer vision and audio processing techniques.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Face Detection
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                <li>Uses OpenCV Haar Cascade classifiers</li>
                <li>Analyzes video frames for human faces</li>
                <li>Optimized for frontal face detection</li>
                <li>Processes every 10th frame for efficiency</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                <Volume2 className="w-5 h-5 mr-2" />
                Voice Detection
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                <li>Extracts audio from video files</li>
                <li>Analyzes audio for speech patterns</li>
                <li>Filters out background noise and silence</li>
                <li>Requires minimum volume and duration thresholds</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Use Cases</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Perfect for content moderation, video analysis, presentation evaluation, accessibility compliance, 
              and automated video categorization based on human presence.
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            💡 <strong>Tip:</strong> For best results, ensure your video has clear lighting for face detection and audible speech for voice detection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FaceVoiceDetectorPage;
