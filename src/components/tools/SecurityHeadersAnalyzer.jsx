// components/SecurityHeadersAnalyzer.js
'use client';

import React, { useState } from 'react';

const SecurityHeadersAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Security headers to analyze with descriptions and recommendations
  const securityHeadersInfo = {
    'content-security-policy': {
      name: 'Content-Security-Policy',
      description: 'Controls resources the user agent is allowed to load',
      recommendation: 'Define allowed sources for scripts, styles, etc.'
    },
    'x-frame-options': {
      name: 'X-Frame-Options',
      description: 'Prevents clickjacking by controlling iframe embedding',
      recommendation: 'Set to DENY or SAMEORIGIN'
    },
    'x-content-type-options': {
      name: 'X-Content-Type-Options',
      description: 'Prevents MIME type sniffing',
      recommendation: 'Set to nosniff'
    },
    'strict-transport-security': {
      name: 'Strict-Transport-Security (HSTS)',
      description: 'Enforces HTTPS connections',
      recommendation: 'Include max-age and includeSubDomains'
    },
    'x-xss-protection': {
      name: 'X-XSS-Protection',
      description: 'Enables XSS filtering in browsers',
      recommendation: 'Set to 1; mode=block (though deprecated in modern browsers)'
    },
    'referrer-policy': {
      name: 'Referrer-Policy',
      description: 'Controls referrer information sent with requests',
      recommendation: 'Set to strict-origin-when-cross-origin or no-referrer'
    }
  };

  // Fetch headers using a proxy API (securityheaders.com in this case)
  const analyzeHeaders = async () => {
    setLoading(true);
    setError('');
    setHeaders(null);

    try {
      // Using securityheaders.com API as a proxy
      const response = await fetch(`https://securityheaders.com/?q=${encodeURIComponent(url)}&followRedirects=true`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch headers');
      }

      const rawHeaders = response.headers;
      const analyzedHeaders = {};

      // Convert headers to lowercase for consistent checking
      const headerMap = new Map();
      rawHeaders.forEach((value, key) => {
        headerMap.set(key.toLowerCase(), value);
      });

      // Analyze relevant security headers
      Object.keys(securityHeadersInfo).forEach(header => {
        const value = headerMap.get(header);
        analyzedHeaders[header] = {
          present: !!value,
          value: value || 'Not set',
          ...securityHeadersInfo[header]
        };
      });

      setHeaders(analyzedHeaders);
    } catch (err) {
      setError('Error analyzing headers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    if (!url.match(/^https?:\/\//)) {
      setUrl('https://' + url); // Add https:// if protocol is missing
    }
    analyzeHeaders();
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    if (headers) {
      const text = JSON.stringify(headers, null, 2);
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setUrl('');
    setHeaders(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-6">Security Headers Analyzer</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="Enter URL (e.g., https://example.com)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Analyzing...' : 'Analyze Headers'}
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

        {/* Results */}
        {headers && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Analysis Results</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy Results
              </button>
            </div>
            <div className="space-y-4">
              {Object.entries(headers).map(([key, info]) => (
                <div key={key} className="border p-4 rounded bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${
                      info.present ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <h3 className="font-medium">{info.name}</h3>
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
      </div>
    </div>
  );
};

export default SecurityHeadersAnalyzer;