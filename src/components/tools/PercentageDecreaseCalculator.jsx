"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const PercentageDecreaseCalculator = () => {
  const [mode, setMode] = useState("decrease"); // decrease, final, initial
  const [initialValue, setInitialValue] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [percentDecrease, setPercentDecrease] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);
  const [history, setHistory] = useState([]);

  // Calculate percentage decrease with configurable decimal places
  const calculatePercentageDecrease = useCallback(() => {
    setError("");
    setResult(null);

    const initialNum = parseFloat(initialValue);
    const finalNum = parseFloat(finalValue);
    const percentNum = parseFloat(percentDecrease);

    if (mode === "decrease") {
      if (isNaN(initialNum) || isNaN(finalNum))
        return { error: "Please enter valid initial and final values" };
      if (initialNum <= 0) return { error: "Initial value must be positive" };
      if (finalNum > initialNum)
        return { error: "Final value must be less than initial value for a decrease" };
      const decrease = initialNum - finalNum;
      const percentDecreaseCalc = (decrease / initialNum) * 100;

      return {
        initialValue: initialNum.toFixed(decimalPlaces),
        finalValue: finalNum.toFixed(decimalPlaces),
        decrease: decrease.toFixed(decimalPlaces),
        percentDecrease: percentDecreaseCalc.toFixed(decimalPlaces),
        type: "decrease",
      };
    } else if (mode === "final") {
      if (isNaN(initialNum) || isNaN(percentNum))
        return { error: "Please enter valid initial value and percentage decrease" };
      if (initialNum <= 0) return { error: "Initial value must be positive" };
      if (percentNum < 0 || percentNum > 100)
        return { error: "Percentage decrease must be between 0 and 100%" };
      const decrease = (percentNum / 100) * initialNum;
      const finalValueCalc = initialNum - decrease;

      return {
        initialValue: initialNum.toFixed(decimalPlaces),
        finalValue: finalValueCalc.toFixed(decimalPlaces),
        decrease: decrease.toFixed(decimalPlaces),
        percentDecrease: percentNum.toFixed(decimalPlaces),
        type: "final",
      };
    } else if (mode === "initial") {
      if (isNaN(finalNum) || isNaN(percentNum))
        return { error: "Please enter valid final value and percentage decrease" };
      if (finalNum < 0) return { error: "Final value must be non-negative" };
      if (percentNum < 0 || percentNum >= 100)
        return { error: "Percentage decrease must be between 0 and 99.99%" };
      const initialValueCalc = finalNum / (1 - percentNum / 100);
      const decrease = initialValueCalc - finalNum;

      return {
        initialValue: initialValueCalc.toFixed(decimalPlaces),
        finalValue: finalNum.toFixed(decimalPlaces),
        decrease: decrease.toFixed(decimalPlaces),
        percentDecrease: percentNum.toFixed(decimalPlaces),
        type: "initial",
      };
    }
    return null;
  }, [mode, initialValue, finalValue, percentDecrease, decimalPlaces]);

  const calculate = () => {
    if (
      (mode === "decrease" && (!initialValue || !finalValue)) ||
      (mode === "final" && (!initialValue || !percentDecrease)) ||
      (mode === "initial" && (!finalValue || !percentDecrease))
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculatePercentageDecrease();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
    setHistory((prev) => [...prev, calcResult].slice(-5)); // Keep last 5 calculations
  };

  const reset = () => {
    setMode("decrease");
    setInitialValue("");
    setFinalValue("");
    setPercentDecrease("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setDecimalPlaces(2);
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Percentage Decrease Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["decrease", "final", "initial"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-sm sm:text-base ${
                mode === m
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {m === "decrease"
                ? "% Decrease"
                : m === "final"
                ? "Final Value"
                : "Initial Value"}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {(mode === "decrease" || mode === "final") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm sm:text-base">
                  Initial Value:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={initialValue}
                  onChange={(e) => setInitialValue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 100"
                />
              </div>
            )}
            {(mode === "decrease" || mode === "initial") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm sm:text-base">
                  Final Value:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 80"
                />
              </div>
            )}
            {(mode === "final" || mode === "initial") && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-32 text-gray-700 text-sm sm:text-base">
                  Percent Decrease (%):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={percentDecrease}
                  onChange={(e) => setPercentDecrease(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., 20"
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700 text-sm sm:text-base">
                Decimal Places:
              </label>
              <select
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-all font-semibold flex items-center justify-center"
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
          <div className="mt-6 p-4 bg-orange-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center">Initial Value: {result.initialValue}</p>
              <p className="text-center">Final Value: {result.finalValue}</p>
              <p className="text-center text-xl">
                Percentage Decrease: {result.percentDecrease}%
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-orange-600 hover:underline flex items-center justify-center mx-auto"
                >
                  <FaInfoCircle className="mr-1" />
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === "decrease" && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Final Value: {result.finalValue}</li>
                        <li>
                          Decrease = Initial - Final = {result.initialValue} -{" "}
                          {result.finalValue} = {result.decrease}
                        </li>
                        <li>
                          Percentage Decrease = (Decrease / Initial) × 100 = (
                          {result.decrease} / {result.initialValue}) × 100 ={" "}
                          {result.percentDecrease}%
                        </li>
                      </>
                    )}
                    {result.type === "final" && (
                      <>
                        <li>Initial Value: {result.initialValue}</li>
                        <li>Percentage Decrease: {result.percentDecrease}%</li>
                        <li>
                          Decrease = (Percent Decrease / 100) × Initial = (
                          {result.percentDecrease} / 100) × {result.initialValue} ={" "}
                          {result.decrease}
                        </li>
                        <li>
                          Final Value = Initial - Decrease = {result.initialValue} -{" "}
                          {result.decrease} = {result.finalValue}
                        </li>
                      </>
                    )}
                    {result.type === "initial" && (
                      <>
                        <li>Final Value: {result.finalValue}</li>
                        <li>Percentage Decrease: {result.percentDecrease}%</li>
                        <li>
                          Initial Value = Final / (1 - Percent Decrease / 100) ={" "}
                          {result.finalValue} / (1 - {result.percentDecrease} / 100) ={" "}
                          {result.initialValue}
                        </li>
                        <li>
                          Decrease = Initial - Final = {result.initialValue} -{" "}
                          {result.finalValue} = {result.decrease}
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
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Calculation History</h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:underline"
              >
                Clear History
              </button>
            </div>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <li key={index}>
                    {entry.type === "decrease"
                      ? `From ${entry.initialValue} to ${entry.finalValue}: ${entry.percentDecrease}% decrease`
                      : entry.type === "final"
                      ? `${entry.initialValue} - ${entry.percentDecrease}% = ${entry.finalValue}`
                      : `${entry.finalValue} with ${entry.percentDecrease}% decrease from ${entry.initialValue}`}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Three modes: % Decrease, Final Value, Initial Value</li>
            <li>Customizable decimal precision (0-4)</li>
            <li>Detailed calculation steps</li>
            <li>Calculation history (last 5)</li>
            <li>Error handling and validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PercentageDecreaseCalculator;