'use client';

import React, { useState } from 'react';

const BitwiseStringToBinary = () => {
  const [inputString, setInputString] = useState('');
  const [encoding, setEncoding] = useState('utf-8');
  const [operation, setOperation] = useState('none');
  const [mask, setMask] = useState('11111111'); // Default 8-bit mask
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [bitLength, setBitLength] = useState(8);

  const encodings = ['utf-8', 'ascii', 'utf-16'];

  const stringToBinary = (str, enc) => {
    try {
      const encoder = enc === 'utf-16' ? new TextEncoder('utf-16le') : new TextEncoder();
      const bytes = enc === 'ascii' ? new Uint8Array([...str].map(c => c.charCodeAt(0))) : encoder.encode(str);
      return Array.from(bytes).map(byte => byte.toString(2).padStart(8, '0'));
    } catch (err) {
      setError(`Encoding error: ${err.message}`);
      return [];
    }
  };

  const applyBitwiseOperation = (binaryArray, maskBinary) => {
    const maskNum = parseInt(maskBinary, 2);
    const resultArray = binaryArray.map(binary => {
      const num = parseInt(binary, 2);
      switch (operation) {
        case 'and': return (num & maskNum).toString(2).padStart(bitLength, '0');
        case 'or': return (num | maskNum).toString(2).padStart(bitLength, '0');
        case 'xor': return (num ^ maskNum).toString(2).padStart(bitLength, '0');
        default: return binary;
      }
    });
    return resultArray;
  };

  const binaryToDecimal = (binary) => parseInt(binary, 2);
  const binaryToHex = (binary) => parseInt(binary, 2).toString(16).toUpperCase().padStart(2, '0');

  const convertString = () => {
    setError('');
    setResult(null);

    if (!inputString) {
      setError('Please enter a string');
      return;
    }

    if (!/^[01]+$/.test(mask) || mask.length !== bitLength) {
      setError(`Mask must be a ${bitLength}-bit binary number`);
      return;
    }

    const binaryArray = stringToBinary(inputString, encoding);
    if (binaryArray.length === 0) return;

    const processedBinary = applyBitwiseOperation(binaryArray, mask);
    const decimalArray = processedBinary.map(binaryToDecimal);
    const hexArray = processedBinary.map(binaryToHex);

    setResult({
      originalBinary: binaryArray,
      processedBinary: processedBinary,
      decimal: decimalArray,
      hex: hexArray,
      mask: mask,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    convertString();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Bitwise String to Binary Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input String
              </label>
              <input
                type="text"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Enter text (e.g., Hello)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encoding
                </label>
                <select
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {encodings.map(enc => (
                    <option key={enc} value={enc}>{enc.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => {
                    const newLength = parseInt(e.target.value);
                    setBitLength(newLength);
                    setMask('1'.repeat(newLength));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                  <option value={32}>32-bit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitwise Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="and">AND</option>
                <option value="or">OR</option>
                <option value="xor">XOR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitwise Mask ({bitLength}-bit)
              </label>
              <input
                type="text"
                value={mask}
                onChange={(e) => setMask(e.target.value)}
                placeholder={`e.g., ${'1'.repeat(bitLength)}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert & Apply Bitwise
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
                <p className="font-medium">Original Binary (per byte):</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono">
                  {result.originalBinary.map((bin, i) => (
                    <span key={i}>{bin}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">After Bitwise Operation ({operation.toUpperCase()} with {mask}):</p>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 font-mono">
                    {result.processedBinary.map((bin, i) => (
                      <span key={i}>{bin}</span>
                    ))}
                  </div>
                  <p>Decimal: {result.decimal.join(', ')}</p>
                  <p>Hex: {result.hex.join(' ')}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Full Binary String:</p>
                <p className="font-mono break-all">{result.processedBinary.join('')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert text to binary using UTF-8, ASCII, or UTF-16</li>
              <li>Apply bitwise operations (AND, OR, XOR) with custom mask</li>
              <li>Supports 8, 16, or 32-bit lengths</li>
              <li>Shows results in binary, decimal, and hex per byte</li>
              <li>Example: "A" → 01000001 (65) → AND 11110000 = 01000000 (64)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BitwiseStringToBinary;