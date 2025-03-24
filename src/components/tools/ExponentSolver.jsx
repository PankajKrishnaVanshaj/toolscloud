"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaQuestionCircle } from "react-icons/fa";

const ExponentSolver = () => {
  const [mode, setMode] = useState("evaluate"); // evaluate (a^x), solveExp (a^x = b), solveBase (x^a = b)
  const [inputs, setInputs] = useState({ base: "", exp: "", result: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(4); // Decimal precision
  const [history, setHistory] = useState([]); // Calculation history

  // Calculate exponential solution
  const calculateExp = useCallback(
    (mode, inputs) => {
      const steps = [
        `Solving for ${
          mode === "evaluate" ? "exponential value" : mode === "solveExp" ? "exponent" : "base"
        }:`,
      ];
      const base = parseFloat(inputs.base);
      const exp = parseFloat(inputs.exp);
      const resultVal = parseFloat(inputs.result);

      if (mode === "evaluate") {
        if (isNaN(base) || isNaN(exp) || base <= 0) {
          return { error: "Base must be positive, exponent must be a number" };
        }
        const value = Math.pow(base, exp);
        steps.push(`${base}^${exp} = ${value.toFixed(precision)}`);
        return { result: value.toFixed(precision), steps, label: `${base}^${exp}` };
      } else if (mode === "solveExp") {
        if (isNaN(base) || isNaN(resultVal) || base <= 0 || resultVal <= 0 || base === 1) {
          return { error: "Base must be positive and ≠ 1, result must be positive" };
        }
        const expResult = Math.log(resultVal) / Math.log(base);
        steps.push(`${base}^x = ${resultVal}`);
        steps.push(`x = log_${base}(${resultVal}) = ln(${resultVal}) / ln(${base})`);
        steps.push(
          `= ${Math.log(resultVal).toFixed(precision)} / ${Math.log(base).toFixed(
            precision
          )} = ${expResult.toFixed(precision)}`
        );
        return { result: expResult.toFixed(precision), steps, label: "x (exponent)" };
      } else if (mode === "solveBase") {
        if (isNaN(exp) || isNaN(resultVal) || resultVal <= 0 || exp === 0) {
          return { error: "Result must be positive, exponent must be non-zero" };
        }
        const baseResult = Math.pow(resultVal, 1 / exp);
        steps.push(`x^${exp} = ${resultVal}`);
        steps.push(`x = ${resultVal}^(1/${exp})`);
        steps.push(`= ${baseResult.toFixed(precision)}`);
        return { result: baseResult.toFixed(precision), steps, label: "x (base)" };
      }
    },
    [precision]
  );

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else if (
      field === "base" &&
      value &&
      (parseFloat(value) <= 0 || (mode === "solveExp" && parseFloat(value) === 1))
    ) {
      setErrors((prev) => ({
        ...prev,
        [field]: mode === "solveExp" ? "Must be positive and ≠ 1" : "Must be positive",
      }));
    } else if (
      (field === "result" && value && parseFloat(value) <= 0) ||
      (field === "exp" && value && parseFloat(value) === 0 && mode === "solveBase")
    ) {
      setErrors((prev) => ({
        ...prev,
        [field]: field === "exp" ? "Must be non-zero" : "Must be positive",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Check input validity
  const isValid = useMemo(() => {
    if (mode === "evaluate") {
      return (
        inputs.base &&
        !isNaN(parseFloat(inputs.base)) &&
        parseFloat(inputs.base) > 0 &&
        inputs.exp &&
        !isNaN(parseFloat(inputs.exp)) &&
        Object.values(errors).every((err) => !err)
      );
    } else if (mode === "solveExp") {
      return (
        inputs.base &&
        !isNaN(parseFloat(inputs.base)) &&
        parseFloat(inputs.base) > 0 &&
        parseFloat(inputs.base) !== 1 &&
        inputs.result &&
        !isNaN(parseFloat(inputs.result)) &&
        parseFloat(inputs.result) > 0 &&
        Object.values(errors).every((err) => !err)
      );
    } else if (mode === "solveBase") {
      return (
        inputs.exp &&
        !isNaN(parseFloat(inputs.exp)) &&
        parseFloat(inputs.exp) !== 0 &&
        inputs.result &&
        !isNaN(parseFloat(inputs.result)) &&
        parseFloat(inputs.result) > 0 &&
        Object.values(errors).every((err) => !err)
      );
    }
    return false;
  }, [mode, inputs, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid inputs for the selected mode" });
      return;
    }

    const calcResult = calculateExp(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setHistory((prev) => [
        { mode, inputs: { ...inputs }, result: calcResult.result, timestamp: new Date() },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    }
  };

  // Reset state
  const reset = () => {
    setMode("evaluate");
    setInputs({ base: "", exp: "", result: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setPrecision(4);
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Exponent Solver
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["evaluate", "solveExp", "solveBase"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg text-sm sm:text-base transition-colors ${
                mode === m ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {m === "evaluate" ? "Evaluate a^x" : m === "solveExp" ? "Solve a^x = b" : "Solve x^a = b"}
            </button>
          ))}
        </div>

        {/* Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Precision: {precision}
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {(mode === "evaluate" || mode === "solveExp") && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-24 sm:w-32 text-gray-700">Base (a):</label>
              <div className="flex-1 w-full">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.base}
                  onChange={handleInputChange("base")}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
                  aria-label="Base"
                />
                {errors.base && <p className="text-red-600 text-sm mt-1">{errors.base}</p>}
              </div>
            </div>
          )}
          {mode === "evaluate" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-24 sm:w-32 text-gray-700">Exponent (x):</label>
              <div className="flex-1 w-full">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.exp}
                  onChange={handleInputChange("exp")}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  aria-label="Exponent"
                />
                {errors.exp && <p className="text-red-600 text-sm mt-1">{errors.exp}</p>}
              </div>
            </div>
          )}
          {(mode === "solveExp" || mode === "solveBase") && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-24 sm:w-32 text-gray-700">Result (b):</label>
              <div className="flex-1 w-full">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.result}
                  onChange={handleInputChange("result")}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8"
                  aria-label="Result"
                />
                {errors.result && <p className="text-red-600 text-sm mt-1">{errors.result}</p>}
              </div>
            </div>
          )}
          {mode === "solveBase" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-24 sm:w-32 text-gray-700">Exponent (a):</label>
              <div className="flex-1 w-full">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.exp}
                  onChange={handleInputChange("exp")}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  aria-label="Exponent"
                />
                {errors.exp && <p className="text-red-600 text-sm mt-1">{errors.exp}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center font-semibold"
          >
            <FaCalculator className="mr-2" /> Calculate
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center font-semibold"
          >
            <FaSync className="mr-2" /> Reset
          </button>
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
            <p className="text-center text-xl sm:text-2xl">
              {result.label} = {result.result}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-decimal list-inside transition-opacity">
                {result.steps.map((step, i) => (
                  <li key={i} className="py-1">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {entry.mode === "evaluate"
                      ? `${entry.inputs.base}^${entry.inputs.exp}`
                      : entry.mode === "solveExp"
                      ? `${entry.inputs.base}^x = ${entry.inputs.result}`
                      : `x^${entry.inputs.exp} = ${entry.inputs.result}`}{" "}
                    = {entry.result}
                  </span>
                  <span className="text-xs text-gray-400">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start">
          <FaQuestionCircle className="text-blue-600 mr-2 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Evaluate exponents (a^x)</li>
              <li>Solve for exponent (a^x = b)</li>
              <li>Solve for base (x^a = b)</li>
              <li>Adjustable decimal precision</li>
              <li>Step-by-step solution display</li>
              <li>Calculation history (last 10)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExponentSolver;