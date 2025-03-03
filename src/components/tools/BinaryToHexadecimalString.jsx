'use client';

import React, { useState } from 'react';

const BinaryToHexadecimalString = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [hexOutput, setHexOutput] = useState('');
  const [groupBits, setGroupBits] = useState(4); // Default grouping of 4 bits
  const [padding, setPadding] = useState('none'); // Padding options: none, left, right
  const [caseOption, setCaseOption] = useState('upper'); // Hex case: upper or lower
  const [error, setError] = useState('');

  const validateBinary = (input) => {
    const cleanedInput = input.replace(/\s/g, '');
    if (!/^[01]+$/.test(cleanedInput)) {
      setError('Invalid binary string: Only 0s and 1s are allowed');
      return null;
    }
    return cleanedInput;
  };

  const binaryToHex = (binary) => {
    const validBinary = validateBinary(binary);
    if (!validBinary) {
      setHexOutput('');
      return;
    }

    setError('');
    let binaryStr = validBinary;

    // Apply padding
    const remainder = binaryStr.length % 4;
    if (padding === 'left' && remainder !== 0) {
      binaryStr = '0'.repeat(4 - remainder) + binaryStr;
    } else if (padding === 'right' && remainder !== 0) {
      binaryStr += '0'.repeat(4 - remainder);
    }

    // Group bits
    let groupedBinary = '';
    for (let i = 0; i < binaryStr.length; i++) {
      groupedBinary += binaryStr[i];
      if ((i + 1) % groupBits === 0 && i !== binaryStr.length - 1) {
        groupedBinary += ' ';
      }
    }

    // Convert to hex
    const hex = parseInt(binaryStr, 2).toString(16);
    const formattedHex = caseOption === 'upper' ? hex.toUpperCase() : hex.toLowerCase();
    setHexOutput(formattedHex);
  };

  const hexToBinary = (hex) => {
    const cleanedHex = hex.replace(/\s/g, '');
    if (!/^[0-9A-Fa-f]+$/.test(cleanedHex)) {
      setError('Invalid hexadecimal string: Only 0-9 and A-F (case insensitive) are allowed');
      setBinaryInput('');
      return;
    }

    setError('');
    const binary = parseInt(cleanedHex, 16).toString(2);
    let formattedBinary = binary;

    // Apply padding
    const remainder = binary.length % 4;
    if (padding === 'left' && remainder !== 0) {
      formattedBinary = '0'.repeat(4 - remainder) + binary;
    } else if (padding === 'right' && remainder !== 0) {
      formattedBinary += '0'.repeat(4 - remainder);
    }

    // Group bits
    let groupedBinary = '';
    for (let i = 0; i < formattedBinary.length; i++) {
      groupedBinary += formattedBinary[i];
      if ((i + 1) % groupBits === 0 && i !== formattedBinary.length - 1) {
        groupedBinary += ' ';
      }
    }

    setBinaryInput(groupedBinary);
  };

  const handleBinaryChange = (value) => {
    setBinaryInput(value);
    binaryToHex(value);
  };

  const handleHexChange = (value) => {
    setHexOutput(value);
    hexToBinary(value);
  };

  const clearInputs = () => {
    setBinaryInput('');
    setHexOutput('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Hexadecimal Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Binary String
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => handleBinaryChange(e.target.value)}
                placeholder="e.g., 1010 1100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Hexadecimal String
              </label>
              <input
                type="text"
                value={hexOutput}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="e.g., AC"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={clearInputs}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Options</h2>
            <div className="grid gap-4 text-sm">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Group Bits:</label>
                <select
                  value={groupBits}
                  onChange={(e) => {
                    setGroupBits(Number(e.target.value));
                    binaryToHex(binaryInput);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={4}>4 bits</option>
                  <option value={8}>8 bits</option>
                  <option value={1}>No grouping</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Padding:</label>
                <select
                  value={padding}
                  onChange={(e) => {
                    setPadding(e.target.value);
                    binaryToHex(binaryInput);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None</option>
                  <option value="left">Left (prefix zeros)</option>
                  <option value="right">Right (suffix zeros)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Hex Case:</label>
                <select
                  value={caseOption}
                  onChange={(e) => {
                    setCaseOption(e.target.value);
                    binaryToHex(binaryInput);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upper">Uppercase (e.g., AC)</option>
                  <option value="lower">Lowercase (e.g., ac)</option>
                </select>
              </div>
            </div>
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
              <li>Convert between binary and hexadecimal strings</li>
              <li>Supports bit grouping (1, 4, 8 bits)</li>
              <li>Padding options for alignment</li>
              <li>Uppercase or lowercase hex output</li>
              <li>Real-time validation and conversion</li>
              <li>Examples: 10101100 ⇔ AC, 1111 ⇔ F</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToHexadecimalString;