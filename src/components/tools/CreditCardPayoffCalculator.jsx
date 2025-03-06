// components/CreditCardPayoffCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const CreditCardPayoffCalculator = () => {
  const [balance, setBalance] = useState(5000);
  const [interestRate, setInterestRate] = useState(18);
  const [monthlyPayment, setMonthlyPayment] = useState(200);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const calculatePayoff = () => {
    if (balance <= 0 || interestRate < 0 || monthlyPayment <= 0) {
      setError('Please enter valid positive values');
      setResults(null);
      return;
    }

    const monthlyInterestRate = interestRate / 100 / 12;
    let remainingBalance = balance;
    let months = 0;
    let totalInterest = 0;

    // Check if monthly payment is enough to cover interest
    const minPayment = remainingBalance * monthlyInterestRate;
    if (monthlyPayment <= minPayment) {
      setError('Monthly payment must be greater than the interest charge');
      setResults(null);
      return;
    }

    while (remainingBalance > 0 && months < 1000) { // Prevent infinite loop
      const interest = remainingBalance * monthlyInterestRate;
      const principal = monthlyPayment - interest;
      remainingBalance -= principal;
      totalInterest += interest;
      months++;

      if (remainingBalance <= 0) {
        // Adjust final month
        totalInterest += remainingBalance; // Add back any negative interest
        remainingBalance = 0;
      }
    }

    if (months >= 1000) {
      setError('Calculation error: Payment too low or balance too high');
      setResults(null);
      return;
    }

    setResults({
      months,
      years: (months / 12).toFixed(1),
      totalInterest: totalInterest.toFixed(2),
      totalPaid: (balance + totalInterest).toFixed(2),
    });
    setError('');
  };

  useEffect(() => {
    calculatePayoff();
  }, [balance, interestRate, monthlyPayment]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Credit Card Payoff Calculator</h1>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Balance ($)
          </label>
          <input
            type="number"
            value={balance}
            onChange={(e) => setBalance(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
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
            max="100"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Payment ($)
          </label>
          <input
            type="number"
            value={monthlyPayment}
            onChange={(e) => setMonthlyPayment(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="10"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-600 text-center mb-4">{error}</p>
      )}

      {results && !error && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Payoff Results</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Time to Pay Off:</span> {results.months} months 
              (~{results.years} years)
            </p>
            <p>
              <span className="font-medium">Total Interest Paid:</span> 
              ${Number(results.totalInterest).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Total Amount Paid:</span> 
              ${Number(results.totalPaid).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: This calculator assumes a fixed monthly payment and interest rate. 
        Actual payoff may vary due to minimum payments or rate changes.
      </p>
    </div>
  );
};

export default CreditCardPayoffCalculator;