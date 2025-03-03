'use client';

import React, { useState } from 'react';

const BinaryShiftRight = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [shiftAmount, setShiftAmount] = useState(1);
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary);
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

  const performShiftRight = () => {
    setError('');
    setResult(null);

    if (!binaryInput.trim()) {
      setError('Please enter a binary number');
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError('Invalid binary input: only 0s and 1s allowed');
      return;
    }

    if (shiftAmount < 0) {
      setError('Shift amount must be non-negative');
      return;
    }

    const decimalInput = binaryToDecimal(binaryInput);
    const shiftedDecimal = decimalInput >>> shiftAmount; // Unsigned right shift
    const paddedInput = padBinary(binaryInput, bitLength);
    const binaryResult = decimalToBinary(shiftedDecimal, bitLength);

    setResult({
      input: paddedInput,
      decimalInput: decimalInput,
      shiftAmount: shiftAmount,
      result: shiftedDecimal,
      binaryResult: binaryResult,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performShiftRight();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Shift Right Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Number
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Amount
                </label>
                <input
                  type="number"
                  min="0"
                  value={shiftAmount}
                  onChange={(e) => setShiftAmount(parseInt(e.target.value) || 0)}
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
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Perform Shift Right
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
              <div>
                <p className="font-medium">Input:</p>
                <p>Binary: {result.input}</p>
                <p>Decimal: {result.decimalInput}</p>
                <p>Hex: {result.decimalInput.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
              </div>
              <div>
                <p className="font-medium">Shift Right by {result.shiftAmount}:</p>
                <p>Binary: {result.binaryResult}</p>
                <p>Decimal: {result.result}</p>
                <p>Hex: {result.result.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
              </div>
              <div>
                <p className="font-medium">Visualization:</p>
                <div className="font-mono text-xs">
                  <p>{result.input} (Input)</p>
                  <p>{'>'.repeat(result.shiftAmount) + ' '.repeat(bitLength - result.shiftAmount)}</p>
                  <p>{result.binaryResult} (Result)</p>
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
              <li>Performs unsigned right shift {`(>>>)`} on binary numbers</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Customizable shift amount</li>
              <li>Shows results in binary, decimal, and hex</li>
              <li>Visualizes the shift operation</li>
              <li>Example: {`1010 >> 1 = 0101 (10 >> 1 = 5)`}</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryShiftRight;