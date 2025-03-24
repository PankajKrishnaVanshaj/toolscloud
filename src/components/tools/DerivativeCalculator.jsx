"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaCalculator } from "react-icons/fa";

const DerivativeCalculator = () => {
  const [inputs, setInputs] = useState({
    x3: "", // x³ term
    x2: "", // x² term
    x1: "", // x term
    x0: "", // constant
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [notation, setNotation] = useState("d/dx"); // Notation style

  // Compute the derivative of ax³ + bx² + cx + d
  const calculateDerivative = useCallback((x3, x2, x1, x0) => {
    const coeffs = {
      x3: parseFloat(x3) || 0,
      x2: parseFloat(x2) || 0,
      x1: parseFloat(x1) || 0,
      x0: parseFloat(x0) || 0,
    };
    const steps = [
      `Differentiating ${coeffs.x3}x³ + ${coeffs.x2}x² + ${coeffs.x1}x + ${coeffs.x0}:`,
    ];

    if (Object.values(coeffs).some((val) => isNaN(val))) {
      return { error: "All coefficients must be valid numbers" };
    }

    // Apply power rule: d/dx(ax^n) = nax^(n-1)
    const deriv = {
      x2: 3 * coeffs.x3, // Derivative of ax³ is 3ax²
      x1: 2 * coeffs.x2, // Derivative of bx² is 2bx
      x0: coeffs.x1,     // Derivative of cx is c
      const: 0,          // Derivative of constant is 0
    };

    steps.push("Power rule: d/dx(axⁿ) = naxⁿ⁻¹");
    steps.push(`d/dx(${coeffs.x3}x³) = ${deriv.x2}x²`);
    steps.push(`d/dx(${coeffs.x2}x²) = ${deriv.x1}x`);
    steps.push(`d/dx(${coeffs.x1}x) = ${deriv.x0}`);
    steps.push(`d/dx(${coeffs.x0}) = ${deriv.const}`);

    // Construct derivative string
    let derivative = "";
    if (deriv.x2 !== 0) derivative += `${deriv.x2}x²`;
    if (deriv.x1 !== 0) {
      if (derivative && deriv.x1 > 0) derivative += " + ";
      derivative += `${deriv.x1}x`;
    }
    if (deriv.x0 !== 0) {
      if (derivative && deriv.x0 > 0) derivative += " + ";
      derivative += deriv.x0;
    }
    if (!derivative) derivative = "0";

    steps.push(`Derivative: ${notation === "d/dx" ? "d/dx" : "f'(x)"} = ${derivative}`);
    return { derivative, steps };
  }, [notation]);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const hasNumber = Object.values(inputs).some(
      (val) => val && !isNaN(parseFloat(val))
    );
    const allValid = Object.values(inputs).every(
      (val) => !val || !isNaN(parseFloat(val))
    );
    return hasNumber && allValid && Object.values(errors).every((err) => !err);
  }, [inputs, errors]);

  // Perform differentiation
  const differentiate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide at least one valid coefficient" });
      return;
    }

    const calcResult = calculateDerivative(inputs.x3, inputs.x2, inputs.x1, inputs.x0);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ x3: "", x2: "", x1: "", x0: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setNotation("d/dx");
  };

  // Construct original function string
  const getFunctionString = () => {
    const { x3, x2, x1, x0 } = inputs;
    let fn = "";
    if (x3 && parseFloat(x3) !== 0) fn += `${parseFloat(x3)}x³`;
    if (x2 && parseFloat(x2) !== 0) {
      if (fn && parseFloat(x2) > 0) fn += " + ";
      fn += `${parseFloat(x2)}x²`;
    }
    if (x1 && parseFloat(x1) !== 0) {
      if (fn && parseFloat(x1) > 0) fn += " + ";
      fn += `${parseFloat(x1)}x`;
    }
    if (x0 && parseFloat(x0) !== 0) {
      if (fn && parseFloat(x0) > 0) fn += " + ";
      fn += parseFloat(x0);
    }
    return fn || "0";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Derivative Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-4">
          {[
            { field: "x3", label: "x³" },
            { field: "x2", label: "x²" },
            { field: "x1", label: "x" },
            { field: "x0", label: "constant" },
          ].map(({ field, label }) => (
            <div key={field} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-24 text-sm font-medium text-gray-700">
                {label}:
              </label>
              <div className="flex-1 w-full">
                <input
                  type="number"
                  step="0.01"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === "x0" ? "5" : "2"}`}
                  aria-label={`${label} coefficient`}
                />
                {errors[field] && (
                  <p className="text-red-600 text-xs mt-1">{errors[field]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notation Style
          </label>
          <select
            value={notation}
            onChange={(e) => setNotation(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="d/dx">d/dx (Leibniz)</option>
            <option value="f'(x)">f'(x) (Prime)</option>
          </select>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={differentiate}
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

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl font-mono">
              {notation}({getFunctionString()}) = {result.derivative}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside bg-white p-3 rounded-md shadow-inner">
                {result.steps.map((step, i) => (
                  <li key={i} className="text-gray-600">{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Calculates derivatives of polynomials up to x³</li>
            <li>Supports Leibniz (d/dx) and Prime (f'(x)) notation</li>
            <li>Detailed step-by-step solution</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DerivativeCalculator;