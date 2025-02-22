'use client'
import React, { useState } from 'react';

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState(''); // Annual interest rate in percentage
  const [time, setTime] = useState(''); // Time in years
  const [frequency, setFrequency] = useState('12'); // Compounds per year (default: monthly)
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Calculate compound interest
  const calculateCompoundInterest = (P, r, t, n) => {
    // Formula: A = P(1 + r/n)^(nt)
    const amount = P * Math.pow(1 + (r / 100 / n), n * t);
    const interest = amount - P;

    // Yearly breakdown
    const breakdown = [];
    let currentBalance = P;
    for (let year = 1; year <= t; year++) {
      const newBalance = P * Math.pow(1 + (r / 100 / n), n * year);
      const yearInterest = newBalance - currentBalance;
      currentBalance = newBalance;
      breakdown.push({
        year,
        balance: newBalance.toFixed(2),
        interest: yearInterest.toFixed(2)
      });
    }

    return {
      finalAmount: amount.toFixed(2),
      totalInterest: interest.toFixed(2),
      breakdown
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    const P = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseInt(time);
    const n = parseInt(frequency);

    // Validation
    if (isNaN(P) || isNaN(r) || isNaN(t) || isNaN(n)) {
      setError('Please enter valid numbers');
      return;
    }
    if (P <= 0 || r < 0 || t <= 0 || n <= 0) {
      setError('All values must be positive (rate can be 0)');
      return;
    }

    const calcResult = calculateCompoundInterest(P, r, t, n);
    setResult(calcResult);
  };

  const reset = () => {
    setPrincipal('');
    setRate('');
    setTime('');
    setFrequency('12');
    setResult(null);
    setError('');
    setShowBreakdown(false);
  };

  const frequencyOptions = {
    1: 'Annually',
    4: 'Quarterly',
    12: 'Monthly',
    365: 'Daily'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Compound Interest Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Principal ($):</label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 1000"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Annual Rate (%):</label>
              <input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 5"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Time (years):</label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 10"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-40 text-gray-700">Compound Frequency:</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(frequencyOptions).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Investment Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Final Amount: ${result.finalAmount}</p>
              <p className="text-center">Total Interest: ${result.totalInterest}</p>
              <p className="text-center">Initial Investment: ${principal}</p>
              
              {/* Breakdown Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {showBreakdown ? 'Hide Yearly Breakdown' : 'Show Yearly Breakdown'}
                </button>
              </div>
              
              {showBreakdown && (
                <div className="mt-2 max-h-64 overflow-y-auto text-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 border">Year</th>
                        <th className="p-2 border">Balance</th>
                        <th className="p-2 border">Interest Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((yearData) => (
                        <tr key={yearData.year}>
                          <td className="p-2 border text-center">{yearData.year}</td>
                          <td className="p-2 border text-center">${yearData.balance}</td>
                          <td className="p-2 border text-center">${yearData.interest}</td>
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

export default CompoundInterestCalculator;