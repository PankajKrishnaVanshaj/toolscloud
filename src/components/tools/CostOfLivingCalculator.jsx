// components/CostOfLivingCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const CostOfLivingCalculator = () => {
  const [expenses, setExpenses] = useState({
    housing: 0,
    utilities: 0,
    groceries: 0,
    transportation: 0,
    healthcare: 0,
    entertainment: 0,
    miscellaneous: 0,
  });
  const [locationIndex, setLocationIndex] = useState(100); // 100 = baseline (average US city)
  const [results, setResults] = useState(null);

  // Sample cost of living indices (simplified for demo)
  const locations = {
    'Average US City': 100,
    'New York City': 187,
    'San Francisco': 170,
    'Chicago': 122,
    'Houston': 96,
    'Miami': 115,
  };

  const calculateCostOfLiving = () => {
    const monthlyBase = Object.values(expenses).reduce((sum, val) => sum + Number(val), 0);
    const annualBase = monthlyBase * 12;
    const adjustmentFactor = locationIndex / 100;
    const monthlyAdjusted = monthlyBase * adjustmentFactor;
    const annualAdjusted = annualBase * adjustmentFactor;

    setResults({
      monthlyBase: monthlyBase.toFixed(2),
      annualBase: annualBase.toFixed(2),
      monthlyAdjusted: monthlyAdjusted.toFixed(2),
      annualAdjusted: annualAdjusted.toFixed(2),
    });
  };

  useEffect(() => {
    calculateCostOfLiving();
  }, [expenses, locationIndex]);

  const handleInputChange = (category, value) => {
    setExpenses(prev => ({
      ...prev,
      [category]: value >= 0 ? value : 0,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Cost of Living Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Expense Inputs */}
        {Object.keys(expenses).map(category => (
          <div key={category}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {category} ($/month)
            </label>
            <input
              type="number"
              value={expenses[category]}
              onChange={(e) => handleInputChange(category, Number(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="10"
            />
          </div>
        ))}

        {/* Location Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            value={locationIndex}
            onChange={(e) => setLocationIndex(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(locations).map(([name, index]) => (
              <option key={name} value={index}>
                {name} (Index: {index})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Base Cost (Your Input):</p>
              <p>Monthly: <span className="font-bold">${Number(results.monthlyBase).toLocaleString()}</span></p>
              <p>Annual: <span className="font-bold">${Number(results.annualBase).toLocaleString()}</span></p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Adjusted for Location (Index: {locationIndex}):</p>
              <p>Monthly: <span className="font-bold text-blue-600">${Number(results.monthlyAdjusted).toLocaleString()}</span></p>
              <p>Annual: <span className="font-bold text-blue-600">${Number(results.annualAdjusted).toLocaleString()}</span></p>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: Costs are estimates based on your input and simplified location indices. 
        Actual costs may vary. Indices are relative to an average US city (100).
      </p>
    </div>
  );
};

export default CostOfLivingCalculator;