// components/RentalYieldCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const RentalYieldCalculator = () => {
  const [propertyValue, setPropertyValue] = useState(300000);
  const [monthlyRent, setMonthlyRent] = useState(1500);
  const [annualExpenses, setAnnualExpenses] = useState(5000);
  const [results, setResults] = useState(null);

  const calculateYield = () => {
    const annualRent = monthlyRent * 12;
    const grossYield = (annualRent / propertyValue) * 100;
    const netYield = ((annualRent - annualExpenses) / propertyValue) * 100;

    setResults({
      annualRent: annualRent.toFixed(2),
      grossYield: grossYield.toFixed(2),
      netYield: netYield.toFixed(2),
    });
  };

  useEffect(() => {
    calculateYield();
  }, [propertyValue, monthlyRent, annualExpenses]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Rental Yield Calculator</h1>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property Value ($)
          </label>
          <input
            type="number"
            value={propertyValue}
            onChange={(e) => setPropertyValue(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            step="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Rent ($)
          </label>
          <input
            type="number"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Expenses ($)
          </label>
          <input
            type="number"
            value={annualExpenses}
            onChange={(e) => setAnnualExpenses(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              Annual Rental Income:{' '}
              <span className="font-bold text-green-600">
                ${Number(results.annualRent).toLocaleString()}
              </span>
            </p>
            <p>
              Gross Yield:{' '}
              <span className="font-bold text-blue-600">
                {results.grossYield}%
              </span>
            </p>
            <p>
              Net Yield:{' '}
              <span className="font-bold text-blue-600">
                {results.netYield}%
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: Gross Yield = (Annual Rent / Property Value) × 100. Net Yield = 
        ((Annual Rent - Annual Expenses) / Property Value) × 100. Results are estimates only.
      </p>
    </div>
  );
};

export default RentalYieldCalculator;