// components/FinancialIndependenceCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const FinancialIndependenceCalculator = () => {
  const [annualExpenses, setAnnualExpenses] = useState(40000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [annualSavings, setAnnualSavings] = useState(20000);
  const [returnRate, setReturnRate] = useState(7);
  const [withdrawalRate, setWithdrawalRate] = useState(4);
  const [results, setResults] = useState(null);

  const calculateFI = () => {
    const monthlyReturn = returnRate / 100 / 12;
    const monthlyWithdrawalRate = withdrawalRate / 100;
    const fiNumber = annualExpenses / monthlyWithdrawalRate; // Amount needed for FI
    
    let years = 0;
    let totalSavings = currentSavings;
    
    // Calculate years to FI
    while (totalSavings < fiNumber && years < 100) { // Cap at 100 years to prevent infinite loop
      totalSavings = totalSavings * (1 + monthlyReturn * 12) + annualSavings;
      years++;
    }

    const monthlyIncome = (fiNumber * monthlyWithdrawalRate) / 12;

    setResults({
      fiNumber: fiNumber.toFixed(2),
      yearsToFI: years < 100 ? years : '100+',
      monthlyIncome: monthlyIncome.toFixed(2),
      totalSavings: totalSavings.toFixed(2)
    });
  };

  useEffect(() => {
    calculateFI();
  }, [annualExpenses, currentSavings, annualSavings, returnRate, withdrawalRate]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Financial Independence Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Savings ($)
          </label>
          <input
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Savings ($)
          </label>
          <input
            type="number"
            value={annualSavings}
            onChange={(e) => setAnnualSavings(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Return Rate (%)
          </label>
          <input
            type="number"
            value={returnRate}
            onChange={(e) => setReturnRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="20"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Safe Withdrawal Rate (%)
          </label>
          <input
            type="number"
            value={withdrawalRate}
            onChange={(e) => setWithdrawalRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="10"
            step="0.1"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              FI Number:{' '}
              <span className="font-bold text-green-600">
                ${Number(results.fiNumber).toLocaleString()}
              </span>
            </p>
            <p>
              Years to Financial Independence:{' '}
              <span className="font-bold">{results.yearsToFI}</span>
            </p>
            <p>
              Projected Total Savings:{' '}
              <span className="font-medium">
                ${Number(results.totalSavings).toLocaleString()}
              </span>
            </p>
            <p>
              Monthly Passive Income:{' '}
              <span className="font-medium">
                ${Number(results.monthlyIncome).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simplified calculation assuming constant returns and no inflation.
        Actual results may vary due to market volatility, taxes, and other factors.
        Consult a financial advisor for professional advice.
      </p>
    </div>
  );
};

export default FinancialIndependenceCalculator;