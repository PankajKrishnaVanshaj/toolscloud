// components/PresentValueCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const PresentValueCalculator = () => {
  const [futureValue, setFutureValue] = useState(10000);
  const [discountRate, setDiscountRate] = useState(5);
  const [years, setYears] = useState(10);
  const [presentValue, setPresentValue] = useState(null);

  const calculatePresentValue = () => {
    const rate = discountRate / 100;
    const pv = futureValue / Math.pow(1 + rate, years);
    setPresentValue(pv.toFixed(2));
  };

  useEffect(() => {
    calculatePresentValue();
  }, [futureValue, discountRate, years]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Present Value Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Future Value ($)
          </label>
          <input
            type="number"
            value={futureValue}
            onChange={(e) => setFutureValue(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Rate (%)
          </label>
          <input
            type="number"
            value={discountRate}
            onChange={(e) => setDiscountRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Years
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1"
          />
        </div>
      </div>

      {presentValue && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-lg font-semibold mb-2">Present Value</h2>
          <p className="text-2xl font-bold text-green-600">
            ${Number(presentValue).toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            The current worth of ${Number(futureValue).toLocaleString()} in {years} years
            at a {discountRate}% discount rate
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This calculator uses the basic present value formula PV = FV / (1 + r)^n.
        It assumes annual compounding and does not account for inflation or taxes.
      </p>
    </div>
  );
};

export default PresentValueCalculator;