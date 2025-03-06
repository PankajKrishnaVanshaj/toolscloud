// components/SimpleInterestCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const SimpleInterestCalculator = () => {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(1);
  const [interest, setInterest] = useState(0);
  const [total, setTotal] = useState(0);

  const calculateInterest = () => {
    const simpleInterest = (principal * rate * time) / 100;
    setInterest(simpleInterest);
    setTotal(Number(principal) + simpleInterest);
  };

  useEffect(() => {
    calculateInterest();
  }, [principal, rate, time]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Simple Interest Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Principal Amount ($)
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Interest Rate (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
            step="0.1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time (Years)
          </label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2 text-center">Results</h2>
        <div className="space-y-2 text-center">
          <p>
            Principal: 
            <span className="font-medium"> ${Number(principal).toLocaleString()}</span>
          </p>
          <p>
            Interest Earned: 
            <span className="font-medium text-green-600"> ${interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          <p>
            Total Amount: 
            <span className="font-bold text-blue-600"> ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Formula: Interest = (Principal × Rate × Time) / 100
      </p>
    </div>
  );
};

export default SimpleInterestCalculator;