// Main Navigation Component for MenoWellness
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import PWAPrompt, { PWAFeatures } from './PWAPrompt';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const { subscription } = useSubscription();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', requiresAuth: true },
    { name: 'Track Symptoms', href: '/track', icon: '📝', requiresAuth: true },
    { name: 'AI Insights', href: '/insights', icon: '🤖', requiresAuth: true },
    { name: 'Account', href: '/account', icon: '⚙️', requiresAuth: true },
    { name: 'Privacy', href: '/privacy', icon: '🔒', requiresAuth: false },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <div className="text-2xl">🌸</div>
                <div className="font-bold text-xl text-gray-900">
                  Meno<span className="text-pink-600">Wellness</span>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems
                .filter(item => !item.requiresAuth || user)
                .map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPath === item.href
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                ))}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Subscription Badge */}
                  {subscription && (
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.tier === 'ultimate' ? 'bg-purple-100 text-purple-700' :
                      subscription.tier === 'complete' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {subscription.tier === 'ultimate' ? '💎 Ultimate' :
                       subscription.tier === 'complete' ? '💎 Complete' :
                       '📝 Basic'}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    Hello, {user.email.split('@')[0]}
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <a
                    href="/login"
                    className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg transition-colors"
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup"
                    className="text-sm bg-pink-600 text-white hover:bg-pink-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Get Started
                  </a>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 p-2 rounded-lg"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              {navItems
                .filter(item => !item.requiresAuth || user)
                .map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPath === item.href
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                ))}
              
              {user ? (
                <div className="pt-3 border-t border-gray-200 space-y-3">
                  {subscription && (
                    <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      subscription.tier === 'ultimate' ? 'bg-purple-100 text-purple-700' :
                      subscription.tier === 'complete' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {subscription.tier === 'ultimate' ? '💎 Ultimate Plan' :
                       subscription.tier === 'complete' ? '💎 Complete Care' :
                       '📝 Basic Plan'}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600 px-3">
                    Signed in as {user.email}
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <a
                    href="/login"
                    className="block text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </a>
                  <a
                    href="/signup"
                    className="block text-sm bg-pink-600 text-white hover:bg-pink-700 px-3 py-2 rounded-lg transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* PWA Features for logged-in users */}
      {user && <PWAPrompt />}
    </>
  );
}

// Footer Component
export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-2xl">🌸</div>
              <div className="font-bold text-xl text-gray-900">
                Meno<span className="text-pink-600">Wellness</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 max-w-md">
              The world's first HIPAA-compliant menopause wellness platform built through 
              groundbreaking Human-Claude collaboration. Empowering women with secure, 
              AI-powered health insights.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-xs">
                <strong>🤝 Human-Claude Collaboration:</strong> This platform demonstrates 
                the power of human healthcare expertise combined with AI capabilities.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              <li><a href="/features" className="text-gray-600 hover:text-pink-600 text-sm">Features</a></li>
              <li><a href="/pricing" className="text-gray-600 hover:text-pink-600 text-sm">Pricing</a></li>
              <li><a href="/security" className="text-gray-600 hover:text-pink-600 text-sm">Security</a></li>
              <li><a href="/api" className="text-gray-600 hover:text-pink-600 text-sm">API</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li><a href="/help" className="text-gray-600 hover:text-pink-600 text-sm">Help Center</a></li>
              <li><a href="/contact" className="text-gray-600 hover:text-pink-600 text-sm">Contact Us</a></li>
              <li><a href="/privacy" className="text-gray-600 hover:text-pink-600 text-sm">Privacy Policy</a></li>
              <li><a href="/terms" className="text-gray-600 hover:text-pink-600 text-sm">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 MenoWellness. Built with ❤️ through Human-Claude collaboration.
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  HIPAA Compliant
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  SOC 2 Type II
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                  GDPR Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Breadcrumb Navigation
export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex mb-6">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="w-5 h-5 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {index === items.length - 1 ? (
              <span className="text-sm font-medium text-gray-500" aria-current="page">
                {item.name}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
              >
                {item.name}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}