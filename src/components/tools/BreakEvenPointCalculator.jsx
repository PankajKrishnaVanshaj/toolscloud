// components/BreakEvenPointCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const BreakEvenPointCalculator = () => {
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(20);
  const [sellingPricePerUnit, setSellingPricePerUnit] = useState(50);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const calculateBreakEven = () => {
    if (sellingPricePerUnit <= variableCostPerUnit) {
      setError('Selling price must be greater than variable cost per unit');
      setResults(null);
      return;
    }

    const contributionMargin = sellingPricePerUnit - variableCostPerUnit;
    const breakEvenUnits = Math.ceil(fixedCosts / contributionMargin);
    const breakEvenSales = breakEvenUnits * sellingPricePerUnit;

    setResults({
      breakEvenUnits,
      breakEvenSales,
      contributionMargin,
    });
    setError('');
  };

  useEffect(() => {
    calculateBreakEven();
  }, [fixedCosts, variableCostPerUnit, sellingPricePerUnit]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Break-Even Point Calculator</h1>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fixed Costs ($)
          </label>
          <input
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variable Cost per Unit ($)
          </label>
          <input
            type="number"
            value={variableCostPerUnit}
            onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selling Price per Unit ($)
          </label>
          <input
            type="number"
            value={sellingPricePerUnit}
            onChange={(e) => setSellingPricePerUnit(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-center mb-4">{error}</p>
      )}

      {results && !error && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              Break-Even Point (Units):{' '}
              <span className="font-bold text-green-600">
                {results.breakEvenUnits.toLocaleString()}
              </span>
            </p>
            <p>
              Break-Even Sales ($):{' '}
              <span className="font-bold text-green-600">
                {results.breakEvenSales.toLocaleString()}
              </span>
            </p>
            <p>
              Contribution Margin per Unit ($):{' '}
              <span className="font-medium">
                {results.contributionMargin.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This calculator assumes constant costs and prices. Actual break-even
        points may vary due to market conditions and other factors.
      </p>
    </div>
  );
};

export default BreakEvenPointCalculator;