'use client';

import React, { useState } from 'react';

const BinaryShiftLeft = () => {
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

  const performShiftLeft = () => {
    setError('');
    setResult(null);

    if (!binaryInput) {
      setError('Please enter a binary number');
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError('Invalid binary input: Must contain only 0s and 1s');
      return;
    }

    if (shiftAmount < 0) {
      setError('Shift amount must be non-negative');
      return;
    }

    const decimal = binaryToDecimal(binaryInput);
    const shiftedDecimal = decimal << shiftAmount;
    const paddedInput = padBinary(binaryInput, bitLength);
    const binaryResult = decimalToBinary(shiftedDecimal, bitLength);

    // Generate step-by-step visualization
    const steps = [];
    let current = decimal;
    for (let i = 0; i < Math.min(shiftAmount, bitLength); i++) {
      current = current << 1;
      steps.push(decimalToBinary(current, bitLength));
    }

    setResult({
      input: paddedInput,
      decimalInput: decimal,
      shiftAmount,
      resultDecimal: shiftedDecimal,
      resultBinary: binaryResult,
      steps: steps,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performShiftLeft();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Shift Left Converter
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

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Amount
                </label>
                <input
                  type="number"
                  value={shiftAmount}
                  onChange={(e) => setShiftAmount(parseInt(e.target.value) || 0)}
                  min="0"
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
            Shift Left
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
                <p>Binary: {result.input} (decimal: {result.decimalInput})</p>
              </div>
              <div>
                <p className="font-medium">Shifted Result:</p>
                <p>Binary: {result.resultBinary}</p>
                <p>Decimal: {result.resultDecimal}</p>
                <p>Hex: {result.resultDecimal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
              </div>
              {result.steps.length > 0 && (
                <div>
                  <p className="font-medium">Step-by-Step Shift (First {result.steps.length} shifts):</p>
                  <div className="font-mono text-xs">
                    <p>{result.input} (Initial)</p>
                    {result.steps.map((step, index) => (
                      <p key={index}>{step} (Shift {index + 1})</p>
                    ))}
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
              <li>Performs left shift {`(<<)`} on binary numbers</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Shows results in binary, decimal, and hex</li>
              <li>Visualizes shift steps up to bit length</li>
              <li>Example:{` 1010 << 1 = 10100 (10 << 1 = 20)`}</li>
              <li>Bits shifted beyond length are discarded</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryShiftLeft;