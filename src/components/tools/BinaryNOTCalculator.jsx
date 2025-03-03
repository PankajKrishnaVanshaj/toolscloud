'use client';

import React, { useState } from 'react';

const BinaryNOTCalculator = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Validate binary input
  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary);
  };

  // Pad binary to specified length
  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  // Convert binary to decimal
  const binaryToDecimal = (binary) => {
    return parseInt(binary, 2);
  };

  // Convert decimal to binary with padding
  const decimalToBinary = (decimal, length) => {
    return decimal.toString(2).padStart(length, '0');
  };

  // Perform NOT operation
  const performNOT = () => {
    setError('');
    setResult(null);

    if (!binaryInput.trim()) {
      setError('Please enter a binary number');
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError('Invalid binary input: only 0s and 1s are allowed');
      return;
    }

    const paddedInput = padBinary(binaryInput, bitLength);
    const decimalInput = binaryToDecimal(paddedInput);
    
    // Bitwise NOT (~) inverts all bits, but we need to mask to bit length
    const mask = (1 << bitLength) - 1; // e.g., for 8-bit: 11111111 (255)
    const notResult = (~decimalInput) & mask;
    const binaryResult = decimalToBinary(notResult, bitLength);

    setResult({
      input: paddedInput,
      decimalInput: decimalInput,
      notResult: notResult,
      binaryResult: binaryResult,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performNOT();
  };

  const clearInput = () => {
    setBinaryInput('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary NOT Calculator
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Calculate NOT
            </button>
            <button
              type="button"
              onClick={clearInput}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear
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
                <p>Binary: {result.input}</p>
                <p>Decimal: {result.decimalInput}</p>
                <p>Hex: {result.decimalInput.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
              </div>
              <div>
                <p className="font-medium">NOT Result (~):</p>
                <p>Binary: {result.binaryResult}</p>
                <p>Decimal: {result.notResult}</p>
                <p>Hex: {result.notResult.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
              </div>
              <div>
                <p className="font-medium">Operation Visualization:</p>
                <div className="font-mono text-xs">
                  <p> Input: {result.input}</p>
                  <p>NOT (~): {result.binaryResult}</p>
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
              <li>Performs bitwise NOT (~) operation on binary input</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Shows results in binary, decimal, and hex</li>
              <li>Visualizes the bit inversion</li>
              <li>Input example: ~1010 (8-bit) = 11110101</li>
              <li>Clear button to reset the form</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryNOTCalculator;