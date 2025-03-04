// components/ROT13Decoder.js
'use client';

import React, { useState } from 'react';

const ROT13Decoder = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState('');

  // ROT13 transformation function
  const rot13 = (text) => {
    return text.replace(/[A-Za-z]/g, (char) => {
      const code = char.charCodeAt(0);
      const base = code >= 97 ? 97 : 65; // Lowercase 'a' = 97, Uppercase 'A' = 65
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
  };

  // Handle decoding/encoding
  const processText = () => {
    setError('');
    setOutputText('');

    if (!inputText.trim()) {
      setError('Please enter text to decode/encode');
      return;
    }

    try {
      const result = rot13(inputText);
      setOutputText(result);
    } catch (err) {
      setError('Processing failed: ' + err.message);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    processText();
  };

  // Copy output to clipboard
  const copyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
    }
  };

  // Clear all
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">ROT13 Decoder/Encoder</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200 h-32"
              placeholder="Enter text to decode or encode"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Process (Decode/Encode)
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

        {/* Output Text */}
        {outputText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Output Text</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <textarea
              value={outputText}
              readOnly
              className="w-full p-2 border rounded bg-gray-50 h-32"
            />
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> ROT13 shifts each letter by 13 positions in the alphabet (A-Z, a-z). It’s a simple cipher where encoding and decoding are the same operation. Non-letter characters remain unchanged.
        </p>
      </div>
    </div>
  );
};

export default ROT13Decoder;