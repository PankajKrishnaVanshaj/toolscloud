"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const InterestRateConverter = () => {
  const [rate, setRate] = useState("");
  const [rateType, setRateType] = useState("annual");
  const [compoundsPerYear, setCompoundsPerYear] = useState(12); // Default to monthly
  const [calculationMode, setCalculationMode] = useState("compound"); // Compound or Simple
  const [decimalPlaces, setDecimalPlaces] = useState(4); // Precision control
  const [showDetails, setShowDetails] = useState(false); // Toggle detailed explanation

  // Calculate rates based on input
  const calculateRates = useCallback(() => {
    if (!rate || isNaN(rate) || rate <= 0) return null;

    const decimalRate = parseFloat(rate) / 100;
    let results = {};

    if (calculationMode === "compound") {
      if (rateType === "annual") {
        const effectiveRate = Math.pow(1 + decimalRate / compoundsPerYear, compoundsPerYear) - 1;
        results = {
          annualNominal: decimalRate,
          monthly: decimalRate / 12,
          daily: decimalRate / 365,
          quarterly: decimalRate / 4,
          effectiveAnnual: effectiveRate,
        };
      } else if (rateType === "monthly") {
        const annualNominal = decimalRate * 12;
        const effectiveRate = Math.pow(1 + decimalRate, 12) - 1;
        results = {
          annualNominal,
          monthly: decimalRate,
          daily: annualNominal / 365,
          quarterly: annualNominal / 4,
          effectiveAnnual: effectiveRate,
        };
      } else if (rateType === "daily") {
        const annualNominal = decimalRate * 365;
        const effectiveRate = Math.pow(1 + decimalRate, 365) - 1;
        results = {
          annualNominal,
          monthly: annualNominal / 12,
          daily: decimalRate,
          quarterly: annualNominal / 4,
          effectiveAnnual: effectiveRate,
        };
      }
    } else {
      // Simple interest
      if (rateType === "annual") {
        results = {
          annualNominal: decimalRate,
          monthly: decimalRate / 12,
          daily: decimalRate / 365,
          quarterly: decimalRate / 4,
          effectiveAnnual: decimalRate, // No compounding in simple interest
        };
      } else if (rateType === "monthly") {
        const annualNominal = decimalRate * 12;
        results = {
          annualNominal,
          monthly: decimalRate,
          daily: annualNominal / 365,
          quarterly: annualNominal / 4,
          effectiveAnnual: annualNominal,
        };
      } else if (rateType === "daily") {
        const annualNominal = decimalRate * 365;
        results = {
          annualNominal,
          monthly: annualNominal / 12,
          daily: decimalRate,
          quarterly: annualNominal / 4,
          effectiveAnnual: annualNominal,
        };
      }
    }

    return {
      annualNominal: (results.annualNominal * 100).toFixed(decimalPlaces),
      monthly: (results.monthly * 100).toFixed(decimalPlaces),
      daily: (results.daily * 100).toFixed(decimalPlaces),
      quarterly: (results.quarterly * 100).toFixed(decimalPlaces),
      effectiveAnnual: (results.effectiveAnnual * 100).toFixed(decimalPlaces),
    };
  }, [rate, rateType, compoundsPerYear, calculationMode, decimalPlaces]);

  const results = calculateRates();

  // Reset all inputs
  const reset = () => {
    setRate("");
    setRateType("annual");
    setCompoundsPerYear(12);
    setCalculationMode("compound");
    setDecimalPlaces(4);
    setShowDetails(false);
  };

  // Download results as text
  const downloadResults = () => {
    if (!results) return;
    const text = `
Interest Rate Conversion Results
Input Rate: ${rate}% (${rateType})
Calculation Mode: ${calculationMode}
Compounds Per Year: ${compoundsPerYear}
Decimal Places: ${decimalPlaces}

Results:
- Annual Nominal Rate: ${results.annualNominal}%
- Monthly Rate: ${results.monthly}%
- Quarterly Rate: ${results.quarterly}%
- Daily Rate: ${results.daily}%
- Effective Annual Rate: ${results.effectiveAnnual}%
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `interest-rate-conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Interest Rate Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                disabled={calculationMode === "simple"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculation Mode
              </label>
              <select
                value={calculationMode}
                onChange={(e) => setCalculationMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="compound">Compound Interest</option>
                <option value="simple">Simple Interest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places
              </label>
              <input
                type="number"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Math.max(1, Math.min(10, Number(e.target.value))))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="1"
                max="10"
                step="1"
              />
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
              onClick={downloadResults}
              disabled={!results}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-center">Converted Rates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="font-medium">Annual Nominal Rate:</span> {results.annualNominal}%
                </p>
                <p>
                  <span className="font-medium">Monthly Rate:</span> {results.monthly}%
                </p>
                <p>
                  <span className="font-medium">Quarterly Rate:</span> {results.quarterly}%
                </p>
                <p>
                  <span className="font-medium">Daily Rate:</span> {results.daily}%
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium">Effective Annual Rate:</span>{" "}
                  {results.effectiveAnnual}%
                </p>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                {showDetails ? "Hide" : "Show"} Calculation Details
              </button>
              {showDetails && (
                <div className="mt-2 text-xs text-gray-600">
                  <p>
                    <strong>Formulas Used:</strong>
                  </p>
                  {calculationMode === "compound" ? (
                    <>
                      <p>Effective Annual Rate = (1 + r/n)^n - 1</p>
                      <p>Where r = nominal rate, n = compounds per year</p>
                    </>
                  ) : (
                    <p>Simple Interest: Rates are linearly scaled without compounding</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!results && rate && (
            <p className="text-sm text-red-600 text-center">
              Please enter a valid positive number
            </p>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between annual, monthly, quarterly, and daily rates</li>
              <li>Support for both compound and simple interest</li>
              <li>Customizable compounding frequency</li>
              <li>Adjustable decimal precision</li>
              <li>Download results as text file</li>
              <li>Detailed calculation explanation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestRateConverter;