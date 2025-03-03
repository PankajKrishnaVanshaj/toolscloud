'use client';

import React, { useState } from 'react';

const TwosComplementToBinary = () => {
  const [decimalInput, setDecimalInput] = useState('');
  const [binaryInput, setBinaryInput] = useState('');
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState('decimal'); // 'decimal' or 'binary'

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const padBinary = (binary, length) => binary.padStart(length, '0');

  const decimalToTwosComplement = (decimal, bits) => {
    const maxValue = 2 ** (bits - 1);
    const minValue = -maxValue;

    if (decimal < minValue || decimal >= maxValue) {
      throw new Error(`Value out of range for ${bits}-bit: ${minValue} to ${maxValue - 1}`);
    }

    if (decimal >= 0) {
      return padBinary(decimal.toString(2), bits);
    } else {
      // Two's complement for negative numbers: invert bits and add 1
      const absBinary = padBinary(Math.abs(decimal).toString(2), bits);
      const inverted = absBinary.split('').map(bit => bit === '1' ? '0' : '1').join('');
      const complement = (parseInt(inverted, 2) + 1).toString(2).padStart(bits, '0');
      return complement;
    }
  };

  const twosComplementToDecimal = (binary, bits) => {
    if (binary.length !== bits) {
      throw new Error(`Binary length must be ${bits} bits`);
    }
    if (!validateBinary(binary)) {
      throw new Error('Invalid binary input');
    }

    const isNegative = binary[0] === '1';
    if (isNegative) {
      // Invert bits and add 1, then negate
      const inverted = binary.split('').map(bit => bit === '1' ? '0' : '1').join('');
      const decimal = -(parseInt(inverted, 2) + 1);
      return decimal;
    } else {
      return parseInt(binary, 2);
    }
  };

  const calculate = () => {
    setError('');
    setResult(null);

    try {
      if (inputMode === 'decimal') {
        const decimal = parseInt(decimalInput, 10);
        if (isNaN(decimal)) {
          throw new Error('Invalid decimal input');
        }
        const binary = decimalToTwosComplement(decimal, bitLength);
        const steps = decimal < 0 ? [
          `1. Absolute value: ${Math.abs(decimal)} = ${padBinary(Math.abs(decimal).toString(2), bitLength)}`,
          `2. Invert bits: ${padBinary(Math.abs(decimal).toString(2), bitLength).split('').map(bit => bit === '1' ? '0' : '1').join('')}`,
          `3. Add 1: ${binary}`,
        ] : ['Direct binary representation'];
        setResult({
          decimal,
          binary,
          steps,
        });
      } else {
        const binary = padBinary(binaryInput, bitLength);
        const decimal = twosComplementToDecimal(binary, bitLength);
        const steps = binary[0] === '1' ? [
          `1. Invert bits: ${binary.split('').map(bit => bit === '1' ? '0' : '1').join('')}`,
          `2. Add 1 and negate: ${decimal}`,
        ] : ['Direct binary to decimal conversion'];
        setResult({
          decimal,
          binary,
          steps,
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculate();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Two's Complement Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Mode Selector */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setInputMode('decimal')}
              className={`px-4 py-2 rounded-md ${inputMode === 'decimal' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white transition-colors`}
            >
              Decimal to Binary
            </button>
            <button
              type="button"
              onClick={() => setInputMode('binary')}
              className={`px-4 py-2 rounded-md ${inputMode === 'binary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-600 hover:text-white transition-colors`}
            >
              Binary to Decimal
            </button>
          </div>

          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inputMode === 'decimal' ? 'Decimal Number' : 'Two\'s Complement Binary'}
              </label>
              <input
                type="text"
                value={inputMode === 'decimal' ? decimalInput : binaryInput}
                onChange={(e) => inputMode === 'decimal' ? setDecimalInput(e.target.value) : setBinaryInput(e.target.value)}
                placeholder={inputMode === 'decimal' ? 'e.g., -5 or 10' : `e.g., ${'1'.repeat(bitLength)}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
            Convert
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
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Decimal:</span> {result.decimal}
              </p>
              <p>
                <span className="font-medium">Binary (Two's Complement):</span> {result.binary}
              </p>
              <p>
                <span className="font-medium">Hex:</span> {parseInt(result.binary, 2).toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}
              </p>
              <div>
                <p className="font-medium">Conversion Steps:</p>
                <ul className="list-disc list-inside">
                  {result.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert between decimal and two's complement binary</li>
              <li>Supports 4, 8, 16, or 32-bit lengths</li>
              <li>Shows step-by-step conversion for negative numbers</li>
              <li>Range: -2^(n-1) to 2^(n-1)-1 (e.g., -128 to 127 for 8-bit)</li>
              <li>Example: -5 (8-bit) = 11111011</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TwosComplementToBinary;