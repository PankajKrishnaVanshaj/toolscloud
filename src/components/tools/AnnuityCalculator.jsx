// components/AnnuityCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const AnnuityCalculator = () => {
  const [payment, setPayment] = useState(1000); // Monthly payment
  const [interestRate, setInterestRate] = useState(5); // Annual interest rate in %
  const [years, setYears] = useState(10); // Number of years
  const [frequency, setFrequency] = useState(12); // Payments per year (monthly)
  const [results, setResults] = useState(null);

  const calculateAnnuity = () => {
    const n = years * frequency; // Total number of payments
    const r = interestRate / 100 / frequency; // Periodic interest rate

    // Future Value of Annuity (FVA)
    const futureValue = payment * ((Math.pow(1 + r, n) - 1) / r);

    // Present Value of Annuity (PVA)
    const presentValue = payment * ((1 - Math.pow(1 + r, -n)) / r);

    setResults({
      futureValue: futureValue.toFixed(2),
      presentValue: presentValue.toFixed(2),
      totalPayments: (payment * n).toFixed(2),
    });
  };

  useEffect(() => {
    calculateAnnuity();
  }, [payment, interestRate, years, frequency]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Annuity Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Amount ($)
          </label>
          <input
            type="number"
            value={payment}
            onChange={(e) => setPayment(Number(e.target.value))}
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
            max="20"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Years
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="1"
            max="50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value={1}>Annually</option>
            <option value={4}>Quarterly</option>
            <option value={12}>Monthly</option>
          </select>
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>
              Future Value:{' '}
              <span className="font-bold text-green-600">
                ${Number(results.futureValue).toLocaleString()}
              </span>
            </p>
            <p>
              Present Value:{' '}
              <span className="font-bold text-blue-600">
                ${Number(results.presentValue).toLocaleString()}
              </span>
            </p>
            <p>
              Total Payments:{' '}
              <span className="font-medium">
                ${Number(results.totalPayments).toLocaleString()}
              </span>
            </p>
            <p>
              Total Periods:{' '}
              <span className="font-medium">{years * frequency}</span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This calculator assumes fixed payments and interest rate. Actual
        results may vary due to compounding variations, fees, or taxes. Consult a
        financial advisor for professional advice.
      </p>
    </div>
  );
};

export default AnnuityCalculator;