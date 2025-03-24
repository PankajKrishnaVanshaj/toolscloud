"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaDownload, FaChartBar } from "react-icons/fa";

const MarginCalculator = () => {
  const [mode, setMode] = useState("costRevenue");
  const [cost, setCost] = useState("");
  const [revenue, setRevenue] = useState("");
  const [margin, setMargin] = useState("");
  const [currency, setCurrency] = useState("$");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState([]);

  // Calculate margin
  const calculateMargin = useCallback(() => {
    setError("");
    const costNum = parseFloat(cost);
    const revenueNum = parseFloat(revenue);
    const marginNum = parseFloat(margin);

    if (mode === "costRevenue") {
      if (isNaN(costNum) || isNaN(revenueNum))
        return { error: "Please enter valid cost and revenue" };
      if (costNum < 0 || revenueNum < 0)
        return { error: "Cost and revenue must be non-negative" };
      if (revenueNum === 0) return { error: "Revenue cannot be zero" };
      const profit = revenueNum - costNum;
      const marginPercent = (profit / revenueNum) * 100;
      return {
        cost: costNum.toFixed(2),
        revenue: revenueNum.toFixed(2),
        profit: profit.toFixed(2),
        margin: marginPercent.toFixed(2),
        type: "costRevenue",
      };
    } else if (mode === "costMargin") {
      if (isNaN(costNum) || isNaN(marginNum))
        return { error: "Please enter valid cost and margin" };
      if (costNum < 0 || marginNum < -100)
        return { error: "Cost must be non-negative, margin must be at least -100%" };
      if (marginNum === 100)
        return { error: "Margin cannot be 100% (revenue would be infinite)" };
      const revenue = costNum / (1 - marginNum / 100);
      const profit = revenue - costNum;
      return {
        cost: costNum.toFixed(2),
        revenue: revenue.toFixed(2),
        profit: profit.toFixed(2),
        margin: marginNum.toFixed(2),
        type: "costMargin",
      };
    } else if (mode === "revenueMargin") {
      if (isNaN(revenueNum) || isNaN(marginNum))
        return { error: "Please enter valid revenue and margin" };
      if (revenueNum <= 0) return { error: "Revenue must be positive" };
      if (marginNum < -100) return { error: "Margin must be at least -100%" };
      const cost = revenueNum * (1 - marginNum / 100);
      const profit = revenueNum - cost;
      return {
        cost: cost.toFixed(2),
        revenue: revenueNum.toFixed(2),
        profit: profit.toFixed(2),
        margin: marginNum.toFixed(2),
        type: "revenueMargin",
      };
    }
    return null;
  }, [mode, cost, revenue, margin]);

  // Handle calculation
  const calculate = () => {
    if (
      (mode === "costRevenue" && (!cost || !revenue)) ||
      (mode === "costMargin" && (!cost || !margin)) ||
      (mode === "revenueMargin" && (!revenue || !margin))
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculateMargin();
    if (calcResult?.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
    setHistory((prev) => [...prev, { ...calcResult, timestamp: new Date() }].slice(-10)); // Keep last 10
  };

  // Reset form
  const reset = () => {
    setMode("costRevenue");
    setCost("");
    setRevenue("");
    setMargin("");
    setCurrency("$");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  // Download results as CSV
  const downloadCSV = () => {
    if (!history.length) return;
    const csvContent = [
      "Mode,Cost,Revenue,Profit,Margin,Timestamp",
      ...history.map((item) =>
        `${item.type},${item.cost},${item.revenue},${item.profit},${item.margin},${item.timestamp.toISOString()}`
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `margin_calculations_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Margin Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["costRevenue", "costMargin", "revenueMargin"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-sm sm:text-base ${
                mode === m
                  ? "bg-lime-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              } transition-colors`}
            >
              {m === "costRevenue"
                ? "Cost & Revenue"
                : m === "costMargin"
                ? "Cost & Margin"
                : "Revenue & Margin"}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(mode === "costRevenue" || mode === "costMargin") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-lime-500"
                  placeholder="e.g., 80"
                />
              </div>
            )}
            {(mode === "costRevenue" || mode === "revenueMargin") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Revenue ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-lime-500"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            {(mode === "costMargin" || mode === "revenueMargin") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Margin (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-lime-500"
                  placeholder="e.g., 20"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-lime-500"
              >
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
                <option value="¥">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-lime-600 text-white rounded-md hover:bg-lime-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadCSV}
              disabled={!history.length}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download History
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-lime-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Margin Results</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>Cost: {currency}{result.cost}</p>
              <p>Revenue: {currency}{result.revenue}</p>
              <p>Profit: {currency}{result.profit}</p>
              <p>Margin: {result.margin}%</p>
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-lime-600 hover:underline"
              >
                {showDetails ? "Hide Details" : "Show Calculation Details"}
              </button>
            </div>
            {showDetails && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-semibold">Calculation Details:</p>
                <ul className="list-disc list-inside mt-1">
                  {result.type === "costRevenue" && (
                    <>
                      <li>
                        Profit = Revenue - Cost = {currency}{result.revenue} - {currency}{result.cost} ={" "}
                        {currency}{result.profit}
                      </li>
                      <li>
                        Margin = (Profit / Revenue) × 100 = ({result.profit} / {result.revenue}) × 100 ={" "}
                        {result.margin}%
                      </li>
                    </>
                  )}
                  {result.type === "costMargin" && (
                    <>
                      <li>
                        Revenue = Cost / (1 - Margin/100) = {currency}{result.cost} / (1 -{" "}
                        {result.margin}/100) = {currency}{result.revenue}
                      </li>
                      <li>
                        Profit = Revenue - Cost = {currency}{result.revenue} - {currency}{result.cost} ={" "}
                        {currency}{result.profit}
                      </li>
                      <li>Margin = {result.margin}% (given)</li>
                    </>
                  )}
                  {result.type === "revenueMargin" && (
                    <>
                      <li>
                        Cost = Revenue × (1 - Margin/100) = {currency}{result.revenue} × (1 -{" "}
                        {result.margin}/100) = {currency}{result.cost}
                      </li>
                      <li>
                        Profit = Revenue - Cost = {currency}{result.revenue} - {currency}{result.cost} ={" "}
                        {currency}{result.profit}
                      </li>
                      <li>Margin = {result.margin}% (given)</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
              <FaChartBar className="mr-2" /> Calculation History
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((item, index) => (
                <li key={index}>
                  {item.type.replace(/([A-Z])/g, " $1").trim()} - {currency}{item.cost} Cost,{" "}
                  {currency}{item.revenue} Revenue, {item.margin}% Margin (
                  {item.timestamp.toLocaleString()})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Three calculation modes: Cost & Revenue, Cost & Margin, Revenue & Margin</li>
            <li>Customizable currency (USD, EUR, GBP, JPY)</li>
            <li>Detailed calculation breakdown</li>
            <li>Calculation history (last 10)</li>
            <li>Download history as CSV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarginCalculator;