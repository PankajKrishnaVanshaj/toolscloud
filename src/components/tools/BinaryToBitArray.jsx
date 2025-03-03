'use client';

import React, { useState } from 'react';

const BinaryToBitArray = () => {
  const [input, setInput] = useState('');
  const [bitArray, setBitArray] = useState([]);
  const [error, setError] = useState('');
  const [inputFormat, setInputFormat] = useState('binary'); // binary, hex, decimal
  const [displayFormat, setDisplayFormat] = useState('array'); // array, grid
  const [bitLength, setBitLength] = useState(8); // Padding length

  const validateInput = (value) => {
    switch (inputFormat) {
      case 'binary':
        return /^[01\s]+$/.test(value);
      case 'hex':
        return /^[0-9A-Fa-f\s]+$/.test(value);
      case 'decimal':
        return /^\d+$/.test(value);
      default:
        return false;
    }
  };

  const convertToBinary = (value) => {
    switch (inputFormat) {
      case 'binary':
        return value.replace(/\s/g, '');
      case 'hex':
        return parseInt(value.replace(/\s/g, ''), 16).toString(2);
      case 'decimal':
        return parseInt(value, 10).toString(2);
      default:
        return '';
    }
  };

  const padBinary = (binary) => {
    return binary.padStart(Math.ceil(binary.length / bitLength) * bitLength, '0');
  };

  const processInput = () => {
    setError('');
    setBitArray([]);

    if (!input.trim()) {
      setError('Please enter a value');
      return;
    }

    if (!validateInput(input)) {
      setError(`Invalid ${inputFormat} input`);
      return;
    }

    const binary = convertToBinary(input);
    const paddedBinary = padBinary(binary);
    const array = paddedBinary.split('').map(bit => parseInt(bit));
    setBitArray(array);
  };

  const toggleBit = (index) => {
    const newArray = [...bitArray];
    newArray[index] = newArray[index] === 0 ? 1 : 0;
    setBitArray(newArray);
    updateInputFromArray(newArray);
  };

  const updateInputFromArray = (array) => {
    const binary = array.join('');
    switch (inputFormat) {
      case 'binary':
        setInput(binary);
        break;
      case 'hex':
        setInput(parseInt(binary, 2).toString(16).toUpperCase());
        break;
      case 'decimal':
        setInput(parseInt(binary, 2).toString(10));
        break;
    }
  };

  const exportArray = () => {
    const json = JSON.stringify(bitArray);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bit_array.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processInput();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Bit Array Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter ${inputFormat} (e.g., ${inputFormat === 'binary' ? '1010' : inputFormat === 'hex' ? 'A' : '10'})`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Format
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="binary">Binary</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="decimal">Decimal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length (Padding)
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Format
              </label>
              <select
                value={displayFormat}
                onChange={(e) => setDisplayFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="array">Array List</option>
                <option value="grid">Grid View</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Convert to Bit Array
          </button>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {bitArray.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Bit Array Result:</h2>
              <button
                onClick={exportArray}
                className="px-4 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                Export JSON
              </button>
            </div>
            <div className="text-sm">
              {displayFormat === 'array' ? (
                <pre className="p-2 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(bitArray, null, 2)}
                </pre>
              ) : (
                <div className="grid grid-cols-8 gap-2">
                  {bitArray.map((bit, index) => (
                    <button
                      key={index}
                      onClick={() => toggleBit(index)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        bit === 1 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      {bit}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <p>Binary: {bitArray.join('')}</p>
                <p>Decimal: {parseInt(bitArray.join(''), 2)}</p>
                <p>Hex: {parseInt(bitArray.join(''), 2).toString(16).toUpperCase()}</p>
                <p>Length: {bitArray.length} bits</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert binary, hex, or decimal to bit array</li>
              <li>Supports 4, 8, 16, or 32-bit padding</li>
              <li>Interactive grid view with bit toggling</li>
              <li>Display in array or grid format</li>
              <li>Export result as JSON</li>
              <li>Shows binary, decimal, and hex representations</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBitArray;