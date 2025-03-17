"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const PolynomialRootApproximator = () => {
  const [coefficients, setCoefficients] = useState({ a: "", b: "", c: "" });
  const [initialGuess, setInitialGuess] = useState("0");
  const [maxIterations, setMaxIterations] = useState("20");
  const [tolerance, setTolerance] = useState("0.000001"); // Convergence tolerance
  const [method, setMethod] = useState("newton"); // Approximation method
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Evaluate polynomial at x
  const evaluatePoly = (coeffs, x) => {
    const { a, b, c } = coeffs;
    return (a || 0) * x * x + (b || 0) * x + (c || 0);
  };

  // Evaluate derivative of polynomial at x
  const evaluateDerivative = (coeffs, x) => {
    const { a, b } = coeffs;
    return 2 * (a || 0) * x + (b || 0);
  };

  // Newton-Raphson method
  const newtonRaphson = (coeffs, x0, maxIter, tol) => {
    const steps = [`Newton-Raphson with initial guess x₀ = ${x0}:`];
    let x = x0;
    const polyStr = `${coeffs.a || 0}x² + ${coeffs.b || 0}x + ${coeffs.c || 0}`;

    for (let i = 0; i < maxIter; i++) {
      const fx = evaluatePoly(coeffs, x);
      const dfx = evaluateDerivative(coeffs, x);

      if (Math.abs(dfx) < tol) {
        steps.push(`Iteration ${i + 1}: Derivative ≈ 0 at x = ${x.toFixed(6)}, method stalled`);
        return { root: null, steps, converged: false };
      }

      const nextX = x - fx / dfx;
      steps.push(
        `Iteration ${i + 1}: x_${i + 1} = ${x.toFixed(6)} - f(${x.toFixed(
          6
        )}) / f'(${x.toFixed(6)}) = ${nextX.toFixed(6)}`
      );
      steps.push(`f(${x.toFixed(6)}) = ${fx.toFixed(6)}, f'(${x.toFixed(6)}) = ${dfx.toFixed(6)}`);

      if (Math.abs(nextX - x) < tol) {
        steps.push(`Converged to root x ≈ ${nextX.toFixed(6)} after ${i + 1} iterations`);
        return { root: nextX.toFixed(6), steps, converged: true };
      }
      x = nextX;
    }
    steps.push(`Did not converge within ${maxIter} iterations, last x = ${x.toFixed(6)}`);
    return { root: x.toFixed(6), steps, converged: false };
  };

  // Bisection method
  const bisection = (coeffs, a, b, maxIter, tol) => {
    const steps = [`Bisection method with interval [${a}, ${b}]:`];
    let left = a;
    let right = b;

    if (evaluatePoly(coeffs, left) * evaluatePoly(coeffs, right) >= 0) {
      steps.push("f(a) and f(b) must have opposite signs for bisection to work");
      return { root: null, steps, converged: false };
    }

    for (let i = 0; i < maxIter; i++) {
      const mid = (left + right) / 2;
      const fMid = evaluatePoly(coeffs, mid);
      steps.push(
        `Iteration ${i + 1}: Midpoint = ${mid.toFixed(6)}, f(${mid.toFixed(6)}) = ${fMid.toFixed(
          6
        )}`
      );

      if (Math.abs(fMid) < tol || (right - left) / 2 < tol) {
        steps.push(`Converged to root x ≈ ${mid.toFixed(6)} after ${i + 1} iterations`);
        return { root: mid.toFixed(6), steps, converged: true };
      }

      if (fMid * evaluatePoly(coeffs, left) < 0) {
        right = mid;
      } else {
        left = mid;
      }
    }
    const finalMid = (left + right) / 2;
    steps.push(`Did not converge within ${maxIter} iterations, last x = ${finalMid.toFixed(6)}`);
    return { root: finalMid.toFixed(6), steps, converged: false };
  };

  // Approximate roots based on method
  const approximateRoots = useCallback(() => {
    const coeffs = {
      a: parseFloat(coefficients.a) || 0,
      b: parseFloat(coefficients.b) || 0,
      c: parseFloat(coefficients.c) || 0,
    };
    const x0 = parseFloat(initialGuess) || 0;
    const maxIter = parseInt(maxIterations) || 20;
    const tol = parseFloat(tolerance) || 0.000001;

    if (coeffs.a === 0 && coeffs.b === 0) {
      return { error: "Polynomial must have at least one non-zero coefficient (excluding constant)" };
    }

    const roots = [];
    let rootResult;

    if (method === "newton") {
      rootResult = newtonRaphson(coeffs, x0, maxIter, tol);
      if (rootResult.root) roots.push(rootResult.root);
      if (coeffs.a !== 0) {
        const secondGuess = x0 + 1;
        const secondResult = newtonRaphson(coeffs, secondGuess, maxIter, tol);
        if (secondResult.root && secondResult.root !== roots[0]) {
          roots.push(secondResult.root);
          rootResult.steps.push(...secondResult.steps.slice(1));
        }
      }
    } else if (method === "bisection") {
      const intervalOffset = 5; // Default interval size
      rootResult = bisection(coeffs, x0 - intervalOffset, x0 + intervalOffset, maxIter, tol);
      if (rootResult.root) roots.push(rootResult.root);
    }

    return { roots, steps: rootResult.steps };
  }, [coefficients, initialGuess, maxIterations, tolerance, method]);

  // Input handlers
  const handleInputChange = (setter, field) => (e) => {
    const value = e.target.value;
    setter(value);
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a number" }));
    } else if (field === "maxIterations" && (parseInt(value) <= 0 || !Number.isInteger(parseFloat(value)))) {
      setErrors((prev) => ({ ...prev, [field]: "Must be a positive integer" }));
    } else if (field === "tolerance" && parseFloat(value) <= 0) {
      setErrors((prev) => ({ ...prev, [field]: "Must be positive" }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validation
  const isValid = useMemo(() => {
    const coeffsValid = Object.values(coefficients).some((val) => val && !isNaN(parseFloat(val)));
    const guessValid = initialGuess && !isNaN(parseFloat(initialGuess));
    const iterValid = maxIterations && !isNaN(parseInt(maxIterations)) && parseInt(maxIterations) > 0;
    const tolValid = tolerance && !isNaN(parseFloat(tolerance)) && parseFloat(tolerance) > 0;
    return coeffsValid && guessValid && iterValid && tolValid && Object.values(errors).every((err) => !err);
  }, [coefficients, initialGuess, maxIterations, tolerance, errors]);

  // Approximate roots
  const approximate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({ ...prev, general: "Please provide valid inputs" }));
      return;
    }

    const approxResult = approximateRoots();
    if (approxResult.error) {
      setErrors({ general: approxResult.error });
    } else {
      setResult(approxResult);
    }
  };

  // Reset state
  const reset = () => {
    setCoefficients({ a: "", b: "", c: "" });
    setInitialGuess("0");
    setMaxIterations("20");
    setTolerance("0.000001");
    setMethod("newton");
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Polynomial Root Approximator
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {["a", "b", "c"].map((field) => (
            <div key={field} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="w-32 text-sm font-medium text-gray-700">
                {field} ({field === "a" ? "x²" : field === "b" ? "x" : "constant"}):
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={coefficients[field]}
                  onChange={handleInputChange(
                    (val) => setCoefficients((prev) => ({ ...prev, [field]: val })),
                    field
                  )}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === "a" ? "1" : field === "b" ? "-4" : "4"}`}
                  aria-label={`${field} coefficient`}
                />
                {errors[field] && <p className="text-red-600 text-xs mt-1">{errors[field]}</p>}
              </div>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-32 text-sm font-medium text-gray-700">Initial Guess:</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={initialGuess}
                onChange={handleInputChange(setInitialGuess, "initialGuess")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0"
                aria-label="Initial guess"
              />
              {errors.initialGuess && (
                <p className="text-red-600 text-xs mt-1">{errors.initialGuess}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-32 text-sm font-medium text-gray-700">Max Iterations:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={maxIterations}
                onChange={handleInputChange(setMaxIterations, "maxIterations")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20"
                aria-label="Maximum iterations"
              />
              {errors.maxIterations && (
                <p className="text-red-600 text-xs mt-1">{errors.maxIterations}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-32 text-sm font-medium text-gray-700">Tolerance:</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.000001"
                value={tolerance}
                onChange={handleInputChange(setTolerance, "tolerance")}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0.000001"
                aria-label="Tolerance"
              />
              {errors.tolerance && <p className="text-red-600 text-xs mt-1">{errors.tolerance}</p>}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label className="w-32 text-sm font-medium text-gray-700">Method:</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full sm:w-auto flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="newton">Newton-Raphson</option>
              <option value="bisection">Bisection</option>
            </select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={approximate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Approximate
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
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Approximated Roots:</h2>
            {result.roots.length > 0 ? (
              <ul className="text-center text-xl space-y-1">
                {result.roots.map((root, i) => (
                  <li key={i} className="text-blue-600">
                    x ≈ {root}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-xl text-gray-600">No roots found within iterations</p>
            )}
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside max-h-48 overflow-y-auto bg-white p-2 rounded-md shadow-inner">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-200">
          <h3 className="font-semibold text-green-700 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" /> Features
          </h3>
          <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
            <li>Supports quadratic polynomials (ax² + bx + c)</li>
            <li>Newton-Raphson and Bisection methods</li>
            <li>Customizable initial guess, iterations, and tolerance</li>
            <li>Detailed iteration steps</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PolynomialRootApproximator;