"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; 

const SecurityHeadersAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailedView, setDetailedView] = useState(false);
  const [fetchMethod, setFetchMethod] = useState("proxy"); // proxy or direct
  const resultRef = useRef(null);

  // Extended security headers with additional ones
  const securityHeadersInfo = {
    "content-security-policy": {
      name: "Content-Security-Policy",
      description: "Controls resources the user agent is allowed to load",
      recommendation: "Define allowed sources for scripts, styles, etc.",
    },
    "x-frame-options": {
      name: "X-Frame-Options",
      description: "Prevents clickjacking by controlling iframe embedding",
      recommendation: "Set to DENY or SAMEORIGIN",
    },
    "x-content-type-options": {
      name: "X-Content-Type-Options",
      description: "Prevents MIME type sniffing",
      recommendation: "Set to nosniff",
    },
    "strict-transport-security": {
      name: "Strict-Transport-Security (HSTS)",
      description: "Enforces HTTPS connections",
      recommendation: "Include max-age and includeSubDomains",
    },
    "x-xss-protection": {
      name: "X-XSS-Protection",
      description: "Enables XSS filtering in browsers (deprecated)",
      recommendation: "Set to 1; mode=block (though deprecated)",
    },
    "referrer-policy": {
      name: "Referrer-Policy",
      description: "Controls referrer information sent with requests",
      recommendation: "Set to strict-origin-when-cross-origin or no-referrer",
    },
    "permissions-policy": {
      name: "Permissions-Policy",
      description: "Controls browser feature permissions",
      recommendation: "Restrict features like geolocation, camera, etc.",
    },
    "cross-origin-opener-policy": {
      name: "Cross-Origin-Opener-Policy",
      description: "Controls window.opener access across origins",
      recommendation: "Set to same-origin or same-origin-allow-popups",
    },
    "cross-origin-resource-policy": {
      name: "Cross-Origin-Resource-Policy",
      description: "Controls resource sharing across origins",
      recommendation: "Set to same-site or same-origin",
    },
  };

  // Analyze headers
  const analyzeHeaders = useCallback(async () => {
    setLoading(true);
    setError("");
    setHeaders(null);

    try {
      let response;
      if (fetchMethod === "proxy") {
        // Using securityheaders.com API as a proxy
        response = await fetch(
          `https://securityheaders.com/?q=${encodeURIComponent(url)}&followRedirects=true`,
          {
            headers: { Accept: "application/json" },
          }
        );
      } else {
        // Direct fetch (might be blocked by CORS)
        response = await fetch(url, { mode: "no-cors" });
      }

      if (!response.ok && fetchMethod === "proxy") {
        throw new Error("Failed to fetch headers via proxy");
      }

      const rawHeaders = response.headers;
      const analyzedHeaders = {};
      const headerMap = new Map();
      rawHeaders.forEach((value, key) => {
        headerMap.set(key.toLowerCase(), value);
      });

      Object.keys(securityHeadersInfo).forEach((header) => {
        const value = headerMap.get(header);
        analyzedHeaders[header] = {
          present: !!value,
          value: value || "Not set",
          ...securityHeadersInfo[header],
          score: value ? evaluateHeader(header, value) : 0,
        };
      });

      setHeaders(analyzedHeaders);
    } catch (err) {
      setError("Error analyzing headers: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [url, fetchMethod]);

  // Simple header evaluation for scoring (basic simulation)
  const evaluateHeader = (header, value) => {
    switch (header) {
      case "x-frame-options":
        return value.toLowerCase() === "deny" || value.toLowerCase() === "sameorigin" ? 100 : 50;
      case "x-content-type-options":
        return value.toLowerCase() === "nosniff" ? 100 : 0;
      case "strict-transport-security":
        return value.includes("max-age") ? 100 : 50;
      default:
        return value !== "Not set" ? 75 : 0; // Basic presence check
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a URL");
      return;
    }
    const normalizedUrl = url.match(/^https?:\/\//) ? url : "https://" + url;
    setUrl(normalizedUrl);
    analyzeHeaders();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (headers) {
      const text = JSON.stringify(headers, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  // Download results as PNG
  const downloadResults = () => {
    if (resultRef.current && headers) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `security-headers-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Clear all
  const clearAll = () => {
    setUrl("");
    setHeaders(null);
    setError("");
    setDetailedView(false);
    setFetchMethod("proxy");
  };

  // Calculate overall security score
  const getOverallScore = () => {
    if (!headers) return 0;
    const scores = Object.values(headers).map((h) => h.score);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Security Headers Analyzer
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., https://example.com"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fetch Method
              </label>
              <select
                value={fetchMethod}
                onChange={(e) => setFetchMethod(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="proxy">Proxy (securityheaders.com)</option>
                <option value="direct">Direct (limited by CORS)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Analyzing..." : "Analyze Headers"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {headers && (
          <div ref={resultRef} className="mt-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Analysis Results (Score: {getOverallScore()}%)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailedView(!detailedView)}
                  className="px-4 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  {detailedView ? "Simple View" : "Detailed View"}
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadResults}
                  className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(headers).map(([key, info]) => (
                <div
                  key={key}
                  className="border p-4 rounded-lg bg-gray-50 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        info.present ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <h3 className="font-medium text-gray-800">{info.name}</h3>
                    {detailedView && (
                      <span className="text-sm text-gray-500">({info.score}%)</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{info.description}</p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Value:</span> {info.value}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Recommendation:</span> {info.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Analyzes key security headers</li>
            <li>Option for proxy or direct fetch</li>
            <li>Detailed view with scoring</li>
            <li>Copy results to clipboard</li>
            <li>Download results as PNG</li>
          </ul>
        </div>

        {/* Note */}
        {fetchMethod === "direct" && (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-700 text-sm">
              <strong>Note:</strong> Direct fetch may be limited by CORS policies. Use proxy for more reliable results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityHeadersAnalyzer;