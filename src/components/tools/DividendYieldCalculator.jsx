"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCalculator, FaChartLine } from "react-icons/fa";

const DividendYieldCalculator = () => {
  const [annualDividend, setAnnualDividend] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [shares, setShares] = useState("");
  const [dividendFrequency, setDividendFrequency] = useState("annual"); // New: Dividend frequency
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]); // New: Calculation history
  const [currency, setCurrency] = useState("USD"); // New: Currency selection

  // Calculate yield and related metrics
  const calculateYield = useCallback(() => {
    const dividend = parseFloat(annualDividend) || 0;
    const price = parseFloat(stockPrice) || 0;
    const numShares = parseFloat(shares) || 0;

    if (price <= 0) {
      setResults(null);
      return;
    }

    // Adjust dividend based on frequency
    let adjustedDividend = dividend;
    if (dividendFrequency === "quarterly") adjustedDividend *= 4;
    if (dividendFrequency === "monthly") adjustedDividend *= 12;

    const yieldPercentage = (adjustedDividend / price) * 100;
    const totalInvestment = price * numShares;
    const annualIncome = adjustedDividend * numShares;
    const monthlyIncome = numShares > 0 ? annualIncome / 12 : 0;

    const newResults = {
      yield: yieldPercentage.toFixed(2),
      totalInvestment: totalInvestment.toFixed(2),
      annualIncome: annualIncome.toFixed(2),
      monthlyIncome: monthlyIncome.toFixed(2),
    };

    setResults(newResults);

    // Add to history if all fields are filled
    if (dividend && price && numShares) {
      setHistory((prev) => [
        { ...newResults, timestamp: new Date().toLocaleString(), dividend, price, shares },
        ...prev.slice(0, 4), // Keep last 5 entries
      ]);
    }
  }, [annualDividend, stockPrice, shares, dividendFrequency]);

  // Recalculate on input change
  useEffect(() => {
    calculateYield();
  }, [annualDividend, stockPrice, shares, dividendFrequency, calculateYield]);

  // Reset all inputs
  const reset = () => {
    setAnnualDividend("");
    setStockPrice("");
    setShares("");
    setDividendFrequency("annual");
    setResults(null);
  };

  // Currency symbol mapping
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
          <FaCalculator /> Dividend Yield Calculator
        </h1>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dividend per Share ({currencySymbols[currency]})
            </label>
            <input
              type="number"
              value={annualDividend}
              onChange={(e) => setAnnualDividend(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2.50"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Price ({currencySymbols[currency]})
            </label>
            <input
              type="number"
              value={stockPrice}
              onChange={(e) => setStockPrice(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 50.00"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Shares
            </label>
            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 100"
              step="1"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dividend Frequency
            </label>
            <select
              value={dividendFrequency}
              onChange={(e) => setDividendFrequency(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full sm:w-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FaChartLine /> Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>
                Dividend Yield:{" "}
                <span className="font-bold text-green-600">{results.yield}%</span>
              </p>
              {shares && (
                <>
                  <p>
                    Total Investment:{" "}
                    <span className="font-medium">
                      {currencySymbols[currency]}
                      {Number(results.totalInvestment).toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Annual Dividend Income:{" "}
                    <span className="font-medium">
                      {currencySymbols[currency]}
                      {Number(results.annualIncome).toLocaleString()}
                    </span>
                  </p>
                  <p>
                    Monthly Dividend Income:{" "}
                    <span className="font-medium">
                      {currencySymbols[currency]}
                      {Number(results.monthlyIncome).toLocaleString()}
                    </span>
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {!results && (
          <p className="text-center text-gray-500 mb-6">
            Enter values above to see results
          </p>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Calculation History</h3>
            <ul className="space-y-2 text-sm text-gray-600 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index}>
                  {entry.timestamp}: Yield {entry.yield}% | {entry.shares} shares @{" "}
                  {currencySymbols[currency]}
                  {entry.price} | Dividend {currencySymbols[currency]}
                  {entry.dividend}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reset Button */}
        <button
          onClick={reset}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
        >
          <FaSync className="mr-2" /> Reset
        </button>

        {/* Notes */}
        <p className="text-xs text-gray-500 mt-4">
          Note: Dividend yield is calculated as (Adjusted Dividend per Share / Stock Price) ×
          100. Adjusts for dividend frequency. Results are for informational purposes only.
        </p>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Real-time calculation</li>
            <li>Support for different dividend frequencies (Annual, Quarterly, Monthly)</li>
            <li>Currency selection (USD, EUR, GBP, JPY)</li>
            <li>Total investment and income calculations</li>
            <li>Calculation history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DividendYieldCalculator;