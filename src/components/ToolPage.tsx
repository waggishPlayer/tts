import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { tools } from '../config/tools';

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = tools.find(t => t.path === `/${toolId}`);

  if (!tool) {
    return <Navigate to="/" replace />;
  }

  const Icon = tool.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 group"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
        Back to Dashboard
      </Link>

      {/* Tool Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${tool.gradient}`}>
            <Icon className="h-12 w-12 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {tool.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {tool.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 capitalize">
            {tool.category}
          </span>
          {tool.comingSoon && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
              Coming Soon
            </span>
          )}
        </div>
      </div>

      {/* Tool Interface */}
      {tool.comingSoon ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Sparkles className="h-16 w-16 text-indigo-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Coming Soon!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            We're working hard to bring you this amazing AI tool. Stay tuned for updates!
          </p>
          <div className="inline-flex items-center text-indigo-600 dark:text-indigo-400">
            <ExternalLink className="h-4 w-4 mr-2" />
            Get notified when it's ready
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Tool Interface
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center">
              <Icon className={`h-16 w-16 mx-auto mb-4 ${tool.color} dark:${tool.color.replace('600', '400')}`} />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {tool.name} Interface
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This is where the {tool.name.toLowerCase()} functionality would be implemented.
                The interface would include input fields, controls, and results display.
              </p>
              
              {/* Sample Interface Elements */}
              <div className="space-y-4 max-w-md mx-auto">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Input
                  </label>
                  <textarea
                    placeholder={`Enter your ${tool.category} here...`}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={4}
                    disabled
                  />
                </div>
                
                <button
                  disabled
                  className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
                >
                  Process with AI
                </button>
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Connect your AI API to enable this functionality
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Key Features
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Fast Processing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Lightning-fast AI processing with optimized performance
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">High Quality</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  State-of-the-art AI models for superior results
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Easy to Use</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Intuitive interface designed for all skill levels
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Secure & Private</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your data is processed securely and never stored
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}