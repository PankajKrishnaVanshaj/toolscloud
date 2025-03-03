'use client';

import React, { useState } from 'react';

const BinaryAdditionCalculator = () => {
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

  const performBinaryAddition = () => {
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

    // Perform binary addition
    const paddedInputs = validInputs.map(binary => padBinary(binary, bitLength));
    let carry = 0;
    let binaryResult = '';
    const steps = [];

    for (let i = bitLength - 1; i >= 0; i--) {
      const bits = paddedInputs.map(input => parseInt(input[i]));
      const sum = bits.reduce((acc, bit) => acc + bit, 0) + carry;
      const bitResult = sum % 2;
      carry = Math.floor(sum / 2);
      binaryResult = bitResult + binaryResult;
      steps.unshift({
        position: bitLength - i,
        bits: bits.map(bit => bit.toString()),
        carryIn: i === bitLength - 1 ? '0' : carry.toString(),
        sum: sum.toString(),
        bitResult: bitResult.toString(),
        carryOut: carry.toString(),
      });
    }

    if (carry > 0) {
      setError('Overflow detected: Result exceeds selected bit length');
    }

    const decimalResult = binaryToDecimal(binaryResult);
    setResult({
      inputs: paddedInputs,
      decimals: paddedInputs.map(binaryToDecimal),
      binaryResult,
      decimalResult,
      steps,
      overflow: carry > 0,
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
    performBinaryAddition();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Addition Calculator
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
            Calculate Binary Addition
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
                <div className="grid gap-2">
                  {result.inputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span>{input}</span>
                      <span className="text-gray-500">(decimal: {result.decimals[index]})</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium">Addition Result:</p>
                <div className="flex flex-col gap-2">
                  <p>Binary: {result.binaryResult} {result.overflow && '(overflow)'}</p>
                  <p>Decimal: {result.decimalResult}</p>
                  <p>Hex: {result.decimalResult.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Step-by-Step Calculation:</p>
                <div className="font-mono text-xs overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border-b p-1">Position</th>
                        {result.inputs.map((_, i) => (
                          <th key={i} className="border-b p-1">Input {i + 1}</th>
                        ))}
                        <th className="border-b p-1">Carry In</th>
                        <th className="border-b p-1">Sum</th>
                        <th className="border-b p-1">Bit Result</th>
                        <th className="border-b p-1">Carry Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.steps.map((step, index) => (
                        <tr key={index}>
                          <td className="p-1">{step.position}</td>
                          {step.bits.map((bit, i) => (
                            <td key={i} className="p-1">{bit}</td>
                          ))}
                          <td className="p-1">{step.carryIn}</td>
                          <td className="p-1">{step.sum}</td>
                          <td className="p-1">{step.bitResult}</td>
                          <td className="p-1">{step.carryOut}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <li>Add multiple binary numbers (e.g., 1010 + 1100)</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Step-by-step addition with carry tracking</li>
              <li>Shows results in binary, decimal, and hex</li>
              <li>Detects overflow for selected bit length</li>
              <li>Input example: 1010 + 1100 = 10110 (10 + 12 = 22)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryAdditionCalculator;