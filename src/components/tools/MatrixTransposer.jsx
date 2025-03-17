"use client";
import React, { useState, useCallback, useMemo } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const MatrixTransposer = () => {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [matrix, setMatrix] = useState(
    Array(5).fill().map(() => Array(5).fill("")) // Increased max size to 5x5
  );
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2); // New feature: control decimal precision
  const [inputMode, setInputMode] = useState("manual"); // New feature: manual or CSV input

  // Transpose the matrix
  const transposeMatrix = useCallback(
    (mat, r, c) => {
      const steps = [`Transposing ${r}x${c} matrix:`];

      // Validate all elements are numeric
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          if (isNaN(parseFloat(mat[i][j]))) {
            return { error: "All matrix elements must be valid numbers" };
          }
        }
      }

      const numMat = mat
        .slice(0, r)
        .map((row) => row.slice(0, c).map((val) => parseFloat(val)));
      steps.push("Original matrix:");
      numMat.forEach((row, i) => steps.push(`Row ${i + 1}: [${row.join(", ")}]`));

      // Transpose: swap rows and columns
      const transposed = Array(c)
        .fill()
        .map(() => Array(r).fill(0));
      for (let i = 0; i < r; i++) {
        for (let j = 0; j < c; j++) {
          transposed[j][i] = Number(numMat[i][j].toFixed(decimalPlaces));
        }
      }

      steps.push("Transposed matrix (rows become columns):");
      transposed.forEach((row, i) => steps.push(`Row ${i + 1}: [${row.join(", ")}]`));

      return { transposed, steps };
    },
    [decimalPlaces]
  );

  // Handle manual input changes
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

  // Handle CSV input
  const handleCSVInput = (e) => {
    const csv = e.target.value;
    try {
      const parsed = csv.split("\n").map((row) => row.split(",").map((val) => val.trim()));
      if (parsed.length > 5 || parsed.some((row) => row.length > 5)) {
        throw new Error("Matrix exceeds 5x5 limit");
      }
      setRows(parsed.length);
      setCols(parsed[0]?.length || 0);
      const newMatrix = Array(5)
        .fill()
        .map(() => Array(5).fill(""));
      parsed.forEach((row, i) => {
        row.forEach((val, j) => {
          newMatrix[i][j] = val;
        });
      });
      setMatrix(newMatrix);
      setErrors({});
      setResult(null);
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  // Check if matrix is valid
  const isValid = useMemo(() => {
    const activeCells = rows * cols;
    let filledCount = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i][j]) filledCount++;
        if (matrix[i][j] && isNaN(parseFloat(matrix[i][j]))) return false;
      }
    }
    return filledCount === activeCells && Object.values(errors).every((err) => !err);
  }, [matrix, rows, cols, errors]);

  // Transpose matrix
  const transpose = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: `Please fill all ${rows}x${cols} elements with valid numbers`,
      }));
      return;
    }

    const calcResult = transposeMatrix(matrix, rows, cols);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setRows(2);
    setCols(2);
    setMatrix(Array(5).fill().map(() => Array(5).fill("")));
    setErrors({});
    setResult(null);
    setShowSteps(false);
    setDecimalPlaces(2);
    setInputMode("manual");
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (result) {
      const text = result.transposed.map((row) => row.join(", ")).join("\n");
      navigator.clipboard.writeText(text);
      alert("Transposed matrix copied to clipboard!");
    }
  };

  // Download result as CSV
  const downloadCSV = () => {
    if (result) {
      const csvContent = result.transposed.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transposed_matrix_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Matrix Transposer
        </h1>

        {/* Settings */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
              <select
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
              <select
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places
              </label>
              <select
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Mode</label>
              <select
                value={inputMode}
                onChange={(e) => setInputMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="manual">Manual</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          {/* Matrix Input */}
          {inputMode === "manual" ? (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {Array(rows)
                .fill()
                .map((_, i) =>
                  Array(cols)
                    .fill()
                    .map((_, j) => (
                      <div key={`${i}${j}`} className="flex flex-col items-center">
                        <input
                          type="number"
                          step="0.01"
                          value={matrix[i][j]}
                          onChange={handleInputChange(i, j)}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
                          placeholder="0"
                        />
                        {errors[`${i}${j}`] && (
                          <p className="text-red-600 text-xs mt-1">{errors[`${i}${j}`]}</p>
                        )}
                      </div>
                    ))
                )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter CSV (e.g., "1,2\n3,4")
              </label>
              <textarea
                rows={5}
                onChange={handleCSVInput}
                placeholder="1,2\n3,4"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={transpose}
              disabled={!isValid}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Transpose
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Errors */}
          {errors.general && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md text-center">
              {errors.general}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Transposed Matrix:</h2>
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))` }}
              >
                {result.transposed.map((row, i) =>
                  row.map((val, j) => (
                    <div key={`${i}${j}`} className="text-center p-2 bg-white rounded-md shadow">
                      {val}
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadCSV}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download CSV
                </button>
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  {showSteps ? "Hide Steps" : "Show Steps"}
                </button>
              </div>
              {showSteps && (
                <ul className="mt-4 text-sm list-disc list-inside">
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
              <li>Up to 5x5 matrix support</li>
              <li>Manual or CSV input modes</li>
              <li>Adjustable decimal precision</li>
              <li>Step-by-step transposition process</li>
              <li>Copy to clipboard and CSV download</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixTransposer;