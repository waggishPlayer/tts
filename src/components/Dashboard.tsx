import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { ToolCard } from './ToolCard';
import { tools, categories } from '../config/tools';

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Your Complete{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Toolbox
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Discover powerful AI tools for content creation, productivity, and innovation. 
          All integrated into one beautiful, easy-to-use platform.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-12 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search AI tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
              <span className="ml-1 text-xs opacity-75">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* No Results */}
      {filteredTools.length === 0 && (
        <div className="text-center py-16">
          <Filter className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No tools found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search terms or category filter.
          </p>
        </div>
      )}

      {/* Stats Section */}
      <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
            {tools.length}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">AI Tools</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            4
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            24/7
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">Available</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            Free
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">To Start</div>
        </div>
      </div>
    </div>
  );
}