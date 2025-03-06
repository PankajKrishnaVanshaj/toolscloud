// components/AmortizationScheduleGenerator.js
'use client';

import React, { useState } from 'react';

const AmortizationScheduleGenerator = () => {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [interestRate, setInterestRate] = useState(5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [schedule, setSchedule] = useState([]);
  const [monthlyPayment, setMonthlyPayment] = useState(null);

  const calculateSchedule = () => {
    const principal = parseFloat(loanAmount);
    const monthlyRate = parseFloat(interestRate) / 100 / 12;
    const termMonths = parseFloat(loanTerm) * 12;

    // Calculate monthly payment using the formula: P[r(1+r)^n]/[(1+r)^n-1]
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                   (Math.pow(1 + monthlyRate, termMonths) - 1);
    setMonthlyPayment(payment.toFixed(2));

    let balance = principal;
    const newSchedule = [];

    for (let i = 1; i <= termMonths && balance > 0; i++) {
      const interest = balance * monthlyRate;
      const principalPayment = payment - interest;
      balance = balance - principalPayment;

      newSchedule.push({
        paymentNumber: i,
        payment: payment.toFixed(2),
        principal: principalPayment.toFixed(2),
        interest: interest.toFixed(2),
        balance: balance > 0 ? balance.toFixed(2) : 0,
      });
    }

    setSchedule(newSchedule);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    calculateSchedule();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Amortization Schedule Generator</h1>

      {/* Input Form */}
      <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loan Amount ($)
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1000"
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
            onChange={(e) => setInterestRate(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0.1"
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
            onChange={(e) => setLoanTerm(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            max="50"
          />
        </div>
        <div className="md:col-span-3 flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate Schedule
          </button>
        </div>
      </form>

      {/* Results */}
      {monthlyPayment && (
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold">
            Monthly Payment: <span className="text-green-600">${monthlyPayment}</span>
          </p>
          <p className="text-sm text-gray-600">
            Total Payments: ${(monthlyPayment * schedule.length).toFixed(2)} | 
            Total Interest: ${(monthlyPayment * schedule.length - loanAmount).toFixed(2)}
          </p>
        </div>
      )}

      {/* Schedule Table */}
      {schedule.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-2">Payment #</th>
                <th className="px-4 py-2">Payment</th>
                <th className="px-4 py-2">Principal</th>
                <th className="px-4 py-2">Interest</th>
                <th className="px-4 py-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
                <tr key={item.paymentNumber} className="border-b">
                  <td className="px-4 py-2">{item.paymentNumber}</td>
                  <td className="px-4 py-2">${item.payment}</td>
                  <td className="px-4 py-2">${item.principal}</td>
                  <td className="px-4 py-2">${item.interest}</td>
                  <td className="px-4 py-2">${item.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!schedule.length && (
        <p className="text-center text-gray-500">
          Enter loan details and click "Generate Schedule" to see the amortization table.
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a basic amortization calculator. Actual payments may vary due to rounding, 
        additional fees, or variable rates.
      </p>
    </div>
  );
};

export default AmortizationScheduleGenerator;