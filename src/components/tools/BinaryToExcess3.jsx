'use client';

import React, { useState } from 'react';

const BinaryToExcess3 = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [bitLength, setBitLength] = useState(4); // Default to 4-bit per digit (standard for BCD)
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary) && binary.length % bitLength === 0;
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  const binaryToDecimal = (binary) => {
    return parseInt(binary, 2);
  };

  const decimalToBinary = (decimal, length) => {
    return decimal.toString(2).padStart(length, '0');
  };

  const convertToExcess3 = (binary) => {
    setError('');
    setResult(null);

    if (!binary.trim()) {
      setError('Please enter a binary number');
      return;
    }

    if (!validateBinary(binary)) {
      setError(`Invalid binary input: Must be a multiple of ${bitLength} bits and contain only 0s and 1s`);
      return;
    }

    // Split binary into groups of bitLength (typically 4 for BCD)
    const chunks = binary.match(new RegExp(`.{1,${bitLength}}`, 'g'));
    const decimals = chunks.map(chunk => binaryToDecimal(chunk));
    
    // Check if any decimal exceeds 9 (valid BCD range is 0-9)
    if (decimals.some(d => d > 9)) {
      setError('Binary input exceeds valid BCD range (0-9 per group)');
      return;
    }

    // Convert to Excess-3 by adding 3 to each decimal
    const excess3Decimals = decimals.map(d => d + 3);
    const excess3Binary = excess3Decimals.map(d => decimalToBinary(d, bitLength));
    const excess3String = excess3Binary.join('');

    setResult({
      binary: binary,
      paddedBinary: padBinary(binary, Math.ceil(binary.length / bitLength) * bitLength),
      decimals: decimals,
      excess3Decimals: excess3Decimals,
      excess3Binary: excess3Binary,
      excess3String: excess3String,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertToExcess3(binaryInput);
  };

  const handleBitLengthChange = (value) => {
    setBitLength(value);
    setResult(null); // Reset result when bit length changes
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Excess-3 Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input (BCD)
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder={`e.g., 0101 (5 in BCD)`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length per Digit
              </label>
              <select
                value={bitLength}
                onChange={(e) => handleBitLengthChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4-bit (Standard BCD)</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert to Excess-3
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
            <h2 className="text-lg font-semibold mb-2">Conversion Results:</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Input:</p>
                <p>Binary (BCD): {result.paddedBinary} ({result.binary.length} bits)</p>
                <p>Decimal: {result.decimals.join(' ')}</p>
              </div>
              <div>
                <p className="font-medium">Excess-3 Output:</p>
                <p>Binary: {result.excess3String}</p>
                <p>Decimal: {result.excess3Decimals.join(' ')}</p>
              </div>
              <div>
                <p className="font-medium">Step-by-Step Conversion:</p>
                <div className="font-mono text-xs">
                  {result.binary.match(new RegExp(`.{1,${bitLength}}`, 'g')).map((chunk, index) => (
                    <div key={index} className="mb-2">
                      <p>{padBinary(chunk, bitLength)} (BCD: {result.decimals[index]})</p>
                      <p>+ 0011 (+3)</p>
                      <p className="border-t border-gray-300">{'-'.repeat(bitLength)}</p>
                      <p>{result.excess3Binary[index]} (Excess-3: {result.excess3Decimals[index]})</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts BCD binary to Excess-3 code</li>
              <li>Supports 4, 8, or 16-bit per digit</li>
              <li>Validates input as binary and BCD (0-9 per group)</li>
              <li>Shows step-by-step conversion process</li>
              <li>Input must be multiple of bit length</li>
              <li>Example: 0101 (5) → 1000 (8 in Excess-3)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToExcess3;