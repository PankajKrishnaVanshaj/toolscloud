'use client'
import React, { useState } from 'react';

const PercentageDecreaseCalculator = () => {
  const [mode, setMode] = useState('decrease'); // decrease, final, initial
  const [initialValue, setInitialValue] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [percentDecrease, setPercentDecrease] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate percentage decrease based on mode
  const calculatePercentageDecrease = () => {
    setError('');
    setResult(null);

    const initialNum = parseFloat(initialValue);
    const finalNum = parseFloat(finalValue);
    const percentNum = parseFloat(percentDecrease);

    if (mode === 'decrease') {
      if (isNaN(initialNum) || isNaN(finalNum)) {
        return { error: 'Please enter valid initial and final values' };
      }
      if (initialNum <= 0) {
        return { error: 'Initial value must be positive' };
      }
      if (finalNum > initialNum) {
        return { error: 'Final value must be less than initial value for a decrease' };
      }
      const decrease = initialNum - finalNum;
      const percentDecreaseCalc = (decrease / initialNum) * 100;

      return {
        initialValue: initialNum.toFixed(2),
        finalValue: finalNum.toFixed(2),
        decrease: decrease.toFixed(2),
        percentDecrease: percentDecreaseCalc.toFixed(2),
        type: 'decrease'
      };
    } else if (mode === 'final') {
      if (isNaN(initialNum) || isNaN(percentNum)) {
        return { error: 'Please enter valid initial value and percentage decrease' };
      }
      if (initialNum <= 0) {
        return { error: 'Initial value must be positive' };
      }
      if (percentNum < 0 || percentNum > 100) {
        return { error: 'Percentage decrease must be between 0 and 100%' };
      }
      const decrease = (percentNum / 100) * initialNum;
      const finalValueCalc = initialNum - decrease;

      return {
        initialValue: initialNum.toFixed(2),
        finalValue: finalValueCalc.toFixed(2),
        decrease: decrease.toFixed(2),
        percentDecrease: percentNum.toFixed(2),
        type: 'final'
      };
    } else if (mode === 'initial') {
      if (isNaN(finalNum) || isNaN(percentNum)) {
        return { error: 'Please enter valid final value and percentage decrease' };
      }
      if (finalNum < 0) {
        return { error: 'Final value must be non-negative' };
      }
      if (percentNum < 0 || percentNum >= 100) {
        return { error: 'Percentage decrease must be between 0 and 99.99%' };
      }
      const initialValueCalc = finalNum / (1 - percentNum / 100);
      const decrease = initialValueCalc - finalNum;

      return {
        initialValue: initialValueCalc.toFixed(2),
        finalValue: finalNum.toFixed(2),
        decrease: decrease.toFixed(2),
        percentDecrease: percentNum.toFixed(2),
        type: 'initial'
      };
    }
    return null;
  };

  const calculate = () => {
    if ((mode === 'decrease' && (!initialValue || !finalValue)) ||
        (mode === 'final' && (!initialValue || !percentDecrease)) ||
        (mode === 'initial' && (!finalValue || !percentDecrease))) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculatePercentageDecrease();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('decrease');
    setInitialValue('');
    setFinalValue('');
    setPercentDecrease('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Percentage Decrease Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('decrease')}
            className={`px-3 py-1 rounded-lg ${mode === 'decrease' ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            % Decrease
          </button>
          <button
            onClick={() => setMode('final')}
            className={`px-3 py-1 rounded-lg ${mode === 'final' ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Final Value
          </button>
          <button
            onClick={() => setMode('initial')}
            className={`px-3 py-1 rounded-lg ${mode === 'initial' ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Initial Value
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {(mode === 'decrease' || mode === 'final') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Initial Value:</label>
                <input
                  type="number"
                  step="0.01"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            {(mode === 'decrease' || mode === 'initial') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Final Value:</label>
                <input
                  type="number"
                  step="0.01"
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 80"
                />
              </div>
            )}
            {(mode === 'final' || mode === 'initial') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Percent Decrease (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={percentDecrease}
                  onChange={(e) => setPercentDecrease(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 20"
                />
              </div>
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Initial Value: {result.initialValue}</p>
              <p className="text-center">Final Value: {result.finalValue}</p>
              <p className="text-center text-xl">
                Percentage Decrease: {result.percentDecrease}%
              </p>

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
                    {result.type === 'decrease' && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Final Value: {result.finalValue}</li>
                        <li>Decrease = Initial - Final = {result.initialValue} - {result.finalValue} = {result.decrease}</li>
                        <li>Percentage Decrease = (Decrease / Initial) × 100 = ({result.decrease} / {result.initialValue}) × 100 = {result.percentDecrease}%</li>
                      </>
                    )}
                    {result.type === 'final' && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Percentage Decrease: {result.percentDecrease}%</li>
                        <li>Decrease = (Percent Decrease / 100) × Initial = ({result.percentDecrease} / 100) × {result.initialValue} = {result.decrease}</li>
                        <li>Final Value = Initial - Decrease = {result.initialValue} - {result.decrease} = {result.finalValue}</li>
                      </>
                    )}
                    {result.type === 'initial' && (
                      <>
                        <li>Final Value: {result.finalValue}</li>
                        <li>Percentage Decrease: {result.percentDecrease}%</li>
                        <li>Initial Value = Final / (1 - Percent Decrease / 100) = {result.finalValue} / (1 - {result.percentDecrease} / 100) = {result.initialValue}</li>
                        <li>Decrease = Initial - Final = {result.initialValue} - {result.finalValue} = {result.decrease}</li>
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

export default PercentageDecreaseCalculator;