// components/TimeValueOfMoneyCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const TimeValueOfMoneyCalculator = () => {
  const [presentValue, setPresentValue] = useState(1000);
  const [futureValue, setFutureValue] = useState('');
  const [interestRate, setInterestRate] = useState(5);
  const [periods, setPeriods] = useState(10);
  const [calculateType, setCalculateType] = useState('FV'); // FV, PV, Rate, Periods
  const [result, setResult] = useState(null);

  const calculateTVM = () => {
    const rate = interestRate / 100;
    let calculatedResult;

    switch (calculateType) {
      case 'FV':
        // FV = PV * (1 + r)^n
        calculatedResult = presentValue * Math.pow(1 + rate, periods);
        setFutureValue(calculatedResult.toFixed(2));
        break;
      case 'PV':
        // PV = FV / (1 + r)^n
        calculatedResult = futureValue / Math.pow(1 + rate, periods);
        setPresentValue(calculatedResult.toFixed(2));
        break;
      case 'Rate':
        // r = (FV/PV)^(1/n) - 1
        calculatedResult = (Math.pow(futureValue / presentValue, 1 / periods) - 1) * 100;
        setInterestRate(calculatedResult.toFixed(2));
        break;
      case 'Periods':
        // n = ln(FV/PV) / ln(1 + r)
        calculatedResult = Math.log(futureValue / presentValue) / Math.log(1 + rate);
        setPeriods(Math.round(calculatedResult));
        break;
      default:
        break;
    }

    setResult(calculatedResult.toFixed(2));
  };

  useEffect(() => {
    if (presentValue && interestRate && periods && 
        (calculateType !== 'FV' || futureValue)) {
      calculateTVM();
    }
  }, [presentValue, futureValue, interestRate, periods, calculateType]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Time Value of Money Calculator</h1>

      <div className="space-y-4">
        {/* Calculate Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calculate
          </label>
          <select
            value={calculateType}
            onChange={(e) => setCalculateType(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="FV">Future Value</option>
            <option value="PV">Present Value</option>
            <option value="Rate">Interest Rate</option>
            <option value="Periods">Number of Periods</option>
          </select>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Present Value ($)
            </label>
            <input
              type="number"
              value={presentValue}
              onChange={(e) => setPresentValue(Number(e.target.value))}
              disabled={calculateType === 'PV'}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Future Value ($)
            </label>
            <input
              type="number"
              value={futureValue}
              onChange={(e) => setFutureValue(Number(e.target.value))}
              disabled={calculateType === 'FV'}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              min="0"
              step="0.01"
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
              disabled={calculateType === 'Rate'}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Periods (years)
            </label>
            <input
              type="number"
              value={periods}
              onChange={(e) => setPeriods(Number(e.target.value))}
              disabled={calculateType === 'Periods'}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              min="1"
            />
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <h2 className="text-lg font-semibold mb-2">Result</h2>
            <p className="text-xl font-bold text-green-600">
              {calculateType === 'FV' && `Future Value: $${Number(result).toLocaleString()}`}
              {calculateType === 'PV' && `Present Value: $${Number(result).toLocaleString()}`}
              {calculateType === 'Rate' && `Interest Rate: ${result}%`}
              {calculateType === 'Periods' && `Periods: ${Math.round(result)} years`}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Assumes compound interest with annual compounding. Results are approximate.
      </p>
    </div>
  );
};

export default TimeValueOfMoneyCalculator;