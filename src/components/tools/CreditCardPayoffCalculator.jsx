"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartBar } from "react-icons/fa";

const CreditCardPayoffCalculator = () => {
  const [balance, setBalance] = useState(5000);
  const [interestRate, setInterestRate] = useState(18);
  const [monthlyPayment, setMonthlyPayment] = useState(200);
  const [extraPayment, setExtraPayment] = useState(0);
  const [results, setResults] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [error, setError] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);

  const calculatePayoff = useCallback(() => {
    if (balance <= 0 || interestRate < 0 || monthlyPayment <= 0) {
      setError("Please enter valid positive values for balance, interest rate, and payment");
      setResults(null);
      setAmortizationSchedule([]);
      return;
    }

    const monthlyInterestRate = interestRate / 100 / 12;
    let remainingBalance = balance;
    let months = 0;
    let totalInterest = 0;
    let totalPrincipal = 0;
    const schedule = [];

    const minPayment = remainingBalance * monthlyInterestRate;
    if (monthlyPayment + extraPayment <= minPayment) {
      setError("Total payment must exceed the monthly interest charge");
      setResults(null);
      setAmortizationSchedule([]);
      return;
    }

    while (remainingBalance > 0 && months < 1000) {
      const interest = remainingBalance * monthlyInterestRate;
      const totalPayment = monthlyPayment + extraPayment;
      const principal = Math.min(totalPayment - interest, remainingBalance);
      remainingBalance -= principal;
      totalInterest += interest;
      totalPrincipal += principal;
      months++;

      schedule.push({
        month: months,
        balance: remainingBalance.toFixed(2),
        interest: interest.toFixed(2),
        principal: principal.toFixed(2),
        totalPayment: totalPayment.toFixed(2),
      });

      if (remainingBalance <= 0) {
        totalInterest += remainingBalance; // Adjust for overpayment
        remainingBalance = 0;
      }
    }

    if (months >= 1000) {
      setError("Calculation error: Payment too low or balance too high");
      setResults(null);
      setAmortizationSchedule([]);
      return;
    }

    setResults({
      months,
      years: (months / 12).toFixed(1),
      totalInterest: totalInterest.toFixed(2),
      totalPaid: (balance + totalInterest).toFixed(2),
      totalPrincipal: totalPrincipal.toFixed(2),
    });
    setAmortizationSchedule(schedule);
    setError("");
  }, [balance, interestRate, monthlyPayment, extraPayment]);

  useEffect(() => {
    calculatePayoff();
  }, [calculatePayoff]);

  const reset = () => {
    setBalance(5000);
    setInterestRate(18);
    setMonthlyPayment(200);
    setExtraPayment(0);
    setShowSchedule(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Credit Card Payoff Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance ($)
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(Math.max(0, Number(e.target.value)))}
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
              onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
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
              onChange={(e) => setMonthlyPayment(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Extra Monthly Payment ($)
            </label>
            <input
              type="number"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="10"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {/* Results */}
        {results && !error && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h2 className="text-lg font-semibold mb-2 text-center">Payoff Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="font-medium">Time to Pay Off:</span> {results.months} months
                  (~{results.years} years)
                </p>
                <p>
                  <span className="font-medium">Total Interest Paid:</span> $
                  {Number(results.totalInterest).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Total Principal Paid:</span> $
                  {Number(results.totalPrincipal).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Total Amount Paid:</span> $
                  {Number(results.totalPaid).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Amortization Schedule Toggle */}
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaChartBar className="mr-2" />
              {showSchedule ? "Hide" : "Show"} Amortization Schedule
            </button>

            {showSchedule && (
              <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
                <h3 className="text-md font-semibold mb-2 text-center">Amortization Schedule</h3>
                <table className="w-full text-sm text-gray-700">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Month</th>
                      <th className="p-2 text-right">Payment</th>
                      <th className="p-2 text-right">Principal</th>
                      <th className="p-2 text-right">Interest</th>
                      <th className="p-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationSchedule.map((entry) => (
                      <tr key={entry.month} className="border-t">
                        <td className="p-2">{entry.month}</td>
                        <td className="p-2 text-right">${Number(entry.totalPayment).toLocaleString()}</td>
                        <td className="p-2 text-right">${Number(entry.principal).toLocaleString()}</td>
                        <td className="p-2 text-right">${Number(entry.interest).toLocaleString()}</td>
                        <td className="p-2 text-right">${Number(entry.balance).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={reset}
          className="mt-6 w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <FaSync className="mr-2" /> Reset
        </button>

        {/* Notes */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate payoff time and total costs</li>
            <li>Include extra monthly payments</li>
            <li>Detailed amortization schedule</li>
            <li>Real-time updates with input changes</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Assumes fixed payments and interest rate. Actual payoff may vary due to minimum
          payments, rate changes, or fees.
        </p>
      </div>
    </div>
  );
};

export default CreditCardPayoffCalculator;