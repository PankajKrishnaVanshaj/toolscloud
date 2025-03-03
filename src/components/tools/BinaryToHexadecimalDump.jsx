'use client';

import React, { useState } from 'react';

const BinaryToHexadecimalDump = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [chunkSize, setChunkSize] = useState(8); // Default to 8-bit (1 byte) chunks
  const [error, setError] = useState('');
  const [hexDump, setHexDump] = useState(null);

  const validateBinary = (binary) => {
    return /^[01\s]*$/.test(binary);
  };

  const binaryToBytes = (binary) => {
    const cleanedBinary = binary.replace(/\s+/g, '');
    if (cleanedBinary.length % 8 !== 0) {
      setError('Binary input length must be a multiple of 8 bits (1 byte)');
      return null;
    }

    const bytes = [];
    for (let i = 0; i < cleanedBinary.length; i += 8) {
      const byte = cleanedBinary.slice(i, i + 8);
      bytes.push(parseInt(byte, 2));
    }
    return bytes;
  };

  const generateHexDump = () => {
    setError('');
    setHexDump(null);

    if (!binaryInput.trim()) {
      setError('Please enter a binary string');
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError('Invalid binary input: only 0s, 1s, and spaces are allowed');
      return;
    }

    const bytes = binaryToBytes(binaryInput);
    if (!bytes) return;

    const lines = [];
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      const offset = i.toString(16).padStart(8, '0');
      const hexValues = chunk.map(byte => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ');
      const asciiValues = chunk
        .map(byte => {
          const char = String.fromCharCode(byte);
          return char.match(/[ -~]/) ? char : '.';
        })
        .join('');

      lines.push({ offset, hex: hexValues, ascii: asciiValues });
    }

    setHexDump(lines);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateHexDump();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Hexadecimal Dump
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input (space-separated bytes optional)
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder="e.g., 01001000 01100101 01101100 01101100 01101111"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bytes per Line
              </label>
              <select
                value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4 bytes</option>
                <option value={8}>8 bytes</option>
                <option value={16}>16 bytes</option>
                <option value={32}>32 bytes</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Generate Hex Dump
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
        {hexDump && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Hexadecimal Dump:</h2>
            <div className="font-mono text-sm overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left p-2">Offset</th>
                    <th className="text-left p-2">Hexadecimal</th>
                    <th className="text-left p-2">ASCII</th>
                  </tr>
                </thead>
                <tbody>
                  {hexDump.map((line, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-2">{line.offset}</td>
                      <td className="p-2">{line.hex}</td>
                      <td className="p-2">{line.ascii}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts binary to hexadecimal dump format</li>
              <li>Displays offset, hex values, and ASCII representation</li>
              <li>Customizable bytes per line (4, 8, 16, 32)</li>
              <li>Supports space-separated binary bytes</li>
              <li>Input must be multiple of 8 bits</li>
              <li>Example: "01001000 01100101" → "48 65" (ASCII: "He")</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToHexadecimalDump;