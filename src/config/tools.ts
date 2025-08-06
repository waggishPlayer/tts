import { MessageSquare, Image, Languages, FileText, Sparkles, Code, Music, Video, LucideIcon, Mic, Target, Eye, Headphones } from 'lucide-react';
import React from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  category: 'text' | 'media' | 'code' | 'productivity';
  color: string;
  gradient: string;
  comingSoon?: boolean;
}

export const tools: Tool[] = [
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    description: 'Intelligent conversational AI assistant for questions, brainstorming, and creative tasks.',
    icon: MessageSquare,
    path: '/chatbot',
    category: 'text',
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'text-to-image',
    name: 'Text to Image',
    description: 'Generate stunning images from text descriptions using advanced AI models.',
    icon: Image,
    path: '/text-to-image',
    category: 'media',
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'translator',
    name: 'Language Translator',
    description: 'Translate text between 100+ languages with context-aware AI translation.',
    icon: Languages,
    path: '/translator',
    category: 'text',
    color: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'summarizer',
    name: 'Text Summarizer',
    description: 'Condense long articles, documents, and content into key insights and summaries.',
    icon: FileText,
    path: '/summarizer',
    category: 'productivity',
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'content-generator',
    name: 'Content Generator',
    description: 'Create engaging blog posts, marketing copy, and creative content with AI assistance.',
    icon: Sparkles,
    path: '/content-generator',
    category: 'text',
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Get help with coding, debugging, and learning programming concepts across languages.',
    icon: Code,
    path: '/code-assistant',
    category: 'code',
    color: 'text-slate-600',
    gradient: 'from-slate-500 to-gray-600'
  },
  {
    id: 'music-generator',
    name: 'Music Generator',
    description: 'Create original music compositions and melodies using AI technology.',
    icon: Music,
    path: '/music-generator',
    category: 'media',
    color: 'text-rose-600',
    gradient: 'from-rose-500 to-pink-500',
    comingSoon: true
  },
  {
    id: 'video-editor',
    name: 'AI Video Editor',
    description: 'Edit and enhance videos with AI-powered tools for cutting, effects, and optimization.',
    icon: Video,
    path: '/video-editor',
    category: 'media',
    color: 'text-cyan-600',
    gradient: 'from-cyan-500 to-blue-500',
    comingSoon: true
  },
  {
    id: 'tts',
    name: 'Text to Speech',
    description: 'Convert text into natural-sounding speech with a variety of voices and languages.',
    icon: Music,
    path: '/tts',
    category: 'media',
    color: 'text-lime-600',
    gradient: 'from-lime-500 to-green-500',
  },
  {
    id: 'stt',
    name: 'Speech to Text',
    description: 'Transcribe audio or video to text using advanced AI models.',
    icon: Mic,
    path: '/stt',
    category: 'media',
    color: 'text-pink-600',
    gradient: 'from-pink-500 to-red-500',
  },
  {
    id: 'confidence-analyzer',
    name: 'Confidence Analyzer',
    description: 'Analyze your speaking confidence and presentation skills from video recordings.',
    icon: Target,
    path: '/confidence-analyzer',
    category: 'productivity',
    color: 'text-violet-600',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    id: 'face-voice-detector',
    name: 'Face & Voice Detector',
    description: 'Detect faces and voice activity in video files for content analysis.',
    icon: Eye,
    path: '/face-voice-detector',
    category: 'media',
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500',
  }
];

export const categories = [
  { id: 'all', name: 'All Tools', count: tools.length },
  { id: 'text', name: 'Text & Language', count: tools.filter(t => t.category === 'text').length },
  { id: 'media', name: 'Media & Creative', count: tools.filter(t => t.category === 'media').length },
  { id: 'code', name: 'Development', count: tools.filter(t => t.category === 'code').length },
  { id: 'productivity', name: 'Productivity', count: tools.filter(t => t.category === 'productivity').length }
];