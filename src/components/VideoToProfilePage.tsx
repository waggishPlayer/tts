import React, { useState, useRef } from 'react';
import { User, Upload, Download, Settings, Info, RotateCw, Star, Video } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface ProfilePicture {
  id: number;
  image_data: string;
  quality_score: number;
  face_type: string;
  frame_index: number;
  bbox: [number, number, number, number];
  size: string;
  circular: boolean;
  enhanced: boolean;
}

interface ProcessingResult {
  success: boolean;
  profile_pictures?: ProfilePicture[];
  total_faces_found?: number;
  best_faces_selected?: number;
  video_info?: {
    frames_processed: number;
    video_path: string;
  };
  error?: string;
}

interface ProcessingOptions {
  supported_formats: string[];
  output_sizes: Record<string, [number, number]>;
}

const VideoToProfilePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [options, setOptions] = useState<ProcessingOptions>({ supported_formats: [], output_sizes: {} });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [outputSize, setOutputSize] = useState('medium');
  const [circularCrop, setCircularCrop] = useState(true);
  const [enhance, setEnhance] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStatus = (message: string, type: 'info' | 'success' | 'error', duration: number = 5000) => {
    setStatus(message);
    setStatusType(type);
    if (type !== 'error') {
      setTimeout(() => setStatus(''), duration);
    }
  };

  // Load processing options
  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.VIDEO_TO_PROFILE_OPTIONS);
        const data = await response.json();
        
        if (data.success) {
          setOptions(data);
        }
      } catch (error) {
        console.error('Failed to load options:', error);
        // Fallback options
        setOptions({
          supported_formats: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
          output_sizes: {
            'small': [128, 128],
            'medium': [256, 256],
            'large': [512, 512],
            'xl': [1024, 1024]
          }
        });
      }
    };

    loadOptions();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!options.supported_formats.includes(fileExtension || '')) {
        updateStatus(`Unsupported file type. Supported formats: ${options.supported_formats.join(', ')}`, 'error');
        return;
      }

      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        updateStatus('File size must be less than 100MB', 'error');
        return;
      }

      setSelectedFile(file);
      setResult(null);
      updateStatus('Video selected successfully!', 'success');
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      updateStatus('Please select a video file first', 'error');
      return;
    }

    setIsProcessing(true);
    updateStatus('Processing video and detecting faces... This may take a few minutes.', 'info');

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('output_size', outputSize);
      formData.append('circular_crop', circularCrop.toString());
      formData.append('enhance', enhance.toString());

      const response = await fetch(API_ENDPOINTS.VIDEO_TO_PROFILE_CONVERT, {
        method: 'POST',
        body: formData,
      });

      const data: ProcessingResult = await response.json();

      if (data.success && data.profile_pictures) {
        setResult(data);
        updateStatus(`Processing complete! Generated ${data.profile_pictures.length} profile pictures.`, 'success');
      } else {
        setResult(data);
        updateStatus(data.error || 'Processing failed', 'error');
      }
    } catch (error) {
      console.error('Processing error:', error);
      updateStatus('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProfilePicture = (profilePic: ProfilePicture) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${profilePic.image_data}`;
    link.download = `profile_picture_${profilePic.id}_quality_${profilePic.quality_score.toFixed(2)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    updateStatus('Profile picture downloaded!', 'success');
  };

  const downloadAllPictures = () => {
    if (result?.profile_pictures) {
      result.profile_pictures.forEach((pic) => {
        setTimeout(() => downloadProfilePicture(pic), 100 * pic.id);
      });
      updateStatus('All profile pictures downloaded!', 'success');
    }
  };

  const getQualityBadge = (score: number) => {
    if (score >= 0.8) return { text: 'Excellent', color: 'bg-green-500' };
    if (score >= 0.6) return { text: 'Good', color: 'bg-yellow-500' };
    if (score >= 0.4) return { text: 'Fair', color: 'bg-orange-500' };
    return { text: 'Poor', color: 'bg-red-500' };
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
          <User className="inline-block w-10 h-10 mr-4" />
          Video to Profile Picture
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload and Settings Section */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <Upload className="w-6 h-6 mr-3 text-indigo-500" />
                Upload Video
              </h2>

              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Video className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {selectedFile ? selectedFile.name : 'Click to select a video'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supported formats: {options.supported_formats.join(', ').toUpperCase()} (Max 100MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>File:</strong> {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {/* Processing Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-indigo-500" />
                Processing Options
              </h3>

              <div className="space-y-4">
                {/* Output Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture Size
                  </label>
                  <select
                    value={outputSize}
                    onChange={(e) => setOutputSize(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(options.output_sizes).map(([key, [width, height]]) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({width}x{height})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Circular Crop */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="circularCrop"
                    checked={circularCrop}
                    onChange={(e) => setCircularCrop(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="circularCrop" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Create circular profile pictures
                  </label>
                </div>

                {/* Enhancement */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enhance"
                    checked={enhance}
                    onChange={(e) => setEnhance(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="enhance" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enhance image quality (sharpness, contrast, colors)
                  </label>
                </div>
              </div>

              {/* Process Button */}
              <div className="mt-6">
                <button
                  onClick={handleProcess}
                  disabled={!selectedFile || isProcessing}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <RotateCw className="w-5 h-5 animate-spin" />
                      Processing Video...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      Create Profile Pictures
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <Star className="w-6 h-6 mr-3 text-yellow-500" />
                Generated Profile Pictures
              </h2>
              {result?.profile_pictures && result.profile_pictures.length > 1 && (
                <button
                  onClick={downloadAllPictures}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download All
                </button>
              )}
            </div>

            {result?.success && result.profile_pictures ? (
              <div>
                {/* Summary */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-2">Processing Summary:</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <p><strong>Total faces found:</strong> {result.total_faces_found}</p>
                    <p><strong>Best faces selected:</strong> {result.best_faces_selected}</p>
                    <p><strong>Frames processed:</strong> {result.video_info?.frames_processed}</p>
                  </div>
                </div>

                {/* Profile Pictures Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.profile_pictures.map((pic) => {
                    const quality = getQualityBadge(pic.quality_score);
                    return (
                      <div key={pic.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="relative">
                          <img
                            src={`data:image/png;base64,${pic.image_data}`}
                            alt={`Profile ${pic.id}`}
                            className={`w-full h-48 object-cover ${pic.circular ? 'rounded-full' : 'rounded-lg'} bg-gray-100 dark:bg-gray-700`}
                          />
                          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs text-white ${quality.color}`}>
                            {quality.text}
                          </div>
                        </div>
                        
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Quality Score:</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                              {(pic.quality_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Face Type:</span>
                            <span className="font-medium text-gray-800 dark:text-white capitalize">
                              {pic.face_type}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Frame:</span>
                            <span className="font-medium text-gray-800 dark:text-white">
                              #{pic.frame_index}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => downloadProfilePicture(pic)}
                            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : result && !result.success ? (
              <div className="text-center py-8">
                <User className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">{result.error}</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Profile pictures will appear here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Upload a video and click "Create Profile Pictures" to start
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        {status && (
          <div className={`mt-6 text-center p-3 rounded-lg transition-all duration-300 ${getStatusColor()}`}>
            {status}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Info className="w-6 h-6 mr-3 text-indigo-500" />
            About Video to Profile Picture
          </h3>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>
              Extract perfect profile pictures from your videos using advanced AI face detection and quality assessment. 
              Our system analyzes your video to find the best shots with optimal lighting, sharpness, and composition.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Smart Detection:</strong> Automatically finds faces in your video</li>
              <li><strong>Quality Scoring:</strong> Ranks faces by sharpness, lighting, and size</li>
              <li><strong>Multiple Options:</strong> Get several profile pictures to choose from</li>
              <li><strong>Enhancement:</strong> Automatically improves image quality</li>
              <li><strong>Flexible Sizes:</strong> Choose from small to extra-large dimensions</li>
              <li><strong>Circular Cropping:</strong> Perfect for social media profiles</li>
            </ul>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Best Results Tips:</strong>
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                <li>Use videos with good lighting and clear face visibility</li>
                <li>Videos where you're looking at the camera work best</li>
                <li>Avoid heavily filtered or low-resolution videos</li>
                <li>Longer videos provide more frame options to choose from</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoToProfilePage;
