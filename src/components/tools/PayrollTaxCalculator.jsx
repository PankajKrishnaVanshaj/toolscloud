"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const PayrollTaxCalculator = () => {
  const [grossPay, setGrossPay] = useState("");
  const [filingStatus, setFilingStatus] = useState("single");
  const [payFrequency, setPayFrequency] = useState("monthly");
  const [dependents, setDependents] = useState(0);
  const [stateTaxRate, setStateTaxRate] = useState(0);
  const [additionalWithholding, setAdditionalWithholding] = useState(0);
  const [results, setResults] = useState(null);

  // Hypothetical 2025 tax brackets
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

  // Tax constants (2025 hypothetical)
  const SOCIAL_SECURITY_RATE = 0.062;
  const MEDICARE_RATE = 0.0145;
  const SOCIAL_SECURITY_WAGE_BASE = 168600;
  const DEPENDENT_CREDIT = 2000; // Per dependent credit

  const frequencyMultiplier = {
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    annually: 1,
  };

  const calculateTaxes = useCallback(() => {
    const gross = parseFloat(grossPay) || 0;
    if (gross <= 0) {
      setResults(null);
      return;
    }

    const annualGross = gross * frequencyMultiplier[payFrequency];

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

    // Apply dependent credit
    const dependentDeduction = dependents * DEPENDENT_CREDIT;
    federalTaxAnnual = Math.max(0, federalTaxAnnual - dependentDeduction);

    // Social Security Tax
    const socialSecurityBase = Math.min(annualGross, SOCIAL_SECURITY_WAGE_BASE);
    const socialSecurityTaxAnnual = socialSecurityBase * SOCIAL_SECURITY_RATE;

    // Medicare Tax
    const medicareTaxAnnual = annualGross * MEDICARE_RATE;

    // State Tax
    const stateTaxAnnual = annualGross * (stateTaxRate / 100);

    // Additional Withholding
    const additionalWithholdingAnnual = additionalWithholding * frequencyMultiplier[payFrequency];

    // Convert back to pay period
    const federalTax = (federalTaxAnnual + additionalWithholdingAnnual) / frequencyMultiplier[payFrequency];
    const socialSecurityTax = socialSecurityTaxAnnual / frequencyMultiplier[payFrequency];
    const medicareTax = medicareTaxAnnual / frequencyMultiplier[payFrequency];
    const stateTax = stateTaxAnnual / frequencyMultiplier[payFrequency];
    const totalTax = federalTax + socialSecurityTax + medicareTax + stateTax;
    const netPay = gross - totalTax;

    setResults({
      federalTax: federalTax.toFixed(2),
      socialSecurityTax: socialSecurityTax.toFixed(2),
      medicareTax: medicareTax.toFixed(2),
      stateTax: stateTax.toFixed(2),
      totalTax: totalTax.toFixed(2),
      netPay: netPay.toFixed(2),
      annualGross: annualGross.toFixed(2),
    });
  }, [grossPay, filingStatus, payFrequency, dependents, stateTaxRate, additionalWithholding]);

  useEffect(() => {
    calculateTaxes();
  }, [calculateTaxes]);

  // Reset function
  const reset = () => {
    setGrossPay("");
    setFilingStatus("single");
    setPayFrequency("monthly");
    setDependents(0);
    setStateTaxRate(0);
    setAdditionalWithholding(0);
    setResults(null);
  };

  // Download results as text
  const downloadResults = () => {
    if (!results) return;
    const text = `
Payroll Tax Calculation Results (${payFrequency})
Gross Pay: $${grossPay}
Annual Gross: $${results.annualGross}
Filing Status: ${filingStatus}
Dependents: ${dependents}
State Tax Rate: ${stateTaxRate}%
Additional Withholding: $${additionalWithholding}

Tax Breakdown:
- Federal Income Tax: $${results.federalTax}
- Social Security Tax: $${results.socialSecurityTax}
- Medicare Tax: $${results.medicareTax}
- State Tax: $${results.stateTax}
- Total Tax: $${results.totalTax}
- Net Pay: $${results.netPay}
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payroll-tax-results-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Payroll Tax Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gross Pay ($)
            </label>
            <input
              type="number"
              value={grossPay}
              onChange={(e) => setGrossPay(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
              placeholder="0.00"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Dependents
            </label>
            <input
              type="number"
              value={dependents}
              onChange={(e) => setDependents(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State Tax Rate (%)
            </label>
            <input
              type="number"
              value={stateTaxRate}
              onChange={(e) => setStateTaxRate(Math.max(0, Math.min(15, parseFloat(e.target.value) || 0)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              max="15"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Withholding ($)
            </label>
            <input
              type="number"
              value={additionalWithholding}
              onChange={(e) => setAdditionalWithholding(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Tax Breakdown ({payFrequency})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <p>
                Gross Pay: <span className="font-medium">${grossPay}</span>
              </p>
              <p>
                Annual Gross: <span className="font-medium">${results.annualGross}</span>
              </p>
              <p>
                Federal Income Tax: <span className="font-medium">${results.federalTax}</span>
              </p>
              <p>
                Social Security Tax: <span className="font-medium">${results.socialSecurityTax}</span>
              </p>
              <p>
                Medicare Tax: <span className="font-medium">${results.medicareTax}</span>
              </p>
              <p>
                State Tax: <span className="font-medium">${results.stateTax}</span>
              </p>
              <p className="border-t pt-2 col-span-full">
                Total Tax: <span className="font-bold text-red-600">${results.totalTax}</span>
              </p>
              <p>
                Net Pay: <span className="font-bold text-green-600">${results.netPay}</span>
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadResults}
            disabled={!results}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
        </div>

       

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates federal, Social Security, Medicare, and state taxes</li>
            <li>Supports multiple pay frequencies</li>
            <li>Includes dependent credits and additional withholding</li>
            <li>Downloadable results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PayrollTaxCalculator;