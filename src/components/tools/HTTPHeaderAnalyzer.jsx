"use client";

import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const HTTPHeaderAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("HEAD");
  const [showRaw, setShowRaw] = useState(false);
  const [history, setHistory] = useState([]);

  const analyzeHeaders = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHeaders(null);
    setStatus(null);

    try {
      const response = await fetch(url, {
        method,
        redirect: "follow",
        headers: { "Cache-Control": "no-cache" }, // Prevent caching
      });

      const headersObj = Object.fromEntries(response.headers.entries());
      setStatus({
        code: response.status,
        text: response.statusText,
        redirected: response.redirected,
        url: response.url,
      });
      const analyzedHeaders = analyzeHeaderDetails(headersObj);
      setHeaders(analyzedHeaders);
      setHistory((prev) => [
        { url, method, timestamp: new Date(), headers: analyzedHeaders },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setError(`Failed to fetch headers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [url, method]);

  const analyzeHeaderDetails = (headers) => {
    const analysis = {};

    const headerRules = {
      "content-type": {
        description: "Specifies the media type of the resource",
        recommendation: (value) =>
          value.includes("charset") ? "" : "Consider specifying charset (e.g., UTF-8)",
      },
      "server": {
        description: "Identifies the server software",
        recommendation: () => "Consider hiding server version for security",
      },
      "x-powered-by": {
        description: "Indicates technology supporting the server",
        recommendation: () => "Remove this header to reduce information disclosure",
      },
      "strict-transport-security": {
        description: "Enforces HTTPS connections",
        recommendation: (value, present) =>
          present
            ? "Good! Ensure max-age is sufficiently long (e.g., 31536000)"
            : "Add HSTS header for better security",
      },
      "content-security-policy": {
        description: "Controls resources the browser can load",
        recommendation: () => "Good! Review policy for completeness",
      },
      "x-frame-options": {
        description: "Prevents clickjacking",
        recommendation: (value, present) =>
          present ? "" : "Add to prevent clickjacking (e.g., DENY)",
      },
      "x-content-type-options": {
        description: "Prevents MIME sniffing",
        recommendation: (value, present) =>
          present && value === "nosniff" ? "" : "Set to 'nosniff' for security",
      },
    };

    Object.keys(headers).forEach((key) => {
      const rule = headerRules[key];
      analysis[key] = {
        value: headers[key],
        description: rule?.description || "Standard HTTP header",
        recommendation: rule?.recommendation(headers[key], true) || "",
      };
    });

    Object.keys(headerRules).forEach((key) => {
      if (!headers[key]) {
        analysis[key] = {
          value: "Not present",
          description: headerRules[key].description,
          recommendation: headerRules[key].recommendation("", false),
        };
      }
    });

    return analysis;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }
    analyzeHeaders();
  };

  const handleCopy = () => {
    const text = JSON.stringify({ status, headers }, null, 2);
    navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify({ status, headers }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `headers-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setUrl("");
    setHeaders(null);
    setStatus(null);
    setError(null);
    setShowRaw(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          HTTP Header Analyzer
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com"
                required
                aria-label="URL Input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="HEAD">HEAD</option>
                <option value="GET">GET</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : null}
              {loading ? "Analyzing..." : "Analyze Headers"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {headers && status && (
          <div className="mt-6 space-y-6">
            {/* Status */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Response Status</h3>
              <p className="text-lg text-gray-800">
                {status.code} {status.text}
              </p>
              {status.redirected && (
                <p className="text-sm text-gray-600 mt-1">
                  Redirected to: {status.url}
                </p>
              )}
            </div>

            {/* Headers */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Headers Analysis</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="py-1 px-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                  >
                    {showRaw ? "Hide Raw" : "Show Raw"}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="py-1 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
                  >
                    <FaCopy className="mr-1" /> Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
                  >
                    <FaDownload className="mr-1" /> Download
                  </button>
                </div>
              </div>

              {showRaw ? (
                <pre className="p-4 bg-gray-100 rounded-lg text-sm font-mono text-gray-800 overflow-auto max-h-96">
                  {JSON.stringify(headers, null, 2)}
                </pre>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {Object.entries(headers).map(([name, details]) => (
                    <div
                      key={name}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <span className="font-mono text-sm text-gray-800">{name}</span>
                        <span className="font-mono text-sm text-gray-600 break-all">
                          {details.value}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{details.description}</p>
                      {details.recommendation && (
                        <p className="text-sm text-blue-600 mt-1">
                          Recommendation: {details.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Recent Analyses (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.map((entry, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-white rounded-md"
                >
                  <span>
                    {entry.method} {entry.url.slice(0, 50)}
                    {entry.url.length > 50 ? "..." : ""}
                  </span>
                  <span className="text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Analyze headers with HEAD or GET methods</li>
            <li>Detailed security recommendations</li>
            <li>Copy or download results as JSON</li>
            <li>View raw header data</li>
            <li>Track recent analyses</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTTPHeaderAnalyzer;