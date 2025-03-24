"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const LogarithmSolver = () => {
  const [mode, setMode] = useState("evaluate"); // evaluate, solve, convert, properties
  const [inputs, setInputs] = useState({ base: "", arg: "", result: "", newBase: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(4); // Decimal places
  const [history, setHistory] = useState([]); // Calculation history

  // Calculate logarithmic solution
  const calculateLog = useCallback(
    (mode, inputs) => {
      const steps = [`Solving for ${mode === "evaluate" ? "log value" : mode === "solve" ? "exponent" : mode === "convert" ? "converted log" : "properties"}:`];
      const base = parseFloat(inputs.base);
      const arg = parseFloat(inputs.arg);
      const resultVal = parseFloat(inputs.result);
      const newBase = parseFloat(inputs.newBase);

      if (mode === "evaluate") {
        if (isNaN(base) || isNaN(arg) || base <= 0 || base === 1 || arg <= 0) {
          return { error: "Base must be positive and ≠ 1, argument must be positive" };
        }
        const logValue = Math.log(arg) / Math.log(base);
        steps.push(`log_${base}(${arg}) = ln(${arg}) / ln(${base})`);
        steps.push(`= ${Math.log(arg).toFixed(precision)} / ${Math.log(base).toFixed(precision)} = ${logValue.toFixed(precision)}`);
        return { result: logValue.toFixed(precision), steps, label: `log_${base}(${arg})` };
      } else if (mode === "solve") {
        if (isNaN(base) || isNaN(resultVal) || base <= 0 || base === 1) {
          return { error: "Base must be positive and ≠ 1" };
        }
        const argResult = Math.pow(base, resultVal);
        steps.push(`log_${base}(x) = ${resultVal}`);
        steps.push(`x = ${base}^${resultVal} = ${argResult.toFixed(precision)}`);
        return { result: argResult.toFixed(precision), steps, label: "x" };
      } else if (mode === "convert") {
        if (isNaN(base) || isNaN(arg) || isNaN(newBase) || base <= 0 || base === 1 || arg <= 0 || newBase <= 0 || newBase === 1) {
          return { error: "Bases must be positive and ≠ 1, argument must be positive" };
        }
        const logValue = Math.log(arg) / Math.log(base);
        const newLogValue = Math.log(arg) / Math.log(newBase);
        steps.push(`log_${base}(${arg}) = ln(${arg}) / ln(${base}) = ${logValue.toFixed(precision)}`);
        steps.push(`Convert to base ${newBase}: log_${newBase}(${arg}) = ln(${arg}) / ln(${newBase})`);
        steps.push(`= ${Math.log(arg).toFixed(precision)} / ${Math.log(newBase).toFixed(precision)} = ${newLogValue.toFixed(precision)}`);
        return { result: newLogValue.toFixed(precision), steps, label: `log_${newBase}(${arg})` };
      } else if (mode === "properties") {
        if (isNaN(base) || isNaN(arg) || base <= 0 || base === 1 || arg <= 0) {
          return { error: "Base must be positive and ≠ 1, argument must be positive" };
        }
        const logValue = Math.log(arg) / Math.log(base);
        steps.push(`1. Power Rule: log_${base}(${arg}^n) = n * log_${base}(${arg})`);
        steps.push(`2. Product Rule: log_${base}(a * b) = log_${base}(a) + log_${base}(b)`);
        steps.push(`3. Quotient Rule: log_${base}(a / b) = log_${base}(a) - log_${base}(b)`);
        steps.push(`Example: log_${base}(${arg}) = ${logValue.toFixed(precision)}`);
        return { result: "See steps for properties", steps, label: "Properties" };
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
    } else if (value && parseFloat(value) <= 0) {
      setErrors((prev) => ({ ...prev, [field]: "Must be positive" }));
    } else if ((field === "base" || field === "newBase") && value && parseFloat(value) === 1) {
      setErrors((prev) => ({ ...prev, [field]: "Base cannot be 1" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate inputs based on mode
  const isValid = useMemo(() => {
    const commonChecks = (field) =>
      inputs[field] && !isNaN(parseFloat(inputs[field])) && parseFloat(inputs[field]) > 0 && parseFloat(inputs[field]) !== 1;
    const positiveCheck = (field) => inputs[field] && !isNaN(parseFloat(inputs[field])) && parseFloat(inputs[field]) > 0;

    if (mode === "evaluate" || mode === "properties") {
      return commonChecks("base") && positiveCheck("arg") && Object.values(errors).every((err) => !err);
    } else if (mode === "solve") {
      return commonChecks("base") && inputs.result && !isNaN(parseFloat(inputs.result)) && Object.values(errors).every((err) => !err);
    } else if (mode === "convert") {
      return commonChecks("base") && positiveCheck("arg") && commonChecks("newBase") && Object.values(errors).every((err) => !err);
    }
    return false;
  }, [mode, inputs, errors]);

  // Perform calculation and add to history
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide valid inputs for the selected mode" });
      return;
    }

    const calcResult = calculateLog(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setHistory((prev) => [...prev, { mode, inputs: { ...inputs }, result: calcResult }].slice(-10)); // Keep last 10
    }
  };

  // Reset state
  const reset = () => {
    setMode("evaluate");
    setInputs({ base: "", arg: "", result: "", newBase: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setPrecision(4);
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">Logarithm Solver</h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["evaluate", "solve", "convert", "properties"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg transition-colors text-sm sm:text-base ${
                mode === m ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {m === "evaluate" ? "Evaluate Log" : m === "solve" ? "Solve for x" : m === "convert" ? "Change Base" : "Properties"}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {["base", mode === "solve" ? "result" : "arg", mode === "convert" && "newBase"].map(
            (field) =>
              field && (
                <div key={field} className="flex items-center gap-2">
                  <label className="w-24 sm:w-32 text-gray-700 capitalize">{field.replace(/newBase/, "New Base")}:</label>
                  <div className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={inputs[field]}
                      onChange={handleInputChange(field)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`e.g., ${field === "base" ? "2" : field === "arg" ? "8" : field === "result" ? "3" : "10"}`}
                      aria-label={`Logarithm ${field}`}
                    />
                    {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
                  </div>
                </div>
              )
          )}
          <div className="flex items-center gap-2">
            <label className="w-24 sm:w-32 text-gray-700">Precision:</label>
            <input
              type="number"
              min="1"
              max="10"
              value={precision}
              onChange={(e) => setPrecision(Math.max(1, Math.min(10, parseInt(e.target.value))))}
              className="w-20 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">{errors.general}</div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
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
            <h3 className="font-semibold text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <li key={index}>
                  {entry.mode === "evaluate"
                    ? `log_${entry.inputs.base}(${entry.inputs.arg}) = ${entry.result.result}`
                    : entry.mode === "solve"
                    ? `log_${entry.inputs.base}(x) = ${entry.inputs.result}, x = ${entry.result.result}`
                    : entry.mode === "convert"
                    ? `log_${entry.inputs.base}(${entry.inputs.arg}) to base ${entry.inputs.newBase} = ${entry.result.result}`
                    : `Properties for log_${entry.inputs.base}(${entry.inputs.arg})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" /> Features
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Evaluate logarithms, solve for x, convert bases, and explore properties</li>
            <li>Adjustable precision (1-10 decimal places)</li>
            <li>Step-by-step solutions</li>
            <li>Calculation history (last 10)</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LogarithmSolver;