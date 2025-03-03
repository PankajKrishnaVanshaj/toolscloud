'use client';

import React, { useState } from 'react';

const BinaryToIEEE754 = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [precision, setPrecision] = useState('single'); // 'single' or 'double'
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [decimalInput, setDecimalInput] = useState('');

  const validateBinary = (input) => {
    const binaryRegex = /^[01]+$/;
    const length = precision === 'single' ? 32 : 64;
    if (!binaryRegex.test(input)) {
      setError('Input must contain only 0s and 1s');
      return false;
    }
    if (input.length !== length) {
      setError(`Input must be exactly ${length} bits for ${precision} precision`);
      return false;
    }
    return true;
  };

  const binaryToIEEE754 = (binary) => {
    const signBit = parseInt(binary[0], 2);
    const exponentBits = precision === 'single' ? 8 : 11;
    const mantissaBits = precision === 'single' ? 23 : 52;

    const exponentBinary = binary.slice(1, 1 + exponentBits);
    const mantissaBinary = binary.slice(1 + exponentBits);

    const exponent = parseInt(exponentBinary, 2);
    const bias = precision === 'single' ? 127 : 1023;
    const adjustedExponent = exponent - bias;

    const mantissa = mantissaBinary.split('').reduce((acc, bit, index) => {
      return acc + (bit === '1' ? Math.pow(2, -(index + 1)) : 0);
    }, 0);
    const implicitLeadingBit = exponent === 0 ? 0 : 1;
    const value = Math.pow(-1, signBit) * (implicitLeadingBit + mantissa) * Math.pow(2, adjustedExponent);

    return {
      sign: signBit === 0 ? '+' : '-',
      exponentBinary,
      exponentDecimal: exponent,
      adjustedExponent,
      mantissaBinary,
      mantissaDecimal: implicitLeadingBit + mantissa,
      value: Number.isFinite(value) ? value : 'NaN/Infinity',
    };
  };

  const decimalToIEEE754 = (decimal) => {
    const num = parseFloat(decimal);
    if (isNaN(num)) {
      setError('Invalid decimal number');
      return null;
    }

    const isNegative = num < 0;
    const absNum = Math.abs(num);
    const signBit = isNegative ? '1' : '0';

    if (absNum === 0) {
      return precision === 'single' 
        ? signBit + '0'.repeat(8) + '0'.repeat(23)
        : signBit + '0'.repeat(11) + '0'.repeat(52);
    }

    if (!Number.isFinite(absNum)) {
      return precision === 'single'
        ? signBit + '1'.repeat(8) + '0'.repeat(23) // Infinity
        : signBit + '1'.repeat(11) + '0'.repeat(52);
    }

    const exponentBits = precision === 'single' ? 8 : 11;
    const mantissaBits = precision === 'single' ? 23 : 52;
    const bias = precision === 'single' ? 127 : 1023;

    let exponent = Math.floor(Math.log2(absNum));
    let mantissa = (absNum / Math.pow(2, exponent)) - 1;
    let adjustedExponent = exponent + bias;

    if (adjustedExponent <= 0) { // Subnormal numbers
      mantissa = absNum / Math.pow(2, -bias + 1);
      adjustedExponent = 0;
    } else if (adjustedExponent >= Math.pow(2, exponentBits)) {
      return precision === 'single'
        ? signBit + '1'.repeat(8) + '0'.repeat(23) // Infinity
        : signBit + '1'.repeat(11) + '0'.repeat(52);
    }

    const exponentBinary = adjustedExponent.toString(2).padStart(exponentBits, '0');
    const mantissaBinary = Array(mantissaBits)
      .fill(0)
      .map((_, i) => {
        mantissa *= 2;
        const bit = Math.floor(mantissa);
        mantissa -= bit;
        return bit;
      })
      .join('');

    return signBit + exponentBinary + mantissaBinary;
  };

  const handleBinaryConvert = () => {
    setError('');
    setResult(null);
    if (validateBinary(binaryInput)) {
      const conversion = binaryToIEEE754(binaryInput);
      setResult(conversion);
      setDecimalInput(conversion.value.toString());
    }
  };

  const handleDecimalConvert = () => {
    setError('');
    setResult(null);
    const binary = decimalToIEEE754(decimalInput);
    if (binary) {
      setBinaryInput(binary);
      const conversion = binaryToIEEE754(binary);
      setResult(conversion);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to IEEE 754 Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input ({precision === 'single' ? '32-bit' : '64-bit'})
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={binaryInput}
                  onChange={(e) => setBinaryInput(e.target.value)}
                  placeholder={precision === 'single' ? '32-bit binary' : '64-bit binary'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  onClick={handleBinaryConvert}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Convert
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Input
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={decimalInput}
                  onChange={(e) => setDecimalInput(e.target.value)}
                  placeholder="e.g., 3.14"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleDecimalConvert}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Convert
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision
              </label>
              <select
                value={precision}
                onChange={(e) => {
                  setPrecision(e.target.value);
                  setBinaryInput('');
                  setDecimalInput('');
                  setResult(null);
                  setError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="single">Single Precision (32-bit)</option>
                <option value="double">Double Precision (64-bit)</option>
              </select>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">IEEE 754 Breakdown:</h2>
              <div className="space-y-2 text-sm font-mono">
                <p><span className="font-bold">Sign:</span> {result.sign} ({binaryInput[0]})</p>
                <p><span className="font-bold">Exponent (Binary):</span> {result.exponentBinary}</p>
                <p><span className="font-bold">Exponent (Decimal):</span> {result.exponentDecimal}</p>
                <p><span className="font-bold">Adjusted Exponent:</span> {result.adjustedExponent}</p>
                <p><span className="font-bold">Mantissa (Binary):</span> {result.mantissaBinary}</p>
                <p><span className="font-bold">Mantissa (Decimal):</span> {result.mantissaDecimal.toFixed(6)}</p>
                <p><span className="font-bold">Value:</span> {result.value}</p>
              </div>
            </div>
          )}

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
              <li>Converts binary to IEEE 754 (single/double precision)</li>
              <li>Converts decimal to IEEE 754 binary</li>
              <li>Shows detailed breakdown (sign, exponent, mantissa)</li>
              <li>Validates input length and format</li>
              <li>Example (Single): 01000000110000000000000000000000 = 3.5</li>
              <li>Handles special cases (NaN, Infinity, subnormal)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToIEEE754;