// components/InterestRateConverter.js
'use client';

import React, { useState } from 'react';

const InterestRateConverter = () => {
  const [rate, setRate] = useState('');
  const [rateType, setRateType] = useState('annual');
  const [compoundsPerYear, setCompoundsPerYear] = useState(12); // Default to monthly compounding

  const calculateRates = () => {
    if (!rate || isNaN(rate) || rate <= 0) return null;

    const decimalRate = parseFloat(rate) / 100;
    let results = {};

    if (rateType === 'annual') {
      // Annual to other rates
      const effectiveRate = Math.pow(1 + decimalRate / compoundsPerYear, compoundsPerYear) - 1;
      results = {
        annualNominal: decimalRate,
        monthly: decimalRate / 12,
        daily: decimalRate / 365,
        effectiveAnnual: effectiveRate,
      };
    } else if (rateType === 'monthly') {
      // Monthly to other rates
      const annualNominal = decimalRate * 12;
      const effectiveRate = Math.pow(1 + decimalRate, 12) - 1;
      results = {
        annualNominal,
        monthly: decimalRate,
        daily: annualNominal / 365,
        effectiveAnnual: effectiveRate,
      };
    } else if (rateType === 'daily') {
      // Daily to other rates
      const annualNominal = decimalRate * 365;
      const effectiveRate = Math.pow(1 + decimalRate, 365) - 1;
      results = {
        annualNominal,
        monthly: annualNominal / 12,
        daily: decimalRate,
        effectiveAnnual: effectiveRate,
      };
    }

    return {
      annualNominal: (results.annualNominal * 100).toFixed(4),
      monthly: (results.monthly * 100).toFixed(4),
      daily: (results.daily * 100).toFixed(4),
      effectiveAnnual: (results.effectiveAnnual * 100).toFixed(4),
    };
  };

  const results = calculateRates();

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Interest Rate Converter</h1>

      <div className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter rate"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rate Type
            </label>
            <select
              value={rateType}
              onChange={(e) => setRateType(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="annual">Annual</option>
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compounds Per Year
            </label>
            <input
              type="number"
              value={compoundsPerYear}
              onChange={(e) => setCompoundsPerYear(Math.max(1, Number(e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="1"
              step="1"
            />
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-center">Converted Rates</h2>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <p>
                <span className="font-medium">Annual Nominal Rate:</span> {results.annualNominal}%
              </p>
              <p>
                <span className="font-medium">Monthly Rate:</span> {results.monthly}%
              </p>
              <p>
                <span className="font-medium">Daily Rate:</span> {results.daily}%
              </p>
              <p>
                <span className="font-medium">Effective Annual Rate:</span> {results.effectiveAnnual}%
              </p>
            </div>
          </div>
        )}

        {!results && rate && (
          <p className="text-sm text-red-600 text-center">
            Please enter a valid positive number
          </p>
        )}

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Calculations assume compound interest. Effective rate accounts for compounding frequency.
        </p>
      </div>
    </div>
  );
};

export default InterestRateConverter;