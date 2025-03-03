'use client';

import React, { useState } from 'react';

const BinaryToTwosComplement = () => {
  const [binaryInput, setBinaryInput] = useState('');
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [isSigned, setIsSigned] = useState(true); // Default to signed
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary);
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  const binaryToDecimal = (binary, signed = false) => {
    if (!signed) return parseInt(binary, 2);
    
    // Two's complement conversion for signed numbers
    const padded = padBinary(binary, bitLength);
    if (padded[0] === '0') return parseInt(padded, 2);
    
    // Invert bits and add 1, then negate
    const inverted = padded.split('').map(bit => bit === '0' ? '1' : '0').join('');
    return -(parseInt(inverted, 2) + 1);
  };

  const decimalToTwosComplement = (decimal, length) => {
    if (decimal >= 0) {
      return decimal.toString(2).padStart(length, '0');
    }
    
    // Two's complement for negative numbers
    const maxPositive = Math.pow(2, length) - 1;
    const flipped = maxPositive + decimal + 1;
    return flipped.toString(2).padStart(length, '0');
  };

  const calculateTwosComplement = () => {
    setError('');
    setResult(null);

    if (!binaryInput.trim()) {
      setError('Please enter a binary number');
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError('Invalid binary input: only 0s and 1s are allowed');
      return;
    }

    if (binaryInput.length > bitLength) {
      setError(`Input exceeds ${bitLength}-bit length`);
      return;
    }

    const paddedBinary = padBinary(binaryInput, bitLength);
    const decimal = binaryToDecimal(paddedBinary, isSigned);
    const twosComplement = isSigned ? paddedBinary : decimalToTwosComplement(decimal, bitLength);
    const unsignedDecimal = parseInt(paddedBinary, 2);

    setResult({
      input: paddedBinary,
      decimal: decimal,
      twosComplement: twosComplement,
      unsignedDecimal: unsignedDecimal,
      steps: isSigned && decimal < 0 ? [
        `Original: ${paddedBinary}`,
        `Invert bits: ${paddedBinary.split('').map(bit => bit === '0' ? '1' : '0').join('')}`,
        `Add 1: ${twosComplement}`,
        `Negate: ${decimal}`
      ] : null,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateTwosComplement();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Two's Complement Converter
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
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
                placeholder={`e.g., 1010 (${bitLength}-bit)`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interpretation
                </label>
                <select
                  value={isSigned ? 'signed' : 'unsigned'}
                  onChange={(e) => setIsSigned(e.target.value === 'signed')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="signed">Signed (Two's Complement)</option>
                  <option value="unsigned">Unsigned</option>
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
            <h2 className="text-lg font-semibold mb-2">Results:</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Input (Padded):</p>
                <p>{result.input}</p>
              </div>
              <div>
                <p className="font-medium">Decimal:</p>
                <p>
                  {isSigned ? 
                    `Signed: ${result.decimal}` : 
                    `Unsigned: ${result.unsignedDecimal}`}
                </p>
              </div>
              <div>
                <p className="font-medium">
                  {isSigned ? 'Two\'s Complement:' : 'Converted to Two\'s Complement:'}
                </p>
                <p>{result.twosComplement}</p>
              </div>
              {result.steps && (
                <div>
                  <p className="font-medium">Conversion Steps (Negative Number):</p>
                  <div className="font-mono text-xs space-y-1">
                    {result.steps.map((step, index) => (
                      <p key={index}>{step}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Usage</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Convert binary to signed/unsigned decimal using two's complement</li>
              <li>Supports 4, 8, 16, or 32-bit lengths</li>
              <li>Shows step-by-step conversion for negative numbers</li>
              <li>Signed range: [-2^(n-1) to 2^(n-1)-1]</li>
              <li>Unsigned range: [0 to 2^n-1]</li>
              <li>Example: 1010 (8-bit) = -6 (signed) or 10 (unsigned)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToTwosComplement;