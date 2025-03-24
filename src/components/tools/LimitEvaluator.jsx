"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaCalculator, FaInfinity } from "react-icons/fa";

const LimitEvaluator = () => {
  const [func, setFunc] = useState("");
  const [point, setPoint] = useState("");
  const [direction, setDirection] = useState("both"); // New: left, right, or both-sided limit
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(4); // New: precision control

  // Simple function parser and evaluator
  const evaluateFunction = (x, expr) => {
    try {
      const sanitizedExpr = expr
        .replace(/\^/g, "**")
        .replace(/x/g, `(${x})`)
        .replace(/sin/g, "Math.sin")
        .replace(/cos/g, "Math.cos")
        .replace(/tan/g, "Math.tan")
        .replace(/ln/g, "Math.log")
        .replace(/sqrt/g, "Math.sqrt");
      return eval(sanitizedExpr); // Note: eval is used for simplicity; use a parser in production
    } catch {
      return NaN;
    }
  };

  // Evaluate limit with direction
  const evaluateLimit = useCallback(() => {
    const steps = ["Evaluating limit:"];
    if (!func) return { error: "Function is required" };
    if (!point) return { error: "Limit point is required" };

    const isInfinity =
      point.toLowerCase() === "infinity" ||
      point.toLowerCase() === "∞" ||
      point.toLowerCase() === "-infinity" ||
      point.toLowerCase() === "-∞";
    const x0 = isInfinity ? (point.includes("-") ? -Infinity : Infinity) : parseFloat(point);

    if (!isInfinity && (isNaN(x0) || point.trim() === "")) {
      return { error: 'Limit point must be a number or "infinity"/"-infinity"' };
    }

    steps.push(`Function: f(x) = ${func}`);
    steps.push(`Limit as x approaches ${isInfinity ? point : x0} (${direction}-sided)`);

    if (isInfinity) {
      const largeX = x0 === Infinity ? 1e6 : -1e6;
      const value = evaluateFunction(largeX, func);
      steps.push(`Approximate at x = ${largeX}: f(x) = ${isFinite(value) ? value.toFixed(decimalPlaces) : value}`);

      if (!isFinite(value)) {
        steps.push(`Result: ${value > 0 ? "∞" : "-∞"}`);
        return { result: value > 0 ? "∞" : "-∞", steps };
      } else {
        steps.push(`Result appears to approach ${value.toFixed(decimalPlaces)}`);
        return { result: value.toFixed(decimalPlaces), steps };
      }
    } else {
      const epsilon = 0.0001;
      const leftX = x0 - epsilon;
      const rightX = x0 + epsilon;
      const leftVal = evaluateFunction(leftX, func);
      const rightVal = evaluateFunction(rightX, func);
      const atX0 = evaluateFunction(x0, func);

      if (direction === "left" || direction === "both") {
        steps.push(`Left limit (x = ${leftX}): f(x) = ${isFinite(leftVal) ? leftVal.toFixed(decimalPlaces) : leftVal}`);
      }
      if (direction === "right" || direction === "both") {
        steps.push(`Right limit (x = ${rightX}): f(x) = ${isFinite(rightVal) ? rightVal.toFixed(decimalPlaces) : rightVal}`);
      }
      steps.push(`At x = ${x0}: f(x) = ${isFinite(atX0) ? atX0.toFixed(decimalPlaces) : atX0}`);

      let limitVal;
      if (direction === "left") {
        limitVal = leftVal;
      } else if (direction === "right") {
        limitVal = rightVal;
      } else {
        if (!isFinite(leftVal) || !isFinite(rightVal)) {
          const signMatch = (leftVal > 0 && rightVal > 0) || (leftVal < 0 && rightVal < 0);
          steps.push(`Result: ${signMatch ? (leftVal > 0 ? "∞" : "-∞") : "Does not exist (diverges)"}`);
          return { result: signMatch ? (leftVal > 0 ? "∞" : "-∞") : "DNE", steps };
        }
        if (Math.abs(leftVal - rightVal) < 0.01) {
          limitVal = (leftVal + rightVal) / 2;
          steps.push(`Left and right limits agree: ${limitVal.toFixed(decimalPlaces)}`);
        } else {
          steps.push("Left and right limits differ: Limit does not exist");
          return { result: "DNE", steps };
        }
      }

      if (!isFinite(limitVal)) {
        steps.push(`Result: ${limitVal > 0 ? "∞" : "-∞"}`);
        return { result: limitVal > 0 ? "∞" : "-∞", steps };
      }

      if (isNaN(atX0) || !isFinite(atX0)) {
        steps.push(`Direct substitution gives indeterminate form`);
        steps.push("Numerical approximation used (advanced methods like L’Hôpital’s may be needed)");
      }

      steps.push(`Result: ${limitVal.toFixed(decimalPlaces)}`);
      return { result: limitVal.toFixed(decimalPlaces), steps };
    }
  }, [func, point, direction, decimalPlaces]);

  // Input handlers
  const handleFuncChange = (e) => {
    const value = e.target.value;
    setFunc(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, func: value ? "" : "Function is required" }));
  };

  const handlePointChange = (e) => {
    const value = e.target.value;
    setPoint(value);
    setResult(null);
    const isInf = ["infinity", "∞", "-infinity", "-∞"].includes(value.toLowerCase());
    if (!value) {
      setErrors((prev) => ({ ...prev, point: "Limit point is required" }));
    } else if (!isInf && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, point: 'Must be a number or "infinity"/"-infinity"' }));
    } else {
      setErrors((prev) => ({ ...prev, point: "" }));
    }
  };

  // Validation
  const isValid = useMemo(() => {
    const isInf = ["infinity", "∞", "-infinity", "-∞"].includes(point.toLowerCase());
    return (
      func.trim() !== "" &&
      (isInf || (!isNaN(parseFloat(point)) && point.trim() !== "")) &&
      Object.values(errors).every((err) => !err)
    );
  }, [func, point, errors]);

  // Evaluate limit
  const evaluate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: "Please provide a valid function and limit point",
      }));
      return;
    }

    const evalResult = evaluateLimit();
    if (evalResult.error) {
      setErrors({ general: evalResult.error });
    } else {
      setResult(evalResult);
    }
  };

  // Reset state
  const reset = () => {
    setFunc("");
    setPoint("");
    setDirection("both");
    setDecimalPlaces(4);
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center gap-2">
          <FaCalculator /> Limit Evaluator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Function f(x)
              </label>
              <input
                type="text"
                value={func}
                onChange={handleFuncChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., x^2 - 4, sin(x), 1/x"
                aria-label="Function"
              />
              {errors.func && <p className="text-red-600 text-xs mt-1">{errors.func}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                x approaches
              </label>
              <input
                type="text"
                value={point}
                onChange={handlePointChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2, infinity, -infinity"
                aria-label="Limit point"
              />
              {errors.point && <p className="text-red-600 text-xs mt-1">{errors.point}</p>}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="both">Both-sided</option>
                <option value="left">Left-sided</option>
                <option value="right">Right-sided</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places ({decimalPlaces})
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={evaluate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Evaluate
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold flex items-center justify-center"
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Limit:</h2>
            <p className="text-center text-xl font-mono">
              lim<sub>x→{point}{direction === "left" ? "⁻" : direction === "right" ? "⁺" : ""}</sub> {func} = {result.result}
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

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Supports basic functions (e.g., x^2, sin(x), 1/x)</li>
            <li>Handles infinity and negative infinity</li>
            <li>Left, right, or both-sided limits</li>
            <li>Adjustable decimal precision</li>
            <li>Detailed step-by-step evaluation</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default LimitEvaluator;