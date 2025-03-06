// components/BusinessValuationCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const BusinessValuationCalculator = () => {
  const [revenue, setRevenue] = useState(0);
  const [revenueMultiple, setRevenueMultiple] = useState(2);
  const [ebitda, setEbitda] = useState(0);
  const [ebitdaMultiple, setEbitdaMultiple] = useState(5);
  const [results, setResults] = useState(null);

  const calculateValuation = () => {
    const revenueValue = revenue * revenueMultiple;
    const ebitdaValue = ebitda * ebitdaMultiple;
    const averageValue = (revenueValue + ebitdaValue) / 2;

    setResults({
      revenueBased: revenueValue,
      ebitdaBased: ebitdaValue,
      average: averageValue
    });
  };

  useEffect(() => {
    if (revenue > 0 || ebitda > 0) {
      calculateValuation();
    } else {
      setResults(null);
    }
  }, [revenue, revenueMultiple, ebitda, ebitdaMultiple]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Business Valuation Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Revenue Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Revenue ($)
          </label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            min="0"
            placeholder="e.g., 500000"
          />
        </div>

        {/* Revenue Multiple */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Revenue Multiple
          </label>
          <input
            type="number"
            value={revenueMultiple}
            onChange={(e) => setRevenueMultiple(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            min="0.1"
            max="10"
            step="0.1"
            placeholder="e.g., 2"
          />
        </div>

        {/* EBITDA Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual EBITDA ($)
          </label>
          <input
            type="number"
            value={ebitda}
            onChange={(e) => setEbitda(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            min="0"
            placeholder="e.g., 100000"
          />
        </div>

        {/* EBITDA Multiple */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            EBITDA Multiple
          </label>
          <input
            type="number"
            value={ebitdaMultiple}
            onChange={(e) => setEbitdaMultiple(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
            min="1"
            max="20"
            step="0.1"
            placeholder="e.g., 5"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-3 text-center">Valuation Results</h2>
          <div className="space-y-2 text-sm">
            <p>
              Revenue-Based Valuation:{' '}
              <span className="font-bold text-indigo-600">
                ${Number(results.revenueBased).toLocaleString()}
              </span>
            </p>
            <p>
              EBITDA-Based Valuation:{' '}
              <span className="font-bold text-indigo-600">
                ${Number(results.ebitdaBased).toLocaleString()}
              </span>
            </p>
            <p>
              Average Valuation:{' '}
              <span className="font-bold text-green-600">
                ${Number(results.average).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      {!results && (
        <p className="text-center text-gray-500">
          Enter revenue or EBITDA to see valuation estimates.
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simplified valuation tool using revenue and EBITDA multiples.
        Actual business valuation involves many factors and should be performed by a professional.
      </p>
    </div>
  );
};

export default BusinessValuationCalculator;