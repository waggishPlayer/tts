import React, { useState, useEffect } from 'react';
import { Palette, Wand2, Download, Settings, Info, RotateCw, Image as ImageIcon } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface GenerationOptions {
  styles: Record<string, string>;
  sizes: Record<string, string>;
}

interface GenerationResult {
  success: boolean;
  image_data?: string;
  model?: string;
  prompt?: string;
  style?: string;
  size?: string;
  message?: string;
  error?: string;
}

const TextToImageGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('square');
  const [model, setModel] = useState('auto');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [options, setOptions] = useState<GenerationOptions>({ styles: {}, sizes: {} });
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateStatus = (message: string, type: 'info' | 'success' | 'error', duration: number = 5000) => {
    setStatus(message);
    setStatusType(type);
    if (type !== 'error') {
      setTimeout(() => setStatus(''), duration);
    }
  };

  // Load generation options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.TEXT_TO_IMAGE_OPTIONS);
        const data = await response.json();
        
        if (data.success) {
          setOptions(data);
        }
      } catch (error) {
        console.error('Failed to load options:', error);
        // Fallback options
        setOptions({
          styles: {
            'realistic': 'Photorealistic',
            'artistic': 'Artistic',
            'cartoon': 'Cartoon',
            'sketch': 'Sketch',
            'digital_art': 'Digital Art'
          },
          sizes: {
            'square': '512x512',
            'landscape': '768x512',
            'portrait': '512x768'
          }
        });
      }
    };

    loadOptions();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      updateStatus('Please enter a description for the image', 'error');
      return;
    }

    setIsGenerating(true);
    updateStatus('Generating your image... This may take a moment.', 'info');

    try {
      const response = await fetch(API_ENDPOINTS.TEXT_TO_IMAGE_GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          style,
          size,
          model
        })
      });

      const data: GenerationResult = await response.json();

      if (data.success && data.image_data) {
        setGeneratedImage(data.image_data);
        setResult(data);
        updateStatus(`Image generated successfully using ${data.model}!`, 'success');
      } else {
        setResult(data);
        updateStatus(data.error || 'Image generation failed', 'error');
        setGeneratedImage(null);
      }
    } catch (error) {
      console.error('Generation error:', error);
      updateStatus('Network error. Please check your connection and try again.', 'error');
      setGeneratedImage(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${generatedImage}`;
      link.download = `ai_generated_image_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      updateStatus('Image downloaded!', 'success');
    }
  };

  const handlePromptExamples = (example: string) => {
    setPrompt(example);
    updateStatus('Example prompt loaded!', 'success');
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

  const examplePrompts = [
    "A majestic mountain landscape at sunset with golden light",
    "A cute robot sitting in a flower garden",
    "An astronaut riding a horse on the moon",
    "A cozy coffee shop in a medieval castle",
    "A neon-lit cyberpunk city at night",
    "A watercolor painting of cherry blossoms in spring"
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
          <Palette className="inline-block w-10 h-10 mr-4" />
          AI Image Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <Wand2 className="w-6 h-6 mr-3 text-indigo-500" />
                Describe Your Image
              </h2>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create... Be as detailed as possible for better results!"
                className="w-full h-32 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {prompt.length} characters
                </span>
              </div>

              {/* Example Prompts */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Try these examples:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {examplePrompts.slice(0, 3).map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptExamples(example)}
                      className="text-left p-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-500" />
                  Generation Settings
                </h3>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                >
                  {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </button>
              </div>

              <div className="space-y-4">
                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(options.styles).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(options.sizes).map(([key, dimensions]) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({dimensions})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Advanced Settings */}
                {showAdvanced && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="auto">Auto (Best Available)</option>
                      <option value="simple_text">Simple Text Generator</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RotateCw className="w-5 h-5 animate-spin" />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <Palette className="w-5 h-5" />
                      Generate Image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <ImageIcon className="w-6 h-6 mr-3 text-green-500" />
              Generated Image
            </h2>

            {generatedImage ? (
              <div>
                <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={`data:image/png;base64,${generatedImage}`}
                    alt="Generated"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={downloadImage}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Image
                  </button>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Generated with {result?.model}
                  </div>
                </div>

                {/* Generation Details */}
                {result && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">Generation Details:</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p><strong>Prompt:</strong> {result.prompt}</p>
                      <p><strong>Style:</strong> {options.styles[result.style || ''] || result.style}</p>
                      <p><strong>Size:</strong> {options.sizes[result.size || ''] || result.size}</p>
                      {result.message && <p><strong>Note:</strong> {result.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Palette className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Your generated image will appear here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter a description and click "Generate Image" to start
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

        {/* More Examples */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            More Prompt Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examplePrompts.slice(3).map((example, index) => (
              <button
                key={index}
                onClick={() => handlePromptExamples(example)}
                className="text-left p-3 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Info className="w-6 h-6 mr-3 text-indigo-500" />
            About AI Image Generation
          </h3>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>
              Transform your ideas into stunning visuals using cutting-edge AI technology. 
              Our image generator creates unique artwork based on your text descriptions.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Multiple Styles:</strong> From photorealistic to artistic interpretations</li>
              <li><strong>Custom Sizes:</strong> Generate images in various dimensions and ratios</li>
              <li><strong>High Quality:</strong> Produces detailed, high-resolution images</li>
              <li><strong>Fast Generation:</strong> Get your images in seconds</li>
              <li><strong>Download Ready:</strong> Save your creations instantly</li>
            </ul>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                💡 <strong>Pro Tips:</strong>
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                <li>Be specific about colors, lighting, and mood</li>
                <li>Include artistic styles or famous artists for reference</li>
                <li>Mention camera angles or perspectives for better composition</li>
                <li>Add quality descriptors like "highly detailed" or "4K resolution"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToImageGeneratorPage;
