"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaInfoCircle, FaClipboard } from "react-icons/fa";

const BrowserCompatibilityChecker = () => {
  const [browserInfo, setBrowserInfo] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [osInfo, setOsInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const detectBrowserAndFeatures = useCallback(() => {
    setIsLoading(true);
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    let version = "Unknown";
    let osName = "Unknown";

    // Browser detection
    if (/chrome|crios/i.test(ua) && !/opr|edge/i.test(ua)) {
      browserName = "Chrome";
      const match = ua.match(/Chrome\/(\d+\.\d+)/i);
      version = match ? match[1] : "Unknown";
    } else if (/firefox|fxios/i.test(ua)) {
      browserName = "Firefox";
      const match = ua.match(/Firefox\/(\d+\.\d+)/i);
      version = match ? match[1] : "Unknown";
    } else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) {
      browserName = "Safari";
      const match = ua.match(/Version\/(\d+\.\d+)/i);
      version = match ? match[1] : "Unknown";
    } else if (/opr/i.test(ua)) {
      browserName = "Opera";
      const match = ua.match(/OPR\/(\d+\.\d+)/i);
      version = match ? match[1] : "Unknown";
    } else if (/edg/i.test(ua)) {
      browserName = "Edge";
      const match = ua.match(/Edg\/(\d+\.\d+)/i);
      version = match ? match[1] : "Unknown";
    } else if (/msie|trident/i.test(ua)) {
      browserName = "Internet Explorer";
      const match = ua.match(/(?:MSIE |rv:)(\d+\.\d+)/i);
      version = match ? match[1] : "Unknown";
    }

    // OS detection
    if (/windows/i.test(ua)) osName = "Windows";
    else if (/mac os|macos/i.test(ua)) osName = "macOS";
    else if (/linux/i.test(ua)) osName = "Linux";
    else if (/android/i.test(ua)) osName = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) osName = "iOS";

    setBrowserInfo({ name: browserName, version });
    setOsInfo({ name: osName });

    // Expanded compatibility checks
    const features = {
      webGL: !!window.WebGLRenderingContext,
      webGL2: !!window.WebGL2RenderingContext,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      serviceWorkers: "serviceWorker" in navigator,
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
    };

    setCompatibility(features);
    setIs_loading(false);
  }, []);

  useEffect(() => {
    detectBrowserAndFeatures();
  }, [detectBrowserAndFeatures]);

  // Copy results to clipboard
  const copyToClipboard = () => {
    const text = `
Browser: ${browserInfo?.name} ${browserInfo?.version}
OS: ${osInfo?.name}
Features:
${Object.entries(compatibility || {})
  .map(([feature, supported]) => `${feature}: ${supported ? "Supported" : "Not Supported"}`)
  .join("\n")}
    `.trim();
    navigator.clipboard.writeText(text);
    alert("Results copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Browser Compatibility Checker
        </h1>

        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-2">Detecting...</p>
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
                  <span className="font-medium">Browser:</span> {browserInfo.name}{" "}
                  {browserInfo.version}
                </p>
                <p>
                  <span className="font-medium">OS:</span> {osInfo.name}
                </p>
              </div>
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
                    These checks test for modern web features. Unsupported features may indicate
                    an older browser version or restricted settings.
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
            <li>WebGL & WebGL2 for graphics</li>
            <li>Storage (Local & Session)</li>
            <li>Service Workers, WebSockets, Fetch API</li>
            <li>IndexedDB, WebRTC, WebAssembly</li>
            <li>CSS Grid, Flexbox, ES6 Modules</li>
            <li>Canvas, Touch Events, Geolocation</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Results may vary due to browser settings, extensions, or user agent spoofing.
        </p>
      </div>
    </div>
  );
};

export default BrowserCompatibilityChecker;