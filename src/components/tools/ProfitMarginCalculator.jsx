// components/ProfitMarginCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const ProfitMarginCalculator = () => {
  const [revenue, setRevenue] = useState('');
  const [costOfGoods, setCostOfGoods] = useState('');
  const [operatingExpenses, setOperatingExpenses] = useState('');
  const [results, setResults] = useState({
    grossProfit: 0,
    grossMargin: 0,
    netProfit: 0,
    netMargin: 0
  });

  const calculateMargins = () => {
    const rev = parseFloat(revenue) || 0;
    const cog = parseFloat(costOfGoods) || 0;
    const exp = parseFloat(operatingExpenses) || 0;

    const grossProfit = rev - cog;
    const grossMargin = rev > 0 ? (grossProfit / rev) * 100 : 0;
    const netProfit = grossProfit - exp;
    const netMargin = rev > 0 ? (netProfit / rev) * 100 : 0;

    setResults({
      grossProfit: grossProfit.toFixed(2),
      grossMargin: grossMargin.toFixed(2),
      netProfit: netProfit.toFixed(2),
      netMargin: netMargin.toFixed(2)
    });
  };

  useEffect(() => {
    calculateMargins();
  }, [revenue, costOfGoods, operatingExpenses]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Profit Margin Calculator</h1>

      <div className="grid grid-cols-1 gap-4 mb-6">
        {/* Revenue Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Revenue ($)
          </label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="Enter revenue"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>

        {/* Cost of Goods Sold Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cost of Goods Sold ($)
          </label>
          <input
            type="number"
            value={costOfGoods}
            onChange={(e) => setCostOfGoods(e.target.value)}
            placeholder="Enter cost of goods"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>

        {/* Operating Expenses Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Operating Expenses ($) - Optional
          </label>
          <input
            type="number"
            value={operatingExpenses}
            onChange={(e) => setOperatingExpenses(e.target.value)}
            placeholder="Enter operating expenses"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {/* Results */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p>Gross Profit: 
              <span className="font-bold text-green-600">
                ${Number(results.grossProfit).toLocaleString()}
              </span>
            </p>
            <p>Gross Margin: 
              <span className="font-bold">
                {results.grossMargin}%
              </span>
            </p>
          </div>
          <div>
            <p>Net Profit: 
              <span className="font-bold text-green-600">
                ${Number(results.netProfit).toLocaleString()}
              </span>
            </p>
            <p>Net Margin: 
              <span className="font-bold">
                {results.netMargin}%
              </span>
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Note: Gross Margin = (Revenue - COGS) / Revenue × 100
        <br />
        Net Margin = (Revenue - COGS - Expenses) / Revenue × 100
      </p>
    </div>
  );
};

export default ProfitMarginCalculator;