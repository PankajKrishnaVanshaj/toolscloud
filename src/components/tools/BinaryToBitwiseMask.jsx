'use client';

import React, { useState } from 'react';

const BinaryToBitwiseMask = () => {
  const [input, setInput] = useState(''); // Single binary input
  const [mask, setMask] = useState('');  // Binary mask
  const [operation, setOperation] = useState('AND'); // AND, OR, XOR, NOT
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, '0');

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, '0');

  const performBitwiseOperation = () => {
    setError('');
    setResult(null);

    if (!input || !mask && operation !== 'NOT') {
      setError('Please enter a binary input' + (operation !== 'NOT' ? ' and mask' : ''));
      return;
    }

    if (!validateBinary(input) || (mask && !validateBinary(mask))) {
      setError('Invalid binary input: Only 0s and 1s are allowed');
      return;
    }

    const paddedInput = padBinary(input, bitLength);
    const paddedMask = operation === 'NOT' ? '' : padBinary(mask, bitLength);
    const inputDecimal = binaryToDecimal(paddedInput);
    const maskDecimal = operation === 'NOT' ? 0 : binaryToDecimal(paddedMask);

    let resultDecimal;
    switch (operation) {
      case 'AND':
        resultDecimal = inputDecimal & maskDecimal;
        break;
      case 'OR':
        resultDecimal = inputDecimal | maskDecimal;
        break;
      case 'XOR':
        resultDecimal = inputDecimal ^ maskDecimal;
        break;
      case 'NOT':
        resultDecimal = ~inputDecimal & ((1 << bitLength) - 1); // Mask to bit length
        break;
      default:
        setError('Invalid operation');
        return;
    }

    const binaryResult = decimalToBinary(resultDecimal, bitLength);

    setResult({
      input: paddedInput,
      mask: paddedMask,
      inputDecimal,
      maskDecimal,
      resultDecimal,
      binaryResult,
      operation,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBitwiseOperation();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Bitwise Mask Converter
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
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {operation !== 'NOT' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Binary Mask
                </label>
                <input
                  type="text"
                  value={mask}
                  onChange={(e) => setMask(e.target.value)}
                  placeholder="e.g., 1100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operation
                </label>
                <select
                  value={operation}
                  onChange={(e) => setOperation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                  <option value="XOR">XOR</option>
                  <option value="NOT">NOT</option>
                </select>
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
            Calculate Bitwise Result
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
                <p>Decimal: {result.inputDecimal}</p>
                <p>Hex: {result.inputDecimal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
              </div>
              {operation !== 'NOT' && (
                <div>
                  <p className="font-medium">Mask:</p>
                  <p>Binary: {result.mask}</p>
                  <p>Decimal: {result.maskDecimal}</p>
                  <p>Hex: {result.maskDecimal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Result ({operation}):</p>
                <p>Binary: {result.binaryResult}</p>
                <p>Decimal: {result.resultDecimal}</p>
                <p>Hex: {result.resultDecimal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
              </div>
              <div>
                <p className="font-medium">Operation Visualization:</p>
                <div className="font-mono text-xs">
                  <p>{result.input} (Input)</p>
                  {operation !== 'NOT' && <p>{result.mask} (Mask)</p>}
                  <p className="border-t border-gray-300">{'-'.repeat(bitLength)}</p>
                  <p>{result.binaryResult} ({operation})</p>
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
              <li>Apply bitwise masks (AND, OR, XOR, NOT) to binary input</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Visualizes the bitwise operation</li>
              <li>Shows results in binary, decimal, and hex</li>
              <li>Examples: 
                <ul className="list-circle list-inside ml-4">
                  <li>1010 AND 1100 = 1000</li>
                  <li>1010 OR 1100 = 1110</li>
                  <li>1010 XOR 1100 = 0110</li>
                  <li>NOT 1010 = 0101 (8-bit)</li>
                </ul>
              </li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBitwiseMask;