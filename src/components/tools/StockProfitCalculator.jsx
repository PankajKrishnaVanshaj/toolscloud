"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaChartLine, FaDownload } from "react-icons/fa";

const StockProfitCalculator = () => {
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [shares, setShares] = useState("");
  const [buyFee, setBuyFee] = useState("");
  const [sellFee, setSellFee] = useState("");
  const [taxRate, setTaxRate] = useState(""); // New: Tax rate in percentage
  const [results, setResults] = useState(null);
  const [currency, setCurrency] = useState("USD"); // New: Currency selection
  const [history, setHistory] = useState([]); // New: Calculation history

  // Calculate profit/loss
  const calculateProfit = useCallback(() => {
    const buy = Number(buyPrice) || 0;
    const sell = Number(sellPrice) || 0;
    const numShares = Number(shares) || 0;
    const buyCommission = Number(buyFee) || 0;
    const sellCommission = Number(sellFee) || 0;
    const tax = Number(taxRate) || 0;

    const totalBuyCost = buy * numShares + buyCommission;
    const totalSellValue = sell * numShares - sellCommission;
    const profitBeforeTax = totalSellValue - totalBuyCost;
    const taxAmount = profitBeforeTax > 0 ? (profitBeforeTax * tax) / 100 : 0;
    const profit = profitBeforeTax - taxAmount;
    const profitPercentage =
      totalBuyCost > 0 ? (profitBeforeTax / totalBuyCost) * 100 : 0;

    const result = {
      totalBuyCost: totalBuyCost.toFixed(2),
      totalSellValue: totalSellValue.toFixed(2),
      profitBeforeTax: profitBeforeTax.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      profit: profit.toFixed(2),
      profitPercentage: profitPercentage.toFixed(2),
      date: new Date().toLocaleString(),
    };

    setResults(result);
    setHistory((prev) => [...prev, result].slice(-5)); // Keep last 5 calculations
  }, [buyPrice, sellPrice, shares, buyFee, sellFee, taxRate]);

  // Auto-calculate when inputs change
  useEffect(() => {
    if (buyPrice && sellPrice && shares) {
      calculateProfit();
    } else {
      setResults(null);
    }
  }, [buyPrice, sellPrice, shares, buyFee, sellFee, taxRate, calculateProfit]);

  // Reset all fields
  const reset = () => {
    setBuyPrice("");
    setSellPrice("");
    setShares("");
    setBuyFee("");
    setSellFee("");
    setTaxRate("");
    setResults(null);
  };

  // Download results as CSV
  const downloadCSV = () => {
    if (!results) return;
    const csvContent = [
      "Field,Value",
      `Total Buy Cost,${results.totalBuyCost}`,
      `Total Sell Value,${results.totalSellValue}`,
      `Profit Before Tax,${results.profitBeforeTax}`,
      `Tax Amount,${results.taxAmount}`,
      `Net Profit,${results.profit}`,
      `Profit Percentage,${results.profitPercentage}%`,
      `Date,${results.date}`,
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock-profit-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Stock Profit Calculator
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {[
            { label: "Buy Price per Share", value: buyPrice, setter: setBuyPrice },
            { label: "Sell Price per Share", value: sellPrice, setter: setSellPrice },
            { label: "Number of Shares", value: shares, setter: setShares, step: 1 },
            { label: "Buy Commission/Fee", value: buyFee, setter: setBuyFee },
            { label: "Sell Commission/Fee", value: sellFee, setter: setSellFee },
            { label: "Tax Rate (%)", value: taxRate, setter: setTaxRate },
          ].map(({ label, value, setter, step = 0.01 }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {label.includes("Price") || label.includes("Fee") ? `(${currencySymbols[currency]})` : ""}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                min="0"
                step={step}
                placeholder="0"
              />
            </div>
          ))}
        </div>

        {/* Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full sm:w-1/3 p-2 border rounded-md focus:ring-2 focus:ring-green-500"
          >
            {Object.keys(currencySymbols).map((curr) => (
              <option key={curr} value={curr}>
                {curr} ({currencySymbols[curr]})
              </option>
            ))}
          </select>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: "Total Buy Cost", value: results.totalBuyCost },
                { label: "Total Sell Value", value: results.totalSellValue },
                { label: "Profit Before Tax", value: results.profitBeforeTax },
                { label: "Tax Amount", value: results.taxAmount },
                { label: "Net Profit", value: results.profit, color: results.profit >= 0 ? "text-green-600" : "text-red-600" },
                { label: "Profit Percentage", value: `${results.profitPercentage}%`, color: results.profitPercentage >= 0 ? "text-green-600" : "text-red-600" },
              ].map(({ label, value, color }) => (
                <p key={label}>
                  {label}:{" "}
                  <span className={`font-medium ${color || ""}`}>
                    {label.includes("Percentage")
                      ? value
                      : `${results.profit >= 0 && label === "Net Profit" ? "+" : ""}${currencySymbols[currency]}${Number(value).toLocaleString()}`}
                  </span>
                </p>
              ))}
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
            onClick={downloadCSV}
            disabled={!results}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download CSV
          </button>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Calculation History</h2>
            <div className="max-h-40 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <div key={index} className="text-sm text-gray-600 mb-2">
                  <p>{entry.date}</p>
                  <p>
                    Profit: <span className={entry.profit >= 0 ? "text-green-600" : "text-red-600"}>
                      {currencySymbols[currency]}{Number(entry.profit).toLocaleString()}
                    </span> ({entry.profitPercentage}%)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate profit/loss with commissions and taxes</li>
            <li>Support for multiple currencies</li>
            <li>Real-time calculations</li>
            <li>Download results as CSV</li>
            <li>Calculation history (last 5 entries)</li>
          </ul>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-4">
          Note: This calculator provides estimates and does not account for dividends, splits, or other financial factors. Consult a financial advisor for detailed analysis.
        </p>
      </div>
    </div>
  );
};

export default StockProfitCalculator;