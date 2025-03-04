// components/ROT13Encoder.js
'use client';

import React, { useState } from 'react';

const ROT13Encoder = () => {
  const [inputText, setInputText] = useState('');
  const [encodedText, setEncodedText] = useState('');
  const [format, setFormat] = useState('plain'); // plain, url, html
  const [error, setError] = useState('');

  // ROT13 transformation function
  const rot13 = (text) => {
    return text.replace(/[A-Za-z]/g, (char) => {
      const code = char.charCodeAt(0);
      const base = code >= 97 ? 97 : 65; // Lowercase 'a' = 97, Uppercase 'A' = 65
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
  };

  // Encode text with selected format
  const encodeText = () => {
    setError('');
    setEncodedText('');

    if (!inputText.trim()) {
      setError('Please enter text to encode');
      return;
    }

    try {
      const baseEncoded = rot13(inputText);
      let formattedOutput = baseEncoded;

      switch (format) {
        case 'url':
          formattedOutput = encodeURIComponent(baseEncoded);
          break;
        case 'html':
          formattedOutput = `&quot;${baseEncoded}&quot;`; // HTML-encoded quotes
          break;
        case 'plain':
        default:
          formattedOutput = baseEncoded;
          break;
      }

      setEncodedText(formattedOutput);
    } catch (err) {
      setError('Encoding failed: ' + err.message);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    encodeText();
  };

  // Copy encoded text to clipboard
  const copyToClipboard = () => {
    if (encodedText) {
      navigator.clipboard.writeText(encodedText);
    }
  };

  // Download encoded text as a file
  const downloadAsFile = () => {
    if (encodedText) {
      const blob = new Blob([encodedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'rot13_encoded.txt';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setInputText('');
    setEncodedText('');
    setFormat('plain');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">ROT13 Encoder</h1>
        
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
              placeholder="Enter text to encode"
            />
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="plain">Plain Text</option>
              <option value="url">URL-Encoded</option>
              <option value="html">HTML-Encoded</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose how the encoded text is formatted (e.g., for URLs or HTML)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Encode
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

        {/* Encoded Output */}
        {encodedText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Encoded Text</h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Copy
                </button>
                <button
                  onClick={downloadAsFile}
                  className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={encodedText}
              readOnly
              className="w-full p-2 border rounded bg-gray-50 h-32 font-mono text-sm"
            />
            <p className="text-sm text-gray-600 mt-2">
              Format: {format === 'plain' ? 'Plain Text' : format === 'url' ? 'URL-Encoded' : 'HTML-Encoded'}
            </p>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> ROT13 shifts each letter by 13 positions (A-Z, a-z). This tool encodes text into ROT13 with options for formatting. Use the ROT13 Decoder to reverse it.
        </p>
      </div>
    </div>
  );
};

export default ROT13Encoder;