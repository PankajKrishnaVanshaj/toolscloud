// components/DividendYieldCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const DividendYieldCalculator = () => {
  const [annualDividend, setAnnualDividend] = useState('');
  const [stockPrice, setStockPrice] = useState('');
  const [shares, setShares] = useState('');
  const [results, setResults] = useState(null);

  const calculateYield = () => {
    const dividend = parseFloat(annualDividend) || 0;
    const price = parseFloat(stockPrice) || 0;
    const numShares = parseFloat(shares) || 0;

    if (price > 0) {
      const yieldPercentage = (dividend / price) * 100;
      const totalInvestment = price * numShares;
      const annualIncome = dividend * numShares;

      setResults({
        yield: yieldPercentage.toFixed(2),
        totalInvestment: totalInvestment.toFixed(2),
        annualIncome: annualIncome.toFixed(2),
      });
    } else {
      setResults(null);
    }
  };

  useEffect(() => {
    calculateYield();
  }, [annualDividend, stockPrice, shares]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Dividend Yield Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Dividend ($/share)
          </label>
          <input
            type="number"
            value={annualDividend}
            onChange={(e) => setAnnualDividend(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 2.50"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Price ($)
          </label>
          <input
            type="number"
            value={stockPrice}
            onChange={(e) => setStockPrice(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 50.00"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Shares
          </label>
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 100"
            step="1"
            min="0"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              Dividend Yield:{' '}
              <span className="font-bold text-green-600">{results.yield}%</span>
            </p>
            {shares && (
              <>
                <p>
                  Total Investment:{' '}
                  <span className="font-medium">
                    ${Number(results.totalInvestment).toLocaleString()}
                  </span>
                </p>
                <p>
                  Annual Dividend Income:{' '}
                  <span className="font-medium">
                    ${Number(results.annualIncome).toLocaleString()}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {!results && (
        <p className="text-center text-gray-500">
          Enter values above to see results
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: Dividend yield is calculated as (Annual Dividend per Share / Stock Price) × 100.
        Results are for informational purposes only.
      </p>
    </div>
  );
};

export default DividendYieldCalculator;