'use client';

import React, { useState } from 'react';

const BinaryToBitwiseString = () => {
  const [inputs, setInputs] = useState(['', '']); // Array for multiple binary inputs
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [selectedOperation, setSelectedOperation] = useState('OR');

  const operations = ['AND', 'OR', 'XOR', 'NOT']; // Supported bitwise operations

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, '0');

  const binaryToDecimal = (binary) => parseInt(binary, 2);

  const decimalToBinary = (decimal, length) => {
    const binary = (decimal >>> 0).toString(2); // Unsigned right shift to handle negatives
    return padBinary(binary, length);
  };

  const performBitwiseOperation = () => {
    setError('');
    setResult(null);

    const validInputs = inputs.filter(input => input.trim() !== '');
    if (validInputs.length === 0 || (selectedOperation !== 'NOT' && validInputs.length < 2)) {
      setError(`Please enter ${selectedOperation === 'NOT' ? 'at least one' : 'at least two'} binary number${selectedOperation === 'NOT' ? '' : 's'}`);
      return;
    }

    for (const input of validInputs) {
      if (!validateBinary(input)) {
        setError(`Invalid binary input: ${input}`);
        return;
      }
    }

    const paddedInputs = validInputs.map(binary => padBinary(binary, bitLength));
    const decimals = paddedInputs.map(binaryToDecimal);

    let resultDecimal;
    switch (selectedOperation) {
      case 'AND':
        resultDecimal = decimals.reduce((acc, curr) => acc & curr);
        break;
      case 'OR':
        resultDecimal = decimals.reduce((acc, curr) => acc | curr);
        break;
      case 'XOR':
        resultDecimal = decimals.reduce((acc, curr) => acc ^ curr);
        break;
      case 'NOT':
        resultDecimal = ~decimals[0] & ((1 << bitLength) - 1); // Mask to bit length
        break;
      default:
        setError('Invalid operation');
        return;
    }

    const binaryResult = decimalToBinary(resultDecimal, bitLength);

    setResult({
      inputs: paddedInputs,
      decimals,
      resultDecimal,
      binaryResult,
      operation: selectedOperation,
    });
  };

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const addInput = () => setInputs([...inputs, '']);
  const removeInput = (index) => {
    if (inputs.length > (selectedOperation === 'NOT' ? 1 : 2)) {
      const newInputs = inputs.filter((_, i) => i !== index);
      setInputs(newInputs);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBitwiseOperation();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Bitwise String Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Operation Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitwise Operation
            </label>
            <select
              value={selectedOperation}
              onChange={(e) => {
                setSelectedOperation(e.target.value);
                setInputs(selectedOperation === 'NOT' && inputs.length > 1 ? [inputs[0]] : inputs);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {operations.map(op => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>

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
                  disabled={selectedOperation === 'NOT' && index > 0}
                />
                {inputs.length > (selectedOperation === 'NOT' ? 1 : 2) && (
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
            {selectedOperation !== 'NOT' && (
              <button
                type="button"
                onClick={addInput}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 w-32"
              >
                Add Input
              </button>
            )}
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
            Calculate Bitwise Operation
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
            <h2 className="text-lg font-semibold mb-2">Results ({result.operation}):</h2>
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
                <p className="font-medium">Result:</p>
                <div className="flex flex-col gap-2">
                  <p>Binary: {result.binaryResult}</p>
                  <p>Decimal: {result.resultDecimal}</p>
                  <p>Hex: {result.resultDecimal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Operation Visualization:</p>
                <div className="font-mono text-xs">
                  {result.inputs.map((input, index) => (
                    <p key={index}>{input} ({index + 1})</p>
                  ))}
                  <p className="border-t border-gray-300">{'-'.repeat(bitLength)}</p>
                  <p>{result.binaryResult} ({result.operation})</p>
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
              <li>Supports AND, OR, XOR, and NOT operations</li>
              <li>Multiple inputs for AND/OR/XOR, single input for NOT</li>
              <li>4, 8, 16, or 32-bit representations</li>
              <li>Dynamic input addition/removal</li>
              <li>Results in binary, decimal, and hex</li>
              <li>Example: 1010 | 1100 = 1110 (10 | 12 = 14)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBitwiseString;