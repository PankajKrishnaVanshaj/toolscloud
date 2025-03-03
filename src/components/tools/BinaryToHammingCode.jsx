'use client';

import React, { useState } from 'react';

const BinaryToHammingCode = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [parityBits, setParityBits] = useState(4); // Default to 4 parity bits
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const calculateHammingCode = (binary) => {
    const dataBits = binary.length;
    const totalBits = dataBits + parityBits;

    // Check if parity bits are sufficient
    if (2 ** parityBits <= totalBits) {
      setError(`Need at least ${Math.ceil(Math.log2(totalBits + 1))} parity bits for ${dataBits} data bits`);
      return null;
    }

    // Initialize array with positions (1-based indexing)
    const hamming = new Array(totalBits + 1).fill(0);
    let dataIndex = 0;

    // Place data bits, skipping parity positions (powers of 2)
    for (let i = 1; i <= totalBits; i++) {
      if (!isPowerOfTwo(i)) {
        hamming[i] = parseInt(binary[dataIndex]);
        dataIndex++;
      }
    }

    // Calculate parity bits
    for (let p = 0; p < parityBits; p++) {
      const parityPos = 2 ** p;
      let parity = 0;
      for (let i = parityPos; i <= totalBits; i += 2 * parityPos) {
        for (let j = i; j < i + parityPos && j <= totalBits; j++) {
          parity ^= hamming[j];
        }
      }
      hamming[parityPos] = parity;
    }

    return hamming.slice(1); // Remove 0th index
  };

  const isPowerOfTwo = (n) => (n & (n - 1)) === 0 && n !== 0;

  const handleConvert = () => {
    setError('');
    setResult(null);

    if (!binaryInput) {
      setError('Please enter a binary number');
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError('Invalid binary input: use only 0s and 1s');
      return;
    }

    const hammingCode = calculateHammingCode(binaryInput);
    if (hammingCode) {
      setResult({
        original: binaryInput,
        hammingCode: hammingCode.join(''),
        parityPositions: Array.from({ length: parityBits }, (_, i) => 2 ** i),
        totalBits: hammingCode.length,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConvert();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Hamming Code Converter
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
                placeholder="e.g., 1011001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Parity Bits
              </label>
              <select
                value={parityBits}
                onChange={(e) => setParityBits(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Generate Hamming Code
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
            <h2 className="text-lg font-semibold mb-2">Hamming Code Result:</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Original Binary:</p>
                <p>{result.original}</p>
              </div>
              <div>
                <p className="font-medium">Hamming Code:</p>
                <p className="font-mono">{result.hammingCode}</p>
                <p>Total Bits: {result.totalBits}</p>
              </div>
              <div>
                <p className="font-medium">Detailed Breakdown:</p>
                <div className="font-mono text-xs">
                  <p>Position: {Array.from({ length: result.totalBits }, (_, i) => String(i + 1).padStart(2, ' ')).join(' ')}</p>
                  <p>Bits:     {result.hammingCode.split('').map((bit, i) => bit.padStart(2, ' ')).join(' ')}</p>
                  <p>Parity:   {Array.from({ length: result.totalBits }, (_, i) => 
                    result.parityPositions.includes(i + 1) ? 'P' : 'D').map(x => x.padStart(2, ' ')).join(' ')}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Parity Bit Positions:</p>
                <p>{result.parityPositions.join(', ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts binary to Hamming Code with error correction</li>
              <li>Customizable number of parity bits (3-8)</li>
              <li>Visualizes bit positions (P for parity, D for data)</li>
              <li>Validates binary input</li>
              <li>Example: 1011 with 4 parity bits → 00110110011</li>
              <li>Parity bits at positions 1, 2, 4, 8, etc.</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToHammingCode;