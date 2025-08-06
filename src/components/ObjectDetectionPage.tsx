import React, { useState, useRef } from 'react';
import { Search, Upload, Download, Info, AlertCircle, CheckCircle, RotateCw } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface DetectedObject {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface DetectionResult {
  success: boolean;
  objects?: DetectedObject[];
  total_objects?: number;
  image_shape?: [number, number, number];
  annotated_image?: string;
  error?: string;
}

const ObjectDetectionPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStatus = (message: string, type: 'info' | 'success' | 'error', duration: number = 5000) => {
    setStatus(message);
    setStatusType(type);
    if (type !== 'error') {
      setTimeout(() => setStatus(''), duration);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        updateStatus('Please select a valid image file (JPEG, PNG, BMP, TIFF, WEBP)', 'error');
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        updateStatus('File size must be less than 10MB', 'error');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
      updateStatus('Image selected successfully!', 'success');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      updateStatus('Please select an image first', 'error');
      return;
    }

    setIsAnalyzing(true);
    updateStatus('Analyzing image for objects...', 'info');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch(API_ENDPOINTS.OBJECT_DETECTION_ANALYZE, {
        method: 'POST',
        body: formData,
      });

      const data: DetectionResult = await response.json();

      if (data.success && data.objects) {
        setResult(data);
        updateStatus(`Analysis complete! Found ${data.total_objects} objects.`, 'success');
      } else {
        setResult(data);
        updateStatus(data.error || 'Analysis failed', 'error');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      updateStatus('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadAnnotatedImage = () => {
    if (result?.annotated_image) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${result.annotated_image}`;
      link.download = `detected_objects_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      updateStatus('Annotated image downloaded!', 'success');
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
          <Search className="inline-block w-10 h-10 mr-4" />
          Object Detection
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <Upload className="w-6 h-6 mr-3 text-indigo-500" />
              Upload Image
            </h2>

            {/* File Upload */}
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {selectedFile ? selectedFile.name : 'Click to select an image'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supported formats: JPEG, PNG, BMP, TIFF, WEBP (Max 10MB)
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Preview */}
            {previewUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Preview:</h3>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg"
                />
              </div>
            )}

            {/* Analyze Button */}
            <div className="mt-6">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Detect Objects
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-500" />
              Detection Results
            </h2>

            {result?.success && result.objects && (
              <div>
                <div className="mb-4">
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    Found <span className="font-bold text-indigo-600">{result.total_objects}</span> objects
                  </p>
                </div>

                {/* Annotated Image */}
                {result.annotated_image && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Annotated Image:</h3>
                    <img
                      src={`data:image/png;base64,${result.annotated_image}`}
                      alt="Annotated"
                      className="w-full h-64 object-contain bg-gray-100 dark:bg-gray-700 rounded-lg"
                    />
                    <button
                      onClick={downloadAnnotatedImage}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Download className="w-4 h-4" />
                      Download Annotated Image
                    </button>
                  </div>
                )}

                {/* Objects List */}
                <div className="max-h-96 overflow-y-auto">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Detected Objects:</h3>
                  <div className="space-y-3">
                    {result.objects.map((obj, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white capitalize">
                              {obj.class.replace('_', ' ')}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Confidence: {(obj.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Position: [{obj.bbox.join(', ')}]
                          </div>
                        </div>
                        <div className="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${obj.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {result && !result.success && (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">{result.error}</p>
              </div>
            )}

            {!result && (
              <div className="text-center py-8">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Upload an image and click "Detect Objects" to see results
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
            About Object Detection
          </h3>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>
              Our object detection tool uses advanced computer vision AI to identify and locate objects in your images.
              It can detect 80+ different types of objects including people, vehicles, animals, and everyday items.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Accurate Detection:</strong> Uses YOLO (You Only Look Once) architecture for fast and precise results</li>
              <li><strong>Multiple Objects:</strong> Can detect and label multiple objects in a single image</li>
              <li><strong>Bounding Boxes:</strong> Shows exact location of each detected object</li>
              <li><strong>Confidence Scores:</strong> Provides accuracy percentage for each detection</li>
              <li><strong>Downloadable Results:</strong> Get annotated images with all detections marked</li>
            </ul>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 <strong>Tip:</strong> For best results, use clear, well-lit images with visible objects.
              The tool works with various image formats and sizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectDetectionPage;
