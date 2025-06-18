// PWA Install Prompt Component
import React, { useState, useEffect } from 'react';

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after user has been on site for a bit
      setTimeout(() => {
        const installDismissed = localStorage.getItem('pwa-install-dismissed');
        const installCount = localStorage.getItem('pwa-install-prompt-count') || 0;
        
        // Don't show if dismissed recently or shown too many times
        if (!installDismissed && installCount < 3) {
          setShowPrompt(true);
          localStorage.setItem('pwa-install-prompt-count', parseInt(installCount) + 1);
        }
      }, 30000); // Show after 30 seconds
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
      localStorage.setItem('pwa-installed', 'true');
    } else {
      console.log('PWA installation declined');
      localStorage.setItem('pwa-install-dismissed', Date.now());
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now());
  };

  const handleRemindLater = () => {
    setShowPrompt(false);
    // Show again in 7 days
    const nextPrompt = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-dismissed', nextPrompt);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg text-white p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              Install MenoWellness
            </h3>
            <p className="text-pink-100 text-sm mb-3">
              Get the full app experience with offline tracking, faster loading, and push notifications for symptom reminders.
            </p>
            
            <div className="space-y-2">
              <button
                onClick={handleInstall}
                className="w-full bg-white text-pink-600 font-medium py-2 px-4 rounded-lg hover:bg-pink-50 transition-colors"
              >
                Install App
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleRemindLater}
                  className="flex-1 bg-pink-400 text-white text-sm py-1 px-3 rounded hover:bg-pink-500 transition-colors"
                >
                  Remind Later
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 bg-pink-400 text-white text-sm py-1 px-3 rounded hover:bg-pink-500 transition-colors"
                >
                  No Thanks
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-pink-200 hover:text-white"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// PWA Features Component
export function PWAFeatures() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('synced');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');

    if (permission === 'granted' && 'serviceWorker' in navigator) {
      // Register for push notifications
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
        });
        
        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h3 className="font-semibold text-gray-800 mb-3">📱 App Features</h3>
      
      <div className="space-y-3">
        {/* Online Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-700">
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
          </div>
          {!isOnline && (
            <span className="text-xs text-gray-500">Data will sync when online</span>
          )}
        </div>

        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Data Sync</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-500' :
              syncStatus === 'syncing' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-gray-500 capitalize">{syncStatus}</span>
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Notifications</span>
          {notificationsEnabled ? (
            <span className="text-xs text-green-600">Enabled</span>
          ) : (
            <button
              onClick={enableNotifications}
              className="text-xs text-pink-600 hover:text-pink-700"
            >
              Enable
            </button>
          )}
        </div>

        {/* Install Status */}
        {window.matchMedia('(display-mode: standalone)').matches && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">App Installed</span>
            <span className="text-xs text-green-600">✓ Yes</span>
          </div>
        )}
      </div>
    </div>
  );
}