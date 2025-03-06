// components/BrowserCacheCleaner.js
'use client';

import React, { useState } from 'react';

const BrowserCacheCleaner = () => {
  const [status, setStatus] = useState('');
  const [cacheCleared, setCacheCleared] = useState(false);

  // Clear Service Worker Cache
  const clearServiceWorkerCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        setStatus('Service Worker cache cleared successfully!');
      } else {
        setStatus('Service Worker cache not supported in this browser.');
      }
    } catch (err) {
      setStatus('Error clearing Service Worker cache: ' + err.message);
    }
  };

  // Clear Local Storage
  const clearLocalStorage = () => {
    try {
      localStorage.clear();
      setStatus('Local Storage cleared successfully!');
    } catch (err) {
      setStatus('Error clearing Local Storage: ' + err.message);
    }
  };

  // Clear Session Storage
  const clearSessionStorage = () => {
    try {
      sessionStorage.clear();
      setStatus('Session Storage cleared successfully!');
    } catch (err) {
      setStatus('Error clearing Session Storage: ' + err.message);
    }
  };

  // Clear All Available Caches
  const clearAll = async () => {
    setCacheCleared(false);
    setStatus('Clearing all caches...');
    
    try {
      await clearServiceWorkerCache();
      clearLocalStorage();
      clearSessionStorage();
      setCacheCleared(true);
      setStatus('All available caches cleared successfully!');
    } catch (err) {
      setStatus('Error clearing caches: ' + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Browser Cache Cleaner</h1>

      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={clearServiceWorkerCache}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Clear Service Worker Cache
          </button>
          <button
            onClick={clearLocalStorage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Clear Local Storage
          </button>
          <button
            onClick={clearSessionStorage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Clear Session Storage
          </button>
          <button
            onClick={clearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Clear All Caches
          </button>
        </div>

        {/* Status Message */}
        {status && (
          <p className={`text-sm text-center ${cacheCleared ? 'text-green-600' : 'text-gray-700'}`}>
            {status}
          </p>
        )}

        {/* Manual Instructions */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Manual Cache Clearing</h2>
          <p className="text-sm text-gray-600">
            This tool can only clear specific browser-managed caches. To fully clear your browser cache:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
            <li>Chrome: Settings → Privacy and security → Clear browsing data</li>
            <li>Firefox: Options → Privacy & Security → Clear Data</li>
            <li>Safari: History → Clear History (or Settings → Safari → Clear History and Website Data)</li>
            <li>Edge: Settings → Privacy, search, and services → Clear browsing data</li>
          </ul>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This tool can only clear Service Worker caches, Local Storage, and Session Storage
          due to browser security restrictions. Full cache clearing requires manual action in browser settings.
        </p>
      </div>
    </div>
  );
};

export default BrowserCacheCleaner;