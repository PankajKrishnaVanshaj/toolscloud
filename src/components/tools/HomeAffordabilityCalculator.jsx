// components/HomeAffordabilityCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const HomeAffordabilityCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState(50000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(1000);
  const [downPayment, setDownPayment] = useState(20000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [results, setResults] = useState(null);

  const calculateAffordability = () => {
    // Assume 36% of income can go towards housing (common guideline)
    const monthlyIncome = annualIncome / 12;
    const maxMonthlyPayment = (monthlyIncome * 0.36) - monthlyExpenses;

    // Calculate maximum loan amount using the formula for monthly payment
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const loanAmount = 
      (maxMonthlyPayment * (Math.pow(1 + monthlyRate, numberOfPayments) - 1)) / 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));

    // Total home price includes down payment
    const totalHomePrice = loanAmount + downPayment;

    setResults({
      maxMonthlyPayment: maxMonthlyPayment.toFixed(2),
      loanAmount: loanAmount.toFixed(2),
      totalHomePrice: totalHomePrice.toFixed(2),
    });
  };

  useEffect(() => {
    calculateAffordability();
  }, [annualIncome, monthlyExpenses, downPayment, interestRate, loanTerm]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Home Affordability Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Income ($)
          </label>
          <input
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Expenses ($)
          </label>
          <input
            type="number"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Down Payment ($)
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interest Rate (%)
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
            Loan Term (years)
          </label>
          <input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            max="50"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              Maximum Monthly Payment:{' '}
              <span className="font-bold text-green-600">
                ${Number(results.maxMonthlyPayment).toLocaleString()}
              </span>
            </p>
            <p>
              Maximum Loan Amount:{' '}
              <span className="font-bold text-green-600">
                ${Number(results.loanAmount).toLocaleString()}
              </span>
            </p>
            <p>
              Total Home Price You Can Afford:{' '}
              <span className="font-bold text-green-600">
                ${Number(results.totalHomePrice).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is an estimate based on a 36% debt-to-income ratio guideline. 
        Actual affordability may vary due to credit score, taxes, insurance, 
        and lender requirements. Consult a financial advisor for accurate advice.
      </p>
    </div>
  );
};

export default HomeAffordabilityCalculator;