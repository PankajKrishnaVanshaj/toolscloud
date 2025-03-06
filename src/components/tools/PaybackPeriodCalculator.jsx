// components/PaybackPeriodCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const PaybackPeriodCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState(10000);
  const [annualCashFlow, setAnnualCashFlow] = useState(2500);
  const [result, setResult] = useState(null);

  const calculatePaybackPeriod = () => {
    if (initialInvestment <= 0 || annualCashFlow <= 0) {
      setResult({
        years: null,
        months: null,
        error: 'Please enter positive values for investment and cash flow.'
      });
      return;
    }

    const years = Math.floor(initialInvestment / annualCashFlow);
    const remainingAmount = initialInvestment % annualCashFlow;
    const months = remainingAmount > 0 
      ? Math.ceil((remainingAmount / annualCashFlow) * 12) 
      : 0;

    setResult({
      years,
      months,
      totalMonths: years * 12 + months,
      error: null
    });
  };

  useEffect(() => {
    calculatePaybackPeriod();
  }, [initialInvestment, annualCashFlow]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Payback Period Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Investment ($)
          </label>
          <input
            type="number"
            value={initialInvestment}
            onChange={(e) => setInitialInvestment(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Cash Flow ($)
          </label>
          <input
            type="number"
            value={annualCashFlow}
            onChange={(e) => setAnnualCashFlow(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
          {result.error ? (
            <p className="text-red-600 text-center">{result.error}</p>
          ) : (
            <div className="space-y-2 text-center">
              <p>
                Payback Period:{' '}
                <span className="font-bold text-green-600">
                  {result.years} years
                  {result.months > 0 && ` and ${result.months} months`}
                </span>
              </p>
              <p>
                Total Months:{' '}
                <span className="font-medium">{result.totalMonths}</span>
              </p>
              <p>
                Initial Investment Recovered:{' '}
                <span className="font-medium">
                  ${Number(initialInvestment).toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simple payback period calculation assuming constant annual cash flows.
        It does not account for time value of money or variable cash flows.
      </p>
    </div>
  );
};

export default PaybackPeriodCalculator;