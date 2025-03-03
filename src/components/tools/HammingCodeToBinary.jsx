'use client';

import React, { useState } from 'react';

const HammingCodeToBinary = () => {
  const [hammingCode, setHammingCode] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [bitLength, setBitLength] = useState(7); // Default to (7,4) Hamming code

  const calculateParityPositions = (length) => {
    const parityBits = [];
    for (let i = 0; i < length; i++) {
      if ((i & (i - 1)) === 0) parityBits.push(i); // Power of 2 positions
    }
    return parityBits;
  };

  const validateHammingCode = (code) => {
    if (!/^[01]+$/.test(code)) return false;
    const minLength = bitLength === 7 ? 7 : bitLength === 15 ? 15 : 31;
    return code.length === minLength;
  };

  const decodeHammingCode = (code) => {
    const parityPositions = calculateParityPositions(code.length);
    const parityCount = parityPositions.length;

    // Calculate syndrome
    const syndrome = [];
    for (let p of parityPositions) {
      let parity = 0;
      for (let i = p; i < code.length; i++) {
        if ((i + 1) & (p + 1)) {
          parity ^= parseInt(code[i]);
        }
      }
      syndrome.push(parity);
    }

    // Determine error position (if any)
    const errorPos = parseInt(syndrome.reverse().join(''), 2) - 1;
    let correctedCode = code;
    if (errorPos >= 0 && errorPos < code.length) {
      correctedCode = code.substring(0, errorPos) + (code[errorPos] === '0' ? '1' : '0') + code.substring(errorPos + 1);
    }

    // Extract data bits
    const dataBits = [];
    for (let i = 0; i < code.length; i++) {
      if (!parityPositions.includes(i)) {
        dataBits.push(correctedCode[i]);
      }
    }

    const binary = dataBits.join('');
    const decimal = parseInt(binary, 2);
    const hex = decimal.toString(16).toUpperCase().padStart(Math.ceil(binary.length / 4), '0');

    return {
      originalCode: code,
      syndrome: syndrome.reverse().join(''),
      errorPosition: errorPos >= 0 && errorPos < code.length ? errorPos + 1 : 'None',
      correctedCode,
      binary,
      decimal,
      hex,
      parityPositions,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!hammingCode) {
      setError('Please enter a Hamming code');
      return;
    }

    if (!validateHammingCode(hammingCode)) {
      setError(`Invalid Hamming code: Must be ${bitLength} bits of 0s and 1s`);
      return;
    }

    const decoded = decodeHammingCode(hammingCode);
    setResult(decoded);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Hamming Code to Binary Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hamming Code
              </label>
              <input
                type="text"
                value={hammingCode}
                onChange={(e) => setHammingCode(e.target.value)}
                placeholder={`e.g., ${bitLength === 7 ? '0110100' : bitLength === 15 ? '011001101010101' : '0110011010101010110011010101010'}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => {
                  setBitLength(parseInt(e.target.value));
                  setHammingCode('');
                  setResult(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>7-bit (4 data, 3 parity)</option>
                <option value={15}>15-bit (11 data, 4 parity)</option>
                <option value={31}>31-bit (26 data, 5 parity)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Decode Hamming Code
            </button>
          </div>
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
            <h2 className="text-lg font-semibold mb-2">Results:</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Input Hamming Code:</p>
                <p>{result.originalCode}</p>
              </div>
              <div>
                <p className="font-medium">Syndrome:</p>
                <p>{result.syndrome} (Error at position: {result.errorPosition})</p>
              </div>
              {result.errorPosition !== 'None' && (
                <div>
                  <p className="font-medium">Corrected Code:</p>
                  <p>{result.correctedCode}</p>
                </div>
              )}
              <div>
                <p className="font-medium">Decoded Data:</p>
                <div className="flex flex-col gap-1">
                  <p>Binary: {result.binary}</p>
                  <p>Decimal: {result.decimal}</p>
                  <p>Hex: {result.hex}</p>
                </div>
              </div>
              <div>
                <p className="font-medium">Bit Positions:</p>
                <div className="font-mono text-xs">
                  <p>{result.correctedCode.split('').map((bit, i) => (
                    result.parityPositions.includes(i) ? <span key={i} className="text-blue-600">{bit}</span> : bit
                  ))}</p>
                  <p>{Array(result.correctedCode.length).fill(' ').map((_, i) => (
                    result.parityPositions.includes(i) ? <span key={i} className="text-blue-600">P</span> : 'D'
                  ))}</p>
                  <p className="text-gray-500">P = Parity, D = Data</p>
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
              <li>Decodes Hamming codes to binary data</li>
              <li>Detects and corrects single-bit errors</li>
              <li>Supports (7,4), (15,11), and (31,26) Hamming codes</li>
              <li>Shows syndrome and error position</li>
              <li>Outputs binary, decimal, and hex</li>
              <li>Example: 0110100 → 1100 (decimal 12)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default HammingCodeToBinary;