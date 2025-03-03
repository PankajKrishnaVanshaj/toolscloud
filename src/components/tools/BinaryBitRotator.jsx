'use client';

import React, { useState } from 'react';

const BinaryBitRotator = () => {
  const [input, setInput] = useState('');
  const [bitLength, setBitLength] = useState(8); // Options: 8, 16, 32, 64
  const [shiftAmount, setShiftAmount] = useState(1);
  const [direction, setDirection] = useState('left'); // 'left' or 'right'
  const [result, setResult] = useState('');
  const [decimalResult, setDecimalResult] = useState('');
  const [hexResult, setHexResult] = useState('');
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState('');

  const bitLengths = [8, 16, 32, 64];

  const padBinary = (bin, length) => {
    return bin.padStart(length, '0').slice(-length);
  };

  const rotateBits = (binary, amount, dir) => {
    const normalizedBinary = padBinary(binary, bitLength);
    const stepsArray = [normalizedBinary];
    let current = normalizedBinary;

    amount = amount % bitLength; // Normalize shift amount to bit length
    if (amount === 0) return current;

    for (let i = 0; i < amount; i++) {
      if (dir === 'left') {
        current = current.slice(1) + current[0];
      } else {
        current = current[current.length - 1] + current.slice(0, -1);
      }
      stepsArray.push(current);
    }

    return { final: current, steps: stepsArray };
  };

  const handleRotate = () => {
    setError('');
    setSteps([]);
    setResult('');
    setDecimalResult('');
    setHexResult('');

    // Validate and convert input
    let binary;
    if (/^[01]+$/.test(input)) {
      binary = input;
    } else if (/^[0-9]+$/.test(input)) {
      binary = parseInt(input, 10).toString(2);
    } else if (/^0x[0-9A-Fa-f]+$/.test(input)) {
      binary = parseInt(input, 16).toString(2);
    } else {
      setError('Invalid input: Use binary (0s and 1s), decimal, or hex (0x prefix)');
      return;
    }

    // Ensure binary fits within bit length
    if (binary.length > bitLength) {
      setError(`Input exceeds ${bitLength}-bit length`);
      return;
    }

    const { final, steps } = rotateBits(binary, shiftAmount, direction);
    setResult(final);
    setSteps(steps);
    setDecimalResult(parseInt(final, 2).toString(10));
    setHexResult('0x' + parseInt(final, 2).toString(16).toUpperCase());
  };

  const handleInputChange = (value) => {
    setInput(value);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Bit Rotator
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input (Binary, Decimal, or Hex)
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="e.g., 1010, 10, or 0xA"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => setBitLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bitLengths.map((len) => (
                    <option key={len} value={len}>{len}-bit</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Amount
                </label>
                <input
                  type="number"
                  value={shiftAmount}
                  onChange={(e) => setShiftAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Direction
                </label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleRotate}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Rotate Bits
            </button>
          </div>

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Binary:</span> {result}</p>
                <p><span className="font-medium">Decimal:</span> {decimalResult}</p>
                <p><span className="font-medium">Hex:</span> {hexResult}</p>
              </div>
            </div>
          )}

          {/* Steps Section */}
          {steps.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Rotation Steps:</h2>
              <div className="space-y-2 text-sm font-mono">
                {steps.map((step, index) => (
                  <p key={index}>
                    Step {index}: {step} {index === steps.length - 1 && '(Final)'}
                  </p>
                ))}
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
              <li>Rotate bits left or right (circular shift)</li>
              <li>Supports 8, 16, 32, 64-bit lengths</li>
              <li>Input: binary (e.g., 1010), decimal (e.g., 10), or hex (e.g., 0xA)</li>
              <li>Shows step-by-step rotation process</li>
              <li>Outputs in binary, decimal, and hex</li>
              <li>Shift amount is normalized to bit length</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryBitRotator;