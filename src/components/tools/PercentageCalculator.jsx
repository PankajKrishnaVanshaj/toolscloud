"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator, FaHistory } from "react-icons/fa";

const PercentageCalculator = () => {
  const [mode, setMode] = useState("percentOf"); // percentOf, whatPercent, change, discount, markup
  const [number1, setNumber1] = useState("");
  const [number2, setNumber2] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Calculate percentage based on mode
  const calculatePercentage = useCallback(() => {
    setError("");
    setResult(null);

    const num1 = parseFloat(number1);
    const num2 = parseFloat(number2);

    if (isNaN(num1) || (mode !== "percentOf" && isNaN(num2))) {
      return { error: "Please enter valid numbers" };
    }

    let calcResult;
    switch (mode) {
      case "percentOf":
        if (num2 <= 0) return { error: "Base number must be positive" };
        calcResult = (num1 / 100) * num2;
        return {
          result: calcResult.toFixed(2),
          percentage: num1,
          base: num2,
          type: "percentOf",
        };
      case "whatPercent":
        if (num2 === 0) return { error: "Denominator cannot be zero" };
        calcResult = (num1 / num2) * 100;
        return {
          result: calcResult.toFixed(2),
          part: num1,
          whole: num2,
          type: "whatPercent",
        };
      case "change":
        if (num1 === 0) return { error: "Initial value cannot be zero" };
        calcResult = ((num2 - num1) / Math.abs(num1)) * 100;
        return {
          result: calcResult.toFixed(2),
          initial: num1,
          final: num2,
          type: "change",
          isIncrease: num2 > num1,
        };
      case "discount":
        if (num2 <= 0) return { error: "Original price must be positive" };
        calcResult = num2 - (num1 / 100) * num2;
        return {
          result: calcResult.toFixed(2),
          discount: num1,
          original: num2,
          type: "discount",
          savings: ((num1 / 100) * num2).toFixed(2),
        };
      case "markup":
        if (num2 <= 0) return { error: "Cost must be positive" };
        calcResult = num2 + (num1 / 100) * num2;
        return {
          result: calcResult.toFixed(2),
          markup: num1,
          cost: num2,
          type: "markup",
          profit: ((num1 / 100) * num2).toFixed(2),
        };
      default:
        return null;
    }
  }, [mode, number1, number2]);

  const calculate = () => {
    if (!number1 || (mode !== "percentOf" && !number2)) {
      setError("Please fill in all required fields");
      return;
    }

    const calcResult = calculatePercentage();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
    setHistory((prev) => [...prev, calcResult].slice(-10)); // Keep last 10 calculations
  };

  const reset = () => {
    setMode("percentOf");
    setNumber1("");
    setNumber2("");
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  const clearHistory = () => {
    setHistory([]);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Percentage Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { id: "percentOf", label: "% of Number" },
            { id: "whatPercent", label: "What %" },
            { id: "change", label: "% Change" },
            { id: "discount", label: "Discount" },
            { id: "markup", label: "Markup" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`px-3 py-1 rounded-lg text-sm sm:text-base ${
                mode === id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            {(mode === "percentOf" || mode === "discount" || mode === "markup") && (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-32 text-gray-700">
                    {mode === "percentOf"
                      ? "Percentage (%):"
                      : mode === "discount"
                      ? "Discount (%):"
                      : "Markup (%):"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={number1}
                    onChange={(e) => setNumber1(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-32 text-gray-700">
                    {mode === "percentOf"
                      ? "Of Number:"
                      : mode === "discount"
                      ? "Original Price:"
                      : "Cost:"}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={number2}
                    onChange={(e) => setNumber2(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>
              </>
            )}
            {mode === "whatPercent" && (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-32 text-gray-700">Part:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number1}
                    onChange={(e) => setNumber1(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 25"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-32 text-gray-700">Whole:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number2}
                    onChange={(e) => setNumber2(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>
              </>
            )}
            {mode === "change" && (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-32 text-gray-700">Initial Value:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number1}
                    onChange={(e) => setNumber1(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-32 text-gray-700">Final Value:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={number2}
                    onChange={(e) => setNumber2(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 150"
                  />
                </div>
              </>
            )}
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <div className="mt-2 space-y-2">
              {result.type === "percentOf" && (
                <p className="text-center text-xl">
                  {result.percentage}% of {result.base} = {result.result}
                </p>
              )}
              {result.type === "whatPercent" && (
                <p className="text-center text-xl">
                  {result.part} is {result.result}% of {result.whole}
                </p>
              )}
              {result.type === "change" && (
                <p className="text-center text-xl">
                  {result.isIncrease ? "Increase" : "Decrease"} from {result.initial} to{" "}
                  {result.final} = {Math.abs(result.result)}%
                </p>
              )}
              {result.type === "discount" && (
                <p className="text-center text-xl">
                  {result.discount}% off {result.original} = {result.result} (Savings:{" "}
                  {result.savings})
                </p>
              )}
              {result.type === "markup" && (
                <p className="text-center text-xl">
                  {result.markup}% markup on {result.cost} = {result.result} (Profit:{" "}
                  {result.profit})
                </p>
              )}

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
                <div className="text-sm space-y-2">
                  <p>Calculation Details:</p>
                  <ul className="list-disc list-inside">
                    {result.type === "percentOf" && (
                      <>
                        <li>Formula: (Percentage / 100) × Base</li>
                        <li>
                          ({result.percentage} / 100) × {result.base} = {result.result}
                        </li>
                      </>
                    )}
                    {result.type === "whatPercent" && (
                      <>
                        <li>Formula: (Part / Whole) × 100</li>
                        <li>
                          ({result.part} / {result.whole}) × 100 = {result.result}%
                        </li>
                      </>
                    )}
                    {result.type === "change" && (
                      <>
                        <li>Formula: ((Final - Initial) / |Initial|) × 100</li>
                        <li>
                          (({result.final} - {result.initial}) / |{result.initial}|) × 100 ={" "}
                          {result.result}%
                        </li>
                        <li>
                          {result.isIncrease ? "Increase" : "Decrease"} by{" "}
                          {Math.abs(result.result)}%
                        </li>
                      </>
                    )}
                    {result.type === "discount" && (
                      <>
                        <li>Formula: Original - (Discount / 100) × Original</li>
                        <li>
                          {result.original} - ({result.discount} / 100) × {result.original} ={" "}
                          {result.result}
                        </li>
                        <li>Savings: {result.savings}</li>
                      </>
                    )}
                    {result.type === "markup" && (
                      <>
                        <li>Formula: Cost + (Markup / 100) × Cost</li>
                        <li>
                          {result.cost} + ({result.markup} / 100) × {result.cost} ={" "}
                          {result.result}
                        </li>
                        <li>Profit: {result.profit}</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Section */}
        <div className="mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 w-full sm:w-auto"
          >
            <FaHistory /> {showHistory ? "Hide History" : "Show History"} (
            {history.length})
          </button>
          {showHistory && history.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md max-h-64 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Calculation History</h3>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear History
                </button>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index}>
                    {entry.type === "percentOf" &&
                      `${entry.percentage}% of ${entry.base} = ${entry.result}`}
                    {entry.type === "whatPercent" &&
                      `${entry.part} is ${entry.result}% of ${entry.whole}`}
                    {entry.type === "change" &&
                      `${entry.isIncrease ? "Increase" : "Decrease"} from ${
                        entry.initial
                      } to ${entry.final} = ${Math.abs(entry.result)}%`}
                    {entry.type === "discount" &&
                      `${entry.discount}% off ${entry.original} = ${entry.result}`}
                    {entry.type === "markup" &&
                      `${entry.markup}% markup on ${entry.cost} = ${entry.result}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate % of number, what %, % change, discount, and markup</li>
            <li>Detailed calculation breakdown</li>
            <li>Calculation history (last 10 entries)</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PercentageCalculator;