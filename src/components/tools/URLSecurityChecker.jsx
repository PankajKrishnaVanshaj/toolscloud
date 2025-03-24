"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaSearch } from "react-icons/fa";

const URLSecurityChecker = () => {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkOptions, setCheckOptions] = useState({
    headers: true,
    ssl: true,
    domain: true,
    phishing: true,
  });

  // Enhanced URL validation regex
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?$/i;

  // Check URL security with expanded options
  const checkURLSecurity = useCallback(async () => {
    setLoading(true);
    setError("");
    setResults(null);

    if (!url.trim()) {
      setError("Please enter a URL to check");
      setLoading(false);
      return;
    }

    if (!urlRegex.test(url)) {
      setError("Invalid URL format");
      setLoading(false);
      return;
    }

    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    const issues = [];
    const domain = new URL(fullUrl).hostname;

    // Client-side checks
    if (checkOptions.headers) {
      if (!fullUrl.startsWith("https")) {
        issues.push({
          issue: "Non-HTTPS Protocol",
          severity: "High",
          details: "URL uses HTTP instead of HTTPS, risking data interception.",
        });
      }

      // Fetch security headers
      try {
        const response = await fetch(
          `https://securityheaders.com/?q=${encodeURIComponent(fullUrl)}&followRedirects=true`,
          { headers: { Accept: "application/json" } }
        );

        if (!response.ok) {
          issues.push({
            issue: "Failed to Fetch Headers",
            severity: "Low",
            details: "Could not retrieve security headers (site may be down or blocking requests).",
          });
        } else {
          const headers = new Map();
          response.headers.forEach((value, key) => headers.set(key.toLowerCase(), value));

          if (!headers.has("content-security-policy")) {
            issues.push({
              issue: "Missing Content-Security-Policy",
              severity: "High",
              details: "No CSP header, increasing XSS risk.",
            });
          }
          if (!headers.has("strict-transport-security")) {
            issues.push({
              issue: "Missing HSTS",
              severity: "Medium",
              details: "No Strict-Transport-Security header, risking downgrade attacks.",
            });
          }
          if (!headers.has("x-frame-options")) {
            issues.push({
              issue: "Missing X-Frame-Options",
              severity: "Medium",
              details: "No protection against clickjacking.",
            });
          }
          if (!headers.has("x-content-type-options") || headers.get("x-content-type-options") !== "nosniff") {
            issues.push({
              issue: "Missing or Incorrect X-Content-Type-Options",
              severity: "Low",
              details: 'Should be "nosniff" to prevent MIME sniffing.',
            });
          }
        }
      } catch (err) {
        issues.push({
          issue: "Header Fetch Error",
          severity: "Low",
          details: "Could not fetch headers: " + err.message,
        });
      }
    }

    // SSL/TLS Check Simulation
    if (checkOptions.ssl && fullUrl.startsWith("https")) {
      try {
        const sslResponse = await fetch(fullUrl, { method: "HEAD" });
        if (!sslResponse.ok) {
          issues.push({
            issue: "SSL/TLS Connection Issue",
            severity: "Medium",
            details: "Failed to establish a secure connection.",
          });
        }
      } catch (err) {
        issues.push({
          issue: "SSL/TLS Error",
          severity: "High",
          details: "SSL/TLS verification failed: " + err.message,
        });
      }
    }

    // Domain Check
    if (checkOptions.domain) {
      if (/[<>]/.test(fullUrl)) {
        issues.push({
          issue: "Suspicious Characters",
          severity: "Medium",
          details: "URL contains < or >, which could indicate injection attempts.",
        });
      }
      if (
        fullUrl.includes("..") ||
        (fullUrl.includes("//") && !fullUrl.startsWith("http://") && !fullUrl.startsWith("https://"))
      ) {
        issues.push({
          issue: "Path Traversal or Redirection Risk",
          severity: "Medium",
          details: 'URL contains ".." or unexpected "//", potentially allowing path manipulation.',
        });
      }
      if (domain.length > 63) {
        issues.push({
          issue: "Excessively Long Domain",
          severity: "Low",
          details: "Domain exceeds typical length, could be suspicious.",
        });
      }
    }

    // Phishing Check Simulation
    if (checkOptions.phishing) {
      const suspiciousKeywords = ["login", "password", "verify", "account"];
      if (suspiciousKeywords.some((kw) => fullUrl.toLowerCase().includes(kw))) {
        issues.push({
          issue: "Potential Phishing Indicators",
          severity: "Medium",
          details: "URL contains keywords often used in phishing attempts.",
        });
      }
    }

    setResults({
      url: fullUrl,
      issues,
      timestamp: new Date().toLocaleString(),
      domain,
    });
    setLoading(false);
  }, [url, checkOptions]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    checkURLSecurity();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (results) {
      const text = JSON.stringify(results, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setUrl("");
    setResults(null);
    setError("");
    setCheckOptions({
      headers: true,
      ssl: true,
      domain: true,
      phishing: true,
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          URL Security Checker
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL to Check</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., https://example.com"
              disabled={loading}
            />
          </div>

          {/* Check Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Check Options</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(checkOptions).map(([key, value]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setCheckOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="mr-2 accent-blue-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-600 capitalize">{key}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              {loading ? "Checking..." : "Check URL"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && <div className="mt-4 text-red-500 text-sm text-center">{error}</div>}

        {/* Results */}
        {results && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Security Check Results</h2>
              <button
                onClick={copyToClipboard}
                className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border space-y-4">
              <div>
                <p className="text-sm">
                  <strong>URL:</strong> {results.url}
                </p>
                <p className="text-sm">
                  <strong>Domain:</strong> {results.domain}
                </p>
                <p className="text-sm">
                  <strong>Checked:</strong> {results.timestamp}
                </p>
              </div>
              {results.issues.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Issues Found ({results.issues.length}):
                  </p>
                  <ul className="mt-2 space-y-3 max-h-96 overflow-y-auto">
                    {results.issues.map((issue, index) => (
                      <li
                        key={index}
                        className="p-3 border rounded-lg shadow-sm bg-white"
                      >
                        <p
                          className={`font-medium ${
                            issue.severity === "High"
                              ? "text-red-600"
                              : issue.severity === "Medium"
                              ? "text-yellow-600"
                              : "text-gray-600"
                          }`}
                        >
                          {issue.issue} ({issue.severity})
                        </p>
                        <p className="text-sm text-gray-600">{issue.details}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-green-600">
                  No obvious security issues detected with selected checks.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Checks for HTTPS, security headers, SSL/TLS, domain issues, and phishing indicators</li>
            <li>Customizable check options</li>
            <li>Copy results to clipboard</li>
            <li>Detailed issue reporting with severity levels</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default URLSecurityChecker;