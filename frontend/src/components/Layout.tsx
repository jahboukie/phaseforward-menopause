import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  ChartBarIcon, 
  HeartIcon, 
  UserGroupIcon, 
  LightBulbIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Symptoms', href: '/symptoms', icon: ChartBarIcon },
  { name: 'Treatments', href: '/treatments', icon: HeartIcon },
  { name: 'Community', href: '/community', icon: UserGroupIcon },
  { name: 'Insights', href: '/insights', icon: LightBulbIcon },
  { name: 'Profile', href: '/profile', icon: UserCircleIcon },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-wellness rounded-lg flex items-center justify-center">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-gradient">MenoWellness</h1>
                    <p className="text-xs text-gray-500">Your menopause journey companion</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animation-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-wellness rounded-lg flex items-center justify-center">
                <HeartIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">MenoWellness</p>
                <p className="text-xs text-gray-500">Powered by Ecosystem Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-primary-600 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-primary-600 transition-colors">Terms</a>
              <a href="/support" className="hover:text-primary-600 transition-colors">Support</a>
              <span className="text-gray-300">|</span>
              <span className="text-xs">
                🤖 Co-authored with <span className="font-medium text-primary-600">Claude Code</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}