"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaDownload } from "react-icons/fa";

const PolynomialFactorizer = () => {
  const [degree, setDegree] = useState(2); // Default to quadratic
  const [coefficients, setCoefficients] = useState({ a: "", b: "", c: "" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [factorMethod, setFactorMethod] = useState("roots"); // "roots" or "trial"

  // Generate dynamic input fields based on degree
  const getInputFields = useMemo(() => {
    return Array.from({ length: degree + 1 }, (_, i) => ({
      key: String.fromCharCode(97 + (degree - i)), // 'a' for highest degree
      label: i === degree ? "constant" : `x${i === degree - 1 ? "" : "²"}`,
      power: i,
    }));
  }, [degree]);

  // Factorize polynomial
  const factorPolynomial = useCallback((coeffs) => {
    const steps = [];
    const numCoeffs = Object.values(coeffs).map(Number);
    const leadingCoeff = numCoeffs[0];

    steps.push(
      `Factorizing: ${Object.entries(coeffs)
        .map(([key, val], i) => `${val}x${degree - i}`)
        .join(" + ")
        .replace(/\+ -/g, "- ")}`
    );

    if (numCoeffs.some(isNaN)) {
      return { error: "All coefficients must be valid numbers" };
    }
    if (leadingCoeff === 0) {
      return { error: "Leading coefficient cannot be zero" };
    }

    if (degree === 2) {
      const [a, b, c] = numCoeffs;
      const discriminant = b * b - 4 * a * c;
      steps.push(`Discriminant (Δ) = ${b}² - 4 × ${a} × ${c} = ${discriminant}`);

      if (discriminant < 0) {
        steps.push("Δ < 0: No real factors exist.");
        return { factors: null, steps, isFactorable: false };
      }

      const sqrtDisc = Math.sqrt(discriminant);
      const root1 = (-b + sqrtDisc) / (2 * a);
      const root2 = (-b - sqrtDisc) / (2 * a);
      steps.push(`Roots: x = (${-b} ± √${discriminant}) / (2 × ${a})`);
      steps.push(`x₁ = ${root1.toFixed(2)}, x₂ = ${root2.toFixed(2)}`);

      const factors =
        a === 1
          ? `(x - ${root1.toFixed(2)})(x - ${root2.toFixed(2)})`
          : `${a}(x - ${root1.toFixed(2)})(x - ${root2.toFixed(2)})`;
      steps.push(`Factors: ${factors}`);
      return { factors, steps, isFactorable: true };
    } else {
      // Placeholder for higher degrees (simplified simulation)
      steps.push("For degrees > 2, using synthetic division simulation:");
      const roots = [];
      for (let i = -10; i <= 10; i++) {
        const value = numCoeffs.reduce((sum, coeff, idx) => {
          return sum + coeff * Math.pow(i, degree - idx);
        }, 0);
        if (Math.abs(value) < 0.01) roots.push(i); // Approximate roots
      }
      steps.push(`Possible integer roots: ${roots.join(", ")}`);
      if (roots.length > 0) {
        const factors = roots.map((r) => `(x - ${r})`).join("");
        steps.push(`Factors (partial): ${leadingCoeff}${factors}`);
        return { factors: `${leadingCoeff}${factors}`, steps, isFactorable: true };
      } else {
        steps.push("No simple integer factors found.");
        return { factors: null, steps, isFactorable: false };
      }
    }
  }, [degree]);

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setCoefficients((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (!value) {
      setErrors((prev) => ({ ...prev, [field]: "This field is required" }));
    } else if (isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a valid number" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle degree change
  const handleDegreeChange = (e) => {
    const newDegree = parseInt(e.target.value);
    setDegree(newDegree);
    setCoefficients(
      Object.fromEntries(
        Array.from({ length: newDegree + 1 }, (_, i) =>
          [String.fromCharCode(97 + (newDegree - i)), ""]
        )
      )
    );
    setResult(null);
    setErrors({});
  };

  // Validate inputs
  const isValid = useMemo(() => {
    return getInputFields.every(
      (field) =>
        coefficients[field.key] &&
        !isNaN(parseFloat(coefficients[field.key])) &&
        !errors[field.key]
    );
  }, [coefficients, errors, getInputFields]);

  // Perform factorization
  const factorize = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors({ general: "Please fill all fields with valid numbers" });
      return;
    }

    const calcResult = factorPolynomial(coefficients);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setDegree(2);
    setCoefficients({ a: "", b: "", c: "" });
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setFactorMethod("roots");
  };

  // Download result as text
  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Polynomial: ${Object.entries(coefficients)
        .map(([key, val], i) => `${val}x${degree - i}`)
        .join(" + ")
        .replace(/\+ -/g, "- ")}`,
      `Factors: ${result.factors || "None"}`,
      ...(showSteps ? ["Steps:"] : []),
      ...(showSteps ? result.steps : []),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `factorization-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Polynomial Factorizer
        </h1>

        {/* Degree Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Polynomial Degree (2-4)
          </label>
          <input
            type="number"
            min="2"
            max="4"
            value={degree}
            onChange={handleDegreeChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          {getInputFields.map((field) => (
            <div key={field.key} className="flex flex-col sm:flex-row items-center gap-2">
              <label className="w-32 text-gray-700">
                {field.key.toUpperCase()} ({field.label}):
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={coefficients[field.key]}
                  onChange={handleInputChange(field.key)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field.power === degree ? "1" : field.power === 0 ? "6" : "-5"}`}
                  aria-label={`${field.key} coefficient`}
                />
                {errors[field.key] && (
                  <p className="text-red-600 text-sm mt-1">{errors[field.key]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Method Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Factorization Method
          </label>
          <select
            value={factorMethod}
            onChange={(e) => setFactorMethod(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="roots">Roots (Quadratic Formula)</option>
            <option value="trial">Trial Division (Higher Degrees)</option>
          </select>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={factorize}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Factorize
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadResult}
            disabled={!result}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl">
              {result.isFactorable
                ? `${Object.entries(coefficients)
                    .map(([key, val], i) => `${val}x${degree - i}`)
                    .join(" + ")
                    .replace(/\+ -/g, "- ")} = ${result.factors}`
                : "No real factors exist."}
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
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports polynomials up to degree 4</li>
            <li>Quadratic formula for degree 2</li>
            <li>Trial division simulation for higher degrees</li>
            <li>Detailed step-by-step breakdown</li>
            <li>Download result as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PolynomialFactorizer;