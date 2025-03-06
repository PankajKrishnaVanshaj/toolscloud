// components/PayrollTaxCalculator.js
'use client';

import React, { useState, useEffect } from 'react';

const PayrollTaxCalculator = () => {
  const [grossPay, setGrossPay] = useState(0);
  const [filingStatus, setFilingStatus] = useState('single');
  const [payFrequency, setPayFrequency] = useState('monthly');
  const [results, setResults] = useState(null);

  // Simplified 2025 tax brackets (hypothetical, for demonstration)
  const taxBrackets = {
    single: [
      { rate: 0.10, min: 0, max: 11000 },
      { rate: 0.12, min: 11001, max: 44725 },
      { rate: 0.22, min: 44726, max: 95375 },
      { rate: 0.24, min: 95376, max: 182100 },
      { rate: 0.32, min: 182101, max: 231250 },
      { rate: 0.35, min: 231251, max: 578125 },
      { rate: 0.37, min: 578126, max: Infinity },
    ],
    married: [
      { rate: 0.10, min: 0, max: 22000 },
      { rate: 0.12, min: 22001, max: 89450 },
      { rate: 0.22, min: 89451, max: 190750 },
      { rate: 0.24, min: 190751, max: 364200 },
      { rate: 0.32, min: 364201, max: 462500 },
      { rate: 0.35, min: 462501, max: 693750 },
      { rate: 0.37, min: 693751, max: Infinity },
    ],
  };

  // Social Security and Medicare rates (2025 hypothetical)
  const SOCIAL_SECURITY_RATE = 0.062; // 6.2%
  const MEDICARE_RATE = 0.0145; // 1.45%
  const SOCIAL_SECURITY_WAGE_BASE = 168600; // 2025 hypothetical limit

  const calculateTaxes = () => {
    if (!grossPay || grossPay <= 0) {
      setResults(null);
      return;
    }

    // Annualize the gross pay
    const frequencyMultiplier = {
      weekly: 52,
      biweekly: 26,
      monthly: 12,
      annually: 1,
    };
    const annualGross = grossPay * frequencyMultiplier[payFrequency];

    // Federal Income Tax
    const brackets = taxBrackets[filingStatus];
    let federalTaxAnnual = 0;
    let previousMax = 0;

    for (const bracket of brackets) {
      if (annualGross > previousMax) {
        const taxableInBracket = Math.min(annualGross, bracket.max) - previousMax;
        federalTaxAnnual += taxableInBracket * bracket.rate;
        previousMax = bracket.max;
      }
    }

    // Social Security Tax
    const socialSecurityBase = Math.min(annualGross, SOCIAL_SECURITY_WAGE_BASE);
    const socialSecurityTaxAnnual = socialSecurityBase * SOCIAL_SECURITY_RATE;

    // Medicare Tax
    const medicareTaxAnnual = annualGross * MEDICARE_RATE;

    // Convert back to pay period
    const federalTax = federalTaxAnnual / frequencyMultiplier[payFrequency];
    const socialSecurityTax = socialSecurityTaxAnnual / frequencyMultiplier[payFrequency];
    const medicareTax = medicareTaxAnnual / frequencyMultiplier[payFrequency];
    const totalTax = federalTax + socialSecurityTax + medicareTax;
    const netPay = grossPay - totalTax;

    setResults({
      federalTax: federalTax.toFixed(2),
      socialSecurityTax: socialSecurityTax.toFixed(2),
      medicareTax: medicareTax.toFixed(2),
      totalTax: totalTax.toFixed(2),
      netPay: netPay.toFixed(2),
    });
  };

  useEffect(() => {
    calculateTaxes();
  }, [grossPay, filingStatus, payFrequency]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Payroll Tax Calculator</h1>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gross Pay ($)
          </label>
          <input
            type="number"
            value={grossPay}
            onChange={(e) => setGrossPay(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filing Status
          </label>
          <select
            value={filingStatus}
            onChange={(e) => setFilingStatus(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single</option>
            <option value="married">Married Filing Jointly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pay Frequency
          </label>
          <select
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
      </div>

      {results && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Tax Breakdown</h2>
          <div className="space-y-2 text-sm">
            <p>Federal Income Tax: <span className="font-medium">${results.federalTax}</span></p>
            <p>Social Security Tax: <span className="font-medium">${results.socialSecurityTax}</span></p>
            <p>Medicare Tax: <span className="font-medium">${results.medicareTax}</span></p>
            <p className="border-t pt-2">Total Tax: <span className="font-bold text-red-600">${results.totalTax}</span></p>
            <p>Net Pay: <span className="font-bold text-green-600">${results.netPay}</span></p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4">
        Note: This is a simplified calculation based on hypothetical 2025 U.S. tax rates. 
        It excludes state taxes, deductions, and other factors. Consult a tax professional 
        for accurate payroll calculations.
      </p>
    </div>
  );
};

export default PayrollTaxCalculator;