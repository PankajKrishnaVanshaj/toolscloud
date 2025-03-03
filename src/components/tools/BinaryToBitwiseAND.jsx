'use client';

import React, { useState } from 'react';

const BinaryToBitwiseAND = () => {
  const [inputs, setInputs] = useState(['', '']); // Array for multiple binary inputs
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit representation

  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary);
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  const binaryToDecimal = (binary) => {
    return parseInt(binary, 2);
  };

  const decimalToBinary = (decimal, length) => {
    return decimal.toString(2).padStart(length, '0');
  };

  const performBitwiseAND = () => {
    setError('');
    setResult(null);

    // Validate all inputs
    const validInputs = inputs.filter(input => input.trim() !== '');
    if (validInputs.length < 2) {
      setError('Please enter at least two binary numbers');
      return;
    }

    for (const input of validInputs) {
      if (!validateBinary(input)) {
        setError(`Invalid binary input: ${input}`);
        return;
      }
    }

    // Convert to decimal and perform AND
    const decimals = validInputs.map(binary => binaryToDecimal(binary));
    const andResult = decimals.reduce((acc, curr) => acc & curr);
    const paddedInputs = validInputs.map(binary => padBinary(binary, bitLength));
    const binaryResult = decimalToBinary(andResult, bitLength);

    setResult({
      inputs: paddedInputs,
      decimals: decimals,
      result: andResult,
      binaryResult: binaryResult,
    });
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
    if (inputs.length > 2) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBitwiseAND();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Bitwise AND Converter
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
                {inputs.length > 2 && (
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

          {/* Bit Length Selector */}
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

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Bitwise AND
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
                <p className="font-medium">Inputs (Padded):</p>
                <div className="grid grid-cols-2 gap-2">
                  {result.inputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span>{input}</span>
                      <span className="text-gray-500">(decimal: {result.decimals[index]})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Bitwise AND Result:</p>
                <div className="flex flex-col gap-2">
                  <p>Binary: {result.binaryResult}</p>
                  <p>Decimal: {result.result}</p>
                  <p>Hex: {result.result.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Operation Visualization:</p>
                <div className="font-mono text-xs">
                  {result.inputs.map((input, index) => (
                    <p key={index}>{input} ({index + 1})</p>
                  ))}
                  <p className="border-t border-gray-300">{'-'.repeat(bitLength)}</p>
                  <p>{result.binaryResult} (AND)</p>
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
              <li>Convert multiple binary numbers to decimal and perform bitwise AND</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Add/remove binary inputs dynamically</li>
              <li>Visualizes the AND operation</li>
              <li>Shows results in binary, decimal, and hex</li>
              <li>Input example: 1010 & 1100 = 1000 (10 & 12 = 8)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBitwiseAND;