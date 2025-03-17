"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaCalculator, FaInfoCircle } from "react-icons/fa";

const ComplexNumberSolver = () => {
  const [operation, setOperation] = useState("add");
  const [num1, setNum1] = useState({ real: "", imag: "" });
  const [num2, setNum2] = useState({ real: "", imag: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(4); // Decimal precision for results

  // Calculate complex number operation
  const calculateComplex = useCallback(
    (op, n1, n2) => {
      const steps = [`Performing ${op} on complex numbers:`];
      const a = parseFloat(n1.real) || 0;
      const b = parseFloat(n1.imag) || 0;
      const c = parseFloat(n2.real) || 0;
      const d = parseFloat(n2.imag) || 0;

      if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
        return { error: "All parts must be valid numbers" };
      }

      steps.push(`z₁ = ${a} ${b >= 0 ? "+" : ""} ${b}i`);
      if (op !== "magnitude" && op !== "conjugate" && op !== "polar")
        steps.push(`z₂ = ${c} ${d >= 0 ? "+" : ""} ${d}i`);

      let real, imag;
      switch (op) {
        case "add":
          real = a + c;
          imag = b + d;
          steps.push(`Addition: (${a} + ${c}) + (${b} + ${d})i`);
          steps.push(`Result: ${real} + ${imag}i`);
          break;
        case "subtract":
          real = a - c;
          imag = b - d;
          steps.push(`Subtraction: (${a} - ${c}) + (${b} - ${d})i`);
          steps.push(`Result: ${real} + ${imag}i`);
          break;
        case "multiply":
          real = a * c - b * d;
          imag = a * d + b * c;
          steps.push(`Multiplication: (${a} + ${b}i) * (${c} + ${d}i)`);
          steps.push(`= (${a} * ${c} - ${b} * ${d}) + (${a} * ${d} + ${b} * ${c})i`);
          steps.push(`= ${real} + ${imag}i`);
          break;
        case "divide":
          const denominator = c * c + d * d;
          if (denominator === 0) {
            steps.push("Division by zero is undefined.");
            return { error: "Cannot divide by zero (z₂ = 0 + 0i)" };
          }
          real = (a * c + b * d) / denominator;
          imag = (b * c - a * d) / denominator;
          steps.push(`Division: (${a} + ${b}i) / (${c} + ${d}i)`);
          steps.push(
            `Multiply by conjugate: [(${a} + ${b}i) * (${c} - ${d}i)] / [(${c} + ${d}i) * (${c} - ${d}i)]`
          );
          steps.push(`= [${a * c + b * d} + ${b * c - a * d}i] / ${denominator}`);
          steps.push(`= ${real.toFixed(precision)} + ${imag.toFixed(precision)}i`);
          break;
        case "magnitude":
          const mag = Math.sqrt(a * a + b * b);
          steps.push(`Magnitude: |z₁| = √(${a}² + ${b}²)`);
          steps.push(`= √(${a * a + b * b}) = ${mag.toFixed(precision)}`);
          return { result: mag.toFixed(precision), steps, scalar: true };
        case "conjugate":
          real = a;
          imag = -b;
          steps.push(`Conjugate: z₁* = ${a} - ${b}i`);
          break;
        case "polar":
          const r = Math.sqrt(a * a + b * b);
          const theta = Math.atan2(b, a) * (180 / Math.PI); // Convert to degrees
          steps.push(`Polar Form: z₁ = r(cosθ + i sinθ)`);
          steps.push(`r = √(${a}² + ${b}²) = ${r.toFixed(precision)}`);
          steps.push(`θ = atan2(${b}, ${a}) = ${theta.toFixed(precision)}°`);
          return {
            result: { r: r.toFixed(precision), theta: theta.toFixed(precision) },
            steps,
            polar: true,
          };
        default:
          return { error: "Invalid operation" };
      }

      return { result: { real: real.toFixed(precision), imag: imag.toFixed(precision) }, steps };
    },
    [precision]
  );

  // Handle input changes with validation
  const handleInputChange = (num, field) => (e) => {
    const value = e.target.value;
    const setter = num === "num1" ? setNum1 : setNum2;
    setter((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${num}${field}`]: "Must be a number" }));
    } else {
      setErrors((prev) => ({ ...prev, [`${num}${field}`]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const num1Valid =
      (num1.real || num1.real === "0") &&
      !isNaN(parseFloat(num1.real)) &&
      (num1.imag || num1.imag === "0") &&
      !isNaN(parseFloat(num1.imag));
    const num2Valid =
      (num2.real || num2.real === "0") &&
      !isNaN(parseFloat(num2.real)) &&
      (num2.imag || num2.imag === "0") &&
      !isNaN(parseFloat(num2.imag));
    return (
      num1Valid &&
      (["magnitude", "conjugate", "polar"].includes(operation) ? true : num2Valid) &&
      Object.values(errors).every((err) => !err)
    );
  }, [num1, num2, operation, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: "Please fill all fields with valid numbers",
      }));
      return;
    }

    const calcResult = calculateComplex(operation, num1, num2);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setOperation("add");
    setNum1({ real: "", imag: "" });
    setNum2({ real: "", imag: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setPrecision(4);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Complex Number Solver
        </h1>

        {/* Operation Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {["add", "subtract", "multiply", "divide", "magnitude", "conjugate", "polar"].map(
            (op) => (
              <button
                key={op}
                onClick={() => setOperation(op)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  operation === op
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {op.charAt(0).toUpperCase() + op.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          {/* Number 1 */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <label className="w-24 text-sm font-medium text-gray-700">z₁ (a + bi):</label>
            <div className="flex flex-1 items-center gap-2">
              <input
                type="number"
                step="any"
                value={num1.real}
                onChange={handleInputChange("num1", "real")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Real (a)"
                aria-label="Real part of z1"
              />
              <span className="text-gray-500">+</span>
              <input
                type="number"
                step="any"
                value={num1.imag}
                onChange={handleInputChange("num1", "imag")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Imag (b)"
                aria-label="Imaginary part of z1"
              />
              <span className="text-gray-500">i</span>
            </div>
          </div>
          {(errors["num1real"] || errors["num1imag"]) && (
            <div className="text-red-600 text-sm ml-24">
              {errors["num1real"] || errors["num1imag"]}
            </div>
          )}

          {/* Number 2 */}
          {!["magnitude", "conjugate", "polar"].includes(operation) && (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <label className="w-24 text-sm font-medium text-gray-700">z₂ (c + di):</label>
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={num2.real}
                    onChange={handleInputChange("num2", "real")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Real (c)"
                    aria-label="Real part of z2"
                  />
                  <span className="text-gray-500">+</span>
                  <input
                    type="number"
                    step="any"
                    value={num2.imag}
                    onChange={handleInputChange("num2", "imag")}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Imag (d)"
                    aria-label="Imaginary part of z2"
                  />
                  <span className="text-gray-500">i</span>
                </div>
              </div>
              {(errors["num2real"] || errors["num2imag"]) && (
                <div className="text-red-600 text-sm ml-24">
                  {errors["num2real"] || errors["num2imag"]}
                </div>
              )}
            </>
          )}
        </div>

        {/* Settings */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precision (decimals): {precision}
          </label>
          <input
            type="range"
            min="1"
            max="6"
            value={precision}
            onChange={(e) => setPrecision(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate
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
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl">
              {result.scalar
                ? result.result
                : result.polar
                ? `${result.result.r} (cos ${result.result.theta}° + i sin ${result.result.theta}°)`
                : `${result.result.real} ${result.result.imag >= 0 ? "+" : ""} ${result.result.imag}i`}
            </p>
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

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" /> Features
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Operations: Add, Subtract, Multiply, Divide, Magnitude, Conjugate, Polar Form</li>
            <li>Step-by-step calculation breakdown</li>
            <li>Adjustable decimal precision (1-6)</li>
            <li>Real-time input validation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComplexNumberSolver;