'use client';

import React, { useState } from 'react';

const BinaryToFloat = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [precision, setPrecision] = useState('32'); // 32-bit or 64-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary);
  };

  const binaryToFloat = (binary, isDouble = false) => {
    const bitLength = isDouble ? 64 : 32;
    if (binary.length !== bitLength) {
      setError(`Input must be exactly ${bitLength} bits for ${isDouble ? 'double' : 'single'} precision`);
      return null;
    }

    if (!validateBinary(binary)) {
      setError('Invalid binary input: must contain only 0s and 1s');
      return null;
    }

    // Split into sign, exponent, and mantissa
    const signBit = binary[0];
    const exponentBits = isDouble ? binary.slice(1, 12) : binary.slice(1, 9);
    const mantissaBits = isDouble ? binary.slice(12) : binary.slice(9);

    // Convert components
    const sign = signBit === '0' ? 1 : -1;
    const exponentLength = isDouble ? 11 : 8;
    const bias = isDouble ? 1023 : 127;
    const exponent = parseInt(exponentBits, 2) - bias;
    const mantissaLength = isDouble ? 52 : 23;
    let mantissa = 0;

    // Calculate mantissa value
    for (let i = 0; i < mantissaBits.length; i++) {
      if (mantissaBits[i] === '1') {
        mantissa += Math.pow(2, -(i + 1));
      }
    }

    // Add implicit leading 1 (for normalized numbers)
    const implicitOne = exponentBits === '0'.repeat(exponentLength) ? 0 : 1;
    const mantissaValue = implicitOne + mantissa;

    // Handle special cases
    if (exponentBits === '1'.repeat(exponentLength)) {
      if (mantissaBits === '0'.repeat(mantissaLength)) {
        return { special: sign === 1 ? 'Infinity' : '-Infinity' };
      } else {
        return { special: 'NaN' };
      }
    }
    if (exponentBits === '0'.repeat(exponentLength) && mantissaBits === '0'.repeat(mantissaLength)) {
      return { decimal: 0, sign, exponent: 0, mantissa: 0 };
    }

    // Calculate final value
    const decimal = sign * mantissaValue * Math.pow(2, exponent);

    return {
      decimal,
      sign,
      exponent,
      mantissa: mantissaValue,
    };
  };

  const handleConvert = () => {
    setError('');
    setResult(null);

    if (!binaryInput) {
      setError('Please enter a binary number');
      return;
    }

    const isDouble = precision === '64';
    const parsedResult = binaryToFloat(binaryInput, isDouble);
    if (parsedResult) {
      setResult({
        binary: binaryInput,
        ...parsedResult,
      });
    }
  };

  const formatBinaryDisplay = (binary, isDouble) => {
    const sign = binary[0];
    const exponentBits = isDouble ? binary.slice(1, 12) : binary.slice(1, 9);
    const mantissaBits = isDouble ? binary.slice(12) : binary.slice(9);
    return `${sign} | ${exponentBits} | ${mantissaBits}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Float Converter (IEEE 754)
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder={`Enter ${precision}-bit binary (e.g., ${precision === '32' ? '01000000110000000000000000000000' : '0100000000111000000000000000000000000000000000000000000000000000'})`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precision
                </label>
                <select
                  value={precision}
                  onChange={(e) => setPrecision(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="32">32-bit (Single)</option>
                  <option value="64">64-bit (Double)</option>
                </select>
              </div>
              <button
                onClick={handleConvert}
                className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert
              </button>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Result:</h2>
              <div className="space-y-4 text-sm">
                {result.special ? (
                  <p className="font-medium">Value: {result.special}</p>
                ) : (
                  <>
                    <p className="font-medium">Decimal Value: {result.decimal.toPrecision(10)}</p>
                    <div>
                      <p className="font-medium">Components:</p>
                      <p>Sign: {result.sign === 1 ? '+' : '-'}</p>
                      <p>Exponent: {result.exponent} (biased: {result.exponent + (precision === '64' ? 1023 : 127)})</p>
                      <p>Mantissa: {result.mantissa.toFixed(10)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Binary Breakdown:</p>
                      <p className="font-mono">
                        {formatBinaryDisplay(result.binary, precision === '64')}
                      </p>
                      <p className="text-gray-500">
                        (Sign | Exponent | Mantissa)
                      </p>
                    </div>
                    <p>Formula: {result.sign} × {result.mantissa.toFixed(3)} × 2^{result.exponent}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts IEEE 754 binary to floating-point decimal</li>
              <li>Supports 32-bit (single) and 64-bit (double) precision</li>
              <li>Breaks down sign, exponent, and mantissa</li>
              <li>Handles special cases (Infinity, NaN, Zero)</li>
              <li>Example (32-bit): 01000000110000000000000000000000 = 3.5</li>
              <li>Example (64-bit): 0100000000111000000000000000000000000000000000000000000000000000 = 3.5</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToFloat;