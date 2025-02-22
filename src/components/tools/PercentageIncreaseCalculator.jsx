'use client'
import React, { useState } from 'react';

const PercentageIncreaseCalculator = () => {
  const [mode, setMode] = useState('increase'); // increase, final, initial
  const [initialValue, setInitialValue] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [percentIncrease, setPercentIncrease] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate percentage increase based on mode
  const calculatePercentageIncrease = () => {
    setError('');
    setResult(null);

    const initialNum = parseFloat(initialValue);
    const finalNum = parseFloat(finalValue);
    const percentNum = parseFloat(percentIncrease);

    if (mode === 'increase') {
      if (isNaN(initialNum) || isNaN(finalNum)) {
        return { error: 'Please enter valid initial and final values' };
      }
      if (initialNum <= 0) {
        return { error: 'Initial value must be positive' };
      }
      if (finalNum < initialNum) {
        return { error: 'Final value must be greater than initial value for an increase' };
      }
      const increase = finalNum - initialNum;
      const percentIncreaseCalc = (increase / initialNum) * 100;

      return {
        initialValue: initialNum.toFixed(2),
        finalValue: finalNum.toFixed(2),
        increase: increase.toFixed(2),
        percentIncrease: percentIncreaseCalc.toFixed(2),
        type: 'increase'
      };
    } else if (mode === 'final') {
      if (isNaN(initialNum) || isNaN(percentNum)) {
        return { error: 'Please enter valid initial value and percentage increase' };
      }
      if (initialNum <= 0) {
        return { error: 'Initial value must be positive' };
      }
      if (percentNum < 0) {
        return { error: 'Percentage increase must be non-negative' };
      }
      const increase = (percentNum / 100) * initialNum;
      const finalValueCalc = initialNum + increase;

      return {
        initialValue: initialNum.toFixed(2),
        finalValue: finalValueCalc.toFixed(2),
        increase: increase.toFixed(2),
        percentIncrease: percentNum.toFixed(2),
        type: 'final'
      };
    } else if (mode === 'initial') {
      if (isNaN(finalNum) || isNaN(percentNum)) {
        return { error: 'Please enter valid final value and percentage increase' };
      }
      if (finalNum <= 0) {
        return { error: 'Final value must be positive' };
      }
      if (percentNum < 0) {
        return { error: 'Percentage increase must be non-negative' };
      }
      const initialValueCalc = finalNum / (1 + percentNum / 100);
      const increase = finalNum - initialValueCalc;

      return {
        initialValue: initialValueCalc.toFixed(2),
        finalValue: finalNum.toFixed(2),
        increase: increase.toFixed(2),
        percentIncrease: percentNum.toFixed(2),
        type: 'initial'
      };
    }
    return null;
  };

  const calculate = () => {
    if ((mode === 'increase' && (!initialValue || !finalValue)) ||
        (mode === 'final' && (!initialValue || !percentIncrease)) ||
        (mode === 'initial' && (!finalValue || !percentIncrease))) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculatePercentageIncrease();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('increase');
    setInitialValue('');
    setFinalValue('');
    setPercentIncrease('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Percentage Increase Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('increase')}
            className={`px-3 py-1 rounded-lg ${mode === 'increase' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            % Increase
          </button>
          <button
            onClick={() => setMode('final')}
            className={`px-3 py-1 rounded-lg ${mode === 'final' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Final Value
          </button>
          <button
            onClick={() => setMode('initial')}
            className={`px-3 py-1 rounded-lg ${mode === 'initial' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Initial Value
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {(mode === 'increase' || mode === 'final') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Initial Value:</label>
                <input
                  type="number"
                  step="0.01"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            {(mode === 'increase' || mode === 'initial') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Final Value:</label>
                <input
                  type="number"
                  step="0.01"
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 120"
                />
              </div>
            )}
            {(mode === 'final' || mode === 'initial') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Percent Increase (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={percentIncrease}
                  onChange={(e) => setPercentIncrease(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 20"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Initial Value: {result.initialValue}</p>
              <p className="text-center">Final Value: {result.finalValue}</p>
              <p className="text-center text-xl">
                Percentage Increase: {result.percentIncrease}%
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-green-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === 'increase' && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Final Value: {result.finalValue}</li>
                        <li>Increase = Final - Initial = {result.finalValue} - {result.initialValue} = {result.increase}</li>
                        <li>Percentage Increase = (Increase / Initial) × 100 = ({result.increase} / {result.initialValue}) × 100 = {result.percentIncrease}%</li>
                      </>
                    )}
                    {result.type === 'final' && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Percentage Increase: {result.percentIncrease}%</li>
                        <li>Increase = (Percent Increase / 100) × Initial = ({result.percentIncrease} / 100) × {result.initialValue} = {result.increase}</li>
                        <li>Final Value = Initial + Increase = {result.initialValue} + {result.increase} = {result.finalValue}</li>
                      </>
                    )}
                    {result.type === 'initial' && (
                      <>
                        <li>Final Value: {result.finalValue}</li>
                        <li>Percentage Increase: {result.percentIncrease}%</li>
                        <li>Initial Value = Final / (1 + Percent Increase / 100) = {result.finalValue} / (1 + {result.percentIncrease} / 100) = {result.initialValue}</li>
                        <li>Increase = Final - Initial = {result.finalValue} - {result.initialValue} = {result.increase}</li>
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

export default PercentageIncreaseCalculator;