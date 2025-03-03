'use client';

import React, { useState } from 'react';

const BinaryToChecksum = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [checksumType, setChecksumType] = useState('8bit');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [inputFormat, setInputFormat] = useState('binary'); // binary, hex, text

  const checksumAlgorithms = {
    '8bit': {
      name: '8-bit Checksum',
      calculate: (bytes) => {
        let sum = 0;
        for (const byte of bytes) {
          sum = (sum + byte) & 0xFF; // Keep within 8 bits
        }
        return sum;
      },
      byteSize: 1,
    },
    '16bit': {
      name: '16-bit Checksum',
      calculate: (bytes) => {
        let sum = 0;
        for (let i = 0; i < bytes.length; i += 2) {
          const word = (bytes[i] << 8) + (bytes[i + 1] || 0);
          sum = (sum + word) & 0xFFFF; // Keep within 16 bits
        }
        return sum;
      },
      byteSize: 2,
    },
    'xor': {
      name: 'XOR Checksum',
      calculate: (bytes) => {
        let xor = 0;
        for (const byte of bytes) {
          xor ^= byte;
        }
        return xor;
      },
      byteSize: 1,
    },
  };

  const parseInput = (input) => {
    setError('');
    let bytes = [];

    switch (inputFormat) {
      case 'binary':
        if (!/^[01\s]+$/.test(input)) {
          setError('Invalid binary input: Use only 0s, 1s, and spaces');
          return null;
        }
        const binaryChunks = input.replace(/\s+/g, '').match(/.{1,8}/g) || [];
        bytes = binaryChunks.map(chunk => parseInt(chunk.padEnd(8, '0'), 2));
        break;
      case 'hex':
        if (!/^[0-9A-Fa-f\s]+$/.test(input)) {
          setError('Invalid hex input: Use only 0-9, A-F, and spaces');
          return null;
        }
        const hexPairs = input.replace(/\s+/g, '').match(/.{1,2}/g) || [];
        bytes = hexPairs.map(pair => parseInt(pair.padStart(2, '0'), 16));
        break;
      case 'text':
        bytes = Array.from(input).map(char => char.charCodeAt(0));
        break;
      default:
        setError('Invalid input format');
        return null;
    }

    return bytes;
  };

  const calculateChecksum = () => {
    setResult(null);
    setError('');

    if (!binaryInput.trim()) {
      setError('Please enter some input');
      return;
    }

    const bytes = parseInput(binaryInput);
    if (!bytes) return;

    const algorithm = checksumAlgorithms[checksumType];
    const checksum = algorithm.calculate(bytes);
    const checksumBinary = checksum.toString(2).padStart(algorithm.byteSize * 8, '0');
    const checksumHex = checksum.toString(16).toUpperCase().padStart(algorithm.byteSize * 2, '0');

    setResult({
      bytes: bytes,
      checksum: checksum,
      checksumBinary: checksumBinary,
      checksumHex: checksumHex,
      steps: bytes.map((byte, index) => ({
        byte: byte.toString(2).padStart(8, '0'),
        decimal: byte,
        step: index === 0 ? byte : algorithm.calculate(bytes.slice(0, index + 1)),
      })),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateChecksum();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Checksum Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder={
                  inputFormat === 'binary' ? 'e.g., 10101010 11001100' :
                  inputFormat === 'hex' ? 'e.g., AA CC' :
                  'e.g., Hello World'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Format
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="binary">Binary (0s and 1s)</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="text">Text (ASCII)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Checksum Type
                </label>
                <select
                  value={checksumType}
                  onChange={(e) => setChecksumType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(checksumAlgorithms).map(([key, { name }]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Checksum
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
            <h2 className="text-lg font-semibold mb-2">Checksum Result:</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Input Bytes:</p>
                <p>Binary: {result.bytes.map(b => b.toString(2).padStart(8, '0')).join(' ')}</p>
                <p>Hex: {result.bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}</p>
                <p>Decimal: {result.bytes.join(' ')}</p>
              </div>
              <div>
                <p className="font-medium">Checksum:</p>
                <p>Binary: {result.checksumBinary}</p>
                <p>Hex: {result.checksumHex}</p>
                <p>Decimal: {result.checksum}</p>
              </div>
              <div>
                <p className="font-medium">Calculation Steps:</p>
                <div className="font-mono text-xs overflow-auto">
                  {result.steps.map((step, index) => (
                    <p key={index}>
                      {step.byte} ({step.decimal}) → {step.step.toString(2).padStart(checksumAlgorithms[checksumType].byteSize * 8, '0')} ({step.step})
                    </p>
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
              <li>Supports 8-bit, 16-bit, and XOR checksums</li>
              <li>Multiple input formats: binary, hex, or text</li>
              <li>Shows detailed calculation steps</li>
              <li>Outputs in binary, hex, and decimal</li>
              <li>Example (8-bit): "10101010 11001100" → Checksum: 01110110 (118)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToChecksum;