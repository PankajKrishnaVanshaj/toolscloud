// components/URLShortener.js
'use client';

import React, { useState } from 'react';

const URLShortener = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const validateUrl = (url) => {
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;
    return urlPattern.test(url);
  };

  const handleShorten = () => {
    setError('');
    setShortenedUrl('');
    setCopied(false);

    if (!inputUrl) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(inputUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    // Simulate URL shortening (Coming Soon)
    const fakeShortUrl = `https://short.ly/${Math.random().toString(36).substring(2, 8)}`;
    setShortenedUrl(fakeShortUrl);
  };

  const handleCopy = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">URL Shortener</h1>

      <div className="space-y-4">
        {/* Input Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter URL to Shorten
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleShorten}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Shorten
            </button>
          </div>
        </div>

        {/* Result Section */}
        {shortenedUrl && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Shortened URL:</p>
                <a
                  href={shortenedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {shortenedUrl}
                </a>
              </div>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 rounded-md text-white transition-colors ${
                  copied ? 'bg-green-500' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              Coming Soon: This is a demo. Actual shortening service will be implemented soon!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Coming Soon Notice */}
        {!shortenedUrl && !error && (
          <p className="text-center text-gray-500">
            Enter a URL and click "Shorten" to see a preview of our upcoming URL shortening service!
          </p>
        )}

        {/* Additional Info */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This is a preview version. Full URL shortening functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default URLShortener;