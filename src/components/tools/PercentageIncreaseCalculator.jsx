"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator, FaChartLine } from "react-icons/fa";

const PercentageIncreaseCalculator = () => {
  const [mode, setMode] = useState("increase"); // increase, final, initial
  const [initialValue, setInitialValue] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [percentIncrease, setPercentIncrease] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [precision, setPrecision] = useState(2); // Decimal places
  const [history, setHistory] = useState([]); // Calculation history

  // Calculate percentage increase based on mode
  const calculatePercentageIncrease = useCallback(() => {
    setError("");
    setResult(null);

    const initialNum = parseFloat(initialValue);
    const finalNum = parseFloat(finalValue);
    const percentNum = parseFloat(percentIncrease);

    if (mode === "increase") {
      if (isNaN(initialNum) || isNaN(finalNum))
        return { error: "Please enter valid initial and final values" };
      if (initialNum <= 0) return { error: "Initial value must be positive" };
      if (finalNum < initialNum)
        return { error: "Final value must be greater than initial value for an increase" };
      const increase = finalNum - initialNum;
      const percentIncreaseCalc = (increase / initialNum) * 100;

      return {
        initialValue: initialNum.toFixed(precision),
        finalValue: finalNum.toFixed(precision),
        increase: increase.toFixed(precision),
        percentIncrease: percentIncreaseCalc.toFixed(precision),
        type: "increase",
      };
    } else if (mode === "final") {
      if (isNaN(initialNum) || isNaN(percentNum))
        return { error: "Please enter valid initial value and percentage increase" };
      if (initialNum <= 0) return { error: "Initial value must be positive" };
      if (percentNum < 0) return { error: "Percentage increase must be non-negative" };
      const increase = (percentNum / 100) * initialNum;
      const finalValueCalc = initialNum + increase;

      return {
        initialValue: initialNum.toFixed(precision),
        finalValue: finalValueCalc.toFixed(precision),
        increase: increase.toFixed(precision),
        percentIncrease: percentNum.toFixed(precision),
        type: "final",
      };
    } else if (mode === "initial") {
      if (isNaN(finalNum) || isNaN(percentNum))
        return { error: "Please enter valid final value and percentage increase" };
      if (finalNum <= 0) return { error: "Final value must be positive" };
      if (percentNum < 0) return { error: "Percentage increase must be non-negative" };
      const initialValueCalc = finalNum / (1 + percentNum / 100);
      const increase = finalNum - initialValueCalc;

      return {
        initialValue: initialValueCalc.toFixed(precision),
        finalValue: finalNum.toFixed(precision),
        increase: increase.toFixed(precision),
        percentIncrease: percentNum.toFixed(precision),
        type: "initial",
      };
    }
    return null;
  }, [mode, initialValue, finalValue, percentIncrease, precision]);

  const calculate = () => {
    if (
      (mode === "increase" && (!initialValue || !finalValue)) ||
      (mode === "final" && (!initialValue || !percentIncrease)) ||
      (mode === "initial" && (!finalValue || !percentIncrease))
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculatePercentageIncrease();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
    setHistory((prev) => [...prev, calcResult].slice(-5)); // Keep last 5 calculations
  };

  const reset = () => {
    setMode("increase");
    setInitialValue("");
    setFinalValue("");
    setPercentIncrease("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setPrecision(2);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Percentage Increase Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["increase", "final", "initial"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } transition-colors`}
            >
              {m === "increase" ? "% Increase" : m === "final" ? "Final Value" : "Initial Value"}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {(mode === "increase" || mode === "final") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-sm font-medium text-gray-700">Initial Value:</label>
                <input
                  type="number"
                  step="0.01"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            {(mode === "increase" || mode === "initial") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-sm font-medium text-gray-700">Final Value:</label>
                <input
                  type="number"
                  step="0.01"
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., 120"
                />
              </div>
            )}
            {(mode === "final" || mode === "initial") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-sm font-medium text-gray-700">
                  Percent Increase (%):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={percentIncrease}
                  onChange={(e) => setPercentIncrease(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., 20"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-sm font-medium text-gray-700">
                Precision (decimals):
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(6, e.target.value)))}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2 text-center">Results</h2>
            <div className="space-y-2">
              <p className="text-center">Initial Value: {result.initialValue}</p>
              <p className="text-center">Final Value: {result.finalValue}</p>
              <p className="text-center text-xl font-bold text-blue-700">
                Percentage Increase: {result.percentIncrease}%
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
                  <p className="font-medium">Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === "increase" && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Final Value: {result.finalValue}</li>
                        <li>
                          Increase = Final - Initial = {result.finalValue} - {result.initialValue}{" "}
                          = {result.increase}
                        </li>
                        <li>
                          % Increase = (Increase / Initial) × 100 = ({result.increase} /{" "}
                          {result.initialValue}) × 100 = {result.percentIncrease}%
                        </li>
                      </>
                    )}
                    {result.type === "final" && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Percentage Increase: {result.percentIncrease}%</li>
                        <li>
                          Increase = (% Increase / 100) × Initial = (
                          {result.percentIncrease} / 100) × {result.initialValue} ={" "}
                          {result.increase}
                        </li>
                        <li>
                          Final Value = Initial + Increase = {result.initialValue} +{" "}
                          {result.increase} = {result.finalValue}
                        </li>
                      </>
                    )}
                    {result.type === "initial" && (
                      <>
                        <li>Final Value: {result.finalValue}</li>
                        <li>Percentage Increase: {result.percentIncrease}%</li>
                        <li>
                          Initial Value = Final / (1 + % Increase / 100) = {result.finalValue}{" "}
                          / (1 + {result.percentIncrease} / 100) = {result.initialValue}
                        </li>
                        <li>
                          Increase = Final - Initial = {result.finalValue} -{" "}
                          {result.initialValue} = {result.increase}
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
            <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
              <FaChartLine className="mr-2" /> History (Last {history.length})
            </h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <li key={index}>
                    {entry.type === "increase"
                      ? `% Increase: ${entry.percentIncrease}% (Initial: ${entry.initialValue} → Final: ${entry.finalValue})`
                      : entry.type === "final"
                      ? `Final Value: ${entry.finalValue} (Initial: ${entry.initialValue}, %: ${entry.percentIncrease})`
                      : `Initial Value: ${entry.initialValue} (Final: ${entry.finalValue}, %: ${entry.percentIncrease})`}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate % increase, final value, or initial value</li>
            <li>Adjustable precision (0-6 decimals)</li>
            <li>Detailed calculation breakdown</li>
            <li>Calculation history (last 5)</li>
            <li>Input validation and error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PercentageIncreaseCalculator;