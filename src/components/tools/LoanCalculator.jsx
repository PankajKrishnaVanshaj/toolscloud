'use client'
import React, { useState } from 'react';

const LoanCalculator = () => {
  const [principal, setPrincipal] = useState(''); // Loan amount
  const [interestRate, setInterestRate] = useState(''); // Annual interest rate (%)
  const [loanTerm, setLoanTerm] = useState(''); // Term in years
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate loan details
  const calculateLoan = (principalAmt, rate, termYears) => {
    const principalNum = parseFloat(principalAmt);
    const annualRateNum = parseFloat(rate);
    const yearsNum = parseInt(termYears);

    if (isNaN(principalNum) || isNaN(annualRateNum) || isNaN(yearsNum)) {
      return { error: 'Please enter valid numbers' };
    }
    if (principalNum <= 0 || annualRateNum < 0 || yearsNum <= 0) {
      return { error: 'Principal and term must be positive, interest rate cannot be negative' };
    }

    const monthlyRate = annualRateNum / 100 / 12;
    const totalPayments = yearsNum * 12;

    // Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment = principalNum * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
                          (Math.pow(1 + monthlyRate, totalPayments) - 1);

    if (!isFinite(monthlyPayment) || monthlyPayment <= 0) {
      return { error: 'Invalid calculation - check your inputs (rate may be too high)' };
    }

    const totalPaid = monthlyPayment * totalPayments;
    const totalInterest = totalPaid - principalNum;

    // Amortization schedule
    const amortization = [];
    let remainingBalance = principalNum;
    for (let month = 1; month <= totalPayments && remainingBalance > 0; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      if (remainingBalance < 0) remainingBalance = 0;

      amortization.push({
        month,
        monthlyPayment: monthlyPayment.toFixed(2),
        principalPayment: principalPayment.toFixed(2),
        interestPayment: interestPayment.toFixed(2),
        remainingBalance: remainingBalance.toFixed(2)
      });
    }

    return {
      principal: principalNum.toFixed(2),
      interestRate: annualRateNum.toFixed(2),
      loanTerm: yearsNum,
      monthlyPayment: monthlyPayment.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      amortization
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!principal || !interestRate || !loanTerm) {
      setError('Please fill in all required fields');
      return;
    }

    const calcResult = calculateLoan(principal, interestRate, loanTerm);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setPrincipal('');
    setInterestRate('');
    setLoanTerm('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Loan Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Loan Amount ($):</label>
              <input
                type="number"
                step="0.01"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 10000"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Interest Rate (%):</label>
              <input
                type="number"
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 5"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Loan Term (years):</label>
              <input
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., 5"
                min="1"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Loan Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">Monthly Payment: ${result.monthlyPayment}</p>
              <p className="text-center">Total Interest: ${result.totalInterest}</p>
              <p className="text-center">Total Paid: ${result.totalPaid}</p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {showDetails ? 'Hide Amortization Schedule' : 'Show Amortization Schedule'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Loan Details:</p>
                  <ul className="list-disc list-inside">
                    <li>Principal: ${result.principal}</li>
                    <li>Annual Interest Rate: {result.interestRate}%</li>
                    <li>Loan Term: {result.loanTerm} years ({result.loanTerm * 12} months)</li>
                  </ul>
                  <p className="mt-2">Amortization Schedule:</p>
                  <div className="max-h-64 overflow-y-auto">
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
                        {result.amortization.map((monthData) => (
                          <tr key={monthData.month}>
                            <td className="p-2 border text-center">{monthData.month}</td>
                            <td className="p-2 border text-center">${monthData.monthlyPayment}</td>
                            <td className="p-2 border text-center">${monthData.principalPayment}</td>
                            <td className="p-2 border text-center">${monthData.interestPayment}</td>
                            <td className="p-2 border text-center">${monthData.remainingBalance}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanCalculator;