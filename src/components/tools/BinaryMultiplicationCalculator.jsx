'use client';

import React, { useState } from 'react';

const BinaryMultiplicationCalculator = () => {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(true);

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, '0');

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, '0');

  const multiplyBinary = (bin1, bin2) => {
    setError('');
    setResult(null);

    // Validate inputs
    if (!num1 || !num2) {
      setError('Please enter both binary numbers');
      return;
    }
    if (!validateBinary(num1) || !validateBinary(num2)) {
      setError('Invalid binary input: only 0s and 1s are allowed');
      return;
    }

    // Convert to decimal for multiplication
    const dec1 = binaryToDecimal(num1);
    const dec2 = binaryToDecimal(num2);
    const product = dec1 * dec2;

    // Check for overflow
    const maxValue = Math.pow(2, bitLength) - 1;
    if (product > maxValue) {
      setError(`Result exceeds ${bitLength}-bit limit (${maxValue})`);
      return;
    }

    // Generate steps for visualization
    const steps = [];
    const paddedNum1 = padBinary(num1, bitLength);
    const paddedNum2 = padBinary(num2, bitLength);
    const intermediates = [];

    for (let i = num2.length - 1; i >= 0; i--) {
      if (num2[i] === '1') {
        const shifted = paddedNum1 + '0'.repeat(num2.length - 1 - i);
        intermediates.push(shifted.padStart(bitLength + num2.length - 1, '0'));
      }
    }

    let currentSum = intermediates.length > 0 ? binaryToDecimal(intermediates[0]) : 0;
    steps.push(`Step 1: ${intermediates[0] || '0'.repeat(bitLength)}`);

    for (let i = 1; i < intermediates.length; i++) {
      currentSum += binaryToDecimal(intermediates[i]);
      steps.push(`Step ${i + 1}: + ${intermediates[i]} = ${decimalToBinary(currentSum, bitLength)}`);
    }

    const binaryResult = decimalToBinary(product, bitLength);

    setResult({
      num1: paddedNum1,
      num2: paddedNum2,
      decimalNum1: dec1,
      decimalNum2: dec2,
      product: product,
      binaryResult: binaryResult,
      hexResult: product.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0'),
      steps: steps,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    multiplyBinary(num1, num2);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Multiplication Calculator
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Binary Number
              </label>
              <input
                type="text"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Second Binary Number
              </label>
              <input
                type="text"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                placeholder="e.g., 1100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="grid gap-4 md:grid-cols-2">
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={(e) => setShowSteps(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Show Multiplication Steps
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
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
                <p className="font-medium">Inputs:</p>
                <p>{result.num1} (decimal: {result.decimalNum1})</p>
                <p>× {result.num2} (decimal: {result.decimalNum2})</p>
              </div>
              <div>
                <p className="font-medium">Product:</p>
                <p>Binary: {result.binaryResult}</p>
                <p>Decimal: {result.product}</p>
                <p>Hex: {result.hexResult}</p>
              </div>
              {showSteps && result.steps.length > 0 && (
                <div>
                  <p className="font-medium">Multiplication Steps:</p>
                  <div className="font-mono text-xs space-y-1">
                    {result.steps.map((step, index) => (
                      <p key={index}>{step}</p>
                    ))}
                    <p className="border-t border-gray-300 pt-1">
                      Result: {result.binaryResult}
                    </p>
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
              <li>Multiply two binary numbers</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Shows step-by-step multiplication process</li>
              <li>Results in binary, decimal, and hex</li>
              <li>Overflow detection</li>
              <li>Example: 1010 × 11 = 11110 (10 × 3 = 30)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryMultiplicationCalculator;