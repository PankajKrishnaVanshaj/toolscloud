// components/SavingsInterestCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const SavingsInterestCalculator = () => {
  const [initialDeposit, setInitialDeposit] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(100);
  const [interestRate, setInterestRate] = useState(5);
  const [years, setYears] = useState(10);
  const [result, setResult] = useState(null);

  const calculateSavings = () => {
    const months = years * 12;
    const monthlyRate = interestRate / 100 / 12;
    
    // Future value of initial deposit
    const futureValueInitial = initialDeposit * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly contributions
    const futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    const total = futureValueInitial + futureValueContributions;
    const totalContributions = initialDeposit + (monthlyContribution * months);
    const interestEarned = total - totalContributions;

    setResult({
      total: total.toFixed(2),
      totalContributions: totalContributions.toFixed(2),
      interestEarned: interestEarned.toFixed(2)
    });
  };

  useEffect(() => {
    calculateSavings();
  }, [initialDeposit, monthlyContribution, interestRate, years]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Savings Interest Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Deposit ($)
          </label>
          <input
            type="number"
            value={initialDeposit}
            onChange={(e) => setInitialDeposit(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Contribution ($)
          </label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="20"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Period (Years)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            max="50"
          />
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              Total Savings:{' '}
              <span className="font-bold text-green-600">
                ${Number(result.total).toLocaleString()}
              </span>
            </p>
            <p>
              Total Contributions:{' '}
              <span className="font-medium">
                ${Number(result.totalContributions).toLocaleString()}
              </span>
            </p>
            <p>
              Interest Earned:{' '}
              <span className="font-medium text-blue-600">
                ${Number(result.interestEarned).toLocaleString()}
              </span>
            </p>
            <p>
              Time Period:{' '}
              <span className="font-medium">{years} years</span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This calculator assumes monthly compounding and constant interest rate.
        Actual results may vary due to fees, taxes, and market conditions.
      </p>
    </div>
  );
};

export default SavingsInterestCalculator;