// components/NetPresentValueCalculator.js
'use client';

import React, { useState } from 'react';

const NetPresentValueCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [discountRate, setDiscountRate] = useState(5);
  const [cashFlows, setCashFlows] = useState([5000, 5000, 5000]); // Default 3 years
  const [npv, setNpv] = useState(null);

  const calculateNPV = () => {
    if (!initialInvestment || !discountRate || cashFlows.length === 0) {
      setNpv(null);
      return;
    }

    const rate = discountRate / 100;
    let totalPV = 0;

    // Calculate present value of each cash flow
    cashFlows.forEach((cashFlow, index) => {
      totalPV += cashFlow / Math.pow(1 + rate, index + 1);
    });

    // Subtract initial investment
    const result = totalPV - initialInvestment;
    setNpv(result);
  };

  const handleCashFlowChange = (index, value) => {
    const newCashFlows = [...cashFlows];
    newCashFlows[index] = Number(value) || 0;
    setCashFlows(newCashFlows);
    calculateNPV();
  };

  const addYear = () => {
    setCashFlows([...cashFlows, 0]);
  };

  const removeYear = () => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.slice(0, -1));
      calculateNPV();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Net Present Value Calculator</h1>

      <div className="space-y-4">
        {/* Initial Investment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Investment ($)
          </label>
          <input
            type="number"
            value={initialInvestment}
            onChange={(e) => {
              setInitialInvestment(Number(e.target.value) || 0);
              calculateNPV();
            }}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        {/* Discount Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Rate (%)
          </label>
          <input
            type="number"
            value={discountRate}
            onChange={(e) => {
              setDiscountRate(Number(e.target.value) || 0);
              calculateNPV();
            }}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.1"
          />
        </div>

        {/* Cash Flows */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cash Flows by Year ($)
          </label>
          {cashFlows.map((flow, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Year {index + 1}:</span>
              <input
                type="number"
                value={flow}
                onChange={(e) => handleCashFlowChange(index, e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              onClick={addYear}
              className="px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Year
            </button>
            <button
              onClick={removeYear}
              disabled={cashFlows.length <= 1}
              className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Remove Year
            </button>
          </div>
        </div>

        {/* Result */}
        {npv !== null && (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <h2 className="text-lg font-semibold mb-2">NPV Result</h2>
            <p className={`text-xl ${npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${npv.toFixed(2).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {npv >= 0 ? 'Positive NPV: Investment is profitable' : 'Negative NPV: Investment may not be profitable'}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Note: NPV calculates the present value of future cash flows minus the initial investment.
        A positive NPV indicates a potentially good investment.
      </p>
    </div>
  );
};

export default NetPresentValueCalculator;