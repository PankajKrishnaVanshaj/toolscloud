'use client'
import React, { useState } from 'react';

const MortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState(''); // In years
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Calculate mortgage details
  const calculateMortgage = (principal, annualRate, years) => {
    const monthlyRate = annualRate / 100 / 12;
    const totalPayments = years * 12;

    // Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
                         (Math.pow(1 + monthlyRate, totalPayments) - 1);

    if (!isFinite(monthlyPayment)) {
      return { error: 'Invalid calculation - check your inputs' };
    }

    const totalPaid = monthlyPayment * totalPayments;
    const totalInterest = totalPaid - principal;

    // Amortization schedule (simplified)
    const amortization = [];
    let remainingBalance = principal;
    for (let i = 1; i <= totalPayments && remainingBalance > 0; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      if (remainingBalance < 0) remainingBalance = 0;

      amortization.push({
        paymentNumber: i,
        monthlyPayment: monthlyPayment.toFixed(2),
        principalPayment: principalPayment.toFixed(2),
        interestPayment: interestPayment.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2)
      });
    }

    return {
      monthlyPayment: monthlyPayment.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      amortization
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    const principal = parseFloat(loanAmount);
    const annualRate = parseFloat(interestRate);
    const years = parseInt(loanTerm);

    // Validation
    if (isNaN(principal) || isNaN(annualRate) || isNaN(years)) {
      setError('Please enter valid numbers');
      return;
    }
    if (principal <= 0 || annualRate < 0 || years <= 0) {
      setError('Loan amount and term must be positive, interest rate cannot be negative');
      return;
    }

    const calcResult = calculateMortgage(principal, annualRate, years);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTerm('');
    setResult(null);
    setError('');
    setShowBreakdown(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Mortgage Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Loan Amount ($):</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 200000"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Interest Rate (%):</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 5.5"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Loan Term (years):</label>
              <input
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 30"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all font-semibold"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Mortgage Details:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Monthly Payment: ${result.monthlyPayment}</p>
              <p className="text-center">Total Interest: ${result.totalInterest}</p>
              <p className="text-center">Total Paid: ${result.totalPaid}</p>
              
              {/* Amortization Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-sm text-teal-600 hover:underline"
                >
                  {showBreakdown ? 'Hide Amortization' : 'Show Amortization'}
                </button>
              </div>
              
              {showBreakdown && (
                <div className="mt-2 max-h-64 overflow-y-auto text-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border">Month</th>
                        <th className="p-2 border">Payment</th>
                        <th className="p-2 border">Principal</th>
                        <th className="p-2 border">Interest</th>
                        <th className="p-2 border">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.amortization.map((payment) => (
                        <tr key={payment.paymentNumber}>
                          <td className="p-2 border text-center">{payment.paymentNumber}</td>
                          <td className="p-2 border text-center">${payment.monthlyPayment}</td>
                          <td className="p-2 border text-center">${payment.principalPayment}</td>
                          <td className="p-2 border text-center">${payment.interestPayment}</td>
                          <td className="p-2 border text-center">${payment.remainingBalance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MortgageCalculator;