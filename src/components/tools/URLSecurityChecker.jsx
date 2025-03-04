'use client';

import React, { useState } from 'react';

const URLSecurityChecker = () => {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Basic URL validation regex
  const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?$/;

  // Check URL for security issues
  const checkURLSecurity = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    if (!url.trim()) {
      setError('Please enter a URL to check');
      setLoading(false);
      return;
    }

    if (!urlRegex.test(url)) {
      setError('Invalid URL format');
      setLoading(false);
      return;
    }

    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const issues = [];

    // Client-side checks
    if (!fullUrl.startsWith('https')) {
      issues.push({
        issue: 'Non-HTTPS Protocol',
        severity: 'High',
        details: 'URL uses HTTP instead of HTTPS, risking data interception.'
      });
    }

    if (/[<>]/.test(fullUrl)) {
      issues.push({
        issue: 'Suspicious Characters',
        severity: 'Medium',
        details: 'URL contains < or >, which could indicate injection attempts.'
      });
    }

    if (fullUrl.includes('..') || fullUrl.includes('//') && !fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      issues.push({
        issue: 'Path Traversal or Redirection Risk',
        severity: 'Medium',
        details: 'URL contains ".." or unexpected "//", potentially allowing path manipulation.'
      });
    }

    // Fetch security headers using securityheaders.com API
    try {
      const response = await fetch(`https://securityheaders.com/?q=${encodeURIComponent(fullUrl)}&followRedirects=true`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        issues.push({
          issue: 'Failed to Fetch Headers',
          severity: 'Low',
          details: 'Could not retrieve security headers (site may be down or blocking requests).'
        });
      } else {
        const headers = new Map();
        response.headers.forEach((value, key) => headers.set(key.toLowerCase(), value));

        if (!headers.has('content-security-policy')) {
          issues.push({
            issue: 'Missing Content-Security-Policy',
            severity: 'High',
            details: 'No CSP header, increasing XSS risk.'
          });
        }
        if (!headers.has('strict-transport-security')) {
          issues.push({
            issue: 'Missing HSTS',
            severity: 'Medium',
            details: 'No Strict-Transport-Security header, risking downgrade attacks.'
          });
        }
        if (!headers.has('x-frame-options')) {
          issues.push({
            issue: 'Missing X-Frame-Options',
            severity: 'Medium',
            details: 'No protection against clickjacking.'
          });
        }
        if (!headers.has('x-content-type-options') || headers.get('x-content-type-options') !== 'nosniff') {
          issues.push({
            issue: 'Missing or Incorrect X-Content-Type-Options',
            severity: 'Low',
            details: 'Should be "nosniff" to prevent MIME sniffing.'
          });
        }
      }
    } catch (err) {
      issues.push({
        issue: 'Header Fetch Error',
        severity: 'Low',
        details: 'Could not fetch headers: ' + err.message
      });
    }

    setResults({
      url: fullUrl,
      issues,
      timestamp: new Date().toLocaleString()
    });
    setLoading(false);
  };

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
    setUrl('');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">URL Security Checker</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL to Check
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="e.g., https://example.com"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Checking...' : 'Check URL'}
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mt-4">{error}</div>
        )}

        {/* Check Results */}
        {results && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Security Check Results</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy Results
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border space-y-2">
              <p className="text-sm">
                <strong>URL:</strong> {results.url}
              </p>
              <p className="text-sm">
                <strong>Checked:</strong> {results.timestamp}
              </p>
              {results.issues.length > 0 ? (
                <div>
                  <p className="text-sm font-medium">Issues Found ({results.issues.length}):</p>
                  <ul className="mt-2 space-y-2">
                    {results.issues.map((issue, index) => (
                      <li key={index} className="border p-2 rounded">
                        <p className={`font-medium ${issue.severity === 'High' ? 'text-red-600' : issue.severity === 'Medium' ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {issue.issue} ({issue.severity})
                        </p>
                        <p className="text-sm text-gray-600">{issue.details}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-green-600">No obvious security issues detected</p>
              )}
            </div>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> This tool checks URL structure and fetches basic security headers via securityheaders.com. It’s a simulation and cannot perform full vulnerability scans (use tools like OWASP ZAP for that).
        </p>
      </div>
    </div>
  );
};

export default URLSecurityChecker;