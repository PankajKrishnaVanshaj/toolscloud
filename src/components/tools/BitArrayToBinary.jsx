'use client';

import React, { useState } from 'react';

const BitArrayToBinary = () => {
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [bits, setBits] = useState(new Array(8).fill(false)); // Array of bits (true = 1, false = 0)
  const [binary, setBinary] = useState('');
  const [decimal, setDecimal] = useState(0);
  const [hex, setHex] = useState('');
  const [error, setError] = useState('');

  const updateValues = (newBits) => {
    const binaryStr = newBits.map(bit => (bit ? '1' : '0')).join('');
    const decimalVal = parseInt(binaryStr, 2);
    const hexVal = decimalVal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0');

    setBinary(binaryStr);
    setDecimal(decimalVal);
    setHex(hexVal);
  };

  const handleBitChange = (index) => {
    setError('');
    const newBits = [...bits];
    newBits[index] = !newBits[index];
    setBits(newBits);
    updateValues(newBits);
  };

  const handleBitLengthChange = (newLength) => {
    setError('');
    const newBits = new Array(newLength).fill(false);
    // Preserve existing bits if possible
    for (let i = 0; i < Math.min(bits.length, newLength); i++) {
      newBits[i] = bits[i];
    }
    setBitLength(newLength);
    setBits(newBits);
    updateValues(newBits);
  };

  const handleBinaryInput = (value) => {
    setError('');
    if (/^[01]*$/.test(value) && value.length <= bitLength) {
      const newBits = new Array(bitLength).fill(false);
      for (let i = 0; i < value.length; i++) {
        newBits[bitLength - value.length + i] = value[i] === '1';
      }
      setBits(newBits);
      updateValues(newBits);
    } else {
      setError(`Invalid binary input or exceeds ${bitLength} bits`);
    }
  };

  const clearBits = () => {
    const newBits = new Array(bitLength).fill(false);
    setBits(newBits);
    updateValues(newBits);
    setError('');
  };

  const exportValues = () => {
    const data = {
      bits: bits,
      binary: binary,
      decimal: decimal,
      hex: hex,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bit_array.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Bit Array to Binary Converter
        </h1>

        <div className="grid gap-6">
          {/* Bit Length Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bit Length
            </label>
            <select
              value={bitLength}
              onChange={(e) => handleBitLengthChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={4}>4-bit</option>
              <option value={8}>8-bit</option>
              <option value={16}>16-bit</option>
              <option value={32}>32-bit</option>
            </select>
          </div>

          {/* Bit Array Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bit Array (MSB to LSB)
            </label>
            <div className="grid grid-cols-8 gap-2">
              {bits.map((bit, index) => (
                <div key={index} className="flex flex-col items-center">
                  <input
                    type="checkbox"
                    checked={bit}
                    onChange={() => handleBitChange(index)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-xs mt-1">{bitLength - 1 - index}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Binary Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Binary Input (optional)
            </label>
            <input
              type="text"
              value={binary}
              onChange={(e) => handleBinaryInput(e.target.value)}
              placeholder={`Enter up to ${bitLength} bits (e.g., 1010)`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={clearBits}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Clear
            </button>
            <button
              onClick={exportValues}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Export
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Results:</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Binary:</span> {binary}
              </p>
              <p>
                <span className="font-medium">Decimal:</span> {decimal}
              </p>
              <p>
                <span className="font-medium">Hex:</span> {hex}
              </p>
              <div>
                <p className="font-medium">Bit Representation:</p>
                <div className="font-mono text-xs">
                  {bits.map((bit, index) => (
                    <span key={index} className={bit ? 'text-blue-600' : 'text-gray-400'}>
                      {bit ? '1' : '0'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert bit array to binary, decimal, and hex</li>
              <li>Adjustable bit length (4, 8, 16, 32)</li>
              <li>Toggle bits with checkboxes or enter binary directly</li>
              <li>Visual bit representation (MSB to LSB)</li>
              <li>Export results as JSON</li>
              <li>Example: [1,0,1,0] (8-bit) = 10100000 = 160 = A0</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BitArrayToBinary;