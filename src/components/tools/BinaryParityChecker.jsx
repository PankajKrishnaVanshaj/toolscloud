'use client';

import React, { useState } from 'react';

const BinaryParityChecker = () => {
  const [inputs, setInputs] = useState(['']); // Array for multiple binary inputs
  const [parityType, setParityType] = useState('even'); // Even or odd parity
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary);
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  const countOnes = (binary) => {
    return binary.split('').reduce((sum, bit) => sum + parseInt(bit), 0);
  };

  const checkParity = (binary) => {
    const ones = countOnes(binary);
    const isEven = ones % 2 === 0;
    return {
      ones,
      isEven,
      parityBit: parityType === 'even' ? (isEven ? '0' : '1') : (isEven ? '1' : '0'),
    };
  };

  const calculateParity = () => {
    setError('');
    setResults([]);

    const validInputs = inputs.filter(input => input.trim() !== '');
    if (validInputs.length === 0) {
      setError('Please enter at least one binary number');
      return;
    }

    const newResults = [];
    for (const input of validInputs) {
      if (!validateBinary(input)) {
        setError(`Invalid binary input: ${input}`);
        return;
      }
      const paddedBinary = padBinary(input, bitLength);
      const decimal = parseInt(paddedBinary, 2);
      const parity = checkParity(paddedBinary);
      newResults.push({
        original: input,
        padded: paddedBinary,
        decimal,
        ...parity,
      });
    }
    setResults(newResults);
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    setInputs([...inputs, '']);
  };

  const removeInput = (index) => {
    if (inputs.length > 1) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateParity();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Parity Checker
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            {inputs.map((input, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  placeholder={`Binary ${index + 1} (e.g., 1010)`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {inputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInput(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addInput}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 w-32"
            >
              Add Input
            </button>
          </div>

          {/* Options */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parity Type
              </label>
              <select
                value={parityType}
                onChange={(e) => setParityType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="even">Even Parity</option>
                <option value="odd">Odd Parity</option>
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
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Check Parity
          </button>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {results.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Parity Results:</h2>
            <div className="space-y-4 text-sm">
              {results.map((result, index) => (
                <div key={index} className="border-b pb-2">
                  <p><span className="font-medium">Input:</span> {result.original}</p>
                  <p><span className="font-medium">Padded Binary:</span> {result.padded}</p>
                  <p><span className="font-medium">Decimal:</span> {result.decimal}</p>
                  <p><span className="font-medium">Number of 1s:</span> {result.ones}</p>
                  <p><span className="font-medium">Parity:</span> {result.isEven ? 'Even' : 'Odd'}</p>
                  <p>
                    <span className="font-medium">{parityType === 'even' ? 'Even' : 'Odd'} Parity Bit:</span> {result.parityBit}
                    <span className="ml-2 text-gray-500">(With parity bit: {result.padded + result.parityBit})</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Checks parity (even/odd) of binary numbers</li>
              <li>Supports multiple inputs with dynamic addition/removal</li>
              <li>Configurable bit length (4, 8, 16, 32)</li>
              <li>Calculates parity bit for even or odd parity</li>
              <li>Shows detailed breakdown (1s count, decimal)</li>
              <li>Example: 1010 (even) → Parity Bit 0 (even), 1 (odd)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryParityChecker;