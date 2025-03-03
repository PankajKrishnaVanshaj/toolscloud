'use client';

import React, { useState } from 'react';

const BinaryDivisionCalculator = () => {
  const [dividend, setDividend] = useState('');
  const [divisor, setDivisor] = useState('');
  const [bitLength, setBitLength] = useState(8); // Default to 8-bit
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(true);

  const validateBinary = (binary) => {
    return /^[01]+$/.test(binary);
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, '0');
  };

  const binaryToDecimal = (binary) => {
    return parseInt(binary, 2);
  };

  const decimalToBinary = (decimal, length) => {
    return decimal.toString(2).padStart(length, '0');
  };

  const performBinaryDivision = () => {
    setError('');
    setResult(null);

    // Validate inputs
    if (!dividend || !divisor) {
      setError('Please enter both dividend and divisor');
      return;
    }
    if (!validateBinary(dividend) || !validateBinary(divisor)) {
      setError('Invalid binary input: Use only 0s and 1s');
      return;
    }

    const dividendDec = binaryToDecimal(dividend);
    const divisorDec = binaryToDecimal(divisor);

    if (divisorDec === 0) {
      setError('Division by zero is not allowed');
      return;
    }

    // Perform division
    const quotientDec = Math.floor(dividendDec / divisorDec);
    const remainderDec = dividendDec % divisorDec;

    const paddedDividend = padBinary(dividend, bitLength);
    const paddedDivisor = padBinary(divisor, bitLength);
    const quotientBin = decimalToBinary(quotientDec, bitLength);
    const remainderBin = decimalToBinary(remainderDec, bitLength);

    // Generate division steps
    const steps = [];
    let currentDividend = dividend;
    let stepDividend = '';

    for (let i = 0; i < dividend.length; i++) {
      stepDividend += currentDividend[i];
      const stepDividendDec = binaryToDecimal(stepDividend);
      const stepQuotientDigit = stepDividendDec >= divisorDec ? '1' : '0';
      const subtractValue = stepQuotientDigit === '1' ? divisorDec : 0;
      const stepResultDec = stepDividendDec - subtractValue;
      const stepResultBin = decimalToBinary(stepResultDec, stepDividend.length);

      steps.push({
        dividend: padBinary(stepDividend, dividend.length),
        subtract: subtractValue ? padBinary(divisor, dividend.length) : '0'.repeat(dividend.length),
        result: padBinary(stepResultBin, dividend.length),
        quotientDigit: stepQuotientDigit,
      });

      stepDividend = stepResultBin;
    }

    setResult({
      dividend: paddedDividend,
      divisor: paddedDivisor,
      quotient: quotientBin,
      remainder: remainderBin,
      quotientDec,
      remainderDec,
      steps,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performBinaryDivision();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Binary Division Calculator
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dividend (Binary)
              </label>
              <input
                type="text"
                value={dividend}
                onChange={(e) => setDividend(e.target.value)}
                placeholder="e.g., 1010"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Divisor (Binary)
              </label>
              <input
                type="text"
                value={divisor}
                onChange={(e) => setDivisor(e.target.value)}
                placeholder="e.g., 10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Options */}
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
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showSteps}
                onChange={(e) => setShowSteps(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">
                Show Division Steps
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate
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
                <p><span className="font-medium">Dividend:</span> {result.dividend} (decimal: {binaryToDecimal(result.dividend)})</p>
                <p><span className="font-medium">Divisor:</span> {result.divisor} (decimal: {binaryToDecimal(result.divisor)})</p>
              </div>
              <div>
                <p><span className="font-medium">Quotient:</span> {result.quotient} (decimal: {result.quotientDec})</p>
                <p><span className="font-medium">Remainder:</span> {result.remainder} (decimal: {result.remainderDec})</p>
              </div>
              {showSteps && (
                <div>
                  <p className="font-medium">Division Steps:</p>
                  <div className="font-mono text-xs overflow-x-auto">
                    {result.steps.map((step, index) => (
                      <div key={index} className="mb-2">
                        <p>{step.dividend} (Step {index + 1})</p>
                        <p>- {step.subtract}</p>
                        <p className="border-t border-gray-300">{step.result} (Q: {step.quotientDigit})</p>
                      </div>
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
              <li>Performs binary division with quotient and remainder</li>
              <li>Supports 4, 8, 16, or 32-bit representations</li>
              <li>Shows step-by-step division process (toggleable)</li>
              <li>Results in binary and decimal formats</li>
              <li>Example: 1010 / 10 = 101 (10 / 2 = 5, remainder 0)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryDivisionCalculator;