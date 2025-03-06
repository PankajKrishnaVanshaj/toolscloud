// components/InternalRateOfReturnCalculator.js
'use client';

import React, { useState } from 'react';

const InternalRateOfReturnCalculator = () => {
  const [cashFlows, setCashFlows] = useState([-1000, 300, 400, 500]); // Initial example: investment + returns
  const [irr, setIrr] = useState(null);
  const [error, setError] = useState('');

  // Calculate IRR using Newton-Raphson method
  const calculateIRR = (flows) => {
    const maxIterations = 1000;
    const precision = 0.0000001;
    let guess = 0.1; // Initial guess of 10%

    const npv = (rate) => {
      return flows.reduce((sum, flow, index) => {
        return sum + flow / Math.pow(1 + rate, index);
      }, 0);
    };

    const derivative = (rate) => {
      return flows.reduce((sum, flow, index) => {
        if (index === 0) return sum;
        return sum - (index * flow) / Math.pow(1 + rate, index + 1);
      }, 0);
    };

    for (let i = 0; i < maxIterations; i++) {
      const npvValue = npv(guess);
      const derivValue = derivative(guess);

      if (Math.abs(derivValue) < precision) {
        return null; // Avoid division by near-zero
      }

      const newGuess = guess - npvValue / derivValue;

      if (Math.abs(newGuess - guess) < precision) {
        return newGuess * 100; // Convert to percentage
      }

      guess = newGuess;
    }
    return null; // Failed to converge
  };

  const handleCalculate = () => {
    if (cashFlows.length < 2) {
      setError('Please enter at least two cash flows (initial investment and one return).');
      setIrr(null);
      return;
    }

    const calculatedIRR = calculateIRR(cashFlows.map(Number));
    if (calculatedIRR === null) {
      setError('Unable to calculate IRR. Try adjusting your cash flows.');
      setIrr(null);
    } else {
      setIrr(calculatedIRR.toFixed(2));
      setError('');
    }
  };

  const handleCashFlowChange = (index, value) => {
    const newCashFlows = [...cashFlows];
    newCashFlows[index] = value === '' ? '' : Number(value);
    setCashFlows(newCashFlows);
  };

  const addCashFlow = () => {
    setCashFlows([...cashFlows, 0]);
  };

  const removeCashFlow = (index) => {
    if (cashFlows.length > 1) {
      setCashFlows(cashFlows.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Internal Rate of Return Calculator</h1>

      <div className="space-y-4">
        {/* Cash Flow Inputs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cash Flows (Negative for investment, Positive for returns)
          </label>
          {cashFlows.map((flow, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={flow}
                onChange={(e) => handleCashFlowChange(index, e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`Year ${index} cash flow`}
              />
              {cashFlows.length > 1 && (
                <button
                  onClick={() => removeCashFlow(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCashFlow}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Cash Flow
          </button>
        </div>

        {/* Calculate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleCalculate}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate IRR
          </button>
        </div>

        {/* Result */}
        {irr !== null && (
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <h2 className="text-lg font-semibold text-blue-600">
              IRR: {irr}%
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              The rate at which the net present value equals zero
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Instructions */}
        <p className="text-xs text-gray-500 mt-4">
          Note: Enter cash flows in order (e.g., -1000 for initial investment, then positive returns).
          IRR calculation uses the Newton-Raphson method and may not converge for all inputs.
        </p>
      </div>
    </div>
  );
};

export default InternalRateOfReturnCalculator;