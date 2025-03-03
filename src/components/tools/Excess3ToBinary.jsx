'use client';

import React, { useState } from 'react';

const Excess3ToBinary = () => {
  const [excess3Input, setExcess3Input] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [bitLength, setBitLength] = useState(4); // Default to 4-bit per digit
  const [showSteps, setShowSteps] = useState(false);

  // Validate Excess-3 input (each 4-bit group should be between 0011 and 1100, i.e., 3 to 12 in decimal)
  const validateExcess3 = (input) => {
    const groups = input.match(/.{1,4}/g) || [];
    return groups.every(group => {
      if (group.length !== 4) return false;
      const decimal = parseInt(group, 2);
      return /^[01]+$/.test(group) && decimal >= 3 && decimal <= 12;
    });
  };

  const excess3ToBinary = (excess3) => {
    const groups = excess3.match(/.{1,4}/g) || [];
    const binaryGroups = groups.map(group => {
      const decimal = parseInt(group, 2) - 3; // Subtract 3 (Excess-3 offset)
      return decimal.toString(2).padStart(4, '0');
    });
    return binaryGroups.join('');
  };

  const binaryToDecimal = (binary) => {
    return parseInt(binary, 2);
  };

  const binaryToExcess3 = (binary) => {
    const groups = binary.match(/.{1,4}/g) || [binary.padStart(4, '0')];
    return groups.map(group => {
      const decimal = parseInt(group, 2) + 3; // Add 3 (Excess-3 offset)
      return decimal.toString(2).padStart(4, '0');
    }).join('');
  };

  const handleConvert = (direction = 'excess3ToBinary') => {
    setError('');
    setResult(null);

    if (!excess3Input.trim()) {
      setError('Please enter an Excess-3 code');
      return;
    }

    let binaryResult, decimalResult, steps = [];

    if (direction === 'excess3ToBinary') {
      // Excess-3 to Binary
      const cleanedInput = excess3Input.replace(/\s/g, '');
      if (!validateExcess3(cleanedInput)) {
        setError('Invalid Excess-3 code. Each 4-bit group must represent 0-9 (0011-1100)');
        return;
      }

      binaryResult = excess3ToBinary(cleanedInput);
      decimalResult = binaryToDecimal(binaryResult);

      const groups = cleanedInput.match(/.{1,4}/g);
      steps = groups.map((group, index) => {
        const excess3Decimal = parseInt(group, 2);
        const actualDecimal = excess3Decimal - 3;
        const binary = actualDecimal.toString(2).padStart(4, '0');
        return `${group} (Excess-3: ${excess3Decimal}) - 3 = ${actualDecimal} (Binary: ${binary})`;
      });

    } else {
      // Binary to Excess-3
      const cleanedInput = excess3Input.replace(/\s/g, '');
      if (!/^[01]+$/.test(cleanedInput)) {
        setError('Invalid binary input. Use only 0s and 1s');
        return;
      }

      binaryResult = cleanedInput;
      decimalResult = binaryToDecimal(binaryResult);
      const excess3Result = binaryToExcess3(binaryResult);

      const groups = binaryResult.match(/.{1,4}/g) || [binaryResult.padStart(4, '0')];
      steps = groups.map((group, index) => {
        const decimal = parseInt(group, 2);
        const excess3Decimal = decimal + 3;
        const excess3 = excess3Decimal.toString(2).padStart(4, '0');
        return `${group} (Decimal: ${decimal}) + 3 = ${excess3Decimal} (Excess-3: ${excess3})`;
      });

      setExcess3Input(excess3Result);
    }

    setResult({
      binary: binaryResult,
      decimal: decimalResult,
      steps: steps,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Excess-3 to Binary Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excess-3 or Binary Input
              </label>
              <input
                type="text"
                value={excess3Input}
                onChange={(e) => setExcess3Input(e.target.value)}
                placeholder="e.g., 01100110 (Excess-3 for 35)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleConvert('excess3ToBinary')}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Convert Excess-3 to Binary
              </button>
              <button
                onClick={() => handleConvert('binaryToExcess3')}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Convert Binary to Excess-3
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length per Digit
              </label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4-bit (standard)</option>
                <option value={8}>8-bit</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={(e) => setShowSteps(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Show Conversion Steps
            </label>
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
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p><span className="font-medium">Binary:</span> {result.binary.match(/.{1,4}/g)?.join(' ') || result.binary}</p>
                  <p><span className="font-medium">Decimal:</span> {result.decimal}</p>
                  <p><span className="font-medium">Hex:</span> {result.decimal.toString(16).toUpperCase()}</p>
                </div>
                {showSteps && (
                  <div>
                    <p className="font-medium">Conversion Steps:</p>
                    <ul className="list-disc list-inside font-mono">
                      {result.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
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
              <li>Convert Excess-3 to Binary and vice versa</li>
              <li>Supports multiple digits (4-bit groups)</li>
              <li>Valid Excess-3 codes: 0011 (0) to 1100 (9)</li>
              <li>Optional step-by-step explanation</li>
              <li>Example: 01100110 (Excess-3) = 00110011 (Binary) = 35 (Decimal)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Excess3ToBinary;