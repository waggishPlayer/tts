import React, { useState, useEffect } from 'react';
import { Languages, ArrowRightLeft, Copy, CheckCircle, Info, RotateCw, Globe } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface Language {
  code: string;
  name: string;
}

interface TranslationResult {
  success: boolean;
  translated_text?: string;
  source_language?: string;
  target_language?: string;
  service?: string;
  confidence?: number;
  error?: string;
}

const TextTranslatorPage: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [result, setResult] = useState<TranslationResult | null>(null);

  const updateStatus = (message: string, type: 'info' | 'success' | 'error', duration: number = 5000) => {
    setStatus(message);
    setStatusType(type);
    if (type !== 'error') {
      setTimeout(() => setStatus(''), duration);
    }
  };

  // Load supported languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.TEXT_TRANSLATOR_LANGUAGES);
        const data = await response.json();
        
        if (data.success) {
          setLanguages(data.languages);
        }
      } catch (error) {
        console.error('Failed to load languages:', error);
        // Fallback languages
        setLanguages({
          'auto': 'Auto-detect',
          'en': 'English',
          'es': 'Spanish',
          'fr': 'French',
          'de': 'German',
          'it': 'Italian',
          'pt': 'Portuguese',
          'ru': 'Russian',
          'ja': 'Japanese',
          'ko': 'Korean',
          'zh': 'Chinese',
          'ar': 'Arabic',
          'hi': 'Hindi'
        });
      }
    };

    loadLanguages();
  }, []);

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      updateStatus('Please enter some text to translate', 'error');
      return;
    }

    setIsTranslating(true);
    updateStatus('Translating...', 'info');

    try {
      const response = await fetch(API_ENDPOINTS.TEXT_TRANSLATOR_TRANSLATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          source_lang: sourceLang,
          target_lang: targetLang
        })
      });

      const data: TranslationResult = await response.json();

      if (data.success && data.translated_text) {
        setTranslatedText(data.translated_text);
        setResult(data);
        updateStatus(`Translation complete via ${data.service}!`, 'success');
      } else {
        setResult(data);
        updateStatus(data.error || 'Translation failed', 'error');
        setTranslatedText('');
      }
    } catch (error) {
      console.error('Translation error:', error);
      updateStatus('Network error. Please check your connection and try again.', 'error');
      setTranslatedText('');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      updateStatus('Cannot swap when auto-detect is enabled', 'error');
      return;
    }
    
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    const tempText = sourceText;
    setSourceText(translatedText);
    setTranslatedText(tempText);
    
    updateStatus('Languages swapped!', 'success');
  };

  const copyToClipboard = async (text: string, type: 'source' | 'translated') => {
    try {
      await navigator.clipboard.writeText(text);
      updateStatus(`${type === 'source' ? 'Source' : 'Translated'} text copied to clipboard!`, 'success');
    } catch (error) {
      updateStatus('Failed to copy text', 'error');
    }
  };

  const handleClearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setResult(null);
    updateStatus('Text cleared!', 'success');
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

  const getLanguageOptions = (excludeAuto = false) => {
    return Object.entries(languages)
      .filter(([code]) => !excludeAuto || code !== 'auto')
      .map(([code, name]) => (
        <option key={code} value={code}>{name}</option>
      ));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
          <Languages className="inline-block w-10 h-10 mr-4" />
          Smart Text Translator
        </h1>

        {/* Language Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-center space-x-4 flex-wrap gap-4">
            {/* Source Language */}
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {getLanguageOptions()}
              </select>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwapLanguages}
              className="mt-6 p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              disabled={sourceLang === 'auto'}
              title="Swap languages"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>

            {/* Target Language */}
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {getLanguageOptions(true)}
              </select>
            </div>
          </div>
        </div>

        {/* Translation Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Source Text */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {languages[sourceLang] || 'Source Text'}
              </h2>
              {sourceText && (
                <button
                  onClick={() => copyToClipboard(sourceText, 'source')}
                  className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                  title="Copy source text"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full h-64 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {sourceText.length} characters
              </span>
              <div className="space-x-2">
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Translated Text */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {languages[targetLang] || 'Translation'}
              </h2>
              {translatedText && (
                <button
                  onClick={() => copyToClipboard(translatedText, 'translated')}
                  className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                  title="Copy translation"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="w-full h-64 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white overflow-y-auto">
              {translatedText || (
                <span className="text-gray-500 dark:text-gray-400">
                  Translation will appear here...
                </span>
              )}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {translatedText.length} characters
              </span>
              {result?.confidence && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Confidence: {(result.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Translate Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleTranslate}
            disabled={!sourceText.trim() || isTranslating}
            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
          >
            {isTranslating ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-5 h-5" />
                Translate Text
              </>
            )}
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className={`mb-6 text-center p-3 rounded-lg transition-all duration-300 ${getStatusColor()}`}>
            {status}
          </div>
        )}

        {/* Translation Info */}
        {result?.success && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Translation Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Service:</span>
                <p className="font-medium text-gray-800 dark:text-white">{result.service}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Source Language:</span>
                <p className="font-medium text-gray-800 dark:text-white">
                  {languages[result.source_language || ''] || result.source_language}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Target Language:</span>
                <p className="font-medium text-gray-800 dark:text-white">
                  {languages[result.target_language || ''] || result.target_language}
                </p>
              </div>
              {result.confidence && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {(result.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Info className="w-6 h-6 mr-3 text-indigo-500" />
            About Smart Text Translator
          </h3>
          <div className="text-gray-600 dark:text-gray-300 space-y-3">
            <p>
              Our intelligent translation system uses multiple translation services to provide accurate, 
              context-aware translations between 70+ languages worldwide.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Auto-Detection:</strong> Automatically identifies source language</li>
              <li><strong>Multiple Services:</strong> Uses best available translation service for quality</li>
              <li><strong>Context-Aware:</strong> Understands context for more natural translations</li>
              <li><strong>Instant Copy:</strong> One-click copying to clipboard</li>
              <li><strong>Language Swap:</strong> Quick language switching for conversations</li>
            </ul>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Globe className="w-4 h-4" />
              <span>Supports {Object.keys(languages).length - 1} languages</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              💡 <strong>Tip:</strong> For better results with long texts, break them into shorter paragraphs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextTranslatorPage;
