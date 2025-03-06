// components/CarLoanCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const CarLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(25000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(60); // in months
  const [results, setResults] = useState(null);

  const calculateLoan = () => {
    const monthlyInterest = interestRate / 100 / 12;
    const numberOfPayments = loanTerm;
    
    // Monthly payment formula: P[r(1+r)^n]/[(1+r)^n - 1]
    const monthlyPayment = loanAmount * 
      (monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) / 
      (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);
    
    const totalCost = monthlyPayment * numberOfPayments;
    const totalInterest = totalCost - loanAmount;

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalCost: totalCost.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
    });
  };

  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTerm]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Car Loan Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loan Amount ($)
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1000"
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
            max="20"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loan Term (months)
          </label>
          <input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="12"
            max="84"
            step="12"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Loan Summary</h2>
          <div className="space-y-2">
            <p>
              Monthly Payment:
              <span className="font-bold text-green-600">
                ${Number(results.monthlyPayment).toLocaleString()}
              </span>
            </p>
            <p>
              Total Interest Paid:
              <span className="font-medium">
                ${Number(results.totalInterest).toLocaleString()}
              </span>
            </p>
            <p>
              Total Cost of Loan:
              <span className="font-medium">
                ${Number(results.totalCost).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This calculator provides estimates only. Actual loan terms may vary based
        on credit score, taxes, fees, and lender policies. Consult your lender for exact figures.
      </p>
    </div>
  );
};

export default CarLoanCalculator;