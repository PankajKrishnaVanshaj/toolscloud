"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCalculator, FaSync, FaChartLine } from "react-icons/fa";

const InflationCalculator = () => {
  const [amount, setAmount] = useState(1000);
  const [startYear, setStartYear] = useState(2020);
  const [endYear, setEndYear] = useState(2025);
  const [inflationRate, setInflationRate] = useState(3);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("future"); // 'future' or 'past'
  const [currency, setCurrency] = useState("USD");
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateInflation = useCallback(() => {
    setIsCalculating(true);
    const years = mode === "future" ? endYear - startYear : startYear - endYear;
    if (years < 0) {
      setResult({
        error: `End year must be ${
          mode === "future" ? "after" : "before"
        } start year.`,
      });
      setIsCalculating(false);
      return;
    }

    const rate = inflationRate / 100;
    let adjustedAmount;
    const yearlyBreakdown = [];

    if (mode === "future") {
      adjustedAmount = amount;
      for (let i = 0; i < years; i++) {
        adjustedAmount *= 1 + rate;
        yearlyBreakdown.push({
          year: startYear + i + 1,
          value: adjustedAmount.toFixed(2),
        });
      }
    } else {
      adjustedAmount = amount;
      for (let i = 0; i < years; i++) {
        adjustedAmount /= 1 + rate;
        yearlyBreakdown.push({
          year: startYear - i - 1,
          value: adjustedAmount.toFixed(2),
        });
      }
      yearlyBreakdown.reverse();
    }

    setResult({
      adjustedAmount: adjustedAmount.toFixed(2),
      years,
      breakdown: yearlyBreakdown,
      error: null,
    });
    setIsCalculating(false);
  }, [amount, startYear, endYear, inflationRate, mode]);

  useEffect(() => {
    calculateInflation();
  }, [calculateInflation]);

  const reset = () => {
    setAmount(1000);
    setStartYear(2020);
    setEndYear(2025);
    setInflationRate(3);
    setMode("future");
    setCurrency("USD");
    setShowBreakdown(false);
    setResult(null);
  };

  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Inflation Calculator
        </h1>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div className="flex justify-center gap-4">
            {["future", "past"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-4 rounded-md ${
                  mode === m
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-blue-700 hover:text-white transition-colors`}
                disabled={isCalculating}
              >
                {m === "future" ? "Future Value" : "Past Value"}
              </button>
            ))}
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({currencySymbols[currency]})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1"
                disabled={isCalculating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === "future" ? "Start Year" : "End Year"}
              </label>
              <input
                type="number"
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="1900"
                max="2100"
                disabled={isCalculating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === "future" ? "End Year" : "Start Year"}
              </label>
              <input
                type="number"
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="1900"
                max="2100"
                disabled={isCalculating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Inflation Rate (%)
              </label>
              <input
                type="number"
                value={inflationRate}
                onChange={(e) => setInflationRate(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.1"
                disabled={isCalculating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isCalculating}
              >
                {Object.keys(currencySymbols).map((curr) => (
                  <option key={curr} value={curr}>
                    {curr} ({currencySymbols[curr]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={calculateInflation}
              disabled={isCalculating}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" />
              {isCalculating ? "Calculating..." : "Calculate"}
            </button>
            <button
              onClick={reset}
              disabled={isCalculating}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gray-50 p-4 rounded-md relative">
              {isCalculating && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-md">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <h2 className="text-lg font-semibold mb-2 text-center">
                {mode === "future" ? "Future Value" : "Past Value"}
              </h2>
              {result.error ? (
                <p className="text-red-600 text-center">{result.error}</p>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p>
                      Adjusted Amount:{" "}
                      <span className="font-bold text-green-600">
                        {currencySymbols[currency]}
                        {Number(result.adjustedAmount).toLocaleString()}
                      </span>
                    </p>
                    <p>
                      Years: <span className="font-medium">{result.years}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
                  >
                    <FaChartLine className="mr-2" />
                    {showBreakdown ? "Hide" : "Show"} Yearly Breakdown
                  </button>
                  {showBreakdown && (
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left">Year</th>
                            <th className="p-2 text-right">Value ({currencySymbols[currency]})</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.breakdown.map((item) => (
                            <tr key={item.year} className="border-t">
                              <td className="p-2">{item.year}</td>
                              <td className="p-2 text-right">
                                {Number(item.value).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Calculate future or past value</li>
              <li>Support for multiple currencies</li>
              <li>Yearly breakdown of inflation impact</li>
              <li>Custom inflation rate</li>
              <li>Real-time calculations</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Note: This calculator assumes a constant inflation rate. For precise historical
            calculations, use actual inflation data from reliable sources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InflationCalculator;