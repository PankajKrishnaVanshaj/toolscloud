// components/ClipboardURLExpander.js
'use client';

import React, { useState } from 'react';

const ClipboardURLExpander = () => {
  const [clipboardURL, setClipboardURL] = useState('');
  const [expandedURL, setExpandedURL] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setError('Clipboard is empty');
        return;
      }
      setClipboardURL(text);
      expandURL(text);
    } catch (err) {
      setError('Clipboard access denied. Please paste the URL manually.');
    }
  };

  const expandURL = async (url) => {
    setLoading(true);
    setError('');
    setExpandedURL(null);

    try {
      // Basic URL validation
      const urlPattern = /^(https?:\/\/[^\s]+)/;
      if (!urlPattern.test(url)) {
        throw new Error('Invalid URL format');
      }

      const response = await fetch('/api/expand-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to expand URL');

      setExpandedURL({
        original: url,
        expanded: data.expandedURL,
        domain: new URL(data.expandedURL).hostname,
        timestamp: new Date().toLocaleString(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    expandURL(clipboardURL);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Clipboard URL Expander</h1>

      <div className="space-y-4">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL from Clipboard or Manual Input
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={clipboardURL}
              onChange={(e) => setClipboardURL(e.target.value)}
              placeholder="Paste URL here or click 'Read Clipboard'"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={readClipboard}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Read Clipboard
            </button>
          </div>
          <button
            onClick={handleManualSubmit}
            className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            disabled={loading || !clipboardURL}
          >
            {loading ? 'Expanding...' : 'Expand URL'}
          </button>
        </div>

        {/* Results Section */}
        {expandedURL && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Expanded URL Details</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Original URL:</span>{' '}
                <a href={expandedURL.original} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {expandedURL.original}
                </a>
              </p>
              <p>
                <span className="font-medium">Expanded URL:</span>{' '}
                <a href={expandedURL.expanded} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
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
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4">
          Note: Requires clipboard permission for automatic reading. Some shortened URLs may not expand if the service is unavailable.
        </p>
      </div>
    </div>
  );
};

export default ClipboardURLExpander;