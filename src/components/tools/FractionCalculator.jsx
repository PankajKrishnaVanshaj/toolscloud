"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaHistory, FaCalculator } from "react-icons/fa";

const FractionCalculator = () => {
  const [fraction1, setFraction1] = useState({ num: "", den: "" });
  const [fraction2, setFraction2] = useState({ num: "", den: "" });
  const [operation, setOperation] = useState("+");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [displayMode, setDisplayMode] = useState("fraction"); // fraction, mixed, decimal
  const [precision, setPrecision] = useState(2); // For decimal display

  // GCD calculation
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  // Simplify fraction and convert to mixed number or decimal
  const processFraction = useCallback((num, den) => {
    if (den === 0) return { error: "Division by zero" };
    const divisor = gcd(num, den);
    const simplifiedNum = num / divisor;
    const simplifiedDen = den / divisor;

    // Mixed number
    const whole = Math.floor(Math.abs(simplifiedNum) / simplifiedDen);
    const remainder = Math.abs(simplifiedNum) % simplifiedDen;
    const mixed = whole > 0 ? { whole, num: remainder, den: simplifiedDen } : null;

    // Decimal
    const decimal = (simplifiedNum / simplifiedDen).toFixed(precision);

    return { num: simplifiedNum, den: simplifiedDen, mixed, decimal };
  }, [precision]);

  // Calculate result
  const calculate = useCallback(() => {
    setError("");
    const f1Num = parseInt(fraction1.num) || 0;
    const f1Den = parseInt(fraction1.den) || 1;
    const f2Num = parseInt(fraction2.num) || 0;
    const f2Den = parseInt(fraction2.den) || 1;

    if (f1Den === 0 || f2Den === 0) {
      setError("Denominator cannot be zero");
      setResult(null);
      return;
    }

    let resultNum, resultDen;
    switch (operation) {
      case "+":
        resultNum = f1Num * f2Den + f2Num * f1Den;
        resultDen = f1Den * f2Den;
        break;
      case "-":
        resultNum = f1Num * f2Den - f2Num * f1Den;
        resultDen = f1Den * f2Den;
        break;
      case "×":
        resultNum = f1Num * f2Num;
        resultDen = f1Den * f2Den;
        break;
      case "÷":
        if (f2Num === 0) {
          setError("Division by zero");
          setResult(null);
          return;
        }
        resultNum = f1Num * f2Den;
        resultDen = f1Den * f2Num;
        break;
      default:
        return;
    }

    const processed = processFraction(resultNum, resultDen);
    if (processed.error) {
      setError(processed.error);
      setResult(null);
      return;
    }

    setResult(processed);
    setHistory((prev) => [
      ...prev.slice(-9), // Keep last 10 entries
      {
        f1: `${f1Num}/${f1Den}`,
        op: operation,
        f2: `${f2Num}/${f2Den}`,
        result: `${processed.num}/${processed.den}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [fraction1, fraction2, operation, processFraction]);

  // Reset calculator
  const reset = () => {
    setFraction1({ num: "", den: "" });
    setFraction2({ num: "", den: "" });
    setOperation("+");
    setResult(null);
    setError("");
    setDisplayMode("fraction");
    setPrecision(2);
  };

  // Clear history
  const clearHistory = () => setHistory([]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Fraction Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2 items-center">
            <input
              type="number"
              value={fraction1.num}
              onChange={(e) => setFraction1({ ...fraction1, num: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Num"
            />
            <span className="text-2xl text-center">/</span>
            <input
              type="number"
              value={fraction1.den}
              onChange={(e) => setFraction1({ ...fraction1, den: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Den"
            />
          </div>

          <div className="flex justify-center gap-2 flex-wrap">
            {["+", "-", "×", "÷"].map((op) => (
              <button
                key={op}
                onClick={() => setOperation(op)}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md font-semibold transition-colors ${
                  operation === op
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 items-center">
            <input
              type="number"
              value={fraction2.num}
              onChange={(e) => setFraction2({ ...fraction2, num: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Num"
            />
            <span className="text-2xl text-center">/</span>
            <input
              type="number"
              value={fraction2.den}
              onChange={(e) => setFraction2({ ...fraction2, den: e.target.value })}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Den"
            />
          </div>
        </div>

        {/* Display Settings */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Mode
            </label>
            <select
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="fraction">Fraction</option>
              <option value="mixed">Mixed Number</option>
              <option value="decimal">Decimal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decimal Precision
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={precision}
              onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={displayMode !== "decimal"}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={calculate}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-green-50 rounded-md text-center">
            <h2 className="text-lg font-semibold text-gray-700">Result:</h2>
            <div className="text-xl mt-2">
              {displayMode === "mixed" && result.mixed ? (
                <span>
                  {result.num < 0 ? "-" : ""}
                  {result.mixed.whole} {result.mixed.num}/{result.mixed.den}
                </span>
              ) : displayMode === "decimal" ? (
                <span>{result.decimal}</span>
              ) : (
                <span>
                  {result.num}/{result.den}
                </span>
              )}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> History
              </h3>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto">
              <ul className="space-y-2">
                {history.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm bg-gray-50 p-2 rounded-md flex justify-between"
                  >
                    <span>
                      {item.f1} {item.op} {item.f2} = {item.result}
                    </span>
                    <span className="text-gray-500 text-xs">{item.timestamp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports addition, subtraction, multiplication, division</li>
            <li>Display as fraction, mixed number, or decimal</li>
            <li>Adjustable decimal precision</li>
            <li>Calculation history with timestamps</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FractionCalculator;