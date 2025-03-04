'use client';

import React, { useState } from 'react';

const HexToDecimal = () => {
  const [hexInput, setHexInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [prefix, setPrefix] = useState('none'); // 'none', '0x', '#'

  const validateHex = (hex) => {
    const cleanHex = prefix === '0x' ? hex.replace(/^0x/i, '') : prefix === '#' ? hex.replace(/^#/, '') : hex;
    const regex = caseSensitive ? /^[0-9A-F]+$/ : /^[0-9A-Fa-f]+$/;
    return regex.test(cleanHex);
  };

  const hexToDecimal = (hex) => {
    const cleanHex = prefix === '0x' ? hex.replace(/^0x/i, '') : prefix === '#' ? hex.replace(/^#/, '') : hex;
    return parseInt(cleanHex, 16);
  };

  const decimalToHex = (decimal) => {
    const hex = decimal.toString(16).toUpperCase();
    return prefix === '0x' ? `0x${hex}` : prefix === '#' ? `#${hex}` : hex;
  };

  const decimalToBinary = (decimal) => decimal.toString(2);
  const decimalToOctal = (decimal) => decimal.toString(8);

  const handleConvert = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!hexInput.trim()) {
      setError('Please enter a hexadecimal number');
      return;
    }

    const hexValues = hexInput.split(/[\s,]+/).filter(val => val); // Split by space or comma
    const results = [];

    for (const hex of hexValues) {
      if (!validateHex(hex)) {
        setError(`Invalid hexadecimal input: ${hex}`);
        return;
      }

      const decimal = hexToDecimal(hex);
      results.push({
        hex: hex,
        decimal: decimal,
        binary: decimalToBinary(decimal),
        octal: decimalToOctal(decimal),
      });
    }

    setResult(results);
  };

  const handleInputChange = (value) => {
    setHexInput(value);
    setError('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Hex to Decimal Converter
        </h1>

        <form onSubmit={handleConvert} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hexadecimal Input
              </label>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={prefix === '0x' ? 'e.g., 0x1A, 0xFF' : prefix === '#' ? 'e.g., #1A, #FF' : 'e.g., 1A, FF'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple values with spaces or commas
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefix Style
                </label>
                <select
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None (e.g., 1A)</option>
                  <option value="0x">0x (e.g., 0x1A)</option>
                  <option value="#"># (e.g., #1A)</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Case Sensitive (A-F only)
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert
          </button>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Results:</h2>
            <div className="space-y-4 text-sm">
              {result.map((res, index) => (
                <div key={index} className="border-b pb-2 last:border-b-0">
                  <p><span className="font-medium">Hex:</span> {res.hex}</p>
                  <p><span className="font-medium">Decimal:</span> {res.decimal.toLocaleString()}</p>
                  <p><span className="font-medium">Binary:</span> {res.binary}</p>
                  <p><span className="font-medium">Octal:</span> {res.octal}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert hex to decimal, binary, and octal</li>
              <li>Supports multiple inputs (space or comma-separated)</li>
              <li>Prefix options: none, 0x, or #</li>
              <li>Case sensitivity toggle</li>
              <li>Examples: 1A, 0xFF, #A3B</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default HexToDecimal;