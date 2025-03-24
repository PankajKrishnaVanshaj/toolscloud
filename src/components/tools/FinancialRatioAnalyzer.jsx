"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const FinancialRatioAnalyzer = () => {
  const [financialData, setFinancialData] = useState({
    revenue: "",
    costOfGoodsSold: "",
    operatingExpenses: "", // New
    netIncome: "",
    totalAssets: "",
    totalLiabilities: "", // New
    currentAssets: "",
    currentLiabilities: "",
    inventory: "",
    accountsReceivable: "",
    accountsPayable: "", // New
    shareholdersEquity: "", // New
  });
  const [ratios, setRatios] = useState(null);
  const [currency, setCurrency] = useState("$");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFinancialData((prev) => ({
      ...prev,
      [name]: value ? Number(value) : "",
    }));
  };

  const calculateRatios = useCallback(() => {
    const {
      revenue,
      costOfGoodsSold,
      operatingExpenses,
      netIncome,
      totalAssets,
      totalLiabilities,
      currentAssets,
      currentLiabilities,
      inventory,
      accountsReceivable,
      accountsPayable,
      shareholdersEquity,
    } = financialData;

    if (!revenue || !netIncome || !totalAssets) {
      alert("Please fill in Revenue, Net Income, and Total Assets for basic ratios.");
      return;
    }

    const ratios = {
      grossProfitMargin: revenue && costOfGoodsSold
        ? ((revenue - costOfGoodsSold) / revenue * 100).toFixed(2)
        : null,
      operatingProfitMargin: revenue && operatingExpenses && costOfGoodsSold
        ? ((revenue - costOfGoodsSold - operatingExpenses) / revenue * 100).toFixed(2)
        : null,
      netProfitMargin: (netIncome / revenue * 100).toFixed(2),
      returnOnAssets: (netIncome / totalAssets * 100).toFixed(2),
      returnOnEquity: shareholdersEquity
        ? (netIncome / shareholdersEquity * 100).toFixed(2)
        : null,
      currentRatio: currentAssets && currentLiabilities
        ? (currentAssets / currentLiabilities).toFixed(2)
        : null,
      quickRatio: currentAssets && currentLiabilities && inventory
        ? ((currentAssets - inventory) / currentLiabilities).toFixed(2)
        : null,
      debtToEquity: totalLiabilities && shareholdersEquity
        ? (totalLiabilities / shareholdersEquity).toFixed(2)
        : null,
      inventoryTurnover: revenue && inventory
        ? (revenue / inventory).toFixed(2)
        : null,
      receivablesTurnover: revenue && accountsReceivable
        ? (revenue / accountsReceivable).toFixed(2)
        : null,
      payablesTurnover: costOfGoodsSold && accountsPayable
        ? (costOfGoodsSold / accountsPayable).toFixed(2)
        : null,
    };

    setRatios(ratios);
  }, [financialData]);

  const resetForm = () => {
    setFinancialData({
      revenue: "",
      costOfGoodsSold: "",
      operatingExpenses: "",
      netIncome: "",
      totalAssets: "",
      totalLiabilities: "",
      currentAssets: "",
      currentLiabilities: "",
      inventory: "",
      accountsReceivable: "",
      accountsPayable: "",
      shareholdersEquity: "",
    });
    setRatios(null);
  };

  const downloadResults = () => {
    if (!ratios) return;
    const content = [
      "Financial Ratio Analysis",
      ...Object.entries(financialData)
        .filter(([, value]) => value !== "")
        .map(([key, value]) => `${key.replace(/([A-Z])/g, " $1")}: ${currency}${value}`),
      "",
      "Calculated Ratios:",
      ...Object.entries(ratios)
        .filter(([, value]) => value !== null)
        .map(([key, value]) =>
          `${key.replace(/([A-Z])/g, " $1")}: ${value}${key.includes("Margin") || key.includes("Return") ? "%" : "x"}`
        ),
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `financial-ratios-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Financial Ratio Analyzer
        </h1>

        {/* Currency Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full sm:w-24 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="$">USD ($)</option>
            <option value="€">EUR (€)</option>
            <option value="£">GBP (£)</option>
            <option value="¥">JPY (¥)</option>
          </select>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(financialData).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key.replace(/([A-Z])/g, " $1")} ({currency})
              </label>
              <input
                type="number"
                name={key}
                value={value}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                placeholder="Enter amount"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <button
            onClick={calculateRatios}
            className="flex-1 py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate Ratios
          </button>
          <button
            onClick={downloadResults}
            disabled={!ratios}
            className="flex-1 py-2 px-6 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
          <button
            onClick={resetForm}
            className="flex-1 py-2 px-6 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Ratios Display */}
        {ratios && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-3 text-center">Financial Ratios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(ratios)
                .filter(([, value]) => value !== null)
                .map(([key, value]) => (
                  <p key={key}>
                    {key.replace(/([A-Z])/g, " $1")}:{" "}
                    <span className="font-bold">
                      {value}
                      {key.includes("Margin") || key.includes("Return") ? "%" : "x"}
                    </span>
                  </p>
                ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculates 11 key financial ratios</li>
            <li>Customizable currency selection</li>
            <li>Download results as a text file</li>
            <li>Real-time input validation</li>
          </ul>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Enter values in your selected currency. Some ratios require additional inputs.
        </p>
      </div>
    </div>
  );
};

export default FinancialRatioAnalyzer;