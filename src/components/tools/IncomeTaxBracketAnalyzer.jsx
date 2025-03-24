"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaDownload, FaSync } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

// 2025 Projected U.S. Federal Tax Brackets (Single filer, simplified estimates)
const taxBracketsSingle = [
  { rate: 0.10, min: 0, max: 11600 },
  { rate: 0.12, min: 11601, max: 47150 },
  { rate: 0.22, min: 47151, max: 100525 },
  { rate: 0.24, min: 100526, max: 191950 },
  { rate: 0.32, min: 191951, max: 243725 },
  { rate: 0.35, min: 243726, max: 609350 },
  { rate: 0.37, min: 609351, max: Infinity },
];

// 2025 Projected U.S. Federal Tax Brackets (Married filing jointly, simplified estimates)
const taxBracketsMarried = [
  { rate: 0.10, min: 0, max: 23200 },
  { rate: 0.12, min: 23201, max: 94300 },
  { rate: 0.22, min: 94301, max: 201050 },
  { rate: 0.24, min: 201051, max: 383900 },
  { rate: 0.32, min: 383901, max: 487450 },
  { rate: 0.35, min: 487451, max: 731200 },
  { rate: 0.37, min: 731201, max: Infinity },
];

const IncomeTaxBracketAnalyzer = () => {
  const [income, setIncome] = useState(50000);
  const [filingStatus, setFilingStatus] = useState("single");
  const [standardDeduction, setStandardDeduction] = useState(true);
  const [taxDetails, setTaxDetails] = useState(null);
  const resultRef = React.useRef(null);

  const calculateTax = useCallback((incomeAmount, brackets, applyDeduction) => {
    if (incomeAmount < 0) return { totalTax: 0, effectiveRate: 0, breakdown: [], taxableIncome: 0 };

    const deduction = applyDeduction
      ? filingStatus === "single"
        ? 14600 // Projected 2025 standard deduction for single
        : 29200 // Projected 2025 standard deduction for married filing jointly
      : 0;

    const taxableIncome = Math.max(0, incomeAmount - deduction);
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    const breakdown = [];

    for (const bracket of brackets) {
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
        range: `${bracket.min.toLocaleString()} - ${
          bracket.max === Infinity ? "∞" : bracket.max.toLocaleString()
        }`,
      });
    }

    const effectiveRate = incomeAmount > 0 ? totalTax / incomeAmount : 0;
    return {
      totalTax,
      effectiveRate,
      breakdown: breakdown.filter((b) => b.amount > 0),
      taxableIncome,
      deduction,
    };
  }, [filingStatus]);

  useEffect(() => {
    const brackets = filingStatus === "single" ? taxBracketsSingle : taxBracketsMarried;
    const result = calculateTax(income, brackets, standardDeduction);
    setTaxDetails(result);
  }, [income, filingStatus, standardDeduction, calculateTax]);

  const reset = () => {
    setIncome(50000);
    setFilingStatus("single");
    setStandardDeduction(true);
  };

  const downloadResult = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `tax-analysis-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Income Tax Bracket Analyzer
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Annual Income ($)
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
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={standardDeduction}
                onChange={(e) => setStandardDeduction(e.target.checked)}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Apply Standard Deduction</span>
            </label>
          </div>
        </div>

        {taxDetails && (
          <div ref={resultRef} className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Tax Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p>
                  <span className="font-medium">Total Income:</span> $
                  {income.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Standard Deduction:</span> $
                  {taxDetails.deduction.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Taxable Income:</span> $
                  {taxDetails.taxableIncome.toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Total Tax:</span> $
                  {taxDetails.totalTax.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p>
                  <span className="font-medium">Effective Tax Rate:</span>{" "}
                  {(taxDetails.effectiveRate * 100).toFixed(2)}%
                </p>
                <p>
                  <span className="font-medium">After-Tax Income:</span> $
                  {(income - taxDetails.totalTax).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
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
                    {taxDetails.breakdown.length > 0 ? (
                      taxDetails.breakdown.map((bracket, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">{bracket.range}</td>
                          <td className="px-4 py-2">{(bracket.rate * 100).toFixed(0)}%</td>
                          <td className="px-4 py-2">{bracket.amount.toLocaleString()}</td>
                          <td className="px-4 py-2">
                            {bracket.tax.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-2 text-center text-gray-500">
                          No tax brackets applied (income below taxable threshold)
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadResult}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Result
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Support for Single and Married Filing Jointly statuses</li>
            <li>Optional standard deduction (2025 estimates)</li>
            <li>Detailed tax bracket breakdown</li>
            <li>Downloadable tax summary as PNG</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-4">
          Note: Based on projected 2025 U.S. federal tax brackets (simplified estimates). Does not
          include credits, additional taxes, or state taxes. Consult a tax professional for accurate
          calculations.
        </p>
      </div>
    </div>
  );
};

export default IncomeTaxBracketAnalyzer;