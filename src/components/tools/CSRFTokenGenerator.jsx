// components/CSRFTokenGenerator.js
'use client';

import React, { useState } from 'react';

const CSRFTokenGenerator = () => {
  const [tokenLength, setTokenLength] = useState(32);
  const [tokenCount, setTokenCount] = useState(1);
  const [tokens, setTokens] = useState([]);
  const [error, setError] = useState('');

  // Generate secure CSRF token
  const generateToken = () => {
    const array = new Uint8Array(tokenLength / 2); // Each byte becomes 2 hex chars
    window.crypto.getRandomValues(array);
    const token = Array.from(array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    return token;
  };

  // Generate multiple tokens
  const generateTokens = () => {
    setError('');
    setTokens([]);

    if (tokenLength < 16 || tokenLength > 128) {
      setError('Token length must be between 16 and 128 characters');
      return;
    }
    if (tokenCount < 1 || tokenCount > 50) {
      setError('Number of tokens must be between 1 and 50');
      return;
    }

    const newTokens = Array.from({ length: tokenCount }, generateToken);
    setTokens(newTokens);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateTokens();
  };

  // Copy tokens to clipboard
  const copyToClipboard = () => {
    if (tokens.length > 0) {
      const text = tokens.join('\n');
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setTokenLength(32);
    setTokenCount(1);
    setTokens([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">CSRF Token Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Token Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token Length (16-128)
            </label>
            <input
              type="number"
              value={tokenLength}
              onChange={(e) => setTokenLength(parseInt(e.target.value))}
              min={16}
              max={128}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 32+ characters for security
            </p>
          </div>

          {/* Number of Tokens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Tokens (1-50)
            </label>
            <input
              type="number"
              value={tokenCount}
              onChange={(e) => setTokenCount(parseInt(e.target.value))}
              min={1}
              max={50}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Tokens
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

        {/* Generated Tokens */}
        {tokens.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Generated CSRF Tokens</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy All
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
              <ul className="list-disc pl-5 font-mono text-sm">
                {tokens.map((token, index) => (
                  <li key={index} className="py-1 break-all">{token}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Use these tokens in your web application to protect against CSRF attacks. Store securely and associate with user sessions.
            </p>
          </div>
        )}

        {/* Security Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Tokens are generated using the Web Crypto API for cryptographic security. Ensure tokens are unpredictable and unique per session.
        </p>
      </div>
    </div>
  );
};

export default CSRFTokenGenerator;