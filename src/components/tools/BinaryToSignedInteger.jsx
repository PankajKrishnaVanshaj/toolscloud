'use client';

import React, { useState } from 'react';

const BinaryToSignedInteger = () => {
  const [binary, setBinary] = useState('');
  const [bitLength, setBitLength] = useState(8);
  const [representation, setRepresentation] = useState('twos_complement');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Supported bit lengths
  const bitLengths = [4, 8, 16, 32];

  // Supported representations
  const representations = {
    twos_complement: "Two's Complement",
    ones_complement: "One's Complement",
    sign_magnitude: "Sign-Magnitude",
  };

  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary) && binary.length <= bitLength;
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  const binaryToSignedInteger = (binary, rep) => {
    const paddedBinary = padBinary(binary, bitLength);
    const isNegative = paddedBinary[0] === '1';
    let decimal;

    switch (rep) {
      case 'twos_complement':
        if (isNegative) {
          // Invert bits and add 1, then negate
          const inverted = paddedBinary.split('').map(bit => bit === '1' ? '0' : '1').join('');
          decimal = -(parseInt(inverted, 2) + 1);
        } else {
          decimal = parseInt(paddedBinary, 2);
        }
        break;
      case 'ones_complement':
        if (isNegative) {
          // Invert bits and negate
          const inverted = paddedBinary.split('').map(bit => bit === '1' ? '0' : '1').join('');
          decimal = -parseInt(inverted, 2);
        } else {
          decimal = parseInt(paddedBinary, 2);
        }
        break;
      case 'sign_magnitude':
        if (isNegative) {
          // Remove sign bit and negate
          decimal = -parseInt(paddedBinary.slice(1), 2);
        } else {
          decimal = parseInt(paddedBinary.slice(1), 2);
        }
        break;
      default:
        return null;
    }

    return {
      binary: paddedBinary,
      decimal,
      steps: isNegative ? getConversionSteps(paddedBinary, rep) : ['Positive number: Direct binary to decimal conversion'],
    };
  };

  const getConversionSteps = (binary, rep) => {
    switch (rep) {
      case 'twos_complement':
        const invertedTwos = binary.split('').map(bit => bit === '1' ? '0' : '1').join('');
        const intermediateTwos = parseInt(invertedTwos, 2);
        return [
          `Original: ${binary}`,
          `Invert bits: ${invertedTwos}`,
          `Add 1: ${intermediateTwos + 1}`,
          `Negate: -${intermediateTwos + 1}`,
        ];
      case 'ones_complement':
        const invertedOnes = binary.split('').map(bit => bit === '1' ? '0' : '1').join('');
        return [
          `Original: ${binary}`,
          `Invert bits: ${invertedOnes}`,
          `Negate: -${parseInt(invertedOnes, 2)}`,
        ];
      case 'sign_magnitude':
        const magnitude = binary.slice(1);
        return [
          `Original: ${binary}`,
          `Sign bit: 1 (negative)`,
          `Magnitude: ${magnitude}`,
          `Decimal: -${parseInt(magnitude, 2)}`,
        ];
      default:
        return [];
    }
  };

  const handleConvert = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!binary) {
      setError('Please enter a binary number');
      return;
    }

    if (!validateBinary(binary)) {
      setError(`Invalid binary input or exceeds ${bitLength} bits`);
      return;
    }

    const conversion = binaryToSignedInteger(binary, representation);
    if (conversion) {
      setResult(conversion);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Signed Integer Converter
        </h1>

        <form onSubmit={handleConvert} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Number
              </label>
              <input
                type="text"
                value={binary}
                onChange={(e) => setBinary(e.target.value)}
                placeholder={`e.g., 1010 (max ${bitLength} bits)`}
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
                  onChange={(e) => setBitLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bitLengths.map(length => (
                    <option key={length} value={length}>{length}-bit</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Representation
                </label>
                <select
                  value={representation}
                  onChange={(e) => setRepresentation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(representations).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
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
            <div className="space-y-4 text-sm">
              <div>
                <p><span className="font-medium">Binary:</span> {result.binary}</p>
                <p><span className="font-medium">Signed Integer:</span> {result.decimal}</p>
                <p><span className="font-medium">Hex:</span> {result.decimal >= 0 ? 
                  result.decimal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0') : 
                  `-${Math.abs(result.decimal).toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), '0')}`}</p>
              </div>
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
              <li>Convert binary to signed integers</li>
              <li>Supports Two's Complement, One's Complement, and Sign-Magnitude</li>
              <li>4, 8, 16, or 32-bit lengths</li>
              <li>Detailed conversion steps for negative numbers</li>
              <li>Examples: 1111 (4-bit, Two's Complement) = -1</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToSignedInteger;