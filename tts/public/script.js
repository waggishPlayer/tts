// Text-to-Speech App using Web Speech API
class TTSApp {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentUtterance = null;
        this.isPlaying = false;
        this.isPaused = false;

        this.initializeElements();
        this.bindEvents();
        this.loadVoices();
        this.checkBrowserSupport();
    }

    initializeElements() {
        this.textInput = document.getElementById('textInput');
        this.voiceSelect = document.getElementById('voiceSelect');
        this.rateInput = document.getElementById('rateInput');
        this.pitchInput = document.getElementById('pitchInput');
        this.volumeInput = document.getElementById('volumeInput');
        this.rateValue = document.getElementById('rateValue');
        this.pitchValue = document.getElementById('pitchValue');
        this.volumeValue = document.getElementById('volumeValue');
        this.speakBtn = document.getElementById('speakBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resumeBtn = document.getElementById('resumeBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.status = document.getElementById('status');
    }

    bindEvents() {
        // Button events
        this.speakBtn.addEventListener('click', () => this.speak());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resumeBtn.addEventListener('click', () => this.resume());
        this.stopBtn.addEventListener('click', () => this.stop());

        // Range input events
        this.rateInput.addEventListener('input', (e) => {
            this.rateValue.textContent = `${e.target.value}x`;
        });

        this.pitchInput.addEventListener('input', (e) => {
            this.pitchValue.textContent = e.target.value;
        });

        this.volumeInput.addEventListener('input', (e) => {
            this.volumeValue.textContent = `${Math.round(e.target.value * 100)}%`;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.speak();
                        break;
                    case ' ':
                        e.preventDefault();
                        if (this.isPlaying && !this.isPaused) {
                            this.pause();
                        } else if (this.isPaused) {
                            this.resume();
                        }
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.stop();
                        break;
                }
            }
        });

        // Voice change event
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    checkBrowserSupport() {
        if (!('speechSynthesis' in window)) {
            this.showStatus('❌ Speech synthesis not supported in this browser. Please use Chrome, Firefox, or Safari.', 'error');
            this.speakBtn.disabled = true;
            return false;
        }
        return true;
    }

    loadVoices() {
        this.voices = this.synth.getVoices();
        
        // Clear existing options
        this.voiceSelect.innerHTML = '';
        
        if (this.voices.length === 0) {
            this.voiceSelect.innerHTML = '<option value="">No voices available</option>';
            return;
        }

        // Group voices by language
        const voicesByLang = {};
        this.voices.forEach((voice, index) => {
            const lang = voice.lang.split('-')[0];
            if (!voicesByLang[lang]) {
                voicesByLang[lang] = [];
            }
            voicesByLang[lang].push({ voice, index });
        });

        // Add voices to select, grouped by language
        Object.keys(voicesByLang).sort().forEach(lang => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = this.getLanguageName(lang);
            
            voicesByLang[lang].forEach(({ voice, index }) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} ${voice.default ? '(Default)' : ''}`;
                if (voice.default) {
                    option.selected = true;
                }
                optgroup.appendChild(option);
            });
            
            this.voiceSelect.appendChild(optgroup);
        });

        this.showStatus('✅ Voices loaded successfully!', 'success');
    }

    getLanguageName(langCode) {
        const languages = {
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
        };
        return languages[langCode] || langCode.toUpperCase();
    }

    speak() {
        const text = this.textInput.value.trim();
        
        if (!text) {
            this.showStatus('⚠️ Please enter some text to speak.', 'error');
            this.textInput.focus();
            return;
        }

        // Stop any current speech
        this.stop();

        // Create new utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        if (this.voiceSelect.value !== '') {
            this.currentUtterance.voice = this.voices[parseInt(this.voiceSelect.value)];
        }

        // Set properties
        this.currentUtterance.rate = parseFloat(this.rateInput.value);
        this.currentUtterance.pitch = parseFloat(this.pitchInput.value);
        this.currentUtterance.volume = parseFloat(this.volumeInput.value);

        // Set event handlers
        this.currentUtterance.onstart = () => {
            this.isPlaying = true;
            this.isPaused = false;
            this.updateButtonStates();
            this.showStatus('🔊 Speaking...', 'speaking');
        };

        this.currentUtterance.onend = () => {
            this.isPlaying = false;
            this.isPaused = false;
            this.updateButtonStates();
            this.showStatus('✅ Speech completed!', 'success');
        };

        this.currentUtterance.onerror = (event) => {
            this.isPlaying = false;
            this.isPaused = false;
            this.updateButtonStates();
            this.showStatus(`❌ Speech error: ${event.error}`, 'error');
        };

        this.currentUtterance.onpause = () => {
            this.isPaused = true;
            this.updateButtonStates();
            this.showStatus('⏸️ Speech paused', 'info');
        };

        this.currentUtterance.onresume = () => {
            this.isPaused = false;
            this.updateButtonStates();
            this.showStatus('▶️ Speech resumed', 'speaking');
        };

        // Start speaking
        this.synth.speak(this.currentUtterance);
    }

    pause() {
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
        }
    }

    resume() {
        if (this.synth.paused) {
            this.synth.resume();
        }
    }

    stop() {
        if (this.synth.speaking) {
            this.synth.cancel();
        }
        this.isPlaying = false;
        this.isPaused = false;
        this.updateButtonStates();
        this.showStatus('⏹️ Speech stopped', 'info');
    }

    updateButtonStates() {
        this.speakBtn.disabled = this.isPlaying && !this.isPaused;
        this.pauseBtn.disabled = !this.isPlaying || this.isPaused;
        this.resumeBtn.disabled = !this.isPaused;
        this.stopBtn.disabled = !this.isPlaying;
    }

    showStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        
        // Auto-clear success and info messages after 5 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (this.status.className.includes(type)) {
                    this.status.textContent = '';
                    this.status.className = 'status';
                }
            }, 5000);
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TTSApp();
});

// Add some sample text for demonstration
document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    if (textInput && !textInput.value) {
        textInput.value = "Hello! Welcome to the Text-to-Speech app. You can type or paste any text here and I'll speak it for you. Try adjusting the voice, rate, pitch, and volume settings to customize how I sound!";
    }
});

// Service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

