"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaCopy, FaHistory } from "react-icons/fa";

const GCDLCMFinder = () => {
  const [inputs, setInputs] = useState({ num1: "", num2: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [history, setHistory] = useState([]);
  const [base, setBase] = useState(10); // Number base (decimal, binary, etc.)

  // Calculate GCD and LCM with steps
  const calculateGCDLCM = useCallback((num1, num2) => {
    const steps = ["Finding GCD using Euclidean algorithm:"];
    let a = Math.abs(parseInt(num1, base));
    let b = Math.abs(parseInt(num2, base));

    if (isNaN(a) || isNaN(b) || a === 0 || b === 0) {
      return { error: "Both numbers must be positive integers in the selected base" };
    }

    // Euclidean algorithm
    while (b !== 0) {
      steps.push(`GCD(${a}, ${b}) = GCD(${b}, ${a % b})`);
      const temp = b;
      b = a % b;
      a = temp;
    }
    const gcd = a;
    steps.push(`GCD = ${gcd} (Base ${base}: ${gcd.toString(base).toUpperCase()})`);

    // Calculate LCM
    const lcm = (Math.abs(parseInt(num1, base)) * Math.abs(parseInt(num2, base))) / gcd;
    steps.push(`LCM = (${num1} * ${num2}) / GCD = ${lcm} (Base ${base}: ${lcm.toString(base).toUpperCase()})`);

    return { gcd, lcm, steps };
  }, [base]);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    const parsed = parseInt(value, base);
    if (value && (isNaN(parsed) || parsed <= 0 || !Number.isInteger(parseFloat(value, base)))) {
      setErrors((prev) => ({ ...prev, [field]: `Must be a positive integer in base ${base}` }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const num1 = parseInt(inputs.num1, base);
    const num2 = parseInt(inputs.num2, base);
    return (
      inputs.num1 &&
      !isNaN(num1) &&
      num1 > 0 &&
      Number.isInteger(parseFloat(inputs.num1, base)) &&
      inputs.num2 &&
      !isNaN(num2) &&
      num2 > 0 &&
      Number.isInteger(parseFloat(inputs.num2, base)) &&
      Object.values(errors).every((err) => !err)
    );
  }, [inputs, errors, base]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please enter two positive integers in the selected base" });
      return;
    }

    const calcResult = calculateGCDLCM(inputs.num1, inputs.num2);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setHistory((prev) => [
        { inputs: { ...inputs }, result: calcResult, timestamp: new Date().toLocaleString() },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ num1: "", num2: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setBase(10);
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          GCD & LCM Finder
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["num1", "num2"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number {field === "num1" ? 1 : 2}:
                </label>
                <input
                  type="text"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${base === 10 ? field === "num1" ? "12" : "18" : base === 2 ? "1010" : "FF"}`}
                  aria-label={`Number ${field === "num1" ? 1 : 2}`}
                />
                {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
              </div>
            ))}
          </div>

          {/* Base Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number Base:</label>
            <select
              value={base}
              onChange={(e) => setBase(parseInt(e.target.value))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>Binary (Base 2)</option>
              <option value={8}>Octal (Base 8)</option>
              <option value={10}>Decimal (Base 10)</option>
              <option value={16}>Hexadecimal (Base 16)</option>
            </select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="flex justify-center gap-4 mt-2">
              <div>
                <p className="text-center text-xl">
                  GCD: {result.gcd}{" "}
                  <button
                    onClick={() => copyToClipboard(result.gcd.toString(base).toUpperCase())}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaCopy />
                  </button>
                </p>
                <p className="text-sm text-gray-600">
                  (Base {base}: {result.gcd.toString(base).toUpperCase()})
                </p>
              </div>
              <div>
                <p className="text-center text-xl">
                  LCM: {result.lcm}{" "}
                  <button
                    onClick={() => copyToClipboard(result.lcm.toString(base).toUpperCase())}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaCopy />
                  </button>
                </p>
                <p className="text-sm text-gray-600">
                  (Base {base}: {result.lcm.toString(base).toUpperCase()})
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
              <FaHistory className="mr-2" /> Calculation History
            </h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index}>
                  {entry.timestamp}: GCD({entry.inputs.num1}, {entry.inputs.num2}) ={" "}
                  {entry.result.gcd}, LCM = {entry.result.lcm}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate GCD and LCM with Euclidean algorithm</li>
            <li>Support for multiple number bases (2, 8, 10, 16)</li>
            <li>Detailed step-by-step breakdown</li>
            <li>Copy results to clipboard</li>
            <li>Calculation history (last 10)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GCDLCMFinder;