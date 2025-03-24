"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const GaussianEliminator = () => {
  const [size, setSize] = useState(2); // Matrix size (2x2, 3x3, 4x4)
  const [equations, setEquations] = useState(
    Array(4).fill().map(() => Array(5).fill("")) // [a, b, c, d, e] for ax + by + cz + dw = e
  );
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(2); // Decimal precision for solutions

  // Solve system using Gaussian elimination with partial pivoting
  const solveGaussian = useCallback((eqs, n) => {
    const steps = [`Solving ${n}x${n} system using Gaussian elimination:`];
    const A = eqs.map((row) => row.map((val) => parseFloat(val) || 0));

    // Validate inputs
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n + 1; j++) {
        if (isNaN(A[i][j])) {
          return { error: "All coefficients and constants must be valid numbers", steps };
        }
      }
    }

    steps.push("Initial augmented matrix:");
    steps.push(
      ...A.map((row, i) =>
        `${row
          .slice(0, n)
          .map((coef, j) => `${coef}${["x", "y", "z", "w"][j]}`)
          .join(" + ")} = ${row[n]}`
      )
    );

    // Gaussian elimination with partial pivoting
    for (let i = 0; i < n; i++) {
      let maxEl = Math.abs(A[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > maxEl) {
          maxEl = Math.abs(A[k][i]);
          maxRow = k;
        }
      }

      if (maxRow !== i) {
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        steps.push(`Pivot: Swap row ${i + 1} with row ${maxRow + 1}`);
        steps.push(
          ...A.map((row, k) =>
            `R${k + 1}: ${row
              .slice(0, n)
              .map((coef, j) => `${coef.toFixed(precision)}${["x", "y", "z", "w"][j]}`)
              .join(" + ")} = ${row[n].toFixed(precision)}`
          )
        );
      }

      if (A[i][i] === 0) {
        steps.push("Pivot element is zero: System has no unique solution.");
        return { error: "System has no unique solution (singular matrix)", steps };
      }

      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = A[k][i] / A[i][i];
          for (let j = i; j <= n; j++) {
            A[k][j] -= factor * A[i][j];
          }
          steps.push(`R${k + 1} = R${k + 1} - (${factor.toFixed(precision)}) * R${i + 1}`);
          steps.push(
            ...A.map((row, r) =>
              `R${r + 1}: ${row
                .slice(0, n)
                .map((coef, j) => `${coef.toFixed(precision)}${["x", "y", "z", "w"][j]}`)
                .join(" + ")} = ${row[n].toFixed(precision)}`
            )
          );
        }
      }
    }

    // Back substitution
    const solutions = new Array(n);
    steps.push("Back substitution:");
    for (let i = n - 1; i >= 0; i--) {
      solutions[i] = A[i][n];
      for (let j = i + 1; j < n; j++) {
        solutions[i] -= A[i][j] * solutions[j];
      }
      solutions[i] /= A[i][i];
      steps.push(
        `${["x", "y", "z", "w"][i]} = (${A[i][n].toFixed(precision)}${
          i < n - 1
            ? ` - ${A[i]
                .slice(i + 1, n)
                .map((coef, j) => `${coef.toFixed(precision)} * ${solutions[i + j + 1].toFixed(precision)}`)
                .join(" - ")}`
            : ""
        }) / ${A[i][i].toFixed(precision)} = ${solutions[i].toFixed(precision)}`
      );
    }

    return { solutions: solutions.map((val) => val.toFixed(precision)), steps };
  }, [precision]);

  // Handle equation input changes
  const handleInputChange = (i, j) => (e) => {
    const value = e.target.value;
    setEquations((prev) => {
      const newEqs = prev.map((row) => [...row]);
      newEqs[i][j] = value;
      return newEqs;
    });
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${i}${j}`]: "Must be a number" }));
    } else {
      setErrors((prev) => ({ ...prev, [`${i}${j}`]: "" }));
    }
  };

  // Validate inputs
  const isValid = useMemo(() => {
    const activeCells = size * (size + 1);
    let filledCount = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size + 1; j++) {
        if (equations[i][j]) filledCount++;
        if (equations[i][j] && isNaN(parseFloat(equations[i][j]))) return false;
      }
    }
    return filledCount === activeCells && Object.values(errors).every((err) => !err);
  }, [equations, size, errors]);

  // Solve system
  const solve = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: `Please fill all ${size} equations with valid numbers`,
      }));
      return;
    }

    const calcResult = solveGaussian(equations, size);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setSize(2);
    setEquations(Array(4).fill().map(() => Array(5).fill("")));
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setPrecision(2);
  };

  // Download steps as text file
  const downloadSteps = () => {
    if (result && result.steps) {
      const text = result.steps.join("\n");
      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `gaussian_elimination_steps_${Date.now()}.txt`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Gaussian Eliminator
        </h1>

        {/* Size and Precision Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matrix Size</label>
            <select
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2x2</option>
              <option value={3}>3x3</option>
              <option value={4}>4x4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision (decimals)
            </label>
            <input
              type="number"
              min="0"
              max="6"
              value={precision}
              onChange={(e) => setPrecision(Math.max(0, Math.min(6, parseInt(e.target.value))))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Equations Input */}
        <div className="space-y-4 mb-6">
          {Array(size)
            .fill()
            .map((_, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                {Array(size)
                  .fill()
                  .map((_, j) => (
                    <div key={j} className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={equations[i][j]}
                        onChange={handleInputChange(i, j)}
                        className="w-16 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        placeholder="0"
                        aria-label={`Coefficient of ${["x", "y", "z", "w"][j]} in equation ${i + 1}`}
                      />
                      <span className="mx-1">{["x", "y", "z", "w"][j]}</span>
                      {j < size - 1 && <span className="text-gray-500">+</span>}
                    </div>
                  ))}
                <span className="text-gray-500">=</span>
                <input
                  type="number"
                  step="0.01"
                  value={equations[i][size]}
                  onChange={handleInputChange(i, size)}
                  className="w-16 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  placeholder="0"
                  aria-label={`Constant in equation ${i + 1}`}
                />
                {errors[`${i}${size}`] && (
                  <p className="text-red-600 text-xs ml-2">{errors[`${i}${size}`]}</p>
                )}
              </div>
            ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={solve}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Solve
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg text-red-700 text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && result.solutions && (
          <div className="p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center mb-2">Solutions:</h2>
            <div className="text-center text-lg space-y-2">
              {result.solutions.map((sol, i) => (
                <p key={i}>
                  {["x", "y", "z", "w"][i]} = {sol}
                </p>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
              <button
                onClick={downloadSteps}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Steps
              </button>
            </div>
            {showSteps && (
              <ul className="mt-4 text-sm list-disc list-inside max-h-48 overflow-y-auto bg-gray-100 p-2 rounded">
                {result.steps.map((step, i) => (
                  <li key={i} className="text-gray-700">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports 2x2, 3x3, and 4x4 systems</li>
            <li>Gaussian elimination with partial pivoting</li>
            <li>Adjustable decimal precision (0-6)</li>
            <li>Detailed step-by-step solution display</li>
            <li>Download steps as a text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GaussianEliminator;