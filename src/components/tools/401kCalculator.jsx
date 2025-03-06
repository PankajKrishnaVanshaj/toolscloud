'use client';

import React, { useState, useEffect } from 'react';

const FourOhOneKCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [results, setResults] = useState(null);

  const calculate401k = () => {
    const years = retirementAge - currentAge;
    const months = years * 12;
    const monthlyRate = annualReturn / 100 / 12;
    
    // Future value of current savings
    const futureValueSavings = currentSavings * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly contributions
    const futureValueContributions = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    
    const total = futureValueSavings + futureValueContributions;
    
    setResults({
      total: total.toFixed(2),
      fromSavings: futureValueSavings.toFixed(2),
      fromContributions: futureValueContributions.toFixed(2)
    });
  };

  useEffect(() => {
    calculate401k();
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">401(k) Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Age
          </label>
          <input
            type="number"
            value={currentAge}
            onChange={(e) => setCurrentAge(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="18"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Retirement Age
          </label>
          <input
            type="number"
            value={retirementAge}
            onChange={(e) => setRetirementAge(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min={currentAge}
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current 401(k) Savings ($)
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
            Monthly Contribution ($)
          </label>
          <input
            type="number"
            value={monthlyContribution}
            onChange={(e) => setMonthlyContribution(Number(e.target.value))}
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
            value={annualReturn}
            onChange={(e) => setAnnualReturn(Number(e.target.value))}
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
            <p>Total at Retirement: 
              <span className="font-bold text-green-600">
                ${Number(results.total).toLocaleString()}
              </span>
            </p>
            <p>From Initial Savings: 
              <span className="font-medium">
                ${Number(results.fromSavings).toLocaleString()}
              </span>
            </p>
            <p>From Contributions: 
              <span className="font-medium">
                ${Number(results.fromContributions).toLocaleString()}
              </span>
            </p>
            <p>Years until retirement: 
              <span className="font-medium">
                {retirementAge - currentAge}
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simplified calculation and doesn&apos;t account for taxes, 
        fees, or market volatility. Consult a financial advisor for professional advice.
      </p>
    </div>
  );
};

export default FourOhOneKCalculator;