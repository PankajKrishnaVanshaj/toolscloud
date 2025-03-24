"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaChartLine } from "react-icons/fa";

const PercentageChangeCalculator = () => {
  const [mode, setMode] = useState("change"); // change, final, initial
  const [initialValue, setInitialValue] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [percentChange, setPercentChange] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState([]);
  const [precision, setPrecision] = useState(2); // Decimal places

  // Calculate percentage change based on mode
  const calculatePercentageChange = useCallback(() => {
    setError("");
    setResult(null);

    const initialNum = parseFloat(initialValue);
    const finalNum = parseFloat(finalValue);
    const percentNum = parseFloat(percentChange);

    if (mode === "change") {
      if (isNaN(initialNum) || isNaN(finalNum)) {
        return { error: "Please enter valid initial and final values" };
      }
      if (initialNum === 0) {
        return { error: "Initial value cannot be zero (undefined percentage change)" };
      }
      const change = finalNum - initialNum;
      const percentChangeCalc = (change / Math.abs(initialNum)) * 100;
      const isIncrease = finalNum > initialNum;

      return {
        initialValue: initialNum.toFixed(precision),
        finalValue: finalNum.toFixed(precision),
        change: change.toFixed(precision),
        percentChange: percentChangeCalc.toFixed(precision),
        isIncrease,
        type: "change",
      };
    } else if (mode === "final") {
      if (isNaN(initialNum) || isNaN(percentNum)) {
        return { error: "Please enter valid initial value and percentage change" };
      }
      if (initialNum === 0) {
        return { error: "Initial value cannot be zero (undefined percentage change)" };
      }
      const change = (percentNum / 100) * Math.abs(initialNum);
      const finalValueCalc = initialNum + (percentNum >= 0 ? change : -change);
      const isIncrease = percentNum >= 0;

      return {
        initialValue: initialNum.toFixed(precision),
        finalValue: finalValueCalc.toFixed(precision),
        change: change.toFixed(precision),
        percentChange: percentNum.toFixed(precision),
        isIncrease,
        type: "final",
      };
    } else if (mode === "initial") {
      if (isNaN(finalNum) || isNaN(percentNum)) {
        return { error: "Please enter valid final value and percentage change" };
      }
      if (percentNum === -100) {
        return { error: "Percentage change cannot be -100% (initial value would be undefined)" };
      }
      const initialValueCalc = finalNum / (1 + percentNum / 100);
      const change = finalNum - initialValueCalc;
      const isIncrease = finalNum > initialValueCalc;

      return {
        initialValue: initialValueCalc.toFixed(precision),
        finalValue: finalNum.toFixed(precision),
        change: change.toFixed(precision),
        percentChange: percentNum.toFixed(precision),
        isIncrease,
        type: "initial",
      };
    }
    return null;
  }, [mode, initialValue, finalValue, percentChange, precision]);

  const calculate = () => {
    if (
      (mode === "change" && (!initialValue || !finalValue)) ||
      (mode === "final" && (!initialValue || !percentChange)) ||
      (mode === "initial" && (!finalValue || !percentChange))
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculatePercentageChange();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
    setHistory((prev) => [...prev, calcResult].slice(-5)); // Keep last 5 calculations
  };

  const reset = () => {
    setMode("change");
    setInitialValue("");
    setFinalValue("");
    setPercentChange("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setPrecision(2);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Percentage Change Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["change", "final", "initial"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
            >
              {m === "change" ? "% Change" : m === "final" ? "Final Value" : "Initial Value"}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {(mode === "change" || mode === "final") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm font-medium">
                  Initial Value:
                </label>
                <input
                  type="number"
                  step="any"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            {(mode === "change" || mode === "initial") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm font-medium">
                  Final Value:
                </label>
                <input
                  type="number"
                  step="any"
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 120"
                />
              </div>
            )}
            {(mode === "final" || mode === "initial") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm font-medium">
                  Percent Change (%):
                </label>
                <input
                  type="number"
                  step="any"
                  value={percentChange}
                  onChange={(e) => setPercentChange(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 20"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm font-medium">
                Precision (decimals):
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Initial Value: {result.initialValue}</p>
              <p className="text-center">Final Value: {result.finalValue}</p>
              <p className="text-center text-xl font-medium">
                {result.isIncrease ? "Increase" : "Decrease"} by{" "}
                {Math.abs(result.percentChange)}%
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm text-gray-600 space-y-2">
                  <p>Calculation Steps:</p>
                  <ul className="list-disc list-inside">
                    {result.type === "change" && (
                      <>
                        <li>Change = Final - Initial = {result.finalValue} - {result.initialValue} = {result.change}</li>
                        <li>Percent Change = (Change / |Initial|) × 100 = ({result.change} / |{result.initialValue}|) × 100 = {result.percentChange}%</li>
                      </>
                    )}
                    {result.type === "final" && (
                      <>
                        <li>Change = (Percent Change / 100) × |Initial| = ({result.percentChange} / 100) × |{result.initialValue}| = {result.change}</li>
                        <li>Final Value = Initial + {result.isIncrease ? "Change" : "-Change"} = {result.initialValue} {result.isIncrease ? "+" : "-"} {result.change} = {result.finalValue}</li>
                      </>
                    )}
                    {result.type === "initial" && (
                      <>
                        <li>Initial Value = Final / (1 + Percent Change / 100) = {result.finalValue} / (1 + {result.percentChange} / 100) = {result.initialValue}</li>
                        <li>Change = Final - Initial = {result.finalValue} - {result.initialValue} = {result.change}</li>
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
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Calculation History</h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:underline"
              >
                Clear History
              </button>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((item, index) => (
                <li key={index} className="p-2 bg-white rounded-md shadow-sm">
                  {item.type === "change"
                    ? `% Change: ${item.isIncrease ? "Increase" : "Decrease"} ${Math.abs(item.percentChange)}% (Initial: ${item.initialValue}, Final: ${item.finalValue})`
                    : item.type === "final"
                    ? `Final Value: ${item.finalValue} (Initial: ${item.initialValue}, % Change: ${item.percentChange}%)`
                    : `Initial Value: ${item.initialValue} (Final: ${item.finalValue}, % Change: ${item.percentChange}%)`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate % change, final value, or initial value</li>
            <li>Customizable decimal precision (0-10)</li>
            <li>Detailed calculation steps</li>
            <li>History of last 5 calculations</li>
            <li>Real-time error feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PercentageChangeCalculator;