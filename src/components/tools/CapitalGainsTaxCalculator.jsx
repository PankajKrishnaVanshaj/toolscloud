// components/CapitalGainsTaxCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const CapitalGainsTaxCalculator = () => {
  const [formData, setFormData] = useState({
    filingStatus: 'single',
    taxableIncome: 0,
    purchasePrice: 0,
    salePrice: 0,
    holdingPeriod: 'long', // 'short' or 'long' (>1 year)
  });
  const [results, setResults] = useState(null);

  // 2023 U.S. Capital Gains Tax Brackets (simplified)
  const taxBrackets = {
    single: [
      { max: 44625, rate: 0 },
      { max: 200000, rate: 15 },
      { max: Infinity, rate: 20 }
    ],
    married: [
      { max: 89250, rate: 0 },
      { max: 250000, rate: 15 },
      { max: Infinity, rate: 20 }
    ]
  };

  const calculateTax = () => {
    const { filingStatus, taxableIncome, purchasePrice, salePrice, holdingPeriod } = formData;
    
    // Calculate capital gain
    const capitalGain = salePrice - purchasePrice;
    if (capitalGain <= 0) {
      setResults({ capitalGain: 0, tax: 0, taxRate: 0 });
      return;
    }

    // Short-term gains are taxed as ordinary income (simplified)
    if (holdingPeriod === 'short') {
      const tax = capitalGain * 0.37; // Assuming highest ordinary income bracket for simplicity
      setResults({ capitalGain, tax: tax.toFixed(2), taxRate: 37 });
      return;
    }

    // Long-term gains
    const totalIncome = Number(taxableIncome) + capitalGain;
    const brackets = taxBrackets[filingStatus];
    
    let taxRate = 0;
    for (const bracket of brackets) {
      if (totalIncome <= bracket.max) {
        taxRate = bracket.rate;
        break;
      }
    }

    const tax = capitalGain * (taxRate / 100);
    setResults({
      capitalGain: capitalGain.toFixed(2),
      tax: tax.toFixed(2),
      taxRate
    });
  };

  useEffect(() => {
    calculateTax();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Capital Gains Tax Calculator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filing Status
          </label>
          <select
            name="filingStatus"
            value={formData.filingStatus}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single</option>
            <option value="married">Married Filing Jointly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taxable Income ($)
          </label>
          <input
            type="number"
            name="taxableIncome"
            value={formData.taxableIncome}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purchase Price ($)
          </label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sale Price ($)
          </label>
          <input
            type="number"
            name="salePrice"
            value={formData.salePrice}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Holding Period
          </label>
          <select
            name="holdingPeriod"
            value={formData.holdingPeriod}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="long">Long-term ({`>1 year`})</option>
            <option value="short">Short-term (≤1 year)</option>
          </select>
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <div className="space-y-2">
            <p>Capital Gain: 
              <span className="font-bold text-green-600">
                ${Number(results.capitalGain).toLocaleString()}
              </span>
            </p>
            <p>Estimated Tax: 
              <span className="font-bold text-red-600">
                ${Number(results.tax).toLocaleString()}
              </span>
            </p>
            <p>Tax Rate: 
              <span className="font-medium">
                {results.taxRate}%
              </span>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simplified calculation based on 2023 U.S. tax rates. 
        Actual taxes may vary due to additional factors (e.g., state taxes, 
        deductions, NIIT). Consult a tax professional for accurate advice.
      </p>
    </div>
  );
};

export default CapitalGainsTaxCalculator;