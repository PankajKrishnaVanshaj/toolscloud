// components/IRAContributionCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const IRAContributionCalculator = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualContribution, setAnnualContribution] = useState(7000); // 2025 IRA limit
  const [currentBalance, setCurrentBalance] = useState(0);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [results, setResults] = useState(null);

  const calculateIRA = () => {
    const years = retirementAge - currentAge;
    if (years <= 0) {
      setResults(null);
      return;
    }

    let balance = Number(currentBalance);
    const yearlyRate = annualReturn / 100;
    let totalContributions = Number(currentBalance);
    
    for (let i = 0; i < years; i++) {
      balance = balance * (1 + yearlyRate) + Number(annualContribution);
      totalContributions += Number(annualContribution);
    }

    setResults({
      finalBalance: balance.toFixed(2),
      totalContributions: totalContributions.toFixed(2),
      investmentGrowth: (balance - totalContributions).toFixed(2),
    });
  };

  useEffect(() => {
    calculateIRA();
  }, [currentAge, retirementAge, annualContribution, currentBalance, annualReturn]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">IRA Contribution Calculator</h1>

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
            Annual Contribution ($)
          </label>
          <input
            type="number"
            value={annualContribution}
            onChange={(e) => setAnnualContribution(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="7000" // 2025 IRA contribution limit (assumed)
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current IRA Balance ($)
          </label>
          <input
            type="number"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Annual Return (%)
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

      {results && retirementAge > currentAge ? (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              Final Balance:{' '}
              <span className="font-bold text-green-600">
                ${Number(results.finalBalance).toLocaleString()}
              </span>
            </p>
            <p>
              Total Contributions:{' '}
              <span className="font-medium">
                ${Number(results.totalContributions).toLocaleString()}
              </span>
            </p>
            <p>
              Investment Growth:{' '}
              <span className="font-medium">
                ${Number(results.investmentGrowth).toLocaleString()}
              </span>
            </p>
            <p>
              Years until Retirement:{' '}
              <span className="font-medium">{retirementAge - currentAge}</span>
            </p>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          {retirementAge <= currentAge
            ? 'Retirement age must be greater than current age'
            : 'Enter values to see results'}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simplified calculation based on 2025 IRA limits ($7,000).
        It assumes constant returns and contributions, and doesn’t account for taxes,
        fees, or inflation. Consult a financial advisor for accurate planning.
      </p>
    </div>
  );
};

export default IRAContributionCalculator;