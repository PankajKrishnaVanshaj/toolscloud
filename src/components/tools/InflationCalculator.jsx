// components/InflationCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const InflationCalculator = () => {
  const [amount, setAmount] = useState(1000);
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2025);
  const [inflationRate, setInflationRate] = useState(3);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('future'); // 'future' or 'past'

  const calculateInflation = () => {
    const years = mode === 'future' ? endYear - startYear : startYear - endYear;
    if (years < 0) {
      setResult({ error: 'End year must be after start year for future value, or before for past value.' });
      return;
    }

    const rate = inflationRate / 100;
    let adjustedAmount;

    if (mode === 'future') {
      // Future value: FV = PV * (1 + r)^n
      adjustedAmount = amount * Math.pow(1 + rate, years);
    } else {
      // Past value: PV = FV / (1 + r)^n
      adjustedAmount = amount / Math.pow(1 + rate, years);
    }

    setResult({
      adjustedAmount: adjustedAmount.toFixed(2),
      years,
      error: null
    });
  };

  useEffect(() => {
    calculateInflation();
  }, [amount, startYear, endYear, inflationRate, mode]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Inflation Calculator</h1>

      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setMode('future')}
            className={`px-4 py-2 rounded-md ${mode === 'future' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700 hover:text-white transition-colors`}
          >
            Future Value
          </button>
          <button
            onClick={() => setMode('past')}
            className={`px-4 py-2 rounded-md ${mode === 'past' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} hover:bg-blue-700 hover:text-white transition-colors`}
          >
            Past Value
          </button>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'future' ? 'Start Year' : 'End Year'}
            </label>
            <input
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1900"
              max="2100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'future' ? 'End Year' : 'Start Year'}
            </label>
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1900"
              max="2100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Inflation Rate (%)
            </label>
            <input
              type="number"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-center">
              {mode === 'future' ? 'Future Value' : 'Past Value'}
            </h2>
            {result.error ? (
              <p className="text-red-600 text-center">{result.error}</p>
            ) : (
              <div className="space-y-2 text-center">
                <p>
                  Adjusted Amount:{' '}
                  <span className="font-bold text-green-600">
                    ${Number(result.adjustedAmount).toLocaleString()}
                  </span>
                </p>
                <p>Years: <span className="font-medium">{result.years}</span></p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: This calculator uses a constant inflation rate. Actual inflation varies over time.
          Use historical data or consult an economist for precise calculations.
        </p>
      </div>
    </div>
  );
};

export default InflationCalculator;