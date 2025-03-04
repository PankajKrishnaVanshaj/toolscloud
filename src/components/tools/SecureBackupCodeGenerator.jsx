// components/SecureBackupCodeGenerator.js
'use client';

import React, { useState } from 'react';
import { generate } from 'randomstring';

const SecureBackupCodeGenerator = () => {
  const [codeLength, setCodeLength] = useState(8);
  const [codeCount, setCodeCount] = useState(10);
  const [format, setFormat] = useState('alphanumeric'); // alphanumeric, numeric, alphabetic
  const [separator, setSeparator] = useState(''); // '', '-', ' '
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState('');

  // Generate secure backup codes
  const generateCodes = () => {
    setError('');
    setCodes([]);

    if (codeLength < 6 || codeLength > 32) {
      setError('Code length must be between 6 and 32 characters');
      return;
    }
    if (codeCount < 1 || codeCount > 100) {
      setError('Number of codes must be between 1 and 100');
      return;
    }

    const newCodes = Array.from({ length: codeCount }, () => {
      let code = generate({
        length: codeLength,
        charset: format === 'numeric' ? 'numeric' : format === 'alphabetic' ? 'alphabetic' : 'alphanumeric',
        capitalization: format === 'alphabetic' ? 'uppercase' : undefined
      });

      // Add separator if specified
      if (separator && codeLength >= 4) {
        const mid = Math.floor(codeLength / 2);
        code = `${code.slice(0, mid)}${separator}${code.slice(mid)}`;
      }

      return code;
    });

    setCodes(newCodes);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateCodes();
  };

  // Copy codes to clipboard
  const copyToClipboard = () => {
    if (codes.length > 0) {
      const text = codes.join('\n');
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setCodes([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Secure Backup Code Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code Length (6-32)
            </label>
            <input
              type="number"
              value={codeLength}
              onChange={(e) => setCodeLength(parseInt(e.target.value))}
              min={6}
              max={32}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Number of Codes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Codes (1-100)
            </label>
            <input
              type="number"
              value={codeCount}
              onChange={(e) => setCodeCount(parseInt(e.target.value))}
              min={1}
              max={100}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="alphanumeric">Alphanumeric</option>
              <option value="numeric">Numeric</option>
              <option value="alphabetic">Alphabetic (Uppercase)</option>
            </select>
          </div>

          {/* Separator Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Separator
            </label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            >
              <option value="">None</option>
              <option value="-">Dash (-)</option>
              <option value=" ">Space</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Codes
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

        {/* Generated Codes */}
        {codes.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Generated Backup Codes</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy All
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
              <ul className="list-disc pl-5 font-mono">
                {codes.map((code, index) => (
                  <li key={index} className="py-1">{code}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Store these codes securely. Each code can typically be used only once.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecureBackupCodeGenerator;