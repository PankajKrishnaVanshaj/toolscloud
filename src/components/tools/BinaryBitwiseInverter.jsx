'use client';

import React, { useState, useEffect } from 'react';

const BinaryBitwiseInverter = () => {
  const [input, setInput] = useState('');
  const [inputFormat, setInputFormat] = useState('binary');
  const [bitLength, setBitLength] = useState(8); // Default to 8 bits
  const [output, setOutput] = useState({
    binary: '',
    decimal: '',
    hex: '',
  });
  const [error, setError] = useState('');

  const bitLengths = [8, 16, 32, 64]; // Common bit lengths

  const validateAndConvertInput = (value, format) => {
    try {
      let num;
      switch (format) {
        case 'binary':
          if (!/^[01]+$/.test(value)) throw new Error('Invalid binary input');
          num = parseInt(value, 2);
          break;
        case 'decimal':
          if (!/^-?\d+$/.test(value)) throw new Error('Invalid decimal input');
          num = parseInt(value, 10);
          break;
        case 'hex':
          if (!/^-?[0-9A-Fa-f]+$/.test(value)) throw new Error('Invalid hex input');
          num = parseInt(value, 16);
          break;
        default:
          throw new Error('Invalid input format');
      }
      return num;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const invertBits = (num) => {
    if (num === null) return null;
    // Ensure the number fits within the selected bit length
    const mask = (1n << BigInt(bitLength)) - 1n;
    const bigNum = BigInt(num) & mask; // Mask to bit length
    const inverted = ~bigNum & mask; // Bitwise NOT and mask
    return inverted;
  };

  const formatOutput = (inverted) => {
    if (inverted === null) {
      return { binary: '', decimal: '', hex: '' };
    }
    const binary = inverted.toString(2).padStart(bitLength, '0');
    const decimal = inverted.toString(10);
    const hex = inverted.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0');
    return { binary, decimal, hex };
  };

  const updateOutput = () => {
    setError('');
    const num = validateAndConvertInput(input, inputFormat);
    const inverted = invertBits(num);
    setOutput(formatOutput(inverted));
  };

  useEffect(() => {
    updateOutput();
  }, [input, inputFormat, bitLength]);

  const handleInputChange = (value) => {
    setInput(value);
  };

  const handleClear = () => {
    setInput('');
    setOutput({ binary: '', decimal: '', hex: '' });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Bitwise Inverter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Input Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={`Enter ${inputFormat} number`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="binary">Binary</option>
                  <option value="decimal">Decimal</option>
                  <option value="hex">Hexadecimal</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => setBitLength(parseInt(e.target.value))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bitLengths.map((len) => (
                    <option key={len} value={len}>{len} bits</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Inverted Result:</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Binary:</span>{' '}
                <span className="font-mono">{output.binary || 'N/A'}</span>
                {output.binary && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({output.binary.length} bits)
                  </span>
                )}
              </p>
              <p>
                <span className="font-medium">Decimal:</span>{' '}
                <span className="font-mono">{output.decimal || 'N/A'}</span>
              </p>
              <p>
                <span className="font-medium">Hexadecimal:</span>{' '}
                <span className="font-mono">{output.hex || 'N/A'}</span>
              </p>
            </div>
            {output.binary && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Bit Visualization:</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {output.binary.split('').map((bit, index) => (
                    <span
                      key={index}
                      className={`w-6 h-6 flex items-center justify-center rounded text-white text-xs ${
                        bit === '1' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      {bit}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
              <li>Performs bitwise NOT operation (~) on input</li>
              <li>Supports binary, decimal, and hex input</li>
              <li>Adjustable bit length (8, 16, 32, 64)</li>
              <li>Real-time conversion and visualization</li>
              <li>Examples: "1010" (bin), "10" (dec), "A" (hex)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryBitwiseInverter;