// components/SecureRandomNumberGenerator.js
'use client';

import React, { useState } from 'react';

const SecureRandomNumberGenerator = () => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState('decimal'); // decimal, hex, binary
  const [numbers, setNumbers] = useState([]);
  const [error, setError] = useState('');

  // Generate secure random numbers
  const generateNumbers = () => {
    setError('');
    setNumbers([]);

    // Input validation
    if (isNaN(min) || isNaN(max) || min >= max) {
      setError('Minimum must be less than Maximum');
      return;
    }
    if (isNaN(count) || count < 1 || count > 100) {
      setError('Count must be between 1 and 100');
      return;
    }
    if (max - min > 2 ** 32) { // Limit range to 32-bit unsigned int for simplicity
      setError('Range too large (max - min must be ≤ 4,294,967,295)');
      return;
    }

    try {
      const range = max - min + 1;
      const results = [];

      for (let i = 0; i < count; i++) {
        // Use Web Crypto API for secure randomness
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        const randomValue = array[0] % range + min; // Scale to [min, max]

        let formattedValue;
        switch (format) {
          case 'hex':
            formattedValue = randomValue.toString(16).toUpperCase();
            break;
          case 'binary':
            formattedValue = randomValue.toString(2);
            break;
          case 'decimal':
          default:
            formattedValue = randomValue.toString(10);
            break;
        }

        results.push(formattedValue);
      }

      setNumbers(results);
    } catch (err) {
      setError('Generation failed: ' + err.message);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    generateNumbers();
  };

  // Copy numbers to clipboard
  const copyToClipboard = () => {
    if (numbers.length > 0) {
      const text = numbers.join('\n');
      navigator.clipboard.writeText(text);
    }
  };

  // Download numbers as a text file
  const downloadAsFile = () => {
    if (numbers.length > 0) {
      const blob = new Blob([numbers.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `random_numbers_${format}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setMin(1);
    setMax(100);
    setCount(1);
    setFormat('decimal');
    setNumbers([]);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Secure Random Number Generator</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Minimum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Value
            </label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(parseInt(e.target.value))}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="e.g., 1"
            />
          </div>

          {/* Maximum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Value
            </label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(parseInt(e.target.value))}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
              placeholder="e.g., 100"
            />
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Values (1-100)
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              min={1}
              max={100}
              className="w-full p-2 border rounded focus:ring focus:ring-blue-200"
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
              <option value="decimal">Decimal</option>
              <option value="hex">Hexadecimal</option>
              <option value="binary">Binary</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Numbers
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

        {/* Generated Numbers */}
        {numbers.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Generated Numbers</h2>
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
            <div className="bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
              <ul className="list-disc pl-5 font-mono text-sm">
                {numbers.map((number, index) => (
                  <li key={index} className="py-1">{number}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Count: {numbers.length} | Format: {format.charAt(0).toUpperCase() + format.slice(1)}
            </p>
          </div>
        )}

        {/* Note */}
        <p className="text-sm text-gray-600 mt-4">
          <strong>Note:</strong> Uses Web Crypto API for cryptographically secure random numbers. Suitable for security-sensitive applications (e.g., tokens, keys).
        </p>
      </div>
    </div>
  );
};

export default SecureRandomNumberGenerator;