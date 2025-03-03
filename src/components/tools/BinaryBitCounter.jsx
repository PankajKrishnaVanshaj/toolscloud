'use client';

import React, { useState } from 'react';

const BinaryBitCounter = () => {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('binary'); // binary, decimal, hex
  const [bitLength, setBitLength] = useState(8); // 8, 16, 32, 64
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateInput = (value, type) => {
    switch (type) {
      case 'binary':
        return /^[01]+$/.test(value);
      case 'decimal':
        return /^\d+$/.test(value) && BigInt(value) <= (2n ** BigInt(bitLength)) - 1n;
      case 'hex':
        return /^[0-9A-Fa-f]+$/.test(value) && BigInt(`0x${value}`) <= (2n ** BigInt(bitLength)) - 1n;
      default:
        return false;
    }
  };

  const convertToBinary = (value, type) => {
    switch (type) {
      case 'binary':
        return value;
      case 'decimal':
        return BigInt(value).toString(2);
      case 'hex':
        return BigInt(`0x${value}`).toString(2);
      default:
        return '';
    }
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  const countBits = (binary) => {
    return binary.split('').reduce((count, bit) => count + (bit === '1' ? 1 : 0), 0);
  };

  const analyzeBits = () => {
    setError('');
    setResult(null);

    if (!input.trim()) {
      setError('Please enter a value');
      return;
    }

    if (!validateInput(input, inputType)) {
      setError(`Invalid ${inputType} input`);
      return;
    }

    const binary = convertToBinary(input, inputType);
    const paddedBinary = padBinary(binary, bitLength);
    const bitCount = countBits(paddedBinary);
    const decimal = BigInt(`0b${paddedBinary}`).toString();
    const hex = BigInt(`0b${paddedBinary}`).toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0');
    
    // Bit positions (0-based, right to left)
    const bitPositions = paddedBinary
      .split('')
      .reverse()
      .map((bit, index) => ({ position: index, value: bit }))
      .filter(bit => bit.value === '1');

    setResult({
      binary: paddedBinary,
      decimal,
      hex,
      bitCount,
      bitPositions,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeBits();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Bit Counter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Input Value
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter ${inputType} value`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Type
                </label>
                <select
                  value={inputType}
                  onChange={(e) => {
                    setInputType(e.target.value);
                    setInput('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="binary">Binary</option>
                  <option value="decimal">Decimal</option>
                  <option value="hex">Hexadecimal</option>
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
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                  <option value={32}>32-bit</option>
                  <option value={64}>64-bit</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Count Bits
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
                <p className="font-medium">Representations:</p>
                <p>Binary: {result.binary}</p>
                <p>Decimal: {result.decimal}</p>
                <p>Hex: {result.hex}</p>
              </div>
              <div>
                <p className="font-medium">Bit Count:</p>
                <p>Total Set Bits (1s): {result.bitCount}</p>
              </div>
              <div>
                <p className="font-medium">Bit Positions (Set Bits):</p>
                {result.bitPositions.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {result.bitPositions.map((bit) => (
                      <li key={bit.position}>
                        Position {bit.position} (right-to-left, 0-based)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No set bits (all 0s)</p>
                )}
              </div>
              <div>
                <p className="font-medium">Visualization:</p>
                <div className="font-mono text-xs">
                  <p>{result.binary.split('').join(' ')}</p>
                  <p>
                    {result.binary
                      .split('')
                      .map((bit, i) => (bit === '1' ? '↑' : ' '))
                      .join(' ')}
                  </p>
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
              <li>Counts set bits (1s) in binary numbers</li>
              <li>Supports binary, decimal, and hex input</li>
              <li>Configurable bit length (8, 16, 32, 64)</li>
              <li>Shows bit positions and visualization</li>
              <li>Examples:
                <ul className="list-circle list-inside ml-4">
                  <li>Binary: 1010 → 2 bits</li>
                  <li>Decimal: 10 → 2 bits</li>
                  <li>Hex: A → 2 bits</li>
                </ul>
              </li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryBitCounter;