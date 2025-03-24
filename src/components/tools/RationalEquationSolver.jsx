"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaEye, FaEyeSlash } from "react-icons/fa";
import { saveAs } from "file-saver"; // For downloading steps as text

const RationalEquationSolver = () => {
  const [type, setType] = useState("type1"); // type1: a/x + b = c, type2: a/(x - b) = c, type3: a/x + b/x = c
  const [inputs, setInputs] = useState({ a: "", b: "", c: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(2); // Decimal precision for results
  const [history, setHistory] = useState([]); // Calculation history

  // Solve rational equation
  const solveRational = useCallback((type, inputs) => {
    const steps = [`Solving ${type === "type1" ? "a/x + b = c" : type === "type2" ? "a/(x - b) = c" : "a/x + b/x = c"}:`];
    const a = parseFloat(inputs.a);
    const b = parseFloat(inputs.b);
    const c = parseFloat(inputs.c);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      return { error: "All coefficients must be valid numbers" };
    }
    if (a === 0 && (type === "type1" || type === "type2")) {
      return { error: "Coefficient a cannot be zero" };
    }

    steps.push(`Given: ${type === "type1" ? `${a}/x + ${b} = ${c}` : type === "type2" ? `${a}/(x - ${b}) = ${c}` : `${a}/x + ${b}/x = ${c}`}`);

    let x;
    if (type === "type1") {
      // a/x + b = c
      const denominator = c - b;
      if (denominator === 0) {
        steps.push(`c - b = ${c} - ${b} = 0`);
        steps.push("Denominator is zero: No solution (x ≠ 0)");
        return { error: "No solution (division by zero)", steps };
      }
      x = a / denominator;
      steps.push(`Subtract ${b} from both sides: ${a}/x = ${c} - ${b} = ${denominator}`);
      steps.push(`Multiply both sides by x: ${a} = ${denominator}x`);
      steps.push(`Divide both sides by ${denominator}: x = ${a} / ${denominator} = ${x.toFixed(precision)}`);
    } else if (type === "type2") {
      // a/(x - b) = c
      if (c === 0) {
        steps.push(`c = 0: ${a}/(x - ${b}) = 0 implies a = 0, but a = ${a}`);
        return { error: "No solution (division by zero or contradiction)", steps };
      }
      x = a / c + b;
      const denominator = x - b;
      if (denominator === 0) {
        steps.push(`x - b = ${x.toFixed(precision)} - ${b} = 0`);
        steps.push("Denominator is zero: No solution");
        return { error: "No solution (denominator zero)", steps };
      }
      steps.push(`Multiply both sides by (x - ${b}): ${a} = ${c}(x - ${b})`);
      steps.push(`Divide both sides by ${c}: ${a}/${c} = x - ${b}`);
      steps.push(`Add ${b} to both sides: x = ${a}/${c} + ${b} = ${x.toFixed(precision)}`);
    } else {
      // type3: a/x + b/x = c
      if (c === 0 && (a !== 0 || b !== 0)) {
        steps.push(`c = 0: (${a} + ${b})/x = 0 implies a + b = 0, but ${a} + ${b} ≠ 0`);
        return { error: "No solution (contradiction)", steps };
      }
      x = (a + b) / c;
      steps.push(`Combine fractions: (${a} + ${b})/x = ${c}`);
      steps.push(`Multiply both sides by x: ${a + b} = ${c}x`);
      steps.push(`Divide both sides by ${c}: x = ${a + b}/${c} = ${x.toFixed(precision)}`);
    }

    steps.push(`Solution: x = ${x.toFixed(precision)}`);
    return { solution: x.toFixed(precision), steps };
  }, [precision]);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else if (field === "a" && value && parseFloat(value) === 0 && type !== "type3") {
      setErrors((prev) => ({ ...prev, [field]: "Cannot be zero" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      inputs.a &&
      !isNaN(parseFloat(inputs.a)) &&
      (type === "type3" || parseFloat(inputs.a) !== 0) &&
      inputs.b &&
      !isNaN(parseFloat(inputs.b)) &&
      inputs.c &&
      !isNaN(parseFloat(inputs.c)) &&
      Object.values(errors).every((err) => !err)
    );
  }, [inputs, errors, type]);

  // Solve equation
  const solve = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: "Please fill all fields with valid numbers (a ≠ 0 for types 1 & 2)",
      }));
      return;
    }

    const calcResult = solveRational(type, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
      setHistory((prev) => [
        ...prev,
        { type, inputs: { ...inputs }, result: calcResult.solution, timestamp: new Date().toLocaleString() },
      ].slice(-5)); // Keep last 5 history items
    }
  };

  // Reset state
  const reset = () => {
    setType("type1");
    setInputs({ a: "", b: "", c: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setPrecision(2);
    setHistory([]);
  };

  // Download steps as text file
  const downloadSteps = () => {
    if (result && result.steps) {
      const blob = new Blob([result.steps.join("\n")], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `rational-equation-steps-${Date.now()}.txt`);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Rational Equation Solver
        </h1>

        {/* Type Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { value: "type1", label: "a/x + b = c" },
            { value: "type2", label: "a/(x - b) = c" },
            { value: "type3", label: "a/x + b/x = c" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                type === value ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {["a", "b", "c"].map((field) => (
            <div key={field} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-24 text-gray-700 text-sm">
                {field.toUpperCase()} {field === "a" ? "(numerator)" : field === "b" && type === "type1" ? "(addend)" : field === "b" ? "(shift)" : "(equals)"}:
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === "a" ? "2" : field === "b" ? "1" : "3"}`}
                  aria-label={`${field} coefficient`}
                />
                {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <label className="w-24 text-gray-700 text-sm">Precision:</label>
            <select
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full sm:w-24 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map((val) => (
                <option key={val} value={val}>
                  {val} decimals
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={solve}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
          >
            Solve
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all font-semibold flex items-center justify-center"
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
        {result && result.solution && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Solution:</h2>
            <p className="text-center text-xl font-mono">x = {result.solution}</p>
            <div className="flex justify-center gap-4 mt-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                {showSteps ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />}
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
              <button
                onClick={downloadSteps}
                className="text-sm text-green-600 hover:underline flex items-center"
              >
                <FaDownload className="mr-1" /> Download Steps
              </button>
            </div>
            {showSteps && (
              <ul className="mt-2 text-sm list-decimal list-inside transition-opacity font-mono">
                {result.steps.map((step, i) => (
                  <li key={i} className="py-1">{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">History (Last 5)</h3>
            <ul className="text-sm space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="p-2 bg-white rounded-md shadow-sm">
                  <p>
                    <strong>Type:</strong> {entry.type === "type1" ? "a/x + b = c" : entry.type === "type2" ? "a/(x - b) = c" : "a/x + b/x = c"}
                  </p>
                  <p><strong>Inputs:</strong> a={entry.inputs.a}, b={entry.inputs.b}, c={entry.inputs.c}</p>
                  <p><strong>Result:</strong> x={entry.result}</p>
                  <p className="text-xs text-gray-500">{entry.timestamp}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports three equation types</li>
            <li>Real-time input validation</li>
            <li>Step-by-step solution display</li>
            <li>Adjustable decimal precision</li>
            <li>Calculation history (last 5)</li>
            <li>Download steps as text</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RationalEquationSolver;