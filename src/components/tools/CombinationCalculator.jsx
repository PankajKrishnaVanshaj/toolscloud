"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaClipboard } from "react-icons/fa";

const CombinationCalculator = () => {
  const [type, setType] = useState("combination"); // combination, permutation, factorial
  const [inputs, setInputs] = useState({ n: "", k: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState("exact"); // exact, decimal
  const [history, setHistory] = useState([]);

  // Factorial helper function with BigInt for larger numbers
  const factorial = (num) => {
    if (num === 0n || num === 1n) return 1n;
    let result = 1n;
    for (let i = 2n; i <= num; i++) result *= i;
    return result;
  };

  // Calculate combinatorial result
  const calculateCombinatorial = useCallback(
    (type, inputs) => {
      const steps = [`Calculating ${type === "combination" ? "C(n, k)" : type === "permutation" ? "P(n, k)" : "n!"}:`];
      const n = BigInt(inputs.n || 0);
      const k = BigInt(inputs.k || 0);

      if (type !== "factorial" && (n < 0n || k < 0n || k > n)) {
        return { error: "n and k must be non-negative integers, k ≤ n" };
      }
      if (type === "factorial" && n < 0n) {
        return { error: "n must be a non-negative integer" };
      }

      let value;
      if (type === "combination") {
        const numerator = factorial(n);
        const denominator = factorial(k) * factorial(n - k);
        value = numerator / denominator;
        steps.push(`Formula: C(n, k) = n! / (k! * (n-k)!)`);
        steps.push(`C(${n}, ${k}) = ${n}! / (${k}! * ${n - k}!)`);
        steps.push(`= ${numerator} / (${factorial(k)} * ${factorial(n - k)}) = ${value}`);
      } else if (type === "permutation") {
        const numerator = factorial(n);
        const denominator = factorial(n - k);
        value = numerator / denominator;
        steps.push(`Formula: P(n, k) = n! / (n-k!)`);
        steps.push(`P(${n}, ${k}) = ${n}! / ${n - k}!`);
        steps.push(`= ${numerator} / ${denominator} = ${value}`);
      } else if (type === "factorial") {
        value = factorial(n);
        steps.push(`Formula: n! = n * (n-1) * ... * 1`);
        steps.push(`${n}! = ${value}`);
      }

      const displayValue = precision === "exact" ? value.toString() : Number(value).toLocaleString();
      return { result: displayValue, steps, label: `${type === "combination" ? "C" : type === "permutation" ? "P" : ""}(${n}${type !== "factorial" ? `, ${k}` : ""})` };
    },
    [precision]
  );

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value === "") {
      setErrors((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    if (isNaN(parseInt(value)) || parseInt(value) < 0) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a non-negative integer" }));
    } else if (field === "k" && value && BigInt(value) > BigInt(inputs.n || 0)) {
      setErrors((prev) => ({ ...prev, [field]: "Must be ≤ n" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const nValid = inputs.n !== "" && !isNaN(parseInt(inputs.n)) && parseInt(inputs.n) >= 0;
    if (!nValid) return false;

    if (type === "factorial") {
      return Object.values(errors).every((err) => !err);
    }

    const kValid = inputs.k !== "" && !isNaN(parseInt(inputs.k)) && parseInt(inputs.k) >= 0 && BigInt(inputs.k) <= BigInt(inputs.n);
    return kValid && Object.values(errors).every((err) => !err);
  }, [type, inputs, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid inputs for the selected calculation type" });
      return;
    }

    const calcResult = calculateCombinatorial(type, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setHistory((prev) => [...prev, { ...calcResult, timestamp: new Date().toLocaleString() }].slice(-10)); // Keep last 10
    }
  };

  // Reset state
  const reset = () => {
    setType("combination");
    setInputs({ n: "", k: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setPrecision("exact");
    setHistory([]);
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(`${result.label} = ${result.result}`);
      alert("Result copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Combination Calculator
        </h1>

        {/* Type Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["combination", "permutation", "factorial"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                type === t ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Input and Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">n (total):</label>
            <input
              type="number"
              step="1"
              value={inputs.n}
              onChange={handleInputChange("n")}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 5"
              aria-label="Total items (n)"
            />
            {errors.n && <p className="text-red-600 text-xs mt-1">{errors.n}</p>}
          </div>
          {type !== "factorial" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">k (choose):</label>
              <input
                type="number"
                step="1"
                value={inputs.k}
                onChange={handleInputChange("k")}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
                aria-label="Items to choose (k)"
              />
              {errors.k && <p className="text-red-600 text-xs mt-1">{errors.k}</p>}
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Result Precision:</label>
            <select
              value={precision}
              onChange={(e) => setPrecision(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="exact">Exact (Integer)</option>
              <option value="decimal">Decimal (Formatted)</option>
            </select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          {result && (
            <button
              onClick={copyToClipboard}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all flex items-center justify-center"
            >
              <FaClipboard className="mr-2" /> Copy Result
            </button>
          )}
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl font-mono">{result.label} = {result.result}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside text-gray-600">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Calculation History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="border-b py-1">
                  <span className="font-medium">{entry.label} = {entry.result}</span>
                  <span className="text-xs text-gray-500 ml-2">({entry.timestamp})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate Combinations, Permutations, and Factorials</li>
            <li>BigInt support for large numbers</li>
            <li>Exact or formatted decimal results</li>
            <li>Step-by-step calculation breakdown</li>
            <li>Calculation history (last 10)</li>
            <li>Copy result to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CombinationCalculator;