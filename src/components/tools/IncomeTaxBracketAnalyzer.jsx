// components/IncomeTaxBracketAnalyzer.js
'use client';

import React, { useState, useEffect } from 'react';

// 2025 Projected U.S. Federal Tax Brackets (Single filer, simplified estimates)
const taxBrackets = [
  { rate: 0.10, min: 0, max: 11600 },
  { rate: 0.12, min: 11601, max: 47150 },
  { rate: 0.22, min: 47151, max: 100525 },
  { rate: 0.24, min: 100526, max: 191950 },
  { rate: 0.32, min: 191951, max: 243725 },
  { rate: 0.35, min: 243726, max: 609350 },
  { rate: 0.37, min: 609351, max: Infinity },
];

const IncomeTaxBracketAnalyzer = () => {
  const [income, setIncome] = useState(50000);
  const [taxDetails, setTaxDetails] = useState(null);

  const calculateTax = (incomeAmount) => {
    if (incomeAmount < 0) return { totalTax: 0, effectiveRate: 0, breakdown: [] };

    let remainingIncome = incomeAmount;
    let totalTax = 0;
    const breakdown = [];

    for (const bracket of taxBrackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.max === Infinity ? remainingIncome : bracket.max - bracket.min + 1
      );
      const taxInBracket = taxableInBracket * bracket.rate;
      totalTax += taxInBracket;
      remainingIncome -= taxableInBracket;

      breakdown.push({
        rate: bracket.rate,
        amount: taxableInBracket,
        tax: taxInBracket,
        range: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()}`,
      });
    }

    const effectiveRate = totalTax / incomeAmount;
    return { totalTax, effectiveRate, breakdown: breakdown.filter(b => b.amount > 0) };
  };

  useEffect(() => {
    const result = calculateTax(income);
    setTaxDetails(result);
  }, [income]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Income Tax Bracket Analyzer</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annual Taxable Income ($)
        </label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          min="0"
          step="100"
        />
      </div>

      {taxDetails && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3">Tax Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p>
                <span className="font-medium">Total Income:</span> ${income.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Total Tax:</span> ${taxDetails.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p>
                <span className="font-medium">Effective Tax Rate:</span> {(taxDetails.effectiveRate * 100).toFixed(2)}%
              </p>
              <p>
                <span className="font-medium">After-Tax Income:</span> ${(income - taxDetails.totalTax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Bracket Breakdown */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Tax Bracket Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Bracket Range ($)</th>
                    <th className="px-4 py-2">Rate</th>
                    <th className="px-4 py-2">Taxable Amount ($)</th>
                    <th className="px-4 py-2">Tax ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {taxDetails.breakdown.map((bracket, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{bracket.range}</td>
                      <td className="px-4 py-2">{(bracket.rate * 100).toFixed(0)}%</td>
                      <td className="px-4 py-2">{bracket.amount.toLocaleString()}</td>
                      <td className="px-4 py-2">{bracket.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6">
        Note: Based on projected 2025 U.S. federal tax brackets for single filers (simplified estimates).
        Does not include standard deduction, credits, or state taxes. Consult a tax professional for accurate calculations.
      </p>
    </div>
  );
};

export default IncomeTaxBracketAnalyzer;