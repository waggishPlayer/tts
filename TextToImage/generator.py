import requests
import base64
import json
import os
import time
from typing import Dict, Optional
from PIL import Image, ImageDraw, ImageFont
import io

class TextToImageGenerator:
    def __init__(self):
        """Initialize the text-to-image generator"""
        self.supported_models = {
            'stable_diffusion': 'Stable Diffusion',
            'dall_e_mini': 'DALL-E Mini',
            'simple_text': 'Simple Text Image'
        }
        
        # Common image styles and parameters
        self.styles = {
            'realistic': 'photorealistic, high quality, detailed',
            'artistic': 'artistic, painting style, beautiful',
            'cartoon': 'cartoon style, animated, colorful',
            'sketch': 'pencil sketch, hand drawn, artistic',
            'digital_art': 'digital art, concept art, trending on artstation',
            'photography': 'professional photography, high resolution, sharp focus'
        }
        
        self.sizes = {
            'square': (512, 512),
            'landscape': (768, 512),
            'portrait': (512, 768),
            'wide': (1024, 512),
            'tall': (512, 1024)
        }
    
    def generate_with_huggingface(self, prompt: str, style: str = 'realistic', size: str = 'square') -> Dict:
        """Generate image using Hugging Face's Inference API (free tier)"""
        try:
            # Use Stable Diffusion model from Hugging Face
            API_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
            
            # Enhance prompt with style
            enhanced_prompt = f"{prompt}, {self.styles.get(style, '')}"
            
            headers = {
                # You would need to get a free API key from Hugging Face
                # "Authorization": f"Bearer {HUGGINGFACE_API_KEY}"
            }
            
            payload = {
                "inputs": enhanced_prompt,
                "parameters": {
                    "num_inference_steps": 20,
                    "guidance_scale": 7.5,
                    "width": self.sizes[size][0],
                    "height": self.sizes[size][1]
                }
            }
            
            # For demo purposes without API key, we'll simulate the response
            return {
                'success': False,
                'error': 'Hugging Face API key required',
                'message': 'To use this feature, please add your Hugging Face API key'
            }
            
            # Actual implementation would be:
            # response = requests.post(API_URL, headers=headers, json=payload, timeout=60)
            # if response.status_code == 200:
            #     image_bytes = response.content
            #     return {
            #         'success': True,
            #         'image_data': base64.b64encode(image_bytes).decode(),
            #         'model': 'Stable Diffusion',
            #         'prompt': enhanced_prompt,
            #         'style': style,
            #         'size': size
            #     }
            
        except Exception as e:
            return {'success': False, 'error': f'Hugging Face generation failed: {str(e)}'}
    
    def generate_with_pollinations(self, prompt: str, style: str = 'realistic', size: str = 'square') -> Dict:
        """Generate image using Pollinations AI (free service)"""
        try:
            # Pollinations.ai is a free image generation service
            base_url = "https://image.pollinations.ai/prompt/"
            
            # Enhance prompt with style
            enhanced_prompt = f"{prompt}, {self.styles.get(style, '')}"
            
            # URL encode the prompt
            import urllib.parse
            encoded_prompt = urllib.parse.quote(enhanced_prompt)
            
            # Get image dimensions
            width, height = self.sizes.get(size, (512, 512))
            
            # Construct URL
            image_url = f"{base_url}{encoded_prompt}?width={width}&height={height}"
            
            # Download the image
            response = requests.get(image_url, timeout=30)
            
            if response.status_code == 200:
                # Convert to base64
                image_b64 = base64.b64encode(response.content).decode()
                
                return {
                    'success': True,
                    'image_data': image_b64,
                    'model': 'Pollinations AI',
                    'prompt': enhanced_prompt,
                    'style': style,
                    'size': size,
                    'image_url': image_url
                }
            else:
                return {'success': False, 'error': f'Pollinations API returned status {response.status_code}'}
            
        except Exception as e:
            return {'success': False, 'error': f'Pollinations generation failed: {str(e)}'}
    
    def generate_simple_text_image(self, text: str, style: str = 'simple', size: str = 'square') -> Dict:
        """Generate a simple text-based image as fallback"""
        try:
            width, height = self.sizes.get(size, (512, 512))
            
            # Create image with gradient background
            image = Image.new('RGB', (width, height), color=(70, 130, 180))
            draw = ImageDraw.Draw(image)
            
            # Create gradient effect
            for y in range(height):
                r = int(70 + (130 * y / height))
                g = int(130 + (100 * y / height))
                b = int(180 - (50 * y / height))
                color = (r, g, b)
                draw.line([(0, y), (width, y)], fill=color)
            
            # Try to load a font
            try:
                # Try to use a system font
                font_size = max(20, min(width, height) // 15)
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
            except:
                try:
                    font = ImageFont.load_default()
                except:
                    font = None
            
            # Prepare text
            lines = text.split('\\n')
            if len(' '.join(lines)) > 100:
                text = text[:100] + '...'
                lines = text.split('\\n')
            
            # Calculate text position
            if font:
                # Get text dimensions for centering
                total_height = len(lines) * font_size * 1.2
                start_y = (height - total_height) // 2
                
                for i, line in enumerate(lines):
                    bbox = draw.textbbox((0, 0), line, font=font)
                    text_width = bbox[2] - bbox[0]
                    x = (width - text_width) // 2
                    y = start_y + (i * font_size * 1.2)
                    
                    # Draw text with shadow effect
                    draw.text((x+2, y+2), line, fill=(0, 0, 0, 128), font=font)  # Shadow
                    draw.text((x, y), line, fill=(255, 255, 255), font=font)  # Main text
            else:
                # Fallback without font
                draw.text((width//4, height//2), text[:50], fill=(255, 255, 255))
            
            # Add decorative elements based on style
            if style == 'artistic':
                # Add some artistic circles
                for i in range(5):
                    x = int(width * (i + 1) / 6)
                    y = int(height * 0.1)
                    draw.ellipse([x-10, y-10, x+10, y+10], fill=(255, 255, 255, 50))
            
            # Convert to base64
            buffer = io.BytesIO()
            image.save(buffer, format='PNG')
            image_b64 = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                'success': True,
                'image_data': image_b64,
                'model': 'Simple Text Generator',
                'prompt': text,
                'style': style,
                'size': size,
                'message': 'Generated using simple text overlay method'
            }
            
        except Exception as e:
            return {'success': False, 'error': f'Simple text generation failed: {str(e)}'}
    
    def generate_image(self, prompt: str, style: str = 'realistic', size: str = 'square', model: str = 'auto') -> Dict:
        """Main image generation method with multiple fallbacks"""
        if not prompt.strip():
            return {'success': False, 'error': 'No prompt provided'}
        
        # Validate parameters
        if style not in self.styles:
            style = 'realistic'
        if size not in self.sizes:
            size = 'square'
        
        # Generation methods in order of preference
        if model == 'simple_text' or model == 'auto':
            # For demo purposes, always use simple text generator
            return self.generate_simple_text_image(prompt, style, size)
        
        generation_methods = [
            self.generate_with_pollinations,
            self.generate_with_huggingface,
            self.generate_simple_text_image
        ]
        
        # Try each method until one succeeds
        last_error = None
        for method in generation_methods:
            try:
                result = method(prompt, style, size)
                if result.get('success'):
                    return result
                last_error = result.get('error', 'Unknown error')
            except Exception as e:
                last_error = str(e)
                continue
        
        return {
            'success': False,
            'error': f'All generation methods failed. Last error: {last_error}',
            'fallback_available': True
        }
    
    def get_supported_styles(self) -> Dict:
        """Get available image styles"""
        return self.styles
    
    def get_supported_sizes(self) -> Dict:
        """Get available image sizes"""
        return {size: f"{dims[0]}x{dims[1]}" for size, dims in self.sizes.items()}
    
    def save_image_from_base64(self, image_data: str, filepath: str) -> bool:
        """Save base64 encoded image to file"""
        try:
            image_bytes = base64.b64decode(image_data)
            with open(filepath, 'wb') as f:
                f.write(image_bytes)
            return True
        except Exception as e:
            print(f"Error saving image: {e}")
            return False
    
    def enhance_prompt(self, basic_prompt: str, style: str = 'realistic') -> str:
        """Enhance a basic prompt with style and quality keywords"""
        style_additions = self.styles.get(style, '')
        quality_keywords = "high quality, detailed, professional"
        
        enhanced = f"{basic_prompt}, {style_additions}, {quality_keywords}"
        return enhanced

# Usage example
if __name__ == "__main__":
    generator = TextToImageGenerator()
    
    # Test image generation
    result = generator.generate_image(
        prompt="A beautiful sunset over mountains",
        style="realistic",
        size="landscape"
    )
    
    print(result)
    
    if result.get('success'):
        # Save the generated image
        if generator.save_image_from_base64(result['image_data'], 'test_output.png'):
            print("Image saved successfully!")
    
    # Show available options
    print("Available styles:", list(generator.get_supported_styles().keys()))
    print("Available sizes:", generator.get_supported_sizes())
