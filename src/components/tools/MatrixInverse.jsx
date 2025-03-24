"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const MatrixInverse = () => {
  const [size, setSize] = useState(2); // Supports 2x2, 3x3, 4x4
  const [matrix, setMatrix] = useState(
    Array(4).fill().map(() => Array(4).fill("")) // Increased to 4x4 max
  );
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(2); // Decimal precision for results

  // Compute determinant (recursive for any size up to 4x4)
  const calculateDeterminant = (mat, n) => {
    const numMat = mat.map((row) => row.map((val) => parseFloat(val)));
    if (n === 1) return numMat[0][0];
    if (n === 2) {
      const [a, b] = numMat[0];
      const [c, d] = numMat[1];
      return a * d - b * c;
    }

    let det = 0;
    for (let j = 0; j < n; j++) {
      det += numMat[0][j] * cofactor(numMat, 0, j, n);
    }
    return det;
  };

  // Helper to compute cofactor
  const cofactor = (mat, row, col, n) => {
    const subMat = [];
    for (let i = 0; i < n; i++) {
      if (i === row) continue;
      const subRow = [];
      for (let j = 0; j < n; j++) {
        if (j !== col) subRow.push(mat[i][j]);
      }
      subMat.push(subRow);
    }
    return ((-1) ** (row + col)) * calculateDeterminant(subMat, n - 1);
  };

  // Compute inverse of the matrix
  const calculateInverse = useCallback(
    (mat, n) => {
      const steps = [`Calculating inverse of ${n}x${n} matrix:`];

      // Validate all elements
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (isNaN(parseFloat(mat[i][j]))) {
            return { error: "All matrix elements must be valid numbers" };
          }
        }
      }

      const numMat = mat.map((row) => row.map((val) => parseFloat(val)));
      const det = calculateDeterminant(numMat, n);
      steps.push(`Determinant = ${det.toFixed(precision)}`);

      if (det === 0) {
        steps.push("Determinant is 0: Matrix is not invertible.");
        return { error: "Matrix is not invertible (determinant = 0)", steps };
      }

      // Compute cofactor matrix
      const cofactors = Array(n)
        .fill()
        .map(() => Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          cofactors[i][j] = cofactor(numMat, i, j, n);
        }
      }
      steps.push(
        `Cofactor matrix = [${cofactors
          .map((row) => `[${row.join(", ")}]`)
          .join(", ")}]`
      );

      // Adjugate (transpose of cofactor matrix)
      const adj = Array(n)
        .fill()
        .map(() => Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          adj[i][j] = cofactors[j][i];
        }
      }
      steps.push(
        `Adjugate = [${adj.map((row) => `[${row.join(", ")}]`).join(", ")}]`
      );

      // Inverse = (1/det) * adj
      const scalar = 1 / det;
      const inverse = adj.map((row) =>
        row.map((val) => (val * scalar).toFixed(precision))
      );
      steps.push(
        `Inverse = (1/${det.toFixed(precision)}) * adj = [${inverse
          .map((row) => `[${row.join(", ")}]`)
          .join(", ")}]`
      );

      return { inverse, steps };
    },
    [precision]
  );

  // Handle matrix input changes
  const handleInputChange = (i, j) => (e) => {
    const value = e.target.value;
    setMatrix((prev) => {
      const newMatrix = prev.map((row) => [...row]);
      newMatrix[i][j] = value;
      return newMatrix;
    });
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${i}${j}`]: "Must be a number" }));
    } else {
      setErrors((prev) => ({ ...prev, [`${i}${j}`]: "" }));
    }
  };

  // Check if matrix is valid
  const isValid = useMemo(() => {
    const activeCells = size * size;
    let filledCount = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (matrix[i][j]) filledCount++;
        if (matrix[i][j] && isNaN(parseFloat(matrix[i][j]))) return false;
      }
    }
    return filledCount === activeCells && Object.values(errors).every((err) => !err);
  }, [matrix, size, errors]);

  // Calculate inverse
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: `Please fill all ${size}x${size} fields with valid numbers`,
      }));
      return;
    }

    const calcResult = calculateInverse(matrix, size);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setSize(2);
    setMatrix(Array(4).fill().map(() => Array(4).fill("")));
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setPrecision(2);
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result && result.inverse) {
      const text = result.inverse.map((row) => row.join("\t")).join("\n");
      navigator.clipboard.writeText(text);
      alert("Inverse matrix copied to clipboard!");
    }
  };

  // Download result as text file
  const downloadResult = () => {
    if (result && result.inverse) {
      const text = `Inverse Matrix (${size}x${size}):\n${result.inverse
        .map((row) => row.join("\t"))
        .join("\n")}\n\nSteps:\n${result.steps.join("\n")}`;
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `matrix-inverse-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Matrix Inverse Calculator
        </h1>

        {/* Size and Precision Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matrix Size
            </label>
            <div className="flex gap-2">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setSize(n)}
                  className={`flex-1 px-3 py-2 rounded-md transition-colors ${
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
              Precision (decimals)
            </label>
            <input
              type="number"
              min="0"
              max="6"
              value={precision}
              onChange={(e) => setPrecision(Math.max(0, Math.min(6, e.target.value)))}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Matrix Input */}
        <div
          className="grid gap-2 mb-6"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {Array(size)
            .fill()
            .map((_, i) =>
              Array(size)
                .fill()
                .map((_, j) => (
                  <div key={`${i}${j}`} className="flex flex-col items-center">
                    <input
                      type="number"
                      step="any"
                      value={matrix[i][j]}
                      onChange={handleInputChange(i, j)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="0"
                      aria-label={`Matrix element at row ${i + 1}, column ${j + 1}`}
                    />
                    {errors[`${i}${j}`] && (
                      <p className="text-red-600 text-xs mt-1">{errors[`${i}${j}`]}</p>
                    )}
                  </div>
                ))
            )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Calculate
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
        {result && result.inverse && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center mb-2">
              Inverse Matrix:
            </h2>
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            >
              {result.inverse.map((row, i) =>
                row.map((val, j) => (
                  <div
                    key={`${i}${j}`}
                    className="text-center text-lg font-mono bg-gray-100 p-2 rounded"
                  >
                    {val}
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
              <button
                onClick={downloadResult}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {showSteps ? "Hide Steps" : "Show Steps"}
              </button>
            </div>
            {showSteps && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Calculation Steps:</h3>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {result.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports 2x2, 3x3, and 4x4 matrices</li>
            <li>Adjustable decimal precision (0-6)</li>
            <li>Detailed step-by-step calculation</li>
            <li>Copy result to clipboard</li>
            <li>Download result as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatrixInverse;