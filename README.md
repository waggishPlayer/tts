# Text-to-Speech Web App

A modern, browser-based Text-to-Speech application that works entirely in the browser using the Web Speech API. No server required!

## Features

🎙️ **Multiple Voices** - Choose from available system voices in different languages  
🎚️ **Adjustable Speech Rate** - Control speaking speed from 0.5x to 2x  
🎵 **Pitch Control** - Adjust voice pitch from 0 to 2  
🔊 **Volume Control** - Set audio volume from 0% to 100%  
⏯️ **Playback Controls** - Play, pause, resume, and stop speech  
⌨️ **Keyboard Shortcuts** - Ctrl/Cmd + Enter to speak, Space to pause/resume, Esc to stop  
📱 **Responsive Design** - Works on desktop, tablet, and mobile devices  

## Browser Support

This app works in modern browsers that support the Web Speech API:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## Local Development

1. Clone this repository
2. Open `public/index.html` in your browser
3. Or serve the `public` folder with any static file server

## Deployment to Netlify

### Option 1: Drag and Drop
1. Zip the `public` folder
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop your zip file

### Option 2: Git Integration
1. Push this repository to GitHub
2. Connect your GitHub account to Netlify
3. Select this repository
4. Deploy with these settings:
   - **Build command:** (leave empty)
   - **Publish directory:** `public`

### Option 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from the project root
netlify deploy --prod --dir=public
```

## File Structure

```
tts/
├── public/
│   ├── index.html      # Main HTML file
│   ├── style.css       # Styles and responsive design
│   └── script.js       # TTS functionality using Web Speech API
├── netlify.toml        # Netlify configuration
└── README.md           # This file
```

## Configuration

The app is configured via `netlify.toml`:
- Publishes the `public` folder
- Sets security headers
- Configures caching for static assets

## Usage

1. Enter or paste text in the text area
2. Select a voice from the dropdown
3. Adjust rate, pitch, and volume as desired
4. Click "Speak" or use Ctrl/Cmd + Enter
5. Use playback controls to pause, resume, or stop

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Start speaking
- **Ctrl/Cmd + Space**: Pause/Resume
- **Ctrl/Cmd + Escape**: Stop

## Technical Notes

- Uses the browser's built-in `speechSynthesis` API
- No external dependencies or server required
- Voices are provided by the user's operating system
- Works offline once loaded
- Progressive Web App features ready for future enhancement

## Migration from Python Version

This replaces the previous FastAPI-based version with:
- ✅ Browser-based TTS (no server needed)
- ✅ Static hosting compatible
- ✅ Multiple voice options
- ✅ Real-time controls
- ✅ Cross-platform compatibility

## License

Open source - feel free to use and modify as needed.

