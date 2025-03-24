"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaClipboard, FaSync, FaDownload, FaHistory } from "react-icons/fa";

const ClipboardURLExpander = () => {
  const [clipboardURL, setClipboardURL] = useState("");
  const [expandedURL, setExpandedURL] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);

  // Read clipboard content
  const readClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setError("Clipboard is empty");
        return;
      }
      setClipboardURL(text);
      expandURL(text);
    } catch (err) {
      setError("Clipboard access denied. Please paste the URL manually.");
    }
  }, []);

  // Expand URL
  const expandURL = useCallback(async (url) => {
    setLoading(true);
    setError("");
    setExpandedURL(null);

    try {
      const urlPattern = /^(https?:\/\/[^\s]+)/;
      if (!urlPattern.test(url)) {
        throw new Error("Invalid URL format");
      }

      // Simulated API call (replace with real API endpoint)
      const response = await fetch("/api/expand-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to expand URL");

      const expandedData = {
        original: url,
        expanded: data.expandedURL || url, // Fallback to original if no expansion
        domain: new URL(data.expandedURL || url).hostname,
        timestamp: new Date().toLocaleString(),
      };

      setExpandedURL(expandedData);
      setHistory((prev) => [expandedData, ...prev.slice(0, 9)]); // Keep last 10
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    expandURL(clipboardURL);
  };

  // Clear input and reset state
  const reset = () => {
    setClipboardURL("");
    setExpandedURL(null);
    setError("");
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Download result as text file
  const downloadResult = () => {
    if (!expandedURL) return;
    const content = `Original URL: ${expandedURL.original}\nExpanded URL: ${expandedURL.expanded}\nDomain: ${expandedURL.domain}\nExpanded At: ${expandedURL.timestamp}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `expanded-url-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Clipboard URL Expander
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL from Clipboard or Manual Input
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={inputRef}
                type="text"
                value={clipboardURL}
                onChange={(e) => setClipboardURL(e.target.value)}
                placeholder="Paste URL here or click 'Read Clipboard'"
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={loading}
              />
              <button
                onClick={readClipboard}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaClipboard className="mr-2" /> Read Clipboard
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <button
                onClick={handleManualSubmit}
                disabled={loading || !clipboardURL}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Expanding..." : "Expand URL"}
              </button>
              <button
                onClick={reset}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          {expandedURL && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Expanded URL Details</h2>
                <button
                  onClick={downloadResult}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
                >
                  <FaDownload className="mr-1" /> Download
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Original URL:</span>{" "}
                  <a
                    href={expandedURL.original}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {expandedURL.original}
                  </a>
                </p>
                <p>
                  <span className="font-medium">Expanded URL:</span>{" "}
                  <a
                    href={expandedURL.expanded}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {expandedURL.expanded}
                  </a>
                </p>
                <p>
                  <span className="font-medium">Domain:</span> {expandedURL.domain}
                </p>
                <p>
                  <span className="font-medium">Expanded At:</span> {expandedURL.timestamp}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-md">
              {error}
            </p>
          )}

          {/* History Section */}
          <div className="mt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaHistory className="mr-2" /> {showHistory ? "Hide" : "Show"} History
            </button>
            {showHistory && history.length > 0 && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2">Expansion History</h3>
                <ul className="space-y-2 text-sm">
                  {history.map((item, index) => (
                    <li
                      key={index}
                      className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setClipboardURL(item.original);
                        setExpandedURL(item);
                      }}
                    >
                      <p>
                        <span className="font-medium">Original:</span>{" "}
                        <span className="text-blue-600">{item.original}</span>
                      </p>
                      <p>
                        <span className="font-medium">Expanded:</span>{" "}
                        <span className="text-blue-600">{item.expanded}</span>
                      </p>
                      <p className="text-gray-500">{item.timestamp}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {showHistory && history.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-2">No history yet</p>
            )}
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Read URLs directly from clipboard</li>
              <li>Manual URL input support</li>
              <li>History of expanded URLs (up to 10)</li>
              <li>Download expanded URL details as text file</li>
              <li>Real-time error feedback</li>
            </ul>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Note: Requires clipboard permission for automatic reading. Actual URL expansion requires a server-side API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClipboardURLExpander;