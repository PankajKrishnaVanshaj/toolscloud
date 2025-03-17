"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync } from "react-icons/fa";

const MatrixDeterminant = () => {
  const [size, setSize] = useState(2); // Matrix size (2x2, 3x3, etc.)
  const [matrix, setMatrix] = useState(
    Array(4).fill().map(() => Array(4).fill("")) // Increased max size to 4x4
  );
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [precision, setPrecision] = useState(2); // Decimal precision for results

  // Compute determinant using recursive minor expansion
  const calculateDeterminant = useCallback((mat, n) => {
    const steps = [`Calculating determinant of ${n}x${n} matrix:`];

    // Validate all elements are numeric
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (isNaN(parseFloat(mat[i][j]))) {
          return { error: "All matrix elements must be valid numbers" };
        }
      }
    }

    const numMat = mat.map((row) => row.map((val) => parseFloat(val)));

    if (n === 1) {
      const det = numMat[0][0];
      steps.push(`det = ${det}`);
      return { determinant: det, steps };
    } else if (n === 2) {
      const [a, b] = numMat[0];
      const [c, d] = numMat[1];
      const det = a * d - b * c;
      steps.push(`Formula: ad - bc`);
      steps.push(`det = (${a})(${d}) - (${b})(${c}) = ${det.toFixed(precision)}`);
      return { determinant: det, steps };
    } else {
      // Cofactor expansion along the first row
      let det = 0;
      steps.push(`Using cofactor expansion along first row:`);
      let expansion = "";

      for (let j = 0; j < n; j++) {
        const cofactor = numMat[0][j] * (j % 2 === 0 ? 1 : -1);
        const minorMat = numMat
          .slice(1)
          .map((row) => row.filter((_, col) => col !== j));
        const minorDet = calculateDeterminant(minorMat, n - 1).determinant;
        det += cofactor * minorDet;

        expansion += `${j > 0 ? " + " : ""}${numMat[0][j]} * (${
          j % 2 === 0 ? "" : "-"
        }${minorDet.toFixed(precision)})`;
      }
      steps.push(`det = ${expansion} = ${det.toFixed(precision)}`);
      return { determinant: det, steps };
    }
  }, [precision]);

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

  // Calculate determinant
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

    const calcResult = calculateDeterminant(matrix, size);
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

  // Download result as text
  const downloadResult = () => {
    if (!result) return;
    const text = `Matrix Determinant\nSize: ${size}x${size}\nDeterminant: ${result.determinant.toFixed(
      precision
    )}\n\nSteps:\n${result.steps.join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `matrix_determinant_${size}x${size}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Matrix Determinant Calculator
        </h1>

        {/* Size Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className={`px-3 py-2 rounded-md transition-colors ${
                size === n
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {n}x{n}
            </button>
          ))}
        </div>

        {/* Precision Control */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Decimal Precision ({precision})
          </label>
          <input
            type="range"
            min="0"
            max="6"
            value={precision}
            onChange={(e) => setPrecision(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
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
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center text-sm"
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
            onClick={downloadResult}
            disabled={!result}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
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
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="p-4 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Determinant:
            </h2>
            <p className="text-center text-xl font-mono">
              {result.determinant.toFixed(precision)}
            </p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? "Hide Steps" : "Show Steps"}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                {result.steps.map((step, i) => (
                  <li key={i} className="mb-1">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports 1x1 to 4x4 matrices</li>
            <li>Recursive determinant calculation with steps</li>
            <li>Adjustable decimal precision</li>
            <li>Download result as text file</li>
            <li>Real-time validation and error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatrixDeterminant;