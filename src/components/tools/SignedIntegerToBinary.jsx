'use client';

import React, { useState } from 'react';

const SignedIntegerToBinary = () => {
  const [input, setInput] = useState('');
  const [bitWidth, setBitWidth] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Supported bit widths
  const bitWidths = [8, 16, 32, 64];

  const validateInput = (value) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      setError('Please enter a valid integer');
      return false;
    }
    const max = 2 ** (bitWidth - 1) - 1;
    const min = -(2 ** (bitWidth - 1));
    if (num > max || num < min) {
      setError(`Value must be between ${min} and ${max} for ${bitWidth}-bit`);
      return false;
    }
    return true;
  };

  const toTwosComplement = (num, bits) => {
    if (num >= 0) {
      return num.toString(2).padStart(bits, '0');
    }
    // For negative numbers, calculate two's complement
    const absBinary = Math.abs(num).toString(2).padStart(bits, '0');
    // Step 1: Invert bits
    const inverted = absBinary.split('').map(bit => bit === '0' ? '1' : '0').join('');
    // Step 2: Add 1
    const twosComplement = (parseInt(inverted, 2) + 1).toString(2).padStart(bits, '0');
    return twosComplement;
  };

  const convertToBinary = () => {
    setError('');
    setResult(null);

    if (!input.trim()) {
      setError('Please enter a number');
      return;
    }

    const num = parseInt(input, 10);
    if (!validateInput(input)) return;

    const binary = toTwosComplement(num, bitWidth);
    const decimal = parseInt(binary, 2);
    const hex = parseInt(binary, 2).toString(16).toUpperCase().padStart(Math.ceil(bitWidth / 4), '0');
    const steps = num < 0 ? {
      absolute: Math.abs(num).toString(2).padStart(bitWidth, '0'),
      inverted: binary.split('').map(bit => bit === '0' ? '1' : '0').join(''),
      final: binary,
    } : null;

    setResult({
      binary,
      decimal: num,
      hex,
      steps,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertToBinary();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Signed Integer to Binary Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Signed Integer
              </label>
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`e.g., -5 or 123 (range: -${2 ** (bitWidth - 1)} to ${2 ** (bitWidth - 1) - 1})`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Width
              </label>
              <select
                value={bitWidth}
                onChange={(e) => {
                  setBitWidth(parseInt(e.target.value));
                  setInput('');
                  setResult(null);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bitWidths.map((width) => (
                  <option key={width} value={width}>{width}-bit</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert to Binary
            </button>
          </div>
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
              <div>
                <p className="font-medium">Input:</p>
                <p>Decimal: {result.decimal}</p>
              </div>
              <div>
                <p className="font-medium">Binary Representation ({bitWidth}-bit):</p>
                <p>Binary: {result.binary.match(/.{1,4}/g)?.join(' ') || result.binary}</p>
                <p>Hex: 0x{result.hex}</p>
              </div>
              {result.steps && (
                <div>
                  <p className="font-medium">Two's Complement Steps (for negative numbers):</p>
                  <div className="font-mono text-xs">
                    <p>Absolute: {result.steps.absolute.match(/.{1,4}/g)?.join(' ') || result.steps.absolute}</p>
                    <p>Inverted: {result.steps.inverted.match(/.{1,4}/g)?.join(' ') || result.steps.inverted}</p>
                    <p>+1:       {'0'.repeat(bitWidth - 1) + '1'}</p>
                    <p className="border-t border-gray-300">{'-'.repeat(bitWidth)}</p>
                    <p>Final:    {result.binary.match(/.{1,4}/g)?.join(' ') || result.binary}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts signed integers to binary using two's complement</li>
              <li>Supports 8, 16, 32, and 64-bit widths</li>
              <li>Shows decimal, binary, and hex representations</li>
              <li>Step-by-step two's complement for negative numbers</li>
              <li>Validates input range for selected bit width</li>
              <li>Example: -5 (8-bit) → 11111011</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SignedIntegerToBinary;