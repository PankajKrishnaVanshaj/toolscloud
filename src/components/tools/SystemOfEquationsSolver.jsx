"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaQuestionCircle } from "react-icons/fa";

const SystemOfEquationsSolver = () => {
  const [size, setSize] = useState(2); // 2x2 or 3x3 system
  const [equations, setEquations] = useState(
    Array(3).fill().map(() => Array(4).fill("")) // [a, b, c, d] for ax + by + cz = d
  );
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [method, setMethod] = useState("cramer"); // Cramer's Rule or Gaussian Elimination

  // Calculate determinant of a matrix
  const calculateDeterminant = (mat, n) => {
    const numMat = mat.map((row) => row.map((val) => parseFloat(val)));
    if (n === 2) {
      const [a, b] = numMat[0];
      const [c, d] = numMat[1];
      return a * d - b * c;
    } else {
      const [a, b, c] = numMat[0];
      const [d, e, f] = numMat[1];
      const [g, h, i] = numMat[2];
      return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    }
  };

  // Gaussian Elimination (new method)
  const gaussianElimination = (eqs, n) => {
    const steps = [`Solving ${n}x${n} system using Gaussian Elimination:`];
    const A = eqs.map((row) => row.slice(0, n).map((val) => parseFloat(val)));
    const b = eqs.map((row) => parseFloat(row[n]));
    const augmented = A.map((row, i) => [...row, b[i]]);

    steps.push("Augmented Matrix:");
    steps.push(augmented.map((row) => row.join(" ")).join("\n"));

    // Forward elimination
    for (let i = 0; i < n; i++) {
      if (augmented[i][i] === 0) {
        steps.push("Pivot is zero: System may have no unique solution.");
        return { error: "System has no unique solution (pivot = 0)", steps };
      }
      for (let j = i + 1; j < n; j++) {
        const ratio = augmented[j][i] / augmented[i][i];
        for (let k = 0; k <= n; k++) {
          augmented[j][k] -= ratio * augmented[i][k];
        }
      }
      steps.push(`After eliminating column ${i + 1}:`);
      steps.push(augmented.map((row) => row.join(" ")).join("\n"));
    }

    // Back substitution
    const solutions = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      solutions[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        solutions[i] -= augmented[i][j] * solutions[j];
      }
      solutions[i] = (solutions[i] / augmented[i][i]).toFixed(2);
    }

    steps.push("Solutions:");
    solutions.forEach((sol, i) => steps.push(`${["x", "y", "z"][i]} = ${sol}`));
    return { solutions, steps };
  };

  // Cramer's Rule
  const cramersRule = (eqs, n) => {
    const steps = [`Solving ${n}x${n} system using Cramer's Rule:`];
    const numEqs = eqs.map((row) => row.map((val) => parseFloat(val)));
    const A = numEqs.map((row) => row.slice(0, n));
    const detA = calculateDeterminant(A, n);
    steps.push(`Main determinant (det A) = ${detA}`);

    if (detA === 0) {
      steps.push("det A = 0: System has no unique solution.");
      return { error: "System has no unique solution (determinant = 0)", steps };
    }

    const b = numEqs.map((row) => row[n]);
    steps.push("Equations:");
    for (let i = 0; i < n; i++) {
      steps.push(
        `${A[i].map((coef, j) => `${coef}${["x", "y", "z"][j]}`).join(" + ")} = ${
          b[i]
        }`
      );
    }

    const solutions = [];
    for (let i = 0; i < n; i++) {
      const Ai = A.map((row) => [...row]);
      for (let j = 0; j < n; j++) {
        Ai[j][i] = b[j];
      }
      const detAi = calculateDeterminant(Ai, n);
      steps.push(`det A_${["x", "y", "z"][i]} = ${detAi}`);
      solutions.push((detAi / detA).toFixed(2));
    }

    steps.push("Solutions:");
    solutions.forEach((sol, i) => steps.push(`${["x", "y", "z"][i]} = ${sol}`));
    return { solutions, steps };
  };

  // Solve system based on selected method
  const solveSystem = useCallback(
    (eqs, n) => {
      return method === "cramer"
        ? cramersRule(eqs, n)
        : gaussianElimination(eqs, n);
    },
    [method]
  );

  // Handle input changes
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

  // Solve handler
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

    const calcResult = solveSystem(equations, size);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset handler
  const reset = () => {
    setSize(2);
    setEquations(Array(3).fill().map(() => Array(4).fill("")));
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setMethod("cramer");
  };

  // Download solutions as text
  const downloadSolutions = () => {
    if (!result || !result.solutions) return;
    const text = [
      `System of Equations (${size}x${size}):`,
      ...equations.slice(0, size).map((eq) =>
        eq
          .slice(0, size)
          .map((coef, j) => `${coef}${["x", "y", "z"][j]}`)
          .join(" + ") + ` = ${eq[size]}`
      ),
      "",
      "Solutions:",
      ...result.solutions.map((sol, i) => `${["x", "y", "z"][i]} = ${sol}`),
      "",
      "Steps:",
      ...result.steps,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `solutions-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          System of Equations Solver
        </h1>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Size
            </label>
            <div className="flex gap-2">
              {[2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setSize(n)}
                  className={`flex-1 py-2 rounded-md transition-colors ${
                    size === n
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {n}x{n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="cramer">Cramer's Rule</option>
              <option value="gaussian">Gaussian Elimination</option>
            </select>
          </div>
        </div>

        {/* Equations Input */}
        <div className="space-y-4 mb-6">
          {Array(size)
            .fill()
            .map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center gap-2">
                {Array(size)
                  .fill()
                  .map((_, j) => (
                    <div key={j} className="flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        value={equations[i][j]}
                        onChange={handleInputChange(i, j)}
                        className="w-16 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                        placeholder="0"
                        aria-label={`Coefficient of ${["x", "y", "z"][j]} in equation ${
                          i + 1
                        }`}
                      />
                      <span className="mx-1">{["x", "y", "z"][j]}</span>
                      {j < size - 1 && <span className="mx-1">+</span>}
                    </div>
                  ))}
                <span className="mx-2">=</span>
                <input
                  type="number"
                  step="0.01"
                  value={equations[i][size]}
                  onChange={handleInputChange(i, size)}
                  className="w-16 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  placeholder="0"
                  aria-label={`Constant in equation ${i + 1}`}
                />
                {errors[`${i}${size}`] && (
                  <p className="text-red-600 text-xs ml-2">
                    {errors[`${i}${size}`]}
                  </p>
                )}
              </div>
            ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={solve}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Solve
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          {result && result.solutions && (
            <button
              onClick={downloadSolutions}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          )}
        </div>

        {/* Errors */}
        {errors.general && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700 text-center">
            {errors.general}
          </div>
        )}

        {/* Results */}
        {result && result.solutions && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Solutions:
            </h2>
            <div className="text-center text-xl space-y-2">
              {result.solutions.map((sol, i) => (
                <p key={i}>
                  {["x", "y", "z"][i]} = {sol}
                </p>
              ))}
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg max-h-64 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Solution Steps:
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 whitespace-pre-wrap">
                  {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports 2x2 and 3x3 systems</li>
            <li>Two solving methods: Cramer's Rule and Gaussian Elimination</li>
            <li>Detailed step-by-step solutions</li>
            <li>Download solutions as text file</li>
            <li>Input validation and error handling</li>
          </ul>
        </div>

        {/* Help Tooltip */}
        <div className="mt-4 text-center">
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() =>
              alert(
                "Enter coefficients for each variable (x, y, z) and the constant term.\nExample for 2x2:\n2x + 3y = 5\n-1x + 4y = 2"
              )
            }
          >
            <FaQuestionCircle className="inline mr-1" /> How to use?
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemOfEquationsSolver;