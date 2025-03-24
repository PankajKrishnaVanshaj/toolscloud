"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaHistory, FaDownload } from "react-icons/fa";

const GCDLCMCalculator = () => {
  const [number1, setNumber1] = useState("");
  const [number2, setNumber2] = useState("");
  const [result, setResult] = useState({ gcd: null, lcm: null });
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showSteps, setShowSteps] = useState(false);
  const [calculationMode, setCalculationMode] = useState("both"); // GCD, LCM, or both

  // Calculate GCD using Euclidean algorithm with steps
  const calculateGCD = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    const steps = [];
    while (b) {
      steps.push(`GCD(${a}, ${b}) = GCD(${b}, ${a % b})`);
      const t = b;
      b = a % b;
      a = t;
    }
    return { gcd: a, steps };
  };

  // Calculate LCM using GCD
  const calculateLCM = (a, b, gcd) => {
    return Math.abs(a * b) / gcd;
  };

  // Prime factorization
  const getPrimeFactors = (num) => {
    const factors = {};
    let n = Math.abs(num);
    for (let i = 2; i <= n; i++) {
      while (n % i === 0) {
        factors[i] = (factors[i] || 0) + 1;
        n /= i;
      }
    }
    return factors;
  };

  const calculate = useCallback(() => {
    setError("");
    const num1 = parseInt(number1);
    const num2 = parseInt(number2);

    // Validation
    if (isNaN(num1) || isNaN(num2)) {
      setError("Please enter valid numbers");
      setResult({ gcd: null, lcm: null });
      return;
    }

    if (num1 === 0 && num2 === 0) {
      setError("GCD and LCM are undefined for two zeros");
      setResult({ gcd: null, lcm: null });
      return;
    }

    const { gcd, steps } = calculateGCD(num1, num2);
    const lcm = calculateLCM(num1, num2, gcd);
    const factors1 = getPrimeFactors(num1);
    const factors2 = getPrimeFactors(num2);

    const newResult = { factors1, factors2 };
    if (calculationMode === "both" || calculationMode === "gcd") {
      newResult.gcd = gcd;
      newResult.gcdSteps = steps;
    }
    if (calculationMode === "both" || calculationMode === "lcm") {
      newResult.lcm = lcm;
    }

    setResult(newResult);
    setHistory((prev) => [
      ...prev.slice(-9), // Keep last 10 entries
      { num1, num2, gcd, lcm, timestamp: new Date().toLocaleString() },
    ]);
  }, [number1, number2, calculationMode]);

  // Reset calculator
  const reset = () => {
    setNumber1("");
    setNumber2("");
    setResult({ gcd: null, lcm: null });
    setError("");
    setShowSteps(false);
    setCalculationMode("both");
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Download history as text
  const downloadHistory = () => {
    const text = history
      .map(
        (item) =>
          `${item.timestamp}: ${item.num1} & ${item.num2} - GCD: ${item.gcd}, LCM: ${item.lcm}`
      )
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gcd_lcm_history_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          GCD & LCM Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="number"
              value={number1}
              onChange={(e) => setNumber1(e.target.value)}
              className="w-full sm:w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              placeholder="First Number"
            />
            <input
              type="number"
              value={number2}
              onChange={(e) => setNumber2(e.target.value)}
              className="w-full sm:w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              placeholder="Second Number"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculation Mode
              </label>
              <select
                value={calculationMode}
                onChange={(e) => setCalculationMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="both">GCD & LCM</option>
                <option value="gcd">GCD Only</option>
                <option value="lcm">LCM Only</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="mr-2 accent-purple-500"
                />
                <span className="text-sm text-gray-700">Show GCD Steps</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all font-semibold flex items-center justify-center"
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
        {result.gcd !== null || result.lcm !== null ? (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-4">
              {result.gcd !== undefined && (
                <p className="text-xl text-center">GCD: {result.gcd}</p>
              )}
              {result.lcm !== undefined && (
                <p className="text-xl text-center">LCM: {result.lcm}</p>
              )}
              <div className="text-sm">
                <p className="font-medium">Prime Factors:</p>
                <p>
                  {number1}:{" "}
                  {Object.entries(result.factors1)
                    .map(([factor, power]) => `${factor}${power > 1 ? `^${power}` : ""}`)
                    .join(" × ") || "None"}
                </p>
                <p>
                  {number2}:{" "}
                  {Object.entries(result.factors2)
                    .map(([factor, power]) => `${factor}${power > 1 ? `^${power}` : ""}`)
                    .join(" × ") || "None"}
                </p>
              </div>
              {showSteps && result.gcdSteps && (
                <div className="text-sm">
                  <p className="font-medium">GCD Calculation Steps:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {result.gcdSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">History:</h3>
              <div className="flex gap-2">
                <button
                  onClick={downloadHistory}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
                  title="Download History"
                >
                  <FaDownload />
                </button>
                <button
                  onClick={clearHistory}
                  className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
                  title="Clear History"
                >
                  <FaHistory />
                </button>
              </div>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((item, index) => (
                <li
                  key={index}
                  className="text-sm bg-gray-50 p-2 rounded flex justify-between"
                >
                  <span>
                    {item.num1} & {item.num2}: GCD = {item.gcd}, LCM = {item.lcm}
                  </span>
                  <span className="text-gray-500 text-xs">{item.timestamp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate GCD, LCM, or both</li>
            <li>Show detailed GCD calculation steps</li>
            <li>Prime factorization display</li>
            <li>Calculation history with timestamps</li>
            <li>Download history as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GCDLCMCalculator;