'use client'
import React, { useState } from 'react';

const EarningsPerShareCalculator = () => {
  const [netIncome, setNetIncome] = useState('');
  const [outstandingShares, setOutstandingShares] = useState('');
  const [isDiluted, setIsDiluted] = useState(false); // Toggle for diluted EPS
  const [convertibleShares, setConvertibleShares] = useState(''); // Potential additional shares
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate EPS
  const calculateEPS = (income, shares, diluted, extraShares) => {
    const netIncomeNum = parseFloat(income);
    const sharesNum = parseInt(shares);
    const extraSharesNum = diluted ? parseInt(extraShares) || 0 : 0;

    if (isNaN(netIncomeNum) || isNaN(sharesNum) || (diluted && isNaN(extraSharesNum))) {
      return { error: 'Please enter valid numbers' };
    }
    if (sharesNum <= 0 || (diluted && extraSharesNum < 0)) {
      return { error: 'Outstanding shares must be positive, convertible shares cannot be negative' };
    }

    const totalShares = sharesNum + extraSharesNum;
    const basicEPS = netIncomeNum / sharesNum;
    const dilutedEPS = diluted ? netIncomeNum / totalShares : null;

    return {
      netIncome: netIncomeNum.toFixed(2),
      outstandingShares: sharesNum,
      convertibleShares: extraSharesNum,
      totalShares: totalShares,
      basicEPS: basicEPS.toFixed(2),
      dilutedEPS: dilutedEPS ? dilutedEPS.toFixed(2) : null,
      isDiluted: diluted
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!netIncome || !outstandingShares || (isDiluted && !convertibleShares)) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateEPS(netIncome, outstandingShares, isDiluted, convertibleShares);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setNetIncome('');
    setOutstandingShares('');
    setIsDiluted(false);
    setConvertibleShares('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Earnings Per Share Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Net Income ($):</label>
              <input
                type="number"
                step="0.01"
                value={netIncome}
                onChange={(e) => setNetIncome(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1000000"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Outstanding Shares:</label>
              <input
                type="number"
                value={outstandingShares}
                onChange={(e) => setOutstandingShares(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 500000"
                min="1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Diluted EPS?</label>
              <input
                type="checkbox"
                checked={isDiluted}
                onChange={(e) => setIsDiluted(e.target.checked)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Yes</span>
            </div>
            {isDiluted && (
              <div className="flex items-center gap-2">
                <label className="w-40 text-gray-700">Convertible Shares:</label>
                <input
                  type="number"
                  value={convertibleShares}
                  onChange={(e) => setConvertibleShares(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10000"
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">EPS Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Basic EPS: ${result.basicEPS}</p>
              {result.isDiluted && (
                <p className="text-center">Diluted EPS: ${result.dilutedEPS}</p>
              )}

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Net Income: ${result.netIncome}</li>
                    <li>Outstanding Shares: {result.outstandingShares}</li>
                    <li>Basic EPS = Net Income / Outstanding Shares = {result.netIncome} / {result.outstandingShares} = ${result.basicEPS}</li>
                    {result.isDiluted && (
                      <>
                        <li>Convertible Shares: {result.convertibleShares}</li>
                        <li>Total Shares (Diluted) = Outstanding + Convertible = {result.outstandingShares} + {result.convertibleShares} = {result.totalShares}</li>
                        <li>Diluted EPS = Net Income / Total Shares = {result.netIncome} / {result.totalShares} = ${result.dilutedEPS}</li>
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

export default EarningsPerShareCalculator;