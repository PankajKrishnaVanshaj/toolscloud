"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const FactorialCalculator = () => {
  const [number, setNumber] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [calculationMode, setCalculationMode] = useState("standard"); // New: Standard or Recursive
  const [history, setHistory] = useState([]);

  // Calculate factorial with different modes
  const calculateFactorial = useCallback((n, mode = "standard") => {
    const num = parseInt(n);
    if (isNaN(num) || num < 0) {
      return { error: "Please enter a non-negative integer" };
    }
    if (num > 1000) {
      return { error: "Number too large (max 1000)" };
    }

    const steps = [];
    let factorial;

    if (mode === "standard") {
      factorial = 1n; // Use BigInt for large numbers
      if (num === 0 || num === 1) {
        steps.push(`${num}! = 1 (by definition)`);
      } else {
        let stepExpr = `${num}! = `;
        for (let i = num; i >= 1; i--) {
          factorial *= BigInt(i);
          stepExpr += `${i}${i > 1 ? " × " : ""}`;
        }
        steps.push(`${stepExpr} = ${factorial.toString()}`);
      }
    } else if (mode === "recursive") {
      const recursiveFactorial = (x) => {
        if (x <= 1) return 1n;
        const result = BigInt(x) * recursiveFactorial(x - 1);
        steps.push(`${x}! = ${x} × ${x - 1}!`);
        return result;
      };
      factorial = recursiveFactorial(num);
      steps.unshift(`${num}! = ${factorial.toString()} (final result)`);
    }

    return {
      number: num,
      factorial: factorial.toString(),
      steps,
      mode,
    };
  }, []);

  const calculate = () => {
    setError("");
    setResult(null);

    if (!number) {
      setError("Please enter a number");
      return;
    }

    const calcResult = calculateFactorial(number, calculationMode);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory((prev) => [
      { ...calcResult, timestamp: new Date().toLocaleString() },
      ...prev.slice(0, 9), // Keep last 10 calculations
    ]);
  };

  const reset = () => {
    setNumber("");
    setResult(null);
    setError("");
    setShowDetails(false);
    setCalculationMode("standard");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center gap-2">
          <FaCalculator /> Factorial Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., 5"
                  min="0"
                  max="1000"
                />
                <span className="ml-2 text-gray-700">!</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculation Mode
              </label>
              <select
                value={calculationMode}
                onChange={(e) => setCalculationMode(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="standard">Standard (Iterative)</option>
                <option value="recursive">Recursive</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all font-semibold flex items-center justify-center"
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
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Factorial Result ({result.mode})
            </h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl font-mono">
                {result.number}! = {result.factorial}
              </p>

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-teal-600 hover:underline flex items-center justify-center mx-auto gap-1"
                >
                  <FaInfoCircle /> {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Steps:</p>
                  <ul className="list-disc list-inside font-mono">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calculation History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Calculation History</h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:underline"
              >
                Clear History
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <ul className="space-y-2 text-sm">
                {history.map((entry, index) => (
                  <li
                    key={index}
                    className="p-2 bg-white rounded-md shadow-sm flex justify-between items-center"
                  >
                    <span>
                      {entry.number}! = {entry.factorial} ({entry.mode})
                    </span>
                    <span className="text-gray-500 text-xs">{entry.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports large numbers with BigInt</li>
            <li>Two calculation modes: Standard and Recursive</li>
            <li>Detailed step-by-step breakdown</li>
            <li>Calculation history (last 10 results)</li>
            <li>Input validation and error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FactorialCalculator;