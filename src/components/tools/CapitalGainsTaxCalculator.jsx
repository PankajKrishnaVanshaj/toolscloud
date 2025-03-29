"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCalculator, FaSync } from "react-icons/fa";

const CapitalGainsTaxCalculator = () => {
  const [formData, setFormData] = useState({
    filingStatus: "single",
    taxableIncome: 0,
    purchasePrice: 0,
    salePrice: 0,
    holdingPeriod: "long",
    state: "none",
    includeNIIT: false,
  });
  const [results, setResults] = useState(null);

  // 2025 U.S. Capital Gains Tax Brackets (hypothetical, updated for March 29, 2025)
  const taxBrackets = {
    single: [
      { max: 47000, rate: 0 },
      { max: 210000, rate: 15 },
      { max: Infinity, rate: 20 },
    ],
    married: [
      { max: 94000, rate: 0 },
      { max: 260000, rate: 15 },
      { max: Infinity, rate: 20 },
    ],
  };

  // Simplified state tax rates (example values)
  const stateTaxRates = {
    none: 0,
    ca: 13.3, // California (high tax state)
    ny: 10.9, // New York
    tx: 0, // Texas (no state income tax)
  };

  const calculateTax = useCallback(() => {
    const { filingStatus, taxableIncome, purchasePrice, salePrice, holdingPeriod, state, includeNIIT } = formData;

    // Calculate capital gain
    const capitalGain = salePrice - purchasePrice;
    if (capitalGain <= 0) {
      setResults({ capitalGain: 0, federalTax: 0, stateTax: 0, totalTax: 0, federalTaxRate: 0 });
      return;
    }

    // Calculate total income (needed for NIIT and long-term brackets)
    const totalIncome = Number(taxableIncome) + capitalGain;
    
    let federalTaxRate = 0;
    let federalTax = 0;

    // Short-term gains (taxed as ordinary income, simplified)
    if (holdingPeriod === "short") {
      federalTaxRate = 37; // Highest federal bracket for simplicity
      federalTax = capitalGain * (federalTaxRate / 100);
    } else {
      // Long-term gains
      const brackets = taxBrackets[filingStatus];
      for (const bracket of brackets) {
        if (totalIncome <= bracket.max) {
          federalTaxRate = bracket.rate;
          break;
        }
      }
      federalTax = capitalGain * (federalTaxRate / 100);
    }

    // State tax
    const stateTaxRate = stateTaxRates[state];
    const stateTax = holdingPeriod === "short" ? capitalGain * (stateTaxRate / 100) : 0;

    // Net Investment Income Tax (3.8% for high earners)
    const niit = includeNIIT && totalIncome > (filingStatus === "single" ? 200000 : 250000) ? capitalGain * 0.038 : 0;

    const totalTax = federalTax + stateTax + niit;

    setResults({
      capitalGain: capitalGain.toFixed(2),
      federalTax: federalTax.toFixed(2),
      stateTax: stateTax.toFixed(2),
      niit: niit.toFixed(2),
      totalTax: totalTax.toFixed(2),
      federalTaxRate,
      stateTaxRate,
    });
  }, [formData]);

  useEffect(() => {
    calculateTax();
  }, [formData, calculateTax]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      filingStatus: "single",
      taxableIncome: 0,
      purchasePrice: 0,
      salePrice: 0,
      holdingPeriod: "long",
      state: "none",
      includeNIIT: false,
    });
    setResults(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Capital Gains Tax Calculator
        </h1>

        {/* Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filing Status</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Taxable Income ($)</label>
            <input
              type="number"
              name="taxableIncome"
              value={formData.taxableIncome}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price ($)</label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price ($)</label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Holding Period</label>
            <select
              name="holdingPeriod"
              value={formData.holdingPeriod}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="long">Long-term (&gt;1 year)</option>
              <option value="short">Short-term (≤1 year)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None (Federal Only)</option>
              <option value="ca">California</option>
              <option value="ny">New York</option>
              <option value="tx">Texas</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="includeNIIT"
                checked={formData.includeNIIT}
                onChange={handleChange}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Include NIIT (3.8%)</span>
            </label>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p>Capital Gain:</p>
                <p className="font-bold text-green-600">${Number(results.capitalGain).toLocaleString()}</p>
              </div>
              <div>
                <p>Federal Tax ({results.federalTaxRate}%):</p>
                <p className="font-bold text-red-600">${Number(results.federalTax).toLocaleString()}</p>
              </div>
              <div>
                <p>State Tax ({results.stateTaxRate}%):</p>
                <p className="font-bold text-red-600">${Number(results.stateTax).toLocaleString()}</p>
              </div>
              <div>
                <p>Net Investment Income Tax:</p>
                <p className="font-bold text-red-600">${Number(results.niit).toLocaleString()}</p>
              </div>
              <div className="sm:col-span-2">
                <p>Total Estimated Tax:</p>
                <p className="font-bold text-red-700 text-lg">${Number(results.totalTax).toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculateTax}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={resetForm}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports Single and Married Filing Jointly statuses</li>
            <li>Short-term and long-term capital gains</li>
            <li>State tax inclusion (CA, NY, TX examples)</li>
            <li>Optional Net Investment Income Tax (NIIT)</li>
            <li>Real-time calculations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CapitalGainsTaxCalculator;