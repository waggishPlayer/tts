import requests
import json
from typing import Dict, List, Optional
import re

class TextTranslator:
    def __init__(self):
        """Initialize the text translator with supported languages"""
        self.supported_languages = {
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
            'zh': 'Chinese (Simplified)',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'tr': 'Turkish',
            'pl': 'Polish',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'da': 'Danish',
            'no': 'Norwegian',
            'fi': 'Finnish',
            'cs': 'Czech',
            'sk': 'Slovak',
            'hu': 'Hungarian',
            'ro': 'Romanian',
            'bg': 'Bulgarian',
            'hr': 'Croatian',
            'sl': 'Slovenian',
            'et': 'Estonian',
            'lv': 'Latvian',
            'lt': 'Lithuanian',
            'uk': 'Ukrainian',
            'be': 'Belarusian',
            'ca': 'Catalan',
            'eu': 'Basque',
            'gl': 'Galician',
            'mt': 'Maltese',
            'cy': 'Welsh',
            'ga': 'Irish',
            'is': 'Icelandic',
            'mk': 'Macedonian',
            'sq': 'Albanian',
            'sr': 'Serbian',
            'bs': 'Bosnian',
            'me': 'Montenegrin',
            'lv': 'Latvian',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'id': 'Indonesian',
            'ms': 'Malay',
            'tl': 'Filipino',
            'sw': 'Swahili',
            'am': 'Amharic',
            'he': 'Hebrew',
            'fa': 'Persian',
            'ur': 'Urdu',
            'bn': 'Bengali',
            'ta': 'Tamil',
            'te': 'Telugu',
            'ml': 'Malayalam',
            'kn': 'Kannada',
            'gu': 'Gujarati',
            'pa': 'Punjabi',
            'ne': 'Nepali',
            'si': 'Sinhala',
            'my': 'Myanmar',
            'km': 'Khmer',
            'lo': 'Lao',
            'ka': 'Georgian',
            'az': 'Azerbaijani',
            'ky': 'Kyrgyz',
            'uz': 'Uzbek',
            'kk': 'Kazakh',
            'tg': 'Tajik',
            'mn': 'Mongolian'
        }
        
        # Simple language detection patterns
        self.language_patterns = {
            'en': r'[a-zA-Z\s]+',
            'es': r'[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+',
            'fr': r'[a-zA-ZàâäçéèêëïîôùûüÿÀÂÄÇÉÈÊËÏÎÔÙÛÜŸ\s]+',
            'de': r'[a-zA-ZäöüßÄÖÜ\s]+',
            'ru': r'[а-яёА-ЯЁ\s]+',
            'zh': r'[\u4e00-\u9fff\s]+',
            'ja': r'[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\s]+',
            'ar': r'[\u0600-\u06ff\s]+',
            'hi': r'[\u0900-\u097f\s]+'
        }
    
    def detect_language(self, text: str) -> str:
        """Simple language detection based on character patterns"""
        text = text.strip()
        if not text:
            return 'en'
        
        # Check for specific language patterns
        for lang_code, pattern in self.language_patterns.items():
            if re.search(pattern, text):
                # Calculate the ratio of matching characters
                matches = len(re.findall(pattern, text, re.IGNORECASE))
                total_chars = len(text.replace(' ', ''))
                if total_chars > 0 and matches / total_chars > 0.3:
                    return lang_code
        
        return 'en'  # Default to English
    
    def translate_with_mymemory(self, text: str, source_lang: str, target_lang: str) -> Dict:
        """Translate using MyMemory API (free translation service)"""
        try:
            url = "https://api.mymemory.translated.net/get"
            params = {
                'q': text,
                'langpair': f"{source_lang}|{target_lang}"
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if 'responseData' in data and 'translatedText' in data['responseData']:
                    return {
                        'success': True,
                        'translated_text': data['responseData']['translatedText'],
                        'source_language': source_lang,
                        'target_language': target_lang,
                        'service': 'MyMemory',
                        'confidence': data['responseData'].get('match', 0)
                    }
            
            return {'success': False, 'error': 'Translation service unavailable'}
            
        except Exception as e:
            return {'success': False, 'error': f'MyMemory translation failed: {str(e)}'}
    
    def translate_with_libre(self, text: str, source_lang: str, target_lang: str) -> Dict:
        """Translate using LibreTranslate API (fallback service)"""
        try:
            # Public LibreTranslate instance (you can use your own)
            url = "https://libretranslate.de/translate"
            
            data = {
                "q": text,
                "source": source_lang if source_lang != 'auto' else 'en',
                "target": target_lang,
                "format": "text"
            }
            
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, json=data, headers=headers, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                return {
                    'success': True,
                    'translated_text': result['translatedText'],
                    'source_language': source_lang,
                    'target_language': target_lang,
                    'service': 'LibreTranslate',
                    'confidence': 0.8
                }
            
            return {'success': False, 'error': 'LibreTranslate service unavailable'}
            
        except Exception as e:
            return {'success': False, 'error': f'LibreTranslate translation failed: {str(e)}'}
    
    def simple_dictionary_translate(self, text: str, source_lang: str, target_lang: str) -> Dict:
        """Simple dictionary-based translation for common words (fallback)"""
        # Basic dictionary for demonstration
        simple_dict = {
            'hello': {'es': 'hola', 'fr': 'salut', 'de': 'hallo', 'it': 'ciao'},
            'goodbye': {'es': 'adiós', 'fr': 'au revoir', 'de': 'auf wiedersehen', 'it': 'arrivederci'},
            'thank you': {'es': 'gracias', 'fr': 'merci', 'de': 'danke', 'it': 'grazie'},
            'yes': {'es': 'sí', 'fr': 'oui', 'de': 'ja', 'it': 'sì'},
            'no': {'es': 'no', 'fr': 'non', 'de': 'nein', 'it': 'no'},
            'please': {'es': 'por favor', 'fr': 's\'il vous plaît', 'de': 'bitte', 'it': 'per favore'},
            'water': {'es': 'agua', 'fr': 'eau', 'de': 'wasser', 'it': 'acqua'},
            'food': {'es': 'comida', 'fr': 'nourriture', 'de': 'essen', 'it': 'cibo'},
            'love': {'es': 'amor', 'fr': 'amour', 'de': 'liebe', 'it': 'amore'},
            'peace': {'es': 'paz', 'fr': 'paix', 'de': 'frieden', 'it': 'pace'}
        }
        
        text_lower = text.lower().strip()
        
        if text_lower in simple_dict and target_lang in simple_dict[text_lower]:
            return {
                'success': True,
                'translated_text': simple_dict[text_lower][target_lang],
                'source_language': source_lang,
                'target_language': target_lang,
                'service': 'Simple Dictionary',
                'confidence': 0.9
            }
        
        return {
            'success': False,
            'error': 'Word not found in simple dictionary',
            'suggested': f"Try using '{text}' with an online translation service"
        }
    
    def translate(self, text: str, source_lang: str = 'auto', target_lang: str = 'en') -> Dict:
        """Main translation method with multiple fallbacks"""
        if not text.strip():
            return {'success': False, 'error': 'No text provided'}
        
        # Auto-detect source language if needed
        if source_lang == 'auto':
            detected_lang = self.detect_language(text)
            source_lang = detected_lang
        
        # Check if source and target are the same
        if source_lang == target_lang:
            return {
                'success': True,
                'translated_text': text,
                'source_language': source_lang,
                'target_language': target_lang,
                'service': 'No translation needed',
                'confidence': 1.0
            }
        
        # Validate language codes
        if source_lang not in self.supported_languages:
            source_lang = 'en'
        if target_lang not in self.supported_languages:
            target_lang = 'en'
        
        # Try translation services in order of preference
        translation_services = [
            self.translate_with_mymemory,
            self.translate_with_libre,
            self.simple_dictionary_translate
        ]
        
        for service in translation_services:
            try:
                result = service(text, source_lang, target_lang)
                if result.get('success'):
                    return result
            except Exception as e:
                continue
        
        return {
            'success': False,
            'error': 'All translation services failed',
            'fallback_text': text,
            'suggestion': 'Please check your internet connection and try again'
        }
    
    def get_supported_languages(self) -> Dict:
        """Get list of supported languages"""
        return self.supported_languages
    
    def batch_translate(self, texts: List[str], source_lang: str = 'auto', target_lang: str = 'en') -> List[Dict]:
        """Translate multiple texts"""
        results = []
        for text in texts:
            result = self.translate(text, source_lang, target_lang)
            results.append(result)
        return results

# Usage example
if __name__ == "__main__":
    translator = TextTranslator()
    
    # Test translation
    result = translator.translate("Hello, how are you?", "en", "es")
    print(result)
    
    # Test language detection
    detected = translator.detect_language("Bonjour, comment allez-vous?")
    print(f"Detected language: {detected}")
    
    # Test batch translation
    texts = ["Hello", "Goodbye", "Thank you"]
    batch_results = translator.batch_translate(texts, "en", "fr")
    print(batch_results)
