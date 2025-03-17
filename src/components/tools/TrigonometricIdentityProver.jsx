"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaCalculator, FaBook } from "react-icons/fa";

const TrigonometricIdentityProver = () => {
  const [lhs, setLhs] = useState("");
  const [rhs, setRhs] = useState("");
  const [angle, setAngle] = useState("");
  const [unit, setUnit] = useState("degrees");
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState("numeric"); // Numeric or symbolic mode

  // Supported trigonometric functions
  const trigFunctions = ["sin", "cos", "tan", "csc", "sec", "cot"];

  // Evaluate expression numerically
  const evaluateExpression = (expr, rad) => {
    try {
      let evalExpr = expr
        .toLowerCase()
        .replace(/sin\(([^)]+)\)/g, (_, arg) => `Math.sin(${arg === "x" ? rad : parseFloat(arg)})`)
        .replace(/cos\(([^)]+)\)/g, (_, arg) => `Math.cos(${arg === "x" ? rad : parseFloat(arg)})`)
        .replace(/tan\(([^)]+)\)/g, (_, arg) => `Math.tan(${arg === "x" ? rad : parseFloat(arg)})`)
        .replace(/csc\(([^)]+)\)/g, (_, arg) => `1/Math.sin(${arg === "x" ? rad : parseFloat(arg)})`)
        .replace(/sec\(([^)]+)\)/g, (_, arg) => `1/Math.cos(${arg === "x" ? rad : parseFloat(arg)})`)
        .replace(/cot\(([^)]+)\)/g, (_, arg) => `1/Math.tan(${arg === "x" ? rad : parseFloat(arg)})`)
        .replace(/\^/g, "**")
        .replace(/pi/g, "Math.PI");

      return eval(evalExpr); // Using eval for simplicity; use a parser library like math.js for production
    } catch (e) {
      throw new Error("Invalid expression");
    }
  };

  // Verify identity (numeric or symbolic)
  const verifyIdentity = useCallback(() => {
    const steps = ["Verifying trigonometric identity:"];

    if (!lhs || !rhs) {
      return { error: "Both LHS and RHS are required" };
    }

    if (mode === "numeric" && !angle) {
      return { error: "Angle is required in numeric mode" };
    }

    let rad = null;
    if (mode === "numeric") {
      const angleValue = parseFloat(angle);
      if (isNaN(angleValue)) {
        return { error: "Angle must be a valid number" };
      }
      rad = unit === "degrees" ? (angleValue * Math.PI) / 180 : angleValue;
      steps.push(`Angle: ${angleValue} ${unit} = ${rad.toFixed(6)} radians`);
    }

    if (mode === "numeric") {
      let leftValue, rightValue;
      try {
        leftValue = evaluateExpression(lhs, rad);
        rightValue = evaluateExpression(rhs, rad);
      } catch (e) {
        return {
          error:
            "Invalid expression format (use sin(x), cos(x), tan(x), csc(x), sec(x), cot(x), ^ for power, pi)",
        };
      }

      steps.push(`LHS: ${lhs} = ${leftValue.toFixed(6)}`);
      steps.push(`RHS: ${rhs} = ${rightValue.toFixed(6)}`);

      const tolerance = 1e-6;
      const isEqual = Math.abs(leftValue - rightValue) < tolerance;
      steps.push(
        `Difference: |${leftValue.toFixed(6)} - ${rightValue.toFixed(6)}| = ${Math.abs(
          leftValue - rightValue
        ).toFixed(6)}`
      );
      steps.push(isEqual ? "Identity holds within tolerance" : "Identity does not hold for this angle");

      return { leftValue, rightValue, isEqual, steps };
    } else {
      // Symbolic mode: Check predefined identities
      const normalizedLhs = lhs.toLowerCase().replace(/\s+/g, "");
      const normalizedRhs = rhs.toLowerCase().replace(/\s+/g, "");
      let isEqual = false;

      const identities = [
        { lhs: "sin(x)^2+cos(x)^2", rhs: "1", name: "Pythagorean Identity" },
        { lhs: "1+tan(x)^2", rhs: "sec(x)^2", name: "Pythagorean Identity (tan-sec)" },
        { lhs: "1+cot(x)^2", rhs: "csc(x)^2", name: "Pythagorean Identity (cot-csc)" },
        { lhs: "sin(2*x)", rhs: "2*sin(x)*cos(x)", name: "Double-Angle Identity (sin)" },
        { lhs: "cos(2*x)", rhs: "cos(x)^2-sin(x)^2", name: "Double-Angle Identity (cos)" },
      ];

      const matchedIdentity = identities.find(
        (id) => (id.lhs === normalizedLhs && id.rhs === normalizedRhs) || (id.lhs === normalizedRhs && id.rhs === normalizedLhs)
      );

      if (matchedIdentity) {
        isEqual = true;
        steps.push(`Recognized identity: ${matchedIdentity.name}`);
        steps.push(`${matchedIdentity.lhs} = ${matchedIdentity.rhs}`);
      } else {
        steps.push("No recognized identity matched");
      }

      return { isEqual, steps };
    }
  }, [lhs, rhs, angle, unit, mode]);

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    if (field === "lhs") {
      setLhs(value);
      setErrors((prev) => ({ ...prev, lhs: value ? "" : "LHS is required" }));
    } else if (field === "rhs") {
      setRhs(value);
      setErrors((prev) => ({ ...prev, rhs: value ? "" : "RHS is required" }));
    } else if (field === "angle") {
      setAngle(value);
      setErrors((prev) => ({
        ...prev,
        angle: value && !isNaN(parseFloat(value)) ? "" : "Angle must be a number",
      }));
    }
    setResult(null);
  };

  // Validation
  const isValid = useMemo(() => {
    return (
      lhs &&
      rhs &&
      (mode === "symbolic" || (angle && !isNaN(parseFloat(angle)))) &&
      Object.values(errors).every((err) => !err)
    );
  }, [lhs, rhs, angle, errors, mode]);

  // Verify action
  const verify = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({ ...prev, general: "Please provide valid inputs" }));
      return;
    }

    const verResult = verifyIdentity();
    if (verResult.error) {
      setErrors({ general: verResult.error });
    } else {
      setResult(verResult);
      setHistory((prev) => [
        ...prev,
        {
          lhs,
          rhs,
          angle: mode === "numeric" ? `${angle} ${unit}` : "Symbolic",
          isEqual: verResult.isEqual,
          timestamp: new Date().toLocaleString(),
        },
      ].slice(-5)); // Keep last 5 entries
    }
  };

  // Reset state
  const reset = () => {
    setLhs("");
    setRhs("");
    setAngle("");
    setUnit("degrees");
    setMode("numeric");
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Trigonometric Identity Prover
        </h1>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="numeric">Numeric (Evaluate at Angle)</option>
            <option value="symbolic">Symbolic (Identity Check)</option>
          </select>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Left-Hand Side</label>
            <input
              type="text"
              value={lhs}
              onChange={handleInputChange("lhs")}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., sin(x)^2 + cos(x)^2"
            />
            {errors.lhs && <p className="text-red-600 text-sm mt-1">{errors.lhs}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Right-Hand Side</label>
            <input
              type="text"
              value={rhs}
              onChange={handleInputChange("rhs")}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 1"
            />
            {errors.rhs && <p className="text-red-600 text-sm mt-1">{errors.rhs}</p>}
          </div>
          {mode === "numeric" && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Angle</label>
                <input
                  type="number"
                  step="0.01"
                  value={angle}
                  onChange={handleInputChange("angle")}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 30"
                />
                {errors.angle && <p className="text-red-600 text-sm mt-1">{errors.angle}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="degrees">Degrees</option>
                  <option value="radians">Radians</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={verify}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Verify
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
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
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Result</h2>
            <p className="text-center text-xl">
              {result.isEqual ? "Identity holds" : "Identity does not hold"}{" "}
              {mode === "numeric" && `at ${angle} ${unit}`}
            </p>
            {mode === "numeric" && (
              <p className="text-center text-sm mt-2">
                LHS = {result.leftValue.toFixed(6)}, RHS = {result.rightValue.toFixed(6)}
              </p>
            )}
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
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
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">History (Last 5)</h3>
            <ul className="text-sm list-disc list-inside space-y-1">
              {history.slice().reverse().map((entry, i) => (
                <li key={i}>
                  {entry.lhs} = {entry.rhs} ({entry.angle}) -{" "}
                  {entry.isEqual ? "Holds" : "Does not hold"} at {entry.timestamp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features and Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
            <FaBook className="mr-2" /> Features & Instructions
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports sin(x), cos(x), tan(x), csc(x), sec(x), cot(x), and pi</li>
            <li>Numeric mode: Evaluates at a specific angle</li>
            <li>Symbolic mode: Checks against common identities</li>
            <li>Use ^ for powers (e.g., sin(x)^2)</li>
            <li>History of last 5 verifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TrigonometricIdentityProver;