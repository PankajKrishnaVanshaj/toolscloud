'use client';

import React, { useState } from 'react';

const FloatToBinary = () => {
  const [floatInput, setFloatInput] = useState('');
  const [precision, setPrecision] = useState('32'); // 32-bit or 64-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const floatToIEEE754 = (number, bits) => {
    if (isNaN(number) || !isFinite(number)) {
      setError('Input must be a finite number');
      return null;
    }

    const isNegative = number < 0;
    const absNumber = Math.abs(number);

    // Special cases
    if (absNumber === 0) {
      return {
        sign: '0',
        exponent: '0'.repeat(bits === 32 ? 8 : 11),
        mantissa: '0'.repeat(bits === 32 ? 23 : 52),
      };
    }
    if (!isFinite(absNumber)) {
      return {
        sign: isNegative ? '1' : '0',
        exponent: '1'.repeat(bits === 32 ? 8 : 11),
        mantissa: '0'.repeat(bits === 32 ? 23 : 52),
      };
    }
    if (isNaN(absNumber)) {
      return {
        sign: '0',
        exponent: '1'.repeat(bits === 32 ? 8 : 11),
        mantissa: '1' + '0'.repeat(bits === 32 ? 22 : 51),
      };
    }

    // Convert to binary
    const exponentBits = bits === 32 ? 8 : 11;
    const mantissaBits = bits === 32 ? 23 : 52;
    const bias = bits === 32 ? 127 : 1023;

    let exponent = Math.floor(Math.log2(absNumber));
    let mantissa = absNumber / Math.pow(2, exponent) - 1;
    exponent += bias;

    // Handle subnormal numbers
    if (exponent <= 0) {
      mantissa = absNumber / Math.pow(2, 1 - bias);
      exponent = 0;
    } else if (exponent >= Math.pow(2, exponentBits)) {
      return {
        sign: isNegative ? '1' : '0',
        exponent: '1'.repeat(exponentBits),
        mantissa: '0'.repeat(mantissaBits),
      };
    }

    const exponentBinary = exponent.toString(2).padStart(exponentBits, '0');
    let mantissaBinary = '';
    for (let i = 0; i < mantissaBits; i++) {
      mantissa *= 2;
      mantissaBinary += Math.floor(mantissa);
      mantissa = mantissa % 1;
    }

    return {
      sign: isNegative ? '1' : '0',
      exponent: exponentBinary,
      mantissa: mantissaBinary,
    };
  };

  const handleConvert = () => {
    setError('');
    setResult(null);

    const number = parseFloat(floatInput);
    if (isNaN(number)) {
      setError('Please enter a valid floating-point number');
      return;
    }

    const bits = parseInt(precision);
    const ieee = floatToIEEE754(number, bits);
    if (!ieee) return;

    const binary = `${ieee.sign}${ieee.exponent}${ieee.mantissa}`;
    const hex = parseInt(binary, 2).toString(16).toUpperCase().padStart(bits / 4, '0');

    setResult({
      binary,
      hex,
      sign: ieee.sign,
      exponent: ieee.exponent,
      mantissa: ieee.mantissa,
      decimal: number,
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Float to Binary (IEEE 754) Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floating-Point Number
              </label>
              <input
                type="number"
                value={floatInput}
                onChange={(e) => setFloatInput(e.target.value)}
                placeholder="e.g., 3.14"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision
              </label>
              <select
                value={precision}
                onChange={(e) => setPrecision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="32">32-bit (Single Precision)</option>
                <option value="64">64-bit (Double Precision)</option>
              </select>
            </div>

            <button
              onClick={handleConvert}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Convert to Binary
            </button>
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
              <h2 className="text-lg font-semibold mb-2">IEEE 754 Representation:</h2>
              <div className="space-y-4 text-sm font-mono">
                <div>
                  <p className="font-medium">Full Binary:</p>
                  <div className="flex items-center gap-2">
                    <span className="break-all">
                      {result.sign} {result.exponent} {result.mantissa}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.binary)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Hexadecimal:</p>
                  <div className="flex items-center gap-2">
                    <span>{result.hex}</span>
                    <button
                      onClick={() => copyToClipboard(result.hex)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Breakdown:</p>
                  <p>Sign: {result.sign} ({result.decimal < 0 ? 'Negative' : 'Positive'})</p>
                  <p>Exponent: {result.exponent} (biased: {parseInt(result.exponent, 2)})</p>
                  <p>Mantissa: {result.mantissa.slice(0, 20)}{result.mantissa.length > 20 ? '...' : ''}</p>
                </div>
                <div>
                  <p className="font-medium">Details:</p>
                  <p>Decimal Input: {result.decimal}</p>
                  <p>Precision: {precision}-bit</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & IEEE 754 Info</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts floats to IEEE 754 binary (32-bit or 64-bit)</li>
              <li>Shows sign, exponent, and mantissa separately</li>
              <li>Provides hexadecimal representation</li>
              <li>Handles special cases: 0, Infinity, NaN</li>
              <li>32-bit: 1 sign, 8 exponent, 23 mantissa</li>
              <li>64-bit: 1 sign, 11 exponent, 52 mantissa</li>
              <li>Example: 3.14 (32-bit) ≈ 0 10000010 10010001111010111000010</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default FloatToBinary;