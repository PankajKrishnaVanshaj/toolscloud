// components/SecurePINGenerator.js
'use client';

import React, { useState } from 'react';
import { generate } from 'randomstring';

const SecurePINGenerator = () => {
  const [pinLength, setPinLength] = useState(4);
  const [pinCount, setPinCount] = useState(1);
  const [includeLetters, setIncludeLetters] = useState(false);
  const [separator, setSeparator] = useState(''); // '', '-', ' '
  const [pins, setPins] = useState([]);
  const [error, setError] = useState('');

  // Generate secure PINs
  const generatePins = () => {
    setError('');
    setPins([]);

    if (pinLength < 4 || pinLength > 16) {
      setError('PIN length must be between 4 and 16 characters');
      return;
    }
    if (pinCount < 1 || pinCount > 50) {
      setError('Number of PINs must be between 1 and 50');
      return;
    }

    const newPins = Array.from({ length: pinCount }, () => {
      let pin = generate({
        length: pinLength,
        charset: includeLetters ? 'alphanumeric' : 'numeric',
        capitalization: includeLetters ? 'uppercase' : undefined
      });

      // Add separator if specified and length allows
      if (separator && pinLength >= 4) {
        const mid = Math.floor(pinLength / 2);
        pin = `${pin.slice(0, mid)}${separator}${pin.slice(mid)}`;
      }

      return pin;
    });

    setPins(newPins);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generatePins();
  };

  // Copy PINs to clipboard
  const copyToClipboard = () => {
    if (pins.length > 0) {
      const text = pins.join('\n');
      navigator.clipboard.writeText(text);
    }
  };

  // Clear all
  const clearAll = () => {
    setPins([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Secure PIN Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PIN Length */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PIN Length (4-16)
            </label>
            <input
              type="number"
              value={pinLength}
              onChange={(e) => setPinLength(parseInt(e.target.value))}
              min={4}
              max={16}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Number of PINs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of PINs (1-50)
            </label>
            <input
              type="number"
              value={pinCount}
              onChange={(e) => setPinCount(parseInt(e.target.value))}
              min={1}
              max={50}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Include Letters */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={includeLetters}
                onChange={(e) => setIncludeLetters(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-200"
              />
              Include Letters (A-Z)
            </label>
            <p className="text-xs text-gray-500 mt-1">
              If checked, generates alphanumeric PINs; otherwise, numeric only.
            </p>
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
              Generate PINs
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

        {/* Generated PINs */}
        {pins.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Generated PINs</h2>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy All
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
              <ul className="list-disc pl-5 font-mono">
                {pins.map((pin, index) => (
                  <li key={index} className="py-1">{pin}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Store these PINs securely. Use them for temporary access or authentication purposes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurePINGenerator;