import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Play, Pause, Square, Info, RotateCw } from 'lucide-react';

const TtsPage: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('info');

  const synth = window.speechSynthesis;

  const updateStatus = (message: string, type: string, duration: number = 5000) => {
    setStatus(message);
    setStatusType(type);
    if (type !== 'error') {
      setTimeout(() => setStatus(''), duration);
    }
  };

  const populateVoiceList = useCallback(() => {
    const newVoices = synth.getVoices();
    setVoices(newVoices);
    if (newVoices.length > 0) {
      const defaultVoice = newVoices.find(voice => voice.default) || newVoices[0];
      setSelectedVoice(defaultVoice);
      updateStatus('Voices loaded successfully!', 'success');
    }
  }, [synth]);

  useEffect(() => {
    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = populateVoiceList;
    }
  }, [populateVoiceList, synth]);

  const handleSpeak = () => {
    if (text.trim() === '') {
      updateStatus('Please enter some text to speak.', 'error');
      return;
    }
    if (synth.speaking) {
      synth.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      updateStatus('Speaking...', 'info', 10000);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      updateStatus('Speech finished.', 'success');
    };
    utterance.onpause = () => {
      setIsPaused(true);
      setIsSpeaking(false);
    };
    utterance.onresume = () => {
      setIsPaused(false);
      setIsSpeaking(true);
    };
    synth.speak(utterance);
  };

  const handlePause = () => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
      setIsSpeaking(false);
      updateStatus('Paused', 'info');
    }
  };

  const handleResume = () => {
    if (synth.paused) {
      synth.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      updateStatus('Resuming...', 'info');
    }
  };

  const handleStop = () => {
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    updateStatus('Stopped', 'info');
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
          <Volume2 className="inline-block w-10 h-10 mr-4" />
          Text-to-Speech
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          <div className="space-y-6">
            {/* Text Input */}
            <div>
              <label htmlFor="textInput" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                ✍️ Enter text to convert
              </label>
              <textarea
                id="textInput"
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Type or paste your text here..."
              />
            </div>

            {/* Voice Selection */}
            <div>
              <label htmlFor="voiceSelect" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎤 Voice
              </label>
              <select
                id="voiceSelect"
                value={selectedVoice ? voices.indexOf(selectedVoice) : ''}
                onChange={(e) => setSelectedVoice(voices[parseInt(e.target.value)])}
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                {voices.length > 0 ? (
                  voices.map((voice, index) => (
                    <option key={voice.name + index} value={index}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                ) : (
                  <option value="">No voices available</option>
                )}
              </select>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="rateInput" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🎚️ Rate ({rate.toFixed(1)}x)
                </label>
                <input id="rateInput" type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full" />
              </div>
              <div>
                <label htmlFor="pitchInput" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🎵 Pitch ({pitch.toFixed(1)})
                </label>
                <input id="pitchInput" type="range" min="0" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full" />
              </div>
              <div>
                <label htmlFor="volumeInput" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔊 Volume ({(volume * 100).toFixed(0)}%)
                </label>
                <input id="volumeInput" type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 items-center justify-center pt-4">
              <button
                onClick={handleSpeak}
                disabled={isSpeaking}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5" />
                Speak
              </button>
              
              {isSpeaking && !isPaused && (
                <button
                  onClick={handlePause}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition shadow-md"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
              )}

              {isPaused && (
                 <button
                  onClick={handleResume}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-500 text-white font-semibold hover:bg-gray-600 transition shadow-md"
                >
                  <RotateCw className="w-5 h-5" />
                  Resume
                </button>
              )}

              <button
                onClick={handleStop}
                disabled={!isSpeaking && !isPaused}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Square className="w-5 h-5" />
                Stop
              </button>
            </div>
            
            {/* Status */}
            {status && (
              <div className={`text-center p-3 rounded-lg transition-all duration-300 ${getStatusColor()}`}>
                {status}
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
              This Text-to-Speech app uses your browser's built-in speech synthesis capabilities. Your text is not sent to any server.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong>Voice:</strong> Choose from available system voices.</li>
              <li><strong>Rate:</strong> Control the speaking speed (0.5x to 2x).</li>
              <li><strong>Pitch:</strong> Adjust the voice pitch (0 to 2).</li>
              <li><strong>Volume:</strong> Set the audio volume (0% to 100%).</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              💡 <strong>Tip:</strong> For the best experience, use a modern browser like Chrome, Firefox, or Safari.
            </p>
        </div>
      </div>
    </div>
  );
};

export default TtsPage; 