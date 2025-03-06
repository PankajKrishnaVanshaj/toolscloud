// components/FutureValueCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const FutureValueCalculator = () => {
  const [initialAmount, setInitialAmount] = useState(1000);
  const [regularContribution, setRegularContribution] = useState(100);
  const [interestRate, setInterestRate] = useState(5);
  const [years, setYears] = useState(10);
  const [contributionFrequency, setContributionFrequency] = useState('monthly');
  const [result, setResult] = useState(null);

  const calculateFutureValue = () => {
    const principal = Number(initialAmount);
    const rate = Number(interestRate) / 100;
    const time = Number(years);
    let periodsPerYear = contributionFrequency === 'monthly' ? 12 : 
                        contributionFrequency === 'quarterly' ? 4 : 1;
    const contribution = Number(regularContribution);
    const totalPeriods = time * periodsPerYear;

    // Future value of initial amount
    const fvInitial = principal * Math.pow(1 + rate / periodsPerYear, totalPeriods);

    // Future value of regular contributions
    const fvContributions = contribution * 
      ((Math.pow(1 + rate / periodsPerYear, totalPeriods) - 1) / 
      (rate / periodsPerYear));

    const totalFV = fvInitial + fvContributions;

    setResult({
      total: totalFV.toFixed(2),
      initialFV: fvInitial.toFixed(2),
      contributionFV: fvContributions.toFixed(2),
      totalContributions: (contribution * totalPeriods).toFixed(2)
    });
  };

  useEffect(() => {
    calculateFutureValue();
  }, [initialAmount, regularContribution, interestRate, years, contributionFrequency]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Future Value Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Investment ($)
          </label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Regular Contribution ($)
          </label>
          <input
            type="number"
            value={regularContribution}
            onChange={(e) => setRegularContribution(e.target.value)}
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
            onChange={(e) => setInterestRate(e.target.value)}
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
            onChange={(e) => setYears(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            max="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contribution Frequency
          </label>
          <select
            value={contributionFrequency}
            onChange={(e) => setContributionFrequency(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {result && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Future Value Results</h2>
          <div className="space-y-2 text-sm">
            <p>
              Total Future Value:{' '}
              <span className="font-bold text-green-600">
                ${Number(result.total).toLocaleString()}
              </span>
            </p>
            <p>
              From Initial Investment:{' '}
              <span className="font-medium">
                ${Number(result.initialFV).toLocaleString()}
              </span>
            </p>
            <p>
              From Contributions:{' '}
              <span className="font-medium">
                ${Number(result.contributionFV).toLocaleString()}
              </span>
            </p>
            <p>
              Total Contributions:{' '}
              <span className="font-medium">
                ${Number(result.totalContributions).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: This calculator assumes compound interest and regular contributions.
        Actual results may vary due to market conditions, fees, and taxes.
      </p>
    </div>
  );
};

export default FutureValueCalculator;