'use client';

import React, { useState } from 'react';

const BinarySubtractionCalculator = () => {
  const [minuend, setMinuend] = useState(''); // First number (minuend)
  const [subtrahend, setSubtrahend] = useState(''); // Second number (subtrahend)
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState([]);

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
    if (decimal < 0) {
      // Handle negative numbers using two's complement
      const positiveBinary = (Math.pow(2, length) + decimal).toString(2);
      return padBinary(positiveBinary, length);
    }
    return decimal.toString(2).padStart(length, '0');
  };

  const performBinarySubtraction = () => {
    setError('');
    setResult(null);
    setSteps([]);

    if (!minuend || !subtrahend) {
      setError('Please enter both binary numbers');
      return;
    }

    if (!validateBinary(minuend) || !validateBinary(subtrahend)) {
      setError('Invalid binary input: only 0s and 1s are allowed');
      return;
    }

    // Pad inputs to the selected bit length
    const paddedMinuend = padBinary(minuend, bitLength);
    const paddedSubtrahend = padBinary(subtrahend, bitLength);

    // Convert to decimal for subtraction
    const decMinuend = binaryToDecimal(paddedMinuend);
    const decSubtrahend = binaryToDecimal(paddedSubtrahend);
    const decResult = decMinuend - decSubtrahend;

    // Perform binary subtraction step-by-step using two's complement
    const stepsArray = [];
    stepsArray.push(`1. Minuend: ${paddedMinuend} (${decMinuend} decimal)`);
    stepsArray.push(`2. Subtrahend: ${paddedSubtrahend} (${decSubtrahend} decimal)`);

    // Two's complement subtraction: minuend + (-subtrahend)
    const subtrahendComplement = decimalToBinary(-decSubtrahend, bitLength);
    stepsArray.push(`3. Two's Complement of Subtrahend: ${subtrahendComplement}`);

    // Perform binary addition
    let carry = 0;
    let binaryResult = '';
    for (let i = bitLength - 1; i >= 0; i--) {
      const m = parseInt(paddedMinuend[i]);
      const s = parseInt(subtrahendComplement[i]);
      const sum = m + s + carry;
      binaryResult = (sum % 2) + binaryResult;
      carry = Math.floor(sum / 2);
    }
    binaryResult = binaryResult.slice(-bitLength); // Truncate to bit length
    stepsArray.push(`4. Addition (Minuend + Complement): ${binaryResult}`);

    const finalDecimal = binaryToDecimal(binaryResult);
    setResult({
      minuend: paddedMinuend,
      subtrahend: paddedSubtrahend,
      binaryResult,
      decimalResult: finalDecimal,
      hexResult: finalDecimal < 0 
        ? (Math.pow(2, bitLength) + finalDecimal).toString(16).toUpperCase().padStart(bitLength / 4, '0')
        : finalDecimal.toString(16).toUpperCase().padStart(bitLength / 4, '0'),
    });
    setSteps(stepsArray);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBinarySubtraction();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Subtraction Calculator
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minuend (First Number)
              </label>
              <input
                type="text"
                value={minuend}
                onChange={(e) => setMinuend(e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtrahend (Second Number)
              </label>
              <input
                type="text"
                value={subtrahend}
                onChange={(e) => setSubtrahend(e.target.value)}
                placeholder="e.g., 0011"
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

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Subtraction
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
                <p>Minuend: {result.minuend} ({binaryToDecimal(result.minuend)} decimal)</p>
                <p>Subtrahend: {result.subtrahend} ({binaryToDecimal(result.subtrahend)} decimal)</p>
              </div>
              <div>
                <p className="font-medium">Result:</p>
                <p>Binary: {result.binaryResult}</p>
                <p>Decimal: {result.decimalResult}</p>
                <p>Hex: {result.hexResult}</p>
              </div>
              <div>
                <p className="font-medium">Step-by-Step Process:</p>
                <div className="font-mono text-xs space-y-1">
                  {steps.map((step, index) => (
                    <p key={index}>{step}</p>
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
              <li>Performs binary subtraction using two's complement</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Shows step-by-step process</li>
              <li>Displays results in binary, decimal, and hex</li>
              <li>Handles negative results</li>
              <li>Example: 1010 - 0011 = 0111 (10 - 3 = 7)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinarySubtractionCalculator;