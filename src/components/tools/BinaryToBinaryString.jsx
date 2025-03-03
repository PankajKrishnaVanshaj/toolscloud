'use client';

import React, { useState } from 'react';

const BinaryToBinaryString = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [stringInput, setStringInput] = useState('');
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit (ASCII)
  const [error, setError] = useState('');
  const [delimiter, setDelimiter] = useState(''); // Space or no delimiter
  const [endianness, setEndianness] = useState('big'); // Big or little endian

  const validateBinary = (binary) => {
    return /^[01\s]+$/.test(binary);
  };

  const binaryToString = (binary) => {
    setError('');
    if (!binary.trim()) {
      setStringInput('');
      return;
    }

    const cleanBinary = binary.replace(/\s+/g, '');
    if (!validateBinary(cleanBinary)) {
      setError('Invalid binary input: Use only 0s, 1s, and spaces');
      setStringInput('');
      return;
    }

    if (cleanBinary.length % bitLength !== 0) {
      setError(`Binary length must be a multiple of ${bitLength} bits`);
      setStringInput('');
      return;
    }

    try {
      const bytes = [];
      for (let i = 0; i < cleanBinary.length; i += bitLength) {
        const byte = cleanBinary.slice(i, i + bitLength);
        const reversedByte = endianness === 'little' ? byte.split('').reverse().join('') : byte;
        bytes.push(parseInt(reversedByte, 2));
      }
      const text = String.fromCharCode(...bytes);
      setStringInput(text);
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
      setStringInput('');
    }
  };

  const stringToBinary = (text) => {
    setError('');
    if (!text) {
      setBinaryInput('');
      return;
    }

    try {
      const binaryArray = [];
      for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i);
        let binary = charCode.toString(2).padStart(bitLength, '0');
        if (endianness === 'little') {
          binary = binary.split('').reverse().join('');
        }
        binaryArray.push(binary);
      }
      setBinaryInput(binaryArray.join(delimiter));
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
      setBinaryInput('');
    }
  };

  const handleBinaryChange = (value) => {
    setBinaryInput(value);
    binaryToString(value);
  };

  const handleStringChange = (value) => {
    setStringInput(value);
    stringToBinary(value);
  };

  const handleClear = () => {
    setBinaryInput('');
    setStringInput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Binary String Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Binary Input
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => handleBinaryChange(e.target.value)}
                placeholder={`e.g., 01001000 01100101 01101100 01101100 01101111 (8-bit)`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 font-mono"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                String Output
              </label>
              <input
                type="text"
                value={stringInput}
                onChange={(e) => handleStringChange(e.target.value)}
                placeholder="e.g., Hello"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Conversion Options</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => {
                    setBitLength(parseInt(e.target.value));
                    binaryToString(binaryInput);
                    stringToBinary(stringInput);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={7}>7-bit (ASCII)</option>
                  <option value={8}>8-bit (Extended ASCII)</option>
                  <option value={16}>16-bit (Unicode)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delimiter
                </label>
                <select
                  value={delimiter}
                  onChange={(e) => {
                    setDelimiter(e.target.value);
                    stringToBinary(stringInput);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  <option value=" ">Space</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endianness
                </label>
                <select
                  value={endianness}
                  onChange={(e) => {
                    setEndianness(e.target.value);
                    binaryToString(binaryInput);
                    stringToBinary(stringInput);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="big">Big Endian</option>
                  <option value="little">Little Endian</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-end">
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Clear
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert binary to string and vice versa</li>
              <li>Supports 7-bit (ASCII), 8-bit (Extended ASCII), and 16-bit (Unicode)</li>
              <li>Customizable delimiter for binary output</li>
              <li>Big or little endian support</li>
              <li>Real-time bidirectional conversion</li>
              <li>Example: 01001000 01100101 01101100 01101100 01101111 = "Hello" (8-bit)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBinaryString;