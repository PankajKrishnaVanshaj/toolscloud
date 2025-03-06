// components/ClipboardTextCleaner.js
'use client';

import React, { useState } from 'react';

const ClipboardTextCleaner = () => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [options, setOptions] = useState({
    removeExtraSpaces: false,
    removeSpecialChars: false,
    toLowerCase: false,
    toUpperCase: false,
    trim: true,
  });

  // Read clipboard content
  const readClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      setError('');
    } catch (err) {
      setError('Clipboard access denied. Please paste manually.');
    }
  };

  // Clean text based on selected options
  const cleanText = () => {
    let cleaned = text;

    if (options.trim) {
      cleaned = cleaned.trim();
    }
    if (options.removeExtraSpaces) {
      cleaned = cleaned.replace(/\s+/g, ' ');
    }
    if (options.removeSpecialChars) {
      cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    if (options.toLowerCase) {
      cleaned = cleaned.toLowerCase();
    }
    if (options.toUpperCase) {
      cleaned = cleaned.toUpperCase();
    }

    setText(cleaned);
  };

  // Copy cleaned text to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setError('Text copied to clipboard!');
      setTimeout(() => setError(''), 2000); // Clear message after 2 seconds
    } catch (err) {
      setError('Failed to copy to clipboard.');
    }
  };

  // Handle option changes
  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option],
      ...(option === 'toLowerCase' && !prev[option] ? { toUpperCase: false } : {}),
      ...(option === 'toUpperCase' && !prev[option] ? { toLowerCase: false } : {}),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Clipboard Text Cleaner</h1>

      <div className="space-y-6">
        {/* Text Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text to Clean
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here or use the Read Clipboard button"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[150px]"
          />
        </div>

        {/* Cleaning Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Cleaning Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.removeExtraSpaces}
                onChange={() => handleOptionChange('removeExtraSpaces')}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Remove Extra Spaces</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.removeSpecialChars}
                onChange={() => handleOptionChange('removeSpecialChars')}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Remove Special Characters</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.toLowerCase}
                onChange={() => handleOptionChange('toLowerCase')}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Convert to Lowercase</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.toUpperCase}
                onChange={() => handleOptionChange('toUpperCase')}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Convert to Uppercase</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.trim}
                onChange={() => handleOptionChange('trim')}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Trim Edges</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={readClipboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Read Clipboard
          </button>
          <button
            onClick={cleanText}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Clean Text
          </button>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Copy to Clipboard
          </button>
        </div>

        {/* Status Message */}
        {error && (
          <p className={`text-sm text-center ${error.includes('copied') ? 'text-green-600' : 'text-red-600'}`}>
            {error}
          </p>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Clipboard access requires permission. Some features may not work without it.
      </p>
    </div>
  );
};

export default ClipboardTextCleaner;