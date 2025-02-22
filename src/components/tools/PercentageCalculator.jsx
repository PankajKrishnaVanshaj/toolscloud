'use client'
import React, { useState } from 'react';

const PercentageCalculator = () => {
  const [mode, setMode] = useState('percentOf'); // percentOf, whatPercent, change
  const [number1, setNumber1] = useState('');
  const [number2, setNumber2] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate percentage based on mode
  const calculatePercentage = () => {
    setError('');
    setResult(null);

    const num1 = parseFloat(number1);
    const num2 = parseFloat(number2);

    if (isNaN(num1) || (mode !== 'percentOf' && isNaN(num2))) {
      return { error: 'Please enter valid numbers' };
    }

    if (mode === 'percentOf') {
      // What is X% of Y?
      if (num2 <= 0) {
        return { error: 'Base number must be positive' };
      }
      const resultValue = (num1 / 100) * num2;
      return {
        result: resultValue.toFixed(2),
        percentage: num1,
        base: num2,
        type: 'percentOf'
      };
    } else if (mode === 'whatPercent') {
      // What percent is X of Y?
      if (num2 === 0) {
        return { error: 'Denominator cannot be zero' };
      }
      const percentage = (num1 / num2) * 100;
      return {
        result: percentage.toFixed(2),
        part: num1,
        whole: num2,
        type: 'whatPercent'
      };
    } else if (mode === 'change') {
      // Percentage increase/decrease from X to Y
      if (num1 === 0) {
        return { error: 'Initial value cannot be zero' };
      }
      const change = ((num2 - num1) / Math.abs(num1)) * 100;
      return {
        result: change.toFixed(2),
        initial: num1,
        final: num2,
        type: 'change',
        isIncrease: num2 > num1
      };
    }
    return null;
  };

  const calculate = () => {
    if (!number1 || (mode !== 'percentOf' && !number2)) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculatePercentage();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('percentOf');
    setNumber1('');
    setNumber2('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Percentage Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('percentOf')}
            className={`px-3 py-1 rounded-lg ${mode === 'percentOf' ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            % of Number
          </button>
          <button
            onClick={() => setMode('whatPercent')}
            className={`px-3 py-1 rounded-lg ${mode === 'whatPercent' ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            What %
          </button>
          <button
            onClick={() => setMode('change')}
            className={`px-3 py-1 rounded-lg ${mode === 'change' ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            % Change
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {mode === 'percentOf' && (
              <>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Percentage (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number1}
                    onChange={(e) => setNumber1(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Of Number:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number2}
                    onChange={(e) => setNumber2(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 100"
                  />
                </div>
              </>
            )}
            {mode === 'whatPercent' && (
              <>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Part:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number1}
                    onChange={(e) => setNumber1(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Whole:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number2}
                    onChange={(e) => setNumber2(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 100"
                  />
                </div>
              </>
            )}
            {mode === 'change' && (
              <>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Initial Value:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number1}
                    onChange={(e) => setNumber1(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-32 text-gray-700">Final Value:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number2}
                    onChange={(e) => setNumber2(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., 150"
                  />
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <div className="mt-2 space-y-2">
              {result.type === 'percentOf' && (
                <p className="text-center text-xl">
                  {result.percentage}% of {result.base} = {result.result}
                </p>
              )}
              {result.type === 'whatPercent' && (
                <p className="text-center text-xl">
                  {result.part} is {result.result}% of {result.whole}
                </p>
              )}
              {result.type === 'change' && (
                <p className="text-center text-xl">
                  {result.isIncrease ? 'Increase' : 'Decrease'} from {result.initial} to {result.final} = {Math.abs(result.result)}%
                </p>
              )}

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-orange-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === 'percentOf' && (
                      <>
                        <li>Formula: (Percentage / 100) × Base</li>
                        <li>({result.percentage} / 100) × {result.base} = {result.result}</li>
                      </>
                    )}
                    {result.type === 'whatPercent' && (
                      <>
                        <li>Formula: (Part / Whole) × 100</li>
                        <li>({result.part} / {result.whole}) × 100 = {result.result}%</li>
                      </>
                    )}
                    {result.type === 'change' && (
                      <>
                        <li>Formula: ((Final - Initial) / |Initial|) × 100</li>
                        <li>(({result.final} - {result.initial}) / |{result.initial}|) × 100 = {result.result}%</li>
                        <li>{result.isIncrease ? 'Increase' : 'Decrease'} by {Math.abs(result.result)}%</li>
                      </>
                    )}
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

export default PercentageCalculator;