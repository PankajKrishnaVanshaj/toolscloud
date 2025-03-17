"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaEye, FaEyeSlash } from "react-icons/fa";

const ExponentSimplifier = () => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [basePreference, setBasePreference] = useState("any"); // New: Base conversion option
  const [history, setHistory] = useState([]); // New: History of simplifications

  // Simplify exponent expression
  const simplifyExponent = useCallback(() => {
    const steps = ["Simplifying exponent expression:"];
    steps.push(`Original: ${expression}`);

    const trimmedExpr = expression.replace(/\s+/g, "");
    if (!trimmedExpr) {
      return { error: "Expression is required" };
    }

    // Enhanced regex to handle more complex cases
    const powerMatch = trimmedExpr.match(/^\(([^()]+)\)\^(\d+)$/); // (x^2)^3
    const productMatch = trimmedExpr.match(/^([^*/]+)\*([^*/]+)$/); // x^2 * x^3
    const quotientMatch = trimmedExpr.match(/^([^*/]+)\/([^*/]+)$/); // x^4 / x^2
    const mixedMatch = trimmedExpr.match(/^([^*/]+)([\*/])([^*/]+)$/); // x^2 * x^3 or x^4 / x^2
    const singleMatch = trimmedExpr.match(/^([a-zA-Z\d]+)\^(\d+)$/); // x^3 or 2^4

    if (!powerMatch && !productMatch && !quotientMatch && !mixedMatch && !singleMatch) {
      return {
        error:
          'Invalid format (use e.g., "x^2 * x^3", "x^4 / x^2", "(x^2)^3", "2^4")',
      };
    }

    let simplified;
    if (powerMatch) {
      // Power rule: (a^m)^n = a^(m*n)
      const [, inner, power] = powerMatch;
      const innerMatch = inner.match(/^([a-zA-Z\d]+)\^(\d+)$/);
      if (!innerMatch) {
        return { error: 'Invalid inner expression (use e.g., "x^2")' };
      }
      const [_, base, exp] = innerMatch;
      const newExp = parseInt(exp) * parseInt(power);
      simplified = `${base}^${newExp}`;
      steps.push(
        `Power rule: (${base}^${exp})^${power} = ${base}^(${exp} * ${power}) = ${simplified}`
      );
    } else if (productMatch || (mixedMatch && mixedMatch[2] === "*")) {
      // Product rule: a^m * a^n = a^(m+n)
      const [, left, right] = productMatch || mixedMatch;
      const leftMatch = left.match(/^([a-zA-Z\d]+)\^(\d+)$/);
      const rightMatch = right.match(/^([a-zA-Z\d]+)\^(\d+)$/);
      if (!leftMatch || !rightMatch || leftMatch[1] !== rightMatch[1]) {
        return { error: 'Bases must match (e.g., "x^2 * x^3")' };
      }
      const [_, base, leftExp] = leftMatch;
      const [, , rightExp] = rightMatch;
      const newExp = parseInt(leftExp) + parseInt(rightExp);
      simplified = `${base}^${newExp}`;
      steps.push(
        `Product rule: ${base}^${leftExp} * ${base}^${rightExp} = ${base}^(${leftExp} + ${rightExp}) = ${simplified}`
      );
    } else if (quotientMatch || (mixedMatch && mixedMatch[2] === "/")) {
      // Quotient rule: a^m / a^n = a^(m-n)
      const [, left, right] = quotientMatch || mixedMatch;
      const leftMatch = left.match(/^([a-zA-Z\d]+)\^(\d+)$/);
      const rightMatch = right.match(/^([a-zA-Z\d]+)\^(\d+)$/);
      if (!leftMatch || !rightMatch || leftMatch[1] !== rightMatch[1]) {
        return { error: 'Bases must match (e.g., "x^4 / x^2")' };
      }
      const [_, base, leftExp] = leftMatch;
      const [, , rightExp] = rightMatch;
      const newExp = parseInt(leftExp) - parseInt(rightExp);
      simplified = newExp === 0 ? "1" : newExp < 0 ? `1/${base}^${Math.abs(newExp)}` : `${base}^${newExp}`;
      steps.push(
        `Quotient rule: ${base}^${leftExp} / ${base}^${rightExp} = ${base}^(${leftExp} - ${rightExp}) = ${simplified}`
      );
    } else if (singleMatch) {
      steps.push("Single term detected");
      simplified = trimmedExpr;
    }

    // Numerical evaluation or base conversion
    const numMatch = simplified.match(/^(\d+)\^(\d+)$/);
    let value;
    if (numMatch && basePreference === "numeric") {
      const [, base, exp] = numMatch;
      value = Math.pow(parseInt(base), parseInt(exp));
      steps.push(`Numerical evaluation: ${base}^${exp} = ${value}`);
    } else if (numMatch && basePreference !== "any" && basePreference !== "numeric") {
      // Convert to specified base (e.g., 2 for binary)
      const [, base, exp] = numMatch;
      const numericValue = Math.pow(parseInt(base), parseInt(exp));
      const newBase = parseInt(basePreference);
      const newExp = Math.round(Math.log(numericValue) / Math.log(newBase));
      simplified = `${newBase}^${newExp}`;
      steps.push(
        `Base conversion to ${newBase}: ${base}^${exp} = ${numericValue} = ${simplified}`
      );
      value = numericValue;
    }

    return { simplified, value, steps };
  }, [expression, basePreference]);

  // Handle input changes
  const handleExpressionChange = (e) => {
    const value = e.target.value;
    setExpression(value);
    setResult(null);
    setErrors((prev) => ({
      ...prev,
      expression: value.trim() ? "" : "Expression is required",
    }));
  };

  // Validate input
  const isValid = useMemo(() => {
    return expression.trim() !== "" && !errors.expression;
  }, [expression, errors]);

  // Simplify and add to history
  const simplify = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please provide a valid exponent expression" });
      return;
    }

    const simpResult = simplifyExponent();
    if (simpResult.error) {
      setErrors({ general: simpResult.error });
    } else {
      setResult(simpResult);
      setHistory((prev) => [
        { expression, simplified: simpResult.simplified, value: simpResult.value },
        ...prev.slice(0, 9), // Keep last 10 entries
      ]);
    }
  };

  // Reset state
  const reset = () => {
    setExpression("");
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setBasePreference("any");
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Exponent Simplifier
        </h1>

        {/* Input and Settings */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expression
              </label>
              <input
                type="text"
                value={expression}
                onChange={handleExpressionChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., x^2 * x^3, (2^2)^3"
              />
              {errors.expression && (
                <p className="text-red-600 text-sm mt-1">{errors.expression}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Result Base
              </label>
              <select
                value={basePreference}
                onChange={(e) => setBasePreference(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Keep Original</option>
                <option value="numeric">Numeric Value</option>
                <option value="2">Base 2 (Binary)</option>
                <option value="10">Base 10</option>
              </select>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={simplify}
              disabled={!isValid}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              Simplify
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-center">
              {errors.general}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Result</h2>
              <p className="text-xl text-center">{result.simplified}</p>
              {result.value && (
                <p className="text-center text-sm mt-1">Value: {result.value}</p>
              )}
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center mx-auto mt-2 text-blue-600 hover:underline"
              >
                {showSteps ? <FaEyeSlash className="mr-1" /> : <FaEye className="mr-1" />}
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
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
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">History</h3>
              <ul className="text-sm space-y-2 max-h-40 overflow-y-auto">
                {history.map((item, index) => (
                  <li
                    key={index}
                    className="p-2 bg-white rounded-md shadow-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => setExpression(item.expression)}
                  >
                    {item.expression} → {item.simplified}{" "}
                    {item.value && `(= ${item.value})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports product, quotient, and power rules</li>
            <li>Base conversion (numeric, binary, base 10)</li>
            <li>Detailed step-by-step explanation</li>
            <li>History of previous simplifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExponentSimplifier;