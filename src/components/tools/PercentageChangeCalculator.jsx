'use client'
import React, { useState } from 'react';

const PercentageChangeCalculator = () => {
  const [mode, setMode] = useState('change'); // change, final, initial
  const [initialValue, setInitialValue] = useState('');
  const [finalValue, setFinalValue] = useState('');
  const [percentChange, setPercentChange] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate percentage change based on mode
  const calculatePercentageChange = () => {
    setError('');
    setResult(null);

    const initialNum = parseFloat(initialValue);
    const finalNum = parseFloat(finalValue);
    const percentNum = parseFloat(percentChange);

    if (mode === 'change') {
      if (isNaN(initialNum) || isNaN(finalNum)) {
        return { error: 'Please enter valid initial and final values' };
      }
      if (initialNum === 0) {
        return { error: 'Initial value cannot be zero (undefined percentage change)' };
      }
      const change = finalNum - initialNum;
      const percentChangeCalc = (change / Math.abs(initialNum)) * 100;
      const isIncrease = finalNum > initialNum;

      return {
        initialValue: initialNum.toFixed(2),
        finalValue: finalNum.toFixed(2),
        change: change.toFixed(2),
        percentChange: percentChangeCalc.toFixed(2),
        isIncrease,
        type: 'change'
      };
    } else if (mode === 'final') {
      if (isNaN(initialNum) || isNaN(percentNum)) {
        return { error: 'Please enter valid initial value and percentage change' };
      }
      if (initialNum === 0) {
        return { error: 'Initial value cannot be zero (undefined percentage change)' };
      }
      const change = (percentNum / 100) * Math.abs(initialNum);
      const finalValueCalc = initialNum + (percentNum >= 0 ? change : -change);
      const isIncrease = percentNum >= 0;

      return {
        initialValue: initialNum.toFixed(2),
        finalValue: finalValueCalc.toFixed(2),
        change: change.toFixed(2),
        percentChange: percentNum.toFixed(2),
        isIncrease,
        type: 'final'
      };
    } else if (mode === 'initial') {
      if (isNaN(finalNum) || isNaN(percentNum)) {
        return { error: 'Please enter valid final value and percentage change' };
      }
      if (percentNum === -100) {
        return { error: 'Percentage change cannot be -100% (initial value would be undefined)' };
      }
      const initialValueCalc = finalNum / (1 + percentNum / 100);
      const change = finalNum - initialValueCalc;
      const isIncrease = finalNum > initialValueCalc;

      return {
        initialValue: initialValueCalc.toFixed(2),
        finalValue: finalNum.toFixed(2),
        change: change.toFixed(2),
        percentChange: percentNum.toFixed(2),
        isIncrease,
        type: 'initial'
      };
    }
    return null;
  };

  const calculate = () => {
    if ((mode === 'change' && (!initialValue || !finalValue)) ||
        (mode === 'final' && (!initialValue || !percentChange)) ||
        (mode === 'initial' && (!finalValue || !percentChange))) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculatePercentageChange();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setMode('change');
    setInitialValue('');
    setFinalValue('');
    setPercentChange('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Percentage Change Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setMode('change')}
            className={`px-3 py-1 rounded-lg ${mode === 'change' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            % Change
          </button>
          <button
            onClick={() => setMode('final')}
            className={`px-3 py-1 rounded-lg ${mode === 'final' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Final Value
          </button>
          <button
            onClick={() => setMode('initial')}
            className={`px-3 py-1 rounded-lg ${mode === 'initial' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Initial Value
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {(mode === 'change' || mode === 'final') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Initial Value:</label>
                <input
                  type="number"
                  step="0.01"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            {(mode === 'change' || mode === 'initial') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Final Value:</label>
                <input
                  type="number"
                  step="0.01"
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 120"
                />
              </div>
            )}
            {(mode === 'final' || mode === 'initial') && (
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Percent Change (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={percentChange}
                  onChange={(e) => setPercentChange(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 20"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Initial Value: {result.initialValue}</p>
              <p className="text-center">Final Value: {result.finalValue}</p>
              <p className="text-center text-xl">
                {result.type === 'change'
                  ? `Percentage Change: ${result.isIncrease ? 'Increase' : 'Decrease'} by ${Math.abs(result.percentChange)}%`
                  : `Percentage Change: ${result.isIncrease ? 'Increase' : 'Decrease'} by ${Math.abs(result.percentChange)}%`}
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === 'change' && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Final Value: {result.finalValue}</li>
                        <li>Change = Final - Initial = {result.finalValue} - {result.initialValue} = {result.change}</li>
                        <li>Percentage Change = (Change / |Initial|) × 100 = ({result.change} / |{result.initialValue}|) × 100 = {result.percentChange}%</li>
                      </>
                    )}
                    {result.type === 'final' && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Percentage Change: {result.percentChange}%</li>
                        <li>Change = (Percent Change / 100) × |Initial| = ({result.percentChange} / 100) × |{result.initialValue}| = {result.change}</li>
                        <li>Final Value = Initial + {result.isIncrease ? 'Change' : '-Change'} = {result.initialValue} {result.isIncrease ? '+' : '-'} {result.change} = {result.finalValue}</li>
                      </>
                    )}
                    {result.type === 'initial' && (
                      <>
                        <li>Final Value: {result.finalValue}</li>
                        <li>Percentage Change: {result.percentChange}%</li>
                        <li>Initial Value = Final / (1 + Percent Change / 100) = {result.finalValue} / (1 + {result.percentChange} / 100) = {result.initialValue}</li>
                        <li>Change = Final - Initial = {result.finalValue} - {result.initialValue} = {result.change}</li>
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

export default PercentageChangeCalculator;