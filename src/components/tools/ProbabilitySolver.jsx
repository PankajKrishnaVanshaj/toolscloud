"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaHistory, FaDownload } from "react-icons/fa";

const ProbabilitySolver = () => {
  const [mode, setMode] = useState("independent");
  const [inputs, setInputs] = useState({ p1: "", p2: "", n: "", k: "", p: "", r: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Calculate probability based on mode
  const calculateProbability = useCallback((mode, inputs) => {
    const steps = [`Calculating probability for ${mode} scenario:`];
    let result, label;

    if (mode === "independent") {
      const p1 = parseFloat(inputs.p1);
      const p2 = parseFloat(inputs.p2);
      if (isNaN(p1) || isNaN(p2) || p1 < 0 || p1 > 1 || p2 < 0 || p2 > 1) {
        return { error: "Probabilities must be between 0 and 1" };
      }
      result = p1 * p2;
      steps.push(`P(A and B) = P(A) * P(B)`);
      steps.push(`= ${p1} * ${p2} = ${result.toFixed(4)}`);
      label = "P(A and B)";
    } else if (mode === "combination") {
      const n = parseInt(inputs.n);
      const k = parseInt(inputs.k);
      if (isNaN(n) || isNaN(k) || n < 0 || k < 0 || k > n || !Number.isInteger(n) || !Number.isInteger(k)) {
        return { error: "n and k must be non-negative integers, k ≤ n" };
      }
      const factorial = (num) => (num <= 1 ? 1 : num * factorial(num - 1));
      result = factorial(n) / (factorial(k) * factorial(n - k));
      steps.push(`C(n, k) = n! / (k! * (n - k)!)`);
      steps.push(`= ${n}! / (${k}! * ${n - k}!) = ${result}`);
      label = `C(${n}, ${k})`;
    } else if (mode === "binomial") {
      const n = parseInt(inputs.n);
      const k = parseInt(inputs.k);
      const p = parseFloat(inputs.p);
      if (
        isNaN(n) || isNaN(k) || isNaN(p) || n < 0 || k < 0 || k > n || p < 0 || p > 1 ||
        !Number.isInteger(n) || !Number.isInteger(k)
      ) {
        return { error: "n and k must be non-negative integers (k ≤ n), p must be between 0 and 1" };
      }
      const factorial = (num) => (num <= 1 ? 1 : num * factorial(num - 1));
      const comb = factorial(n) / (factorial(k) * factorial(n - k));
      result = comb * Math.pow(p, k) * Math.pow(1 - p, n - k);
      steps.push(`P(X = k) = C(n, k) * p^k * (1 - p)^(n - k)`);
      steps.push(`C(${n}, ${k}) = ${n}! / (${k}! * ${n - k}!) = ${comb}`);
      steps.push(`p^k = ${p}^${k} = ${Math.pow(p, k).toFixed(4)}`);
      steps.push(`(1 - p)^(n - k) = ${1 - p}^${n - k} = ${Math.pow(1 - p, n - k).toFixed(4)}`);
      steps.push(`P(X = ${k}) = ${comb} * ${Math.pow(p, k).toFixed(4)} * ${Math.pow(1 - p, n - k).toFixed(4)} = ${result.toFixed(4)}`);
      label = `P(X = ${k})`;
    } else if (mode === "permutation") {
      const n = parseInt(inputs.n);
      const r = parseInt(inputs.r);
      if (isNaN(n) || isNaN(r) || n < 0 || r < 0 || r > n || !Number.isInteger(n) || !Number.isInteger(r)) {
        return { error: "n and r must be non-negative integers, r ≤ n" };
      }
      const factorial = (num) => (num <= 1 ? 1 : num * factorial(num - 1));
      result = factorial(n) / factorial(n - r);
      steps.push(`P(n, r) = n! / (n - r)!`);
      steps.push(`= ${n}! / (${n - r}!) = ${result}`);
      label = `P(${n}, ${r})`;
    } else if (mode === "conditional") {
      const p1 = parseFloat(inputs.p1); // P(A and B)
      const p2 = parseFloat(inputs.p2); // P(B)
      if (isNaN(p1) || isNaN(p2) || p1 < 0 || p1 > 1 || p2 < 0 || p2 > 1 || p2 === 0) {
        return { error: "Probabilities must be between 0 and 1, P(B) ≠ 0" };
      }
      result = p1 / p2;
      steps.push(`P(A|B) = P(A and B) / P(B)`);
      steps.push(`= ${p1} / ${p2} = ${result.toFixed(4)}`);
      label = "P(A|B)";
    }
    return { result: Number.isInteger(result) ? result : result.toFixed(4), steps, label };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else if ((field === "p1" || field === "p2" || field === "p") && value && (parseFloat(value) < 0 || parseFloat(value) > 1)) {
      setErrors((prev) => ({ ...prev, [field]: "Must be between 0 and 1" }));
    } else if ((field === "n" || field === "k" || field === "r") && value && (!Number.isInteger(parseFloat(value)) || parseFloat(value) < 0)) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a non-negative integer" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate inputs based on mode
  const isValid = useMemo(() => {
    const checkNum = (val) => val && !isNaN(parseFloat(val));
    const checkProb = (val) => checkNum(val) && parseFloat(val) >= 0 && parseFloat(val) <= 1;
    const checkInt = (val) => checkNum(val) && Number.isInteger(parseFloat(val)) && parseFloat(val) >= 0;

    switch (mode) {
      case "independent":
        return checkProb(inputs.p1) && checkProb(inputs.p2);
      case "combination":
        return checkInt(inputs.n) && checkInt(inputs.k) && parseInt(inputs.k) <= parseInt(inputs.n);
      case "binomial":
        return checkInt(inputs.n) && checkInt(inputs.k) && parseInt(inputs.k) <= parseInt(inputs.n) && checkProb(inputs.p);
      case "permutation":
        return checkInt(inputs.n) && checkInt(inputs.r) && parseInt(inputs.r) <= parseInt(inputs.n);
      case "conditional":
        return checkProb(inputs.p1) && checkProb(inputs.p2) && parseFloat(inputs.p2) > 0;
      default:
        return false;
    }
  }, [mode, inputs]);

  // Perform calculation and add to history
  const calculate = () => {
    setErrors({});
    if (!isValid) {
      setErrors({ general: "Please provide valid inputs for the selected mode" });
      return;
    }

    const calcResult = calculateProbability(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setHistory((prev) => [...prev, { mode, inputs: { ...inputs }, ...calcResult }].slice(-10)); // Keep last 10
    }
  };

  // Reset state
  const reset = () => {
    setMode("independent");
    setInputs({ p1: "", p2: "", n: "", k: "", p: "", r: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setShowHistory(false);
  };

  // Download result as text
  const downloadResult = () => {
    if (!result) return;
    const text = `${result.label} = ${result.result}\n\nSteps:\n${result.steps.join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `probability_result_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Probability Solver</h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["independent", "combination", "binomial", "permutation", "conditional"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                mode === m ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {m === "independent" ? "Independent Events" : m === "combination" ? "Combinations" : m === "binomial" ? "Binomial" : m === "permutation" ? "Permutations" : "Conditional"}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {(mode === "independent" || mode === "conditional") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "conditional" ? "P(A and B)" : "P(A)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.p1}
                  onChange={handleInputChange("p1")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 0.5"
                />
                {errors.p1 && <p className="text-red-600 text-xs mt-1">{errors.p1}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "conditional" ? "P(B)" : "P(B)"}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.p2}
                  onChange={handleInputChange("p2")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 0.3"
                />
                {errors.p2 && <p className="text-red-600 text-xs mt-1">{errors.p2}</p>}
              </div>
            </>
          )}
          {(mode === "combination" || mode === "binomial" || mode === "permutation") && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">n (total)</label>
                <input
                  type="number"
                  step="1"
                  value={inputs.n}
                  onChange={handleInputChange("n")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                />
                {errors.n && <p className="text-red-600 text-xs mt-1">{errors.n}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "permutation" ? "r (selections)" : "k (successes)"}
                </label>
                <input
                  type="number"
                  step="1"
                  value={mode === "permutation" ? inputs.r : inputs.k}
                  onChange={handleInputChange(mode === "permutation" ? "r" : "k")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
                />
                {(errors.k || errors.r) && (
                  <p className="text-red-600 text-xs mt-1">{errors.k || errors.r}</p>
                )}
              </div>
            </>
          )}
          {mode === "binomial" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">p (success)</label>
              <input
                type="number"
                step="0.01"
                value={inputs.p}
                onChange={handleInputChange("p")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0.4"
              />
              {errors.p && <p className="text-red-600 text-xs mt-1">{errors.p}</p>}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <FaHistory className="mr-2" /> {showHistory ? "Hide" : "Show"} History
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-center">{errors.general}</div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700">Result:</h2>
            <p className="text-xl">{result.label} = {result.result}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
              <button
                onClick={downloadResult}
                className="flex items-center text-sm text-green-600 hover:underline"
              >
                <FaDownload className="mr-1" /> Download
              </button>
            </div>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* History */}
        {showHistory && history.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm space-y-2 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="p-2 bg-white rounded shadow-sm">
                  {entry.label} = {entry.result} ({entry.mode})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple modes: Independent, Combination, Binomial, Permutation, Conditional</li>
            <li>Detailed step-by-step solutions</li>
            <li>Calculation history (last 10)</li>
            <li>Download results as text</li>
            <li>Input validation and error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProbabilitySolver;