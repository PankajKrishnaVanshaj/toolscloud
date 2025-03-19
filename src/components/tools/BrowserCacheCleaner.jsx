"use client";
import React, { useState, useCallback } from "react";
import { FaTrash, FaSync, FaInfoCircle } from "react-icons/fa";

const BrowserCacheCleaner = () => {
  const [status, setStatus] = useState("");
  const [cacheCleared, setCacheCleared] = useState(false);
  const [cacheDetails, setCacheDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get cache sizes (approximate)
  const getCacheDetails = useCallback(async () => {
    let details = {};
    try {
      // Service Worker Cache
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        details.serviceWorker = cacheNames.length;
      } else {
        details.serviceWorker = "Not supported";
      }

      // Local Storage
      let localStorageSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localStorageSize += ((localStorage[key].length + key.length) * 2) / 1024; // KB
        }
      }
      details.localStorage = `${localStorageSize.toFixed(2)} KB`;

      // Session Storage
      let sessionStorageSize = 0;
      for (let key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key)) {
          sessionStorageSize += ((sessionStorage[key].length + key.length) * 2) / 1024; // KB
        }
      }
      details.sessionStorage = `${sessionStorageSize.toFixed(2)} KB`;

      setCacheDetails(details);
    } catch (err) {
      setStatus("Error retrieving cache details: " + err.message);
    }
  }, []);

  // Clear Service Worker Cache
  const clearServiceWorkerCache = async () => {
    setIsProcessing(true);
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        setStatus("Service Worker cache cleared successfully!");
        setCacheCleared(true);
      } else {
        setStatus("Service Worker cache not supported in this browser.");
      }
    } catch (err) {
      setStatus("Error clearing Service Worker cache: " + err.message);
    }
    setIsProcessing(false);
    getCacheDetails();
  };

  // Clear Local Storage
  const clearLocalStorage = () => {
    setIsProcessing(true);
    try {
      localStorage.clear();
      setStatus("Local Storage cleared successfully!");
      setCacheCleared(true);
    } catch (err) {
      setStatus("Error clearing Local Storage: " + err.message);
    }
    setIsProcessing(false);
    getCacheDetails();
  };

  // Clear Session Storage
  const clearSessionStorage = () => {
    setIsProcessing(true);
    try {
      sessionStorage.clear();
      setStatus("Session Storage cleared successfully!");
      setCacheCleared(true);
    } catch (err) {
      setStatus("Error clearing Session Storage: " + err.message);
    }
    setIsProcessing(false);
    getCacheDetails();
  };

  // Clear Cookies (basic simulation, requires user confirmation in real scenarios)
  const clearCookies = () => {
    setIsProcessing(true);
    try {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      setStatus("Cookies cleared successfully!");
      setCacheCleared(true);
    } catch (err) {
      setStatus("Error clearing Cookies: " + err.message);
    }
    setIsProcessing(false);
    getCacheDetails();
  };

  // Clear All Available Caches
  const clearAll = async () => {
    setIsProcessing(true);
    setCacheCleared(false);
    setStatus("Clearing all caches...");
    try {
      await clearServiceWorkerCache();
      clearLocalStorage();
      clearSessionStorage();
      clearCookies();
      setCacheCleared(true);
      setStatus("All available caches cleared successfully!");
    } catch (err) {
      setStatus("Error clearing caches: " + err.message);
    }
    setIsProcessing(false);
  };

  // Reset UI
  const reset = () => {
    setStatus("");
    setCacheCleared(false);
    setCacheDetails(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Browser Cache Cleaner
        </h1>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Service Worker Cache", action: clearServiceWorkerCache },
            { label: "Local Storage", action: clearLocalStorage },
            { label: "Session Storage", action: clearSessionStorage },
            { label: "Cookies", action: clearCookies },
            { label: "All Caches", action: clearAll, color: "red" },
          ].map(({ label, action, color = "blue" }) => (
            <button
              key={label}
              onClick={action}
              disabled={isProcessing}
              className={`py-2 px-4 bg-${color}-600 text-white rounded-md hover:bg-${color}-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center`}
            >
              <FaTrash className="mr-2" /> {label}
            </button>
          ))}
          <button
            onClick={reset}
            disabled={isProcessing}
            className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Status and Cache Details */}
        <div className="mb-6">
          {status && (
            <p
              className={`text-sm text-center ${
                cacheCleared ? "text-green-600" : "text-gray-700"
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  Processing...
                </span>
              ) : (
                status
              )}
            </p>
          )}
          <button
            onClick={getCacheDetails}
            disabled={isProcessing}
            className="mt-4 w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaInfoCircle className="mr-2" /> Show Cache Details
          </button>
          {cacheDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Cache Details</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Service Worker Caches: {cacheDetails.serviceWorker} found</li>
                <li>Local Storage: {cacheDetails.localStorage}</li>
                <li>Session Storage: {cacheDetails.sessionStorage}</li>
              </ul>
            </div>
          )}
        </div>

        {/* Manual Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Manual Cache Clearing</h2>
          <p className="text-sm text-blue-600">
            This tool clears specific browser-managed caches. For a complete cleanup:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-600 mt-2 space-y-1">
            <li>
              Chrome: Settings → Privacy and security → Clear browsing data → Cached images and
              files
            </li>
            <li>Firefox: Options → Privacy & Security → Clear Data → Cached Web Content</li>
            <li>
              Safari: Settings → Safari → Clear History and Website Data (or Developer tools)
            </li>
            <li>Edge: Settings → Privacy, search, and services → Clear browsing data → Cached data</li>
          </ul>
        </div>

        {/* Notes */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> This tool clears Service Worker caches, Local Storage, Session
            Storage, and Cookies where possible. Browser security restrictions limit full cache
            access (e.g., HTTP cache). Cookies clearing may require additional permissions in some
            browsers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrowserCacheCleaner;