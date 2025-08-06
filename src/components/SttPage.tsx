import React, { useState, useRef } from 'react';
import { Mic, Upload, FileAudio, Play, Square, RotateCw, Download, Languages, Info } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const SttPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStatus = (message: string, type: string, duration: number = 5000) => {
    setStatus(message);
    setStatusType(type);
    if (type !== 'error') {
      setTimeout(() => setStatus(''), duration);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      updateStatus('Recording... Click stop when finished', 'info', 10000);
    } catch (error) {
      updateStatus('Error accessing microphone. Please check permissions.', 'error');
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setLoading(true);
      updateStatus('Processing audio...', 'info');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        setAudioFile(file);
        updateStatus(`File "${file.name}" selected. Click transcribe to process.`, 'success');
      } else {
        updateStatus('Please select an audio or video file.', 'error');
      }
    }
  };

  const transcribeFile = () => {
    if (audioFile) {
      setLoading(true);
      transcribeAudio(audioFile);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      
      // Convert to WAV format if needed
      const wavBlob = await convertToWav(audioBlob);
      formData.append('audio', wavBlob, 'audio.wav');

      const endpoint = selectedLanguage === 'auto' 
        ? API_ENDPOINTS.STT_TRANSCRIBE
        : API_ENDPOINTS.STT_TRANSCRIBE_LANG(selectedLanguage);

      const response = await fetch(endpoint, {
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

      setTranscript(data.text);
      setDetectedLanguage(data.detected_language || data.specified_language || '');
      updateStatus('Transcription completed successfully!', 'success');
      
    } catch (error) {
      console.error('Transcription error:', error);
      updateStatus(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    // For now, return the original blob
    // In production, you might want to use an audio processing library
    return audioBlob;
  };

  const downloadTranscript = () => {
    if (transcript) {
      const element = document.createElement('a');
      const file = new Blob([transcript], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'transcript.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setDetectedLanguage('');
    setAudioFile(null);
    setStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          <Mic className="inline-block w-10 h-10 mr-4" />
          Speech-to-Text
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="space-y-6">
            {/* Language Selection */}
            <div>
              <label htmlFor="languageSelect" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Languages className="inline-block w-5 h-5 mr-2" />
                Language
              </label>
              <select
                id="languageSelect"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                <option value="auto">Auto-detect</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
            </div>

            {/* Recording Section */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Mic className="w-6 h-6 mr-2" />
                Record Audio
              </h3>
              <div className="flex flex-wrap gap-4 items-center justify-center">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 transition shadow-md"
                  >
                    <Square className="w-5 h-5" />
                    Stop Recording
                  </button>
                )}
              </div>
            </div>

            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                <Upload className="w-6 h-6 mr-2" />
                Upload Audio/Video File
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="fileInput"
              />
              <div className="flex flex-wrap gap-4 items-center justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileAudio className="w-5 h-5" />
                  Choose File
                </button>
                {audioFile && (
                  <button
                    onClick={transcribeFile}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <RotateCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                    Transcribe
                  </button>
                )}
              </div>
              {audioFile && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
                  Selected: {audioFile.name}
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
            {transcript && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Transcript
                  </h3>
                  <div className="flex gap-2">
                    {detectedLanguage && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm">
                        {detectedLanguage === 'english' ? 'English' : 'Hindi'}
                      </span>
                    )}
                    <button
                      onClick={downloadTranscript}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={clearTranscript}
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border">
                  <p className="text-gray-800 dark:text-white whitespace-pre-wrap">
                    {transcript}
                  </p>
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
            This Speech-to-Text tool supports automatic language detection between English and Hindi using advanced AI models.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li><strong>Recording:</strong> Click record to capture audio directly from your microphone.</li>
            <li><strong>File Upload:</strong> Upload audio or video files for transcription.</li>
            <li><strong>Language Detection:</strong> Automatically detects between English and Hindi.</li>
            <li><strong>Download:</strong> Save your transcripts as text files.</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            💡 <strong>Tip:</strong> For best results, ensure clear audio with minimal background noise.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SttPage;
