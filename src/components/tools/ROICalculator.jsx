// components/ROICalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const ROICalculator = () => {
  const [investment, setInvestment] = useState(10000);
  const [revenue, setRevenue] = useState(15000);
  const [costs, setCosts] = useState(2000);
  const [timePeriod, setTimePeriod] = useState(12); // in months
  const [results, setResults] = useState(null);

  const calculateROI = () => {
    const netProfit = revenue - investment - costs;
    const roi = (netProfit / investment) * 100;
    const annualizedROI = timePeriod > 0 ? 
      ((Math.pow(1 + roi / 100, 12 / timePeriod) - 1) * 100) : roi;

    setResults({
      netProfit: netProfit.toFixed(2),
      roi: roi.toFixed(2),
      annualizedROI: annualizedROI.toFixed(2),
    });
  };

  useEffect(() => {
    if (investment > 0) {
      calculateROI();
    }
  }, [investment, revenue, costs, timePeriod]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">ROI Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Investment ($)
          </label>
          <input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(Math.max(0, Number(e.target.value)))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Revenue Generated ($)
          </label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(Math.max(0, Number(e.target.value)))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Costs ($)
          </label>
          <input
            type="number"
            value={costs}
            onChange={(e) => setCosts(Math.max(0, Number(e.target.value)))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Period (months)
          </label>
          <input
            type="number"
            value={timePeriod}
            onChange={(e) => setTimePeriod(Math.max(0, Number(e.target.value)))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1"
          />
        </div>
      </div>

      {results && investment > 0 && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Net Profit:</span>{' '}
              <span className={results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                ${Number(results.netProfit).toLocaleString()}
              </span>
            </p>
            <p>
              <span className="font-medium">ROI:</span>{' '}
              <span className={results.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                {results.roi}%
              </span>
            </p>
            {timePeriod > 0 && (
              <p>
                <span className="font-medium">Annualized ROI:</span>{' '}
                <span className={results.annualizedROI >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {results.annualizedROI}%
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {investment <= 0 && (
        <p className="text-center text-red-600">Please enter a valid investment amount</p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: ROI = (Net Profit / Investment) × 100. Annualized ROI accounts for the time period.
      </p>
    </div>
  );
};

export default ROICalculator;