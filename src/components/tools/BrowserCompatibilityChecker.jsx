"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaInfoCircle, FaClipboard, FaExclamationTriangle } from "react-icons/fa";

const BrowserCompatibilityChecker = () => {
  const [browserInfo, setBrowserInfo] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [osInfo, setOsInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const detectBrowserAndFeatures = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      const ua = navigator.userAgent;
      let browserName = "Unknown";
      let version = "Unknown";
      let osName = "Unknown";
      let osVersion = "Unknown";

      // Enhanced Browser detection
      if (/chrome|crios/i.test(ua) && !/opr|edge/i.test(ua)) {
        browserName = "Chrome";
        version = ua.match(/Chrome\/([\d.]+)/i)?.[1] || "Unknown";
      } else if (/firefox|fxios/i.test(ua)) {
        browserName = "Firefox";
        version = ua.match(/Firefox\/([\d.]+)/i)?.[1] || "Unknown";
      } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
        browserName = "Safari";
        version = ua.match(/Version\/([\d.]+)/i)?.[1] || "Unknown";
      } else if (/opr/i.test(ua)) {
        browserName = "Opera";
        version = ua.match(/OPR\/([\d.]+)/i)?.[1] || "Unknown";
      } else if (/edg/i.test(ua)) {
        browserName = "Edge";
        version = ua.match(/Edg\/([\d.]+)/i)?.[1] || "Unknown";
      } else if (/msie|trident/i.test(ua)) {
        browserName = "Internet Explorer";
        version = ua.match(/(?:MSIE |rv:)([\d.]+)/i)?.[1] || "Unknown";
      }

      // Enhanced OS detection with version
      if (/windows/i.test(ua)) {
        osName = "Windows";
        osVersion = ua.match(/Windows NT ([\d.]+)/i)?.[1] || "Unknown";
      } else if (/mac os|macos/i.test(ua)) {
        osName = "macOS";
        osVersion = ua.match(/Mac OS X ([\d_]+)/i)?.[1]?.replace(/_/g, ".") || "Unknown";
      } else if (/linux/i.test(ua)) osName = "Linux";
      else if (/android/i.test(ua)) {
        osName = "Android";
        osVersion = ua.match(/Android ([\d.]+)/i)?.[1] || "Unknown";
      } else if (/iphone|ipad|ipod/i.test(ua)) {
        osName = "iOS";
        osVersion = ua.match(/OS ([\d_]+)/i)?.[1]?.replace(/_/g, ".") || "Unknown";
      }

      setBrowserInfo({ name: browserName, version });
      setOsInfo({ name: osName, version: osVersion });

      // Expanded compatibility checks
      const features = {
        webGL: !!window.WebGLRenderingContext,
        webGL2: !!window.WebGL2RenderingContext,
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        serviceWorkers: "serviceWorker" in navigator,
        webWorkers: typeof Worker !== "undefined",
        webSockets: !!window.WebSocket,
        fetchAPI: !!window.fetch,
        indexedDB: !!window.indexedDB,
        webRTC: !!window.RTCPeerConnection,
        cssGrid: CSS.supports("display", "grid"),
        flexbox: CSS.supports("display", "flex"),
        es6Modules: "noModule" in HTMLScriptElement.prototype,
        webAssembly: typeof WebAssembly === "object",
        canvas: !!window.HTMLCanvasElement,
        touchEvents: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        geolocation: "geolocation" in navigator,
        notifications: "Notification" in window,
        intersectionObserver: "IntersectionObserver" in window,
      };

      setCompatibility(features);
      setLastChecked(new Date().toLocaleString());
    } catch (err) {
      setError("Failed to detect browser features: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    detectBrowserAndFeatures();
  }, [detectBrowserAndFeatures]);

  const copyToClipboard = () => {
    const text = `
Browser: ${browserInfo?.name} ${browserInfo?.version}
OS: ${osInfo?.name} ${osInfo?.version || ""}
Last Checked: ${lastChecked || "N/A"}
Features:
${Object.entries(compatibility || {})
  .map(([feature, supported]) => `${feature}: ${supported ? "Supported" : "Not Supported"}`)
  .join("\n")}
    `.trim();
    navigator.clipboard.writeText(text).then(() => {
      alert("Results copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy to clipboard");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Browser Compatibility Checker
        </h1>

        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Detecting...</p>
          </div>
        ) : error ? (
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <FaExclamationTriangle className="mx-auto text-red-500 text-2xl mb-2" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={detectBrowserAndFeatures}
              className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaSync className="mr-2 inline" /> Try Again
            </button>
          </div>
        ) : browserInfo && compatibility ? (
          <div className="space-y-6">
            {/* Browser and OS Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-center text-blue-600">
                Your Environment
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                <p>
                  <span className="font-medium">Browser:</span> {browserInfo.name} {browserInfo.version}
                </p>
                <p>
                  <span className="font-medium">OS:</span> {osInfo.name} {osInfo.version || ""}
                </p>
              </div>
              {lastChecked && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Last checked: {lastChecked}
                </p>
              )}
            </div>

            {/* Compatibility Features */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-center text-blue-600">
                  Feature Support
                </h2>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"
                >
                  <FaInfoCircle /> {showDetails ? "Hide" : "Show"} Details
                </button>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {Object.entries(compatibility).map(([feature, supported]) => (
                  <li
                    key={feature}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                  >
                    <span className="capitalize">
                      {feature.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        supported ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {supported ? "✓ Supported" : "✗ Not Supported"}
                    </span>
                  </li>
                ))}
              </ul>
              {showDetails && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                  <p>
                    These checks test modern web features crucial for contemporary applications.
                    Missing features might affect performance or functionality of certain websites.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={detectBrowserAndFeatures}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Refresh Detection
              </button>
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaClipboard className="mr-2" /> Copy Results
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Unable to detect browser information.</p>
        )}

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features Checked</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Graphics: WebGL, WebGL2, Canvas</li>
            <li>Storage: LocalStorage, SessionStorage, IndexedDB</li>
            <li>Connectivity: WebSockets, WebRTC, Fetch API</li>
            <li>Workers: Service Workers, Web Workers</li>
             </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Results may vary due to browser settings, extensions, or user agent modifications.
        </p>
      </div>
    </div>
  );
};

export default BrowserCompatibilityChecker;