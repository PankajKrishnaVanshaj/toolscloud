// components/SavingsGoalCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const SavingsGoalCalculator = () => {
  const [goalAmount, setGoalAmount] = useState(10000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlySavings, setMonthlySavings] = useState(500);
  const [interestRate, setInterestRate] = useState(2);
  const [results, setResults] = useState(null);

  const calculateSavings = () => {
    const monthlyRate = interestRate / 100 / 12;
    let remaining = goalAmount - currentSavings;
    let months = 0;
    let balance = currentSavings;

    if (monthlySavings <= 0) {
      setResults({
        months: Infinity,
        monthlyRequired: (goalAmount - currentSavings) > 0 ? 'N/A' : 0,
      });
      return;
    }

    // Calculate months to reach goal with compound interest
    while (balance < goalAmount && months < 1200) { // Cap at 100 years
      balance = balance * (1 + monthlyRate) + monthlySavings;
      months++;
    }

    // Calculate required monthly savings if time-based
    const years = 5; // Default 5-year goal for monthly calculation
    const monthsForMonthly = years * 12;
    const futureValueFactor = Math.pow(1 + monthlyRate, monthsForMonthly);
    const monthlyRequired = (goalAmount - currentSavings * futureValueFactor) / 
      ((futureValueFactor - 1) / monthlyRate);

    setResults({
      months: balance >= goalAmount ? months : 'Goal not reachable',
      monthlyRequired: monthlyRequired > 0 ? monthlyRequired.toFixed(2) : 0,
    });
  };

  useEffect(() => {
    calculateSavings();
  }, [goalAmount, currentSavings, monthlySavings, interestRate]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Savings Goal Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Savings Goal ($)
          </label>
          <input
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(Number(e.target.value))}
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
            Monthly Savings ($)
          </label>
          <input
            type="number"
            value={monthlySavings}
            onChange={(e) => setMonthlySavings(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
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
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              Time to Reach Goal:{' '}
              <span className="font-bold text-green-600">
                {results.months === Infinity 
                  ? 'Never (increase monthly savings)' 
                  : typeof results.months === 'number' 
                    ? `${results.months} months (${(results.months / 12).toFixed(1)} years)` 
                    : results.months}
              </span>
            </p>
            <p>
              Monthly Savings Needed (5-year goal):{' '}
              <span className="font-bold text-green-600">
                ${Number(results.monthlyRequired).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: Calculations include compound interest and assume consistent monthly savings.
        The monthly savings needed is based on a 5-year goal. Results are estimates only.
      </p>
    </div>
  );
};

export default SavingsGoalCalculator;