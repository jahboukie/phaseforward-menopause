// Reusable Loading Spinner Component
import React from 'react';

export default function LoadingSpinner({ size = 'medium', color = 'pink', message = null }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    pink: 'border-pink-200 border-t-pink-600',
    purple: 'border-purple-200 border-t-purple-600',
    blue: 'border-blue-200 border-t-blue-600',
    green: 'border-green-200 border-t-green-600',
    gray: 'border-gray-200 border-t-gray-600'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-2 ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {message && (
        <p className="mt-3 text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
}

export function FullPageLoader({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xlarge" color="pink" />
        <h2 className="mt-6 text-2xl font-semibold text-gray-800">{message}</h2>
        <p className="mt-2 text-gray-600">Please wait while we load your data</p>
      </div>
    </div>
  );
}

export function CardLoader({ className = "" }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-lg h-6 w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="bg-gray-200 rounded h-4 w-full"></div>
        <div className="bg-gray-200 rounded h-4 w-5/6"></div>
        <div className="bg-gray-200 rounded h-4 w-4/6"></div>
      </div>
    </div>
  );
}

export function TableLoader({ rows = 5, columns = 3 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 mb-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="bg-gray-200 rounded h-4 flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
}