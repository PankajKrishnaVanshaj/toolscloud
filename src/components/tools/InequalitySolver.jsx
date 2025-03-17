"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const InequalitySolver = () => {
  const [inputs, setInputs] = useState({ a: "", b: "", c: "", operator: "<" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(2); // Decimal precision for results
  const [history, setHistory] = useState([]); // History of solved inequalities

  // Solve the inequality ax + b [operator] c
  const solveInequality = useCallback((a, b, c, operator) => {
    const steps = [`Solving ${a}x + ${b} ${operator} ${c} for x:`];
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);

    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
      return { error: "All coefficients must be valid numbers" };
    }
    if (aNum === 0) {
      return { error: "Coefficient of x (a) cannot be zero" };
    }

    // Step 1: Subtract b from both sides
    const rhs = cNum - bNum;
    steps.push(`Subtract ${bNum} from both sides: ${aNum}x ${operator} ${rhs}`);

    // Step 2: Divide by a and handle inequality direction
    const solution = rhs / aNum;
    let finalOperator = operator;

    if (aNum < 0) {
      finalOperator =
        operator === "<" ? ">" : operator === ">" ? "<" : operator === "≤" ? "≥" : "≤";
      steps.push(
        `Divide both sides by ${aNum} (negative, so reverse inequality): x ${finalOperator} ${solution.toFixed(precision)}`
      );
    } else {
      steps.push(
        `Divide both sides by ${aNum}: x ${finalOperator} ${solution.toFixed(precision)}`
      );
    }

    // Convert to interval notation
    const interval = aNum < 0
      ? operator === "<" || operator === "≤"
        ? `(${solution.toFixed(precision)}, ∞)`
        : `(-∞, ${solution.toFixed(precision)}]`
      : operator === "<" || operator === "≤"
      ? `(-∞, ${solution.toFixed(precision)}${operator === "≤" ? "]" : ")"}`
      : `[${solution.toFixed(precision)}, ∞)`;

    steps.push(`Solution in interval notation: ${interval}`);
    return {
      solution: `x ${finalOperator} ${solution.toFixed(precision)}`,
      interval,
      steps,
      input: `${a}x + ${b} ${operator} ${c}`,
    };
  }, [precision]);

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else if (field === "a" && value && parseFloat(value) === 0) {
      setErrors((prev) => ({ ...prev, [field]: "Cannot be zero" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle operator change
  const handleOperatorChange = (e) => {
    setInputs((prev) => ({ ...prev, operator: e.target.value }));
    setResult(null);
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      inputs.a &&
      !isNaN(parseFloat(inputs.a)) &&
      parseFloat(inputs.a) !== 0 &&
      inputs.b &&
      !isNaN(parseFloat(inputs.b)) &&
      inputs.c &&
      !isNaN(parseFloat(inputs.c)) &&
      Object.values(errors).every((err) => !err)
    );
  }, [inputs, errors]);

  // Solve the inequality
  const solve = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: "Please fill all fields with valid numbers (a ≠ 0)",
      }));
      return;
    }

    const calcResult = solveInequality(inputs.a, inputs.b, inputs.c, inputs.operator);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setHistory((prev) => [calcResult, ...prev.slice(0, 9)]); // Keep last 10
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ a: "", b: "", c: "", operator: "<" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setPrecision(2);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Inequality Solver
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={inputs.a}
                onChange={handleInputChange("a")}
                className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
                placeholder="a"
                aria-label="Coefficient of x"
              />
              <span className="text-gray-700">x +</span>
              <input
                type="number"
                step="0.01"
                value={inputs.b}
                onChange={handleInputChange("b")}
                className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
                placeholder="b"
                aria-label="Constant b"
              />
              <select
                value={inputs.operator}
                onChange={handleOperatorChange}
                className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                aria-label="Inequality operator"
              >
                {["<", ">", "≤", "≥"].map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                value={inputs.c}
                onChange={handleInputChange("c")}
                className="w-20 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
                placeholder="c"
                aria-label="Right-hand side constant"
              />
            </div>
          </div>

          {/* Precision Control */}
          <div className="flex justify-center items-center gap-4">
            <label className="text-sm text-gray-700">Precision:</label>
            <input
              type="number"
              min="0"
              max="6"
              value={precision}
              onChange={(e) => setPrecision(Math.max(0, Math.min(6, e.target.value)))}
              className="w-16 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
            />
            <span className="text-sm text-gray-600">decimals</span>
          </div>

          {/* Errors */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["a", "b", "c"].map(
              (field) =>
                errors[field] && (
                  <p key={field} className="text-red-600 text-sm">
                    {errors[field]}
                  </p>
                )
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={solve}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Solve
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Solution:</h2>
            <p className="text-center text-xl text-blue-700">{result.solution}</p>
            <p className="text-center text-lg text-blue-600">
              Interval: {result.interval}
            </p>
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

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">History</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{entry.input} → {entry.solution}</span>
                  <button
                    onClick={() => {
                      setInputs({
                        a: entry.input.split("x")[0],
                        b: entry.input.split(" + ")[1].split(" ")[0],
                        c: entry.input.split(" ")[2],
                        operator: entry.input.split(" ")[1],
                      });
                      setResult(entry);
                    }}
                    className="text-blue-500 hover:underline text-xs"
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" /> Features
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Solves linear inequalities (ax + b [operator] c)</li>
            <li>Adjustable decimal precision</li>
            <li>Step-by-step solution breakdown</li>
            <li>Interval notation output</li>
            <li>History tracking with reload option</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InequalitySolver;