"use client";

import React, { useState } from 'react';

const HTTPHeaderAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeHeaders = async () => {
    setLoading(true);
    setError(null);
    setHeaders(null);
    setStatus(null);

    try {
      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to get headers without body
        redirect: 'follow'
      });

      const headersObj = Object.fromEntries(response.headers.entries());
      setStatus({
        code: response.status,
        text: response.statusText
      });
      setHeaders(analyzeHeaderDetails(headersObj));
    } catch (err) {
      setError('Failed to fetch headers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeHeaderDetails = (headers) => {
    const analysis = {};
    
    // Common headers with analysis
    if (headers['content-type']) {
      analysis['content-type'] = {
        value: headers['content-type'],
        description: 'Specifies the media type of the resource',
        recommendation: headers['content-type'].includes('charset') 
          ? ''
          : 'Consider specifying charset (e.g., UTF-8)'
      };
    }

    if (headers['server']) {
      analysis['server'] = {
        value: headers['server'],
        description: 'Identifies the server software',
        recommendation: 'Consider hiding server version for security'
      };
    }

    if (headers['x-powered-by']) {
      analysis['x-powered-by'] = {
        value: headers['x-powered-by'],
        description: 'Indicates technology supporting the server',
        recommendation: 'Remove this header to reduce information disclosure'
      };
    }

    if (headers['strict-transport-security']) {
      analysis['strict-transport-security'] = {
        value: headers['strict-transport-security'],
        description: 'Enforces HTTPS connections',
        recommendation: 'Good! Ensure max-age is sufficiently long (e.g., 31536000)'
      };
    } else {
      analysis['strict-transport-security'] = {
        value: 'Not present',
        description: 'Missing HSTS header',
        recommendation: 'Add HSTS header for better security'
      };
    }

    if (headers['content-security-policy']) {
      analysis['content-security-policy'] = {
        value: headers['content-security-policy'],
        description: 'Controls resources the browser can load',
        recommendation: 'Good! Review policy for completeness'
      };
    }

    // Add all other headers without specific analysis
    Object.keys(headers).forEach(key => {
      if (!analysis[key]) {
        analysis[key] = {
          value: headers[key],
          description: 'Standard HTTP header',
          recommendation: ''
        };
      }
    });

    return analysis;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }
    analyzeHeaders();
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">HTTP Header Analyzer</h2>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Analyzing...' : 'Analyze Headers'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {headers && status && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700">Status</h3>
              <p className="text-lg text-gray-800">
                {status.code} {status.text}
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Headers Analysis</h3>
              <div className="max-h-96 overflow-y-auto">
                {Object.entries(headers).map(([name, details]) => (
                  <div key={name} className="p-3 bg-gray-50 rounded-md mb-2">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-sm text-gray-800">{name}</span>
                      <span className="font-mono text-sm text-gray-600 break-all">{details.value}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{details.description}</p>
                    {details.recommendation && (
                      <p className="text-sm text-blue-600 mt-1">{details.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HTTPHeaderAnalyzer;