import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sparkles, Moon, Sun, Home, ChevronRight } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { tools } from '../config/tools';

export function Layout() {
  const [isDark, setIsDark] = useDarkMode();
  const location = useLocation();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return [];
    
    const tool = tools.find(t => t.path === path);
    if (tool) {
      return [{ name: tool.name, path }];
    }
    return [];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Toolbox Hub
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Your AI Assistant Suite
                </p>
              </div>
            </Link>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                  <Home className="h-4 w-4" />
                </Link>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {crumb.name}
                    </span>
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2025 AI Toolbox Hub. Built with React & Tailwind CSS.</p>
            <p className="text-sm mt-1">Empowering creativity with artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}