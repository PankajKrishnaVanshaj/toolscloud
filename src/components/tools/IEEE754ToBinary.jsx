'use client';

import React, { useState } from 'react';

const IEEE754ToBinary = () => {
  const [number, setNumber] = useState('');
  const [precision, setPrecision] = useState('single'); // 'single' or 'double'
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  const toIEEE754 = (input, isDouble) => {
    const num = parseFloat(input);
    if (isNaN(num)) {
      setError('Invalid number');
      return null;
    }

    // Handle special cases
    if (!Number.isFinite(num)) {
      return {
        binary: isDouble ? '0'.repeat(64) : '0'.repeat(32), // Infinity or NaN
        sign: num > 0 ? '0' : '1',
        exponent: '1'.repeat(isDouble ? 11 : 8),
        mantissa: '0'.repeat(isDouble ? 52 : 23),
        steps: [`Special case: ${num === Infinity ? 'Infinity' : num === -Infinity ? '-Infinity' : 'NaN'}`],
      };
    }

    const bits = isDouble ? 64 : 32;
    const expBits = isDouble ? 11 : 8;
    const mantissaBits = isDouble ? 52 : 23;
    const bias = isDouble ? 1023 : 127;

    // Get sign
    const sign = num >= 0 ? '0' : '1';
    const absNum = Math.abs(num);

    // Convert to binary
    let exponent = Math.floor(Math.log2(absNum));
    let mantissa = absNum / Math.pow(2, exponent) - 1;
    let expBinary = (exponent + bias).toString(2).padStart(expBits, '0');
    let mantBinary = '';

    // Handle subnormal numbers
    if (exponent < -bias + 1) {
      mantissa = absNum / Math.pow(2, -bias + 1);
      expBinary = '0'.repeat(expBits);
    }

    // Convert mantissa to binary
    for (let i = 0; i < mantissaBits; i++) {
      mantissa *= 2;
      mantBinary += Math.floor(mantissa);
      mantissa %= 1;
    }

    // Full binary representation
    const binary = sign + expBinary + mantBinary;

    // Steps for explanation
    const steps = [
      `Input: ${num}`,
      `Sign bit: ${sign} (${num >= 0 ? 'positive' : 'negative'})`,
      `Exponent (decimal): ${exponent}, biased: ${exponent + bias}`,
      `Exponent (binary): ${expBinary}`,
      `Mantissa (decimal): ${absNum / Math.pow(2, exponent) - 1}`,
      `Mantissa (binary): ${mantBinary}`,
      `Full IEEE 754: ${binary}`,
    ];

    return {
      binary,
      sign,
      exponent: expBinary,
      mantissa: mantBinary,
      steps,
    };
  };

  const handleConvert = () => {
    setError('');
    setResult(null);
    if (!number) {
      setError('Please enter a number');
      return;
    }

    const isDouble = precision === 'double';
    const conversion = toIEEE754(number, isDouble);
    if (conversion) {
      setResult(conversion);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          IEEE 754 to Binary Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Number
              </label>
              <input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g., 3.14"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precision
                </label>
                <select
                  value={precision}
                  onChange={(e) => setPrecision(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single">Single (32-bit)</option>
                  <option value="double">Double (64-bit)</option>
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

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Result:</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Binary:</span> {result.binary.match(/.{1,8}/g)?.join(' ') || result.binary}
                </p>
                <p>
                  <span className="font-medium">Sign:</span> {result.sign} ({result.sign === '0' ? 'Positive' : 'Negative'})
                </p>
                <p>
                  <span className="font-medium">Exponent:</span> {result.exponent}
                </p>
                <p>
                  <span className="font-medium">Mantissa:</span> {result.mantissa.match(/.{1,8}/g)?.join(' ') || result.mantissa}
                </p>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={showSteps}
                    onChange={(e) => setShowSteps(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Show Conversion Steps
                </label>
                {showSteps && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <h3 className="font-medium">Steps:</h3>
                    <ul className="list-disc list-inside text-sm">
                      {result.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
            <summary className="cursor-pointer font-medium">Features & Notes</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Converts to IEEE 754 single (32-bit) or double (64-bit) precision</li>
              <li>Shows sign, exponent, and mantissa separately</li>
              <li>Handles special cases (Infinity, NaN)</li>
              <li>Step-by-step explanation toggle</li>
              <li>Input any decimal number (e.g., 3.14, -42, 0.001)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default IEEE754ToBinary;