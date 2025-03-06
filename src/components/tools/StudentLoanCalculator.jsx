// components/StudentLoanCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const StudentLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(20000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(10);
  const [results, setResults] = useState(null);

  const calculateLoan = () => {
    const monthlyInterest = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    // Monthly payment calculation using the amortization formula
    const monthlyPayment = 
      (loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, numberOfPayments)) /
      (Math.pow(1 + monthlyInterest, numberOfPayments) - 1);
    
    const totalPaid = monthlyPayment * numberOfPayments;
    const totalInterest = totalPaid - loanAmount;

    setResults({
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
    });
  };

  useEffect(() => {
    calculateLoan();
  }, [loanAmount, interestRate, loanTerm]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Student Loan Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            max="1000000"
            step="100"
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
            Loan Term (Years)
          </label>
          <input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            max="30"
          />
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2 text-center">Loan Summary</h2>
          <div className="space-y-2">
            <p className="flex justify-between">
              <span className="font-medium">Monthly Payment:</span>
              <span className="text-green-600 font-bold">${Number(results.monthlyPayment).toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Total Interest Paid:</span>
              <span className="text-red-600">${Number(results.totalInterest).toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Total Amount Paid:</span>
              <span className="text-blue-600">${Number(results.totalPaid).toLocaleString()}</span>
            </p>
            <p className="flex justify-between">
              <span className="font-medium">Number of Payments:</span>
              <span>{loanTerm * 12}</span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a basic calculation assuming fixed interest and no additional fees or payments.
        Actual loan terms may vary. Consult your lender for precise figures.
      </p>
    </div>
  );
};

export default StudentLoanCalculator;