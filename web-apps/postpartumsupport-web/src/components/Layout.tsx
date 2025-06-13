import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  HomeIcon,
  CalendarIcon,
  ChartBarIcon,
  HeartIcon,
  UserIcon,
  AcademicCapIcon,
  UsersIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Mental Health', href: '/mental-health', icon: HeartIcon },
    { name: 'Baby Care', href: '/baby-care', icon: CalendarIcon },
    { name: 'Support Groups', href: '/support', icon: UsersIcon },
    { name: 'Progress', href: '/progress', icon: ChartBarIcon },
    { name: 'Resources', href: '/resources', icon: AcademicCapIcon },
    { name: 'Crisis Support', href: '/crisis', icon: ShieldCheckIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <div className="flex items-center">
            <HeartIcon className="h-8 w-8 text-postpartum-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">PostpartumSupport</span>
          </div>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-postpartum-100 text-postpartum-700 border-r-2 border-postpartum-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Ecosystem Status */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-postpartum-50 to-support-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">🌐 Ecosystem</p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8 px-8">
          {children}
        </main>
      </div>
    </div>
  )
}