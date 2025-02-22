'use client'
import React, { useState } from 'react';

const PercentageDifferenceCalculator = () => {
  const [number1, setNumber1] = useState('');
  const [number2, setNumber2] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate percentage difference
  const calculatePercentageDifference = (num1, num2) => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) {
      return { error: 'Please enter valid numbers' };
    }
    if (n1 === 0 && n2 === 0) {
      return { error: 'Both numbers cannot be zero (undefined percentage difference)' };
    }

    // Absolute percentage difference: |n2 - n1| / ((n1 + n2) / 2) * 100
    const absoluteDiff = Math.abs(n2 - n1);
    const average = (n1 + n2) / 2;
    const percentDiff = average === 0 ? 0 : (absoluteDiff / average) * 100;

    // Directional change: (n2 - n1) / |n1| * 100
    const directionalChange = n1 === 0 ? (n2 > 0 ? Infinity : -Infinity) : ((n2 - n1) / Math.abs(n1)) * 100;
    const isIncrease = n2 > n1;

    return {
      number1: n1.toFixed(2),
      number2: n2.toFixed(2),
      percentDiff: percentDiff.toFixed(2),
      directionalChange: isFinite(directionalChange) ? directionalChange.toFixed(2) : directionalChange,
      absoluteDiff: absoluteDiff.toFixed(2),
      average: average.toFixed(2),
      isIncrease,
      isZeroBase: n1 === 0
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!number1 || !number2) {
      setError('Please enter both numbers');
      return;
    }

    const calcResult = calculatePercentageDifference(number1, number2);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setNumber1('');
    setNumber2('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Percentage Difference Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Number 1:</label>
              <input
                type="number"
                step="0.01"
                value={number1}
                onChange={(e) => setNumber1(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Number 2:</label>
              <input
                type="number"
                step="0.01"
                value={number2}
                onChange={(e) => setNumber2(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 120"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all font-semibold"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">
                Percentage Difference: {result.percentDiff}%
              </p>
              <p className="text-center">
                {result.isZeroBase
                  ? 'Directional Change: Undefined (base is zero)'
                  : `Directional Change: ${result.isIncrease ? 'Increase' : 'Decrease'} by ${Math.abs(result.directionalChange)}%`}
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-teal-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Number 1: {result.number1}</li>
                    <li>Number 2: {result.number2}</li>
                    <li>Absolute Difference = |Number 2 - Number 1| = |{result.number2} - {result.number1}| = {result.absoluteDiff}</li>
                    <li>Average = (Number 1 + Number 2) / 2 = ({result.number1} + {result.number2}) / 2 = {result.average}</li>
                    <li>Percentage Difference = (Absolute Difference / Average) × 100 = ({result.absoluteDiff} / {result.average}) × 100 = {result.percentDiff}%</li>
                    <li>Directional Change = ((Number 2 - Number 1) / |Number 1|) × 100 = 
                      {result.isZeroBase 
                        ? `${result.number2 > 0 ? 'Infinity' : '-Infinity'} (division by zero)`
                        : `(${result.number2} - ${result.number1}) / |${result.number1}| × 100 = ${result.directionalChange}%`}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PercentageDifferenceCalculator;