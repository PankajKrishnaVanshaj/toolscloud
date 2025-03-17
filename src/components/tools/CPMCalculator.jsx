"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const CPMCalculator = () => {
  const [mode, setMode] = useState("cpm"); // cpm, cost, impressions
  const [cost, setCost] = useState("");
  const [impressions, setImpressions] = useState("");
  const [cpm, setCpm] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [currency, setCurrency] = useState("USD"); // New: Currency selection
  const [history, setHistory] = useState([]); // New: Calculation history

  // Calculate CPM based on mode
  const calculateCPM = useCallback(() => {
    setError("");
    setResult(null);

    const costNum = parseFloat(cost);
    const impressionsNum = parseFloat(impressions);
    const cpmNum = parseFloat(cpm);

    if (mode === "cpm") {
      if (isNaN(costNum) || isNaN(impressionsNum)) {
        return { error: "Please enter valid cost and impressions" };
      }
      if (costNum < 0 || impressionsNum <= 0) {
        return { error: "Cost must be non-negative, impressions must be positive" };
      }
      const cpmCalc = (costNum / impressionsNum) * 1000;
      return {
        cost: costNum.toFixed(2),
        impressions: impressionsNum.toLocaleString(),
        cpm: cpmCalc.toFixed(2),
        type: "cpm",
        currency,
      };
    } else if (mode === "cost") {
      if (isNaN(cpmNum) || isNaN(impressionsNum)) {
        return { error: "Please enter valid CPM and impressions" };
      }
      if (cpmNum < 0 || impressionsNum <= 0) {
        return { error: "CPM must be non-negative, impressions must be positive" };
      }
      const costCalc = (cpmNum * impressionsNum) / 1000;
      return {
        cost: costCalc.toFixed(2),
        impressions: impressionsNum.toLocaleString(),
        cpm: cpmNum.toFixed(2),
        type: "cost",
        currency,
      };
    } else if (mode === "impressions") {
      if (isNaN(costNum) || isNaN(cpmNum)) {
        return { error: "Please enter valid cost and CPM" };
      }
      if (costNum < 0 || cpmNum <= 0) {
        return { error: "Cost must be non-negative, CPM must be positive" };
      }
      const impressionsCalc = (costNum / cpmNum) * 1000;
      return {
        cost: costNum.toFixed(2),
        impressions: impressionsCalc.toLocaleString(),
        cpm: cpmNum.toFixed(2),
        type: "impressions",
        currency,
      };
    }
    return null;
  }, [cost, impressions, cpm, mode, currency]);

  const calculate = () => {
    if (
      (mode === "cpm" && (!cost || !impressions)) ||
      (mode === "cost" && (!cpm || !impressions)) ||
      (mode === "impressions" && (!cost || !cpm))
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculateCPM();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
    setHistory((prev) => [calcResult, ...prev].slice(0, 5)); // Keep last 5 calculations
  };

  const reset = () => {
    setMode("cpm");
    setCost("");
    setImpressions("");
    setCpm("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setCurrency("USD");
  };

  // Currency symbols
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          CPM Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["cpm", "cost", "impressions"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-sm sm:text-base ${
                mode === m
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              } transition-colors`}
            >
              Calculate {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {(mode === "cpm" || mode === "impressions") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 font-medium">Cost:</label>
                <div className="flex-1 flex items-center">
                  <span className="p-2 bg-gray-100 rounded-l-lg border border-r-0">
                    {currencySymbols[currency]}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="flex-1 p-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 500"
                    min="0"
                  />
                </div>
              </div>
            )}
            {(mode === "cpm" || mode === "cost") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 font-medium">Impressions:</label>
                <input
                  type="number"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., 100000"
                  min="1"
                />
              </div>
            )}
            {(mode === "cost" || mode === "impressions") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 font-medium">CPM:</label>
                <div className="flex-1 flex items-center">
                  <span className="p-2 bg-gray-100 rounded-l-lg border border-r-0">
                    {currencySymbols[currency]}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={cpm}
                    onChange={(e) => setCpm(e.target.value)}
                    className="flex-1 p-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 5"
                    min="0"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 font-medium">Currency:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {Object.keys(currencySymbols).map((curr) => (
                  <option key={curr} value={curr}>
                    {curr} ({currencySymbols[curr]})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
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
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              CPM Results
            </h2>
            <div className="mt-2 space-y-2 text-center">
              <p>Cost: {currencySymbols[currency]}{result.cost}</p>
              <p>Impressions: {result.impressions}</p>
              <p>CPM: {currencySymbols[currency]}{result.cpm}</p>

              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-green-600 hover:underline flex items-center justify-center mx-auto"
              >
                <FaInfoCircle className="mr-1" />
                {showDetails ? "Hide Details" : "Show Details"}
              </button>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === "cpm" && (
                      <>
                        <li>Cost: {currencySymbols[currency]}{result.cost}</li>
                        <li>Impressions: {result.impressions}</li>
                        <li>
                          CPM = (Cost / Impressions) × 1000 = (
                          {result.cost} / {parseFloat(result.impressions.replace(/,/g, ""))}) × 1000
                          = {currencySymbols[currency]}{result.cpm}
                        </li>
                      </>
                    )}
                    {result.type === "cost" && (
                      <>
                        <li>CPM: {currencySymbols[currency]}{result.cpm}</li>
                        <li>Impressions: {result.impressions}</li>
                        <li>
                          Cost = (CPM × Impressions) / 1000 = (
                          {result.cpm} × {parseFloat(result.impressions.replace(/,/g, ""))}) / 1000
                          = {currencySymbols[currency]}{result.cost}
                        </li>
                      </>
                    )}
                    {result.type === "impressions" && (
                      <>
                        <li>Cost: {currencySymbols[currency]}{result.cost}</li>
                        <li>CPM: {currencySymbols[currency]}{result.cpm}</li>
                        <li>
                          Impressions = (Cost / CPM) × 1000 = (
                          {result.cost} / {result.cpm}) × 1000 = {result.impressions}
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.map((item, index) => (
                <li key={index} className="p-2 bg-white rounded-md shadow-sm">
                  {item.type === "cpm" && (
                    <>Calculated CPM: {currencySymbols[item.currency]}{item.cpm} (Cost: {currencySymbols[item.currency]}{item.cost}, Impressions: {item.impressions})</>
                  )}
                  {item.type === "cost" && (
                    <>Calculated Cost: {currencySymbols[item.currency]}{item.cost} (CPM: {currencySymbols[item.currency]}{item.cpm}, Impressions: {item.impressions})</>
                  )}
                  {item.type === "impressions" && (
                    <>Calculated Impressions: {item.impressions} (Cost: {currencySymbols[item.currency]}{item.cost}, CPM: {currencySymbols[item.currency]}{item.cpm})</>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate CPM, Cost, or Impressions</li>
            <li>Multiple currency support (USD, EUR, GBP, JPY)</li>
            <li>Detailed calculation breakdown</li>
            <li>Calculation history (last 5 results)</li>
            <li>Input validation and error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CPMCalculator;