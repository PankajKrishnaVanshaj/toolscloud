'use client';

import React, { useState } from 'react';

const DecimalToHex = () => {
  const [decimal, setDecimal] = useState('');
  const [hex, setHex] = useState('');
  const [binary, setBinary] = useState('');
  const [octal, setOctal] = useState('');
  const [bitLength, setBitLength] = useState(32); // Default to 32-bit
  const [isSigned, setIsSigned] = useState(false);
  const [error, setError] = useState('');

  const validateDecimal = (value) => {
    return /^-?\d+$/.test(value);
  };

  const validateHex = (value) => {
    return /^[0-9A-Fa-f]+$/.test(value);
  };

  const normalizeNumber = (num) => {
    if (isSigned) {
      const max = 2 ** (bitLength - 1);
      const min = -max;
      if (num >= max) num = num - 2 * max;
      if (num < min) num = num + 2 * max;
      return num;
    }
    return num & ((1 << bitLength) - 1); // Mask to bit length for unsigned
  };

  const decimalToAll = (dec) => {
    setError('');
    if (!validateDecimal(dec)) {
      setError('Invalid decimal input');
      return;
    }

    let num = parseInt(dec, 10);
    num = normalizeNumber(num);

    const hexValue = num < 0 ? (num >>> 0).toString(16).toUpperCase() : num.toString(16).toUpperCase();
    const binaryValue = num < 0 ? (num >>> 0).toString(2) : num.toString(2);
    const octalValue = num < 0 ? (num >>> 0).toString(8) : num.toString(8);

    setHex(hexValue.padStart(Math.ceil(bitLength / 4), '0'));
    setBinary(binaryValue.padStart(bitLength, '0'));
    setOctal(octalValue.padStart(Math.ceil(bitLength / 3), '0'));
  };

  const hexToAll = (hexValue) => {
    setError('');
    if (!validateHex(hexValue)) {
      setError('Invalid hexadecimal input');
      return;
    }

    let num = parseInt(hexValue, 16);
    if (isSigned && num >= 2 ** (bitLength - 1)) {
      num = num - 2 ** bitLength;
    }
    num = normalizeNumber(num);

    setDecimal(num.toString(10));
    setBinary(num < 0 ? (num >>> 0).toString(2).padStart(bitLength, '0') : num.toString(2).padStart(bitLength, '0'));
    setOctal(num < 0 ? (num >>> 0).toString(8).padStart(Math.ceil(bitLength / 3), '0') : num.toString(8).padStart(Math.ceil(bitLength / 3), '0'));
  };

  const handleDecimalChange = (value) => {
    setDecimal(value);
    if (value === '') {
      setHex('');
      setBinary('');
      setOctal('');
      setError('');
      return;
    }
    decimalToAll(value);
  };

  const handleHexChange = (value) => {
    setHex(value.toUpperCase());
    if (value === '') {
      setDecimal('');
      setBinary('');
      setOctal('');
      setError('');
      return;
    }
    hexToAll(value);
  };

  const handleBitLengthChange = (value) => {
    setBitLength(value);
    if (decimal) decimalToAll(decimal);
    else if (hex) hexToAll(hex);
  };

  const handleSignedChange = (checked) => {
    setIsSigned(checked);
    if (decimal) decimalToAll(decimal);
    else if (hex) hexToAll(hex);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Decimal to Hex Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Decimal
              </label>
              <input
                type="text"
                value={decimal}
                onChange={(e) => handleDecimalChange(e.target.value)}
                placeholder="e.g., 255 or -128"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Hexadecimal
              </label>
              <input
                type="text"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="e.g., FF or 80"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => handleBitLengthChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                  <option value={32}>32-bit</option>
                  <option value={64}>64-bit</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={isSigned}
                  onChange={(e) => handleSignedChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Signed Number
                </label>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {(decimal || hex) && !error && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Decimal:</span> {decimal}</p>
                <p><span className="font-medium">Hexadecimal:</span> {hex}</p>
                <p><span className="font-medium">Binary:</span> {binary}</p>
                <p><span className="font-medium">Octal:</span> {octal}</p>
              </div>
              <div className="mt-4">
                <p className="font-medium">Bit Representation:</p>
                <div className="font-mono text-xs break-all">{binary}</div>
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
              <li>Convert between decimal and hexadecimal</li>
              <li>Supports binary and octal outputs</li>
              <li>8, 16, 32, or 64-bit representations</li>
              <li>Signed/unsigned number support</li>
              <li>Input validation for decimal and hex</li>
              <li>Example: 255 (decimal) = FF (hex), -128 = 80 (8-bit signed)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DecimalToHex;