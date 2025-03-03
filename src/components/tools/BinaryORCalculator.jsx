'use client';

import React, { useState } from 'react';

const BinaryORCalculator = () => {
  const [inputs, setInputs] = useState([{ value: '', base: 'binary' }]); // Array of inputs with base type
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const bases = [
    { name: 'Binary', value: 'binary', radix: 2, validator: /^[01]+$/ },
    { name: 'Decimal', value: 'decimal', radix: 10, validator: /^\d+$/ },
    { name: 'Hexadecimal', value: 'hex', radix: 16, validator: /^[0-9A-Fa-f]+$/ },
  ];

  const validateInput = (value, base) => {
    const validator = bases.find(b => b.value === base).validator;
    return validator.test(value);
  };

  const convertToDecimal = (value, base) => {
    return parseInt(value, bases.find(b => b.value === base).radix);
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  const decimalToBinary = (decimal, length) => {
    return decimal.toString(2).padStart(length, '0');
  };

  const decimalToHex = (decimal, length) => {
    return decimal.toString(16).toUpperCase().padStart(Math.ceil(length / 4), '0');
  };

  const calculateOR = () => {
    setError('');
    setResult(null);

    const validInputs = inputs.filter(input => input.value.trim() !== '');
    if (validInputs.length < 2) {
      setError('Please enter at least two numbers');
      return;
    }

    const decimals = [];
    for (const input of validInputs) {
      if (!validateInput(input.value, input.base)) {
        setError(`Invalid ${input.base} input: ${input.value}`);
        return;
      }
      decimals.push(convertToDecimal(input.value, input.base));
    }

    const orResult = decimals.reduce((acc, curr) => acc | curr, 0);
    const binaryInputs = decimals.map(dec => decimalToBinary(dec, bitLength));
    const binaryResult = decimalToBinary(orResult, bitLength);
    const hexResult = decimalToHex(orResult, bitLength);

    setResult({
      inputs: validInputs.map((input, index) => ({
        value: input.value,
        base: input.base,
        binary: binaryInputs[index],
        decimal: decimals[index],
      })),
      result: {
        decimal: orResult,
        binary: binaryResult,
        hex: hexResult,
      },
    });
  };

  const handleInputChange = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    setInputs([...inputs, { value: '', base: 'binary' }]);
  };

  const removeInput = (index) => {
    if (inputs.length > 2) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateOR();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary OR Calculator
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            {inputs.map((input, index) => (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={input.base}
                  onChange={(e) => handleInputChange(index, 'base', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bases.map(base => (
                    <option key={base.value} value={base.value}>{base.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={input.value}
                  onChange={(e) => handleInputChange(index, 'value', e.target.value)}
                  placeholder={`Number ${index + 1} (${input.base})`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              Bit Length (for Binary Output)
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
            Calculate OR
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
                <p className="font-medium">Inputs:</p>
                <div className="grid gap-2">
                  {result.inputs.map((input, index) => (
                    <div key={index} className="flex flex-col">
                      <span>{input.base.charAt(0).toUpperCase() + input.base.slice(1)}: {input.value}</span>
                      <span className="text-gray-500">Decimal: {input.decimal}</span>
                      <span className="text-gray-500">Binary: {input.binary}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">OR Result:</p>
                <div className="flex flex-col gap-2">
                  <p>Binary: {result.result.binary}</p>
                  <p>Decimal: {result.result.decimal}</p>
                  <p>Hex: {result.result.hex}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Operation Visualization (Binary):</p>
                <div className="font-mono text-xs">
                  {result.inputs.map((input, index) => (
                    <p key={index}>{input.binary} ({index + 1})</p>
                  ))}
                  <p className="border-t border-gray-300">{'-'.repeat(bitLength)}</p>
                  <p>{result.result.binary} (OR)</p>
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
              <li>Perform bitwise OR on multiple numbers in binary, decimal, or hex</li>
              <li>Supports 4, 8, 16, or 32-bit binary output</li>
              <li>Dynamic input addition/removal (minimum 2)</li>
              <li>Shows results in all three bases</li>
              <li>Visualizes binary OR operation</li>
              <li>Examples: 1010 | 1100 = 1110, 10 | 12 = 14, A | C = E</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryORCalculator;