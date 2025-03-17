"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const PermutationCalculator = () => {
  const [mode, setMode] = useState("standard"); // standard (P(n, r)), repetition, circular
  const [inputs, setInputs] = useState({ n: "", r: "", repetition: "", circularN: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [notation, setNotation] = useState("decimal"); // decimal, scientific

  // Factorial function with optimization for large numbers
  const factorial = useCallback((num) => {
    if (num === 0 || num === 1) return 1n; // Use BigInt for large numbers
    let result = 1n;
    for (let i = 2n; i <= num; i++) result *= i;
    return result;
  }, []);

  // Format number based on notation
  const formatNumber = (num) => {
    if (notation === "scientific") {
      return num.toString().replace(/(\d+)n/, "$1") // Remove BigInt 'n' for display
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
        .toLocaleString("en-US", { notation: "scientific" });
    }
    return num.toString().replace(/(\d+)n/, "$1").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };

  // Calculate permutations
  const calculatePermutation = useCallback((mode, inputs) => {
    const steps = [`Calculating ${mode === "standard" ? "P(n, r)" : mode === "repetition" ? "permutations with repetition" : "circular permutations"}:`];

    if (mode === "standard") {
      const n = parseInt(inputs.n);
      const r = parseInt(inputs.r);
      if (isNaN(n) || isNaN(r) || n < 0 || r < 0 || r > n) {
        return { error: "n and r must be non-negative integers, r ≤ n" };
      }
      const permutation = factorial(n) / factorial(n - r);
      steps.push(`Formula: P(n, r) = n! / (n - r)!`);
      steps.push(`P(${n}, ${r}) = ${n}! / (${n} - ${r})!`);
      steps.push(`= ${factorial(n)} / ${factorial(n - r)} = ${permutation}`);
      return { result: permutation, steps, label: `P(${n}, ${r})` };
    } else if (mode === "repetition") {
      const counts = inputs.repetition.split(",").map(val => parseInt(val.trim())).filter(val => !isNaN(val));
      if (counts.length === 0 || counts.some(val => val < 0)) {
        return { error: "Enter a comma-separated list of non-negative integers (e.g., 2, 3, 1)" };
      }
      const total = counts.reduce((sum, val) => sum + val, 0);
      const numerator = factorial(total);
      const denominator = counts.reduce((prod, val) => prod * factorial(val), 1n);
      const permutation = numerator / denominator;
      steps.push(`Formula: n! / (n₁! * n₂! * ... * nₖ!), where n = total items, nᵢ = repetitions`);
      steps.push(`Total items (n) = ${total}`);
      steps.push(`Repetitions = ${counts.join(", ")}`);
      steps.push(`P = ${total}! / (${counts.map(val => `${val}!`).join(" * ")})`);
      steps.push(`= ${numerator} / ${denominator} = ${permutation}`);
      return { result: permutation, steps, label: `Permutations with repetition` };
    } else if (mode === "circular") {
      const n = parseInt(inputs.circularN);
      if (isNaN(n) || n < 0) {
        return { error: "n must be a non-negative integer" };
      }
      const permutation = factorial(n - 1); // (n-1)! for circular permutations
      steps.push(`Formula: Circular P(n) = (n - 1)!`);
      steps.push(`P(${n}) = (${n} - 1)!`);
      steps.push(`= ${factorial(n - 1)} = ${permutation}`);
      return { result: permutation, steps, label: `Circular P(${n})` };
    }
  }, [notation]);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (field === "repetition") {
      const counts = value.split(",").map(val => parseInt(val.trim())).filter(val => !isNaN(val));
      setErrors((prev) => ({
        ...prev,
        [field]: value && (counts.length === 0 || counts.some(val => val < 0))
          ? "Must be comma-separated non-negative integers"
          : "",
      }));
    } else {
      const num = parseInt(value);
      setErrors((prev) => ({
        ...prev,
        [field]: value && (isNaN(num) || num < 0)
          ? "Must be a non-negative integer"
          : field === "r" && inputs.n && value && num > parseInt(inputs.n)
          ? "r must be ≤ n"
          : "",
      }));
    }
  };

  // Check input validity
  const isValid = useMemo(() => {
    if (mode === "standard") {
      return (
        inputs.n && !isNaN(parseInt(inputs.n)) && parseInt(inputs.n) >= 0 &&
        inputs.r && !isNaN(parseInt(inputs.r)) && parseInt(inputs.r) >= 0 && parseInt(inputs.r) <= parseInt(inputs.n) &&
        !Object.values(errors).some(err => err)
      );
    } else if (mode === "repetition") {
      const counts = inputs.repetition.split(",").map(val => parseInt(val.trim())).filter(val => !isNaN(val));
      return (
        inputs.repetition && counts.length > 0 && counts.every(val => val >= 0) &&
        !Object.values(errors).some(err => err)
      );
    } else if (mode === "circular") {
      return (
        inputs.circularN && !isNaN(parseInt(inputs.circularN)) && parseInt(inputs.circularN) >= 0 &&
        !Object.values(errors).some(err => err)
      );
    }
    return false;
  }, [mode, inputs, errors]);

  // Calculate permutation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid inputs for the selected mode" });
      return;
    }

    const calcResult = calculatePermutation(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setMode("standard");
    setInputs({ n: "", r: "", repetition: "", circularN: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setNotation("decimal");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Permutation Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["standard", "repetition", "circular"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-2 rounded-md text-sm sm:text-base transition-colors ${
                mode === m ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {m === "standard" ? "P(n, r)" : m === "repetition" ? "With Repetition" : "Circular"}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {mode === "standard" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  n (total items)
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.n}
                  onChange={handleInputChange("n")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                />
                {errors.n && <p className="text-red-600 text-sm mt-1">{errors.n}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  r (items to arrange)
                </label>
                <input
                  type="number"
                  step="1"
                  value={inputs.r}
                  onChange={handleInputChange("r")}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                />
                {errors.r && <p className="text-red-600 text-sm mt-1">{errors.r}</p>}
              </div>
            </>
          )}
          {mode === "repetition" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repetitions (comma-separated)
              </label>
              <input
                type="text"
                value={inputs.repetition}
                onChange={handleInputChange("repetition")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2, 3, 1"
              />
              {errors.repetition && <p className="text-red-600 text-sm mt-1">{errors.repetition}</p>}
            </div>
          )}
          {mode === "circular" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                n (items in circle)
              </label>
              <input
                type="number"
                step="1"
                value={inputs.circularN}
                onChange={handleInputChange("circularN")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 4"
              />
              {errors.circularN && <p className="text-red-600 text-sm mt-1">{errors.circularN}</p>}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notation</label>
              <select
                value={notation}
                onChange={(e) => setNotation(e.target.value)}
                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal</option>
                <option value="scientific">Scientific</option>
              </select>
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <FaInfoCircle /> {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

        {/* Errors */}
        {errors.general && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Result:</h2>
            <p className="text-xl text-center">
              {result.label} = {formatNumber(result.result)}
            </p>
            {showSteps && (
              <ul className="mt-4 text-sm list-disc list-inside">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate standard P(n, r), with repetition, and circular permutations</li>
            <li>BigInt support for large numbers</li>
            <li>Decimal or scientific notation</li>
            <li>Step-by-step calculation breakdown</li>
            <li>Input validation and error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PermutationCalculator;