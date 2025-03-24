"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaInfoCircle } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading result

const MatrixCalculator = () => {
  const [operation, setOperation] = useState("addition");
  const [size, setSize] = useState("2x2");
  const [matrixA, setMatrixA] = useState([[0, 0], [0, 0]]);
  const [matrixB, setMatrixB] = useState([[0, 0], [0, 0]]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [precision, setPrecision] = useState(2); // Decimal precision
  const resultRef = React.useRef(null);

  // Update matrices when size changes
  useEffect(() => {
    const [rows, cols] = size.split("x").map(Number);
    const newMatrix = Array(rows).fill().map(() => Array(cols).fill(0));
    setMatrixA(newMatrix);
    setMatrixB(newMatrix);
    setResult(null);
    setError("");
  }, [size]);

  // Handle matrix input changes
  const updateMatrix = useCallback((matrix, setMatrix, row, col, value) => {
    const newMatrix = matrix.map((r, i) =>
      r.map((v, j) => (i === row && j === col ? (value === "" ? 0 : parseFloat(value)) : v))
    );
    setMatrix(newMatrix);
  }, []);

  // Matrix operations
  const calculateMatrix = useCallback(() => {
    setError("");
    setResult(null);

    const [rows, cols] = size.split("x").map(Number);

    // Validate inputs
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (isNaN(matrixA[i][j]) || (operation !== "determinant" && isNaN(matrixB[i][j]))) {
          return { error: "All matrix entries must be valid numbers" };
        }
      }
    }

    let resultMatrix, det;
    const steps = [];

    if (operation === "addition" || operation === "subtraction") {
      resultMatrix = Array(rows).fill().map(() => Array(cols).fill(0));
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          resultMatrix[i][j] =
            operation === "addition"
              ? matrixA[i][j] + matrixB[i][j]
              : matrixA[i][j] - matrixB[i][j];
          steps.push(
            `${matrixA[i][j]} ${operation === "addition" ? "+" : "-"} ${matrixB[i][j]} = ${resultMatrix[i][j].toFixed(precision)}`
          );
        }
      }
    } else if (operation === "multiplication") {
      resultMatrix = Array(rows).fill().map(() => Array(cols).fill(0));
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          let step = "";
          for (let k = 0; k < cols; k++) {
            resultMatrix[i][j] += matrixA[i][k] * matrixB[k][j];
            step += `${matrixA[i][k]} × ${matrixB[k][j]}${k < cols - 1 ? " + " : ""}`;
          }
          steps.push(
            `Row ${i + 1}, Col ${j + 1}: ${step} = ${resultMatrix[i][j].toFixed(precision)}`
          );
        }
      }
    } else if (operation === "determinant") {
      if (size === "2x2") {
        det = matrixA[0][0] * matrixA[1][1] - matrixA[0][1] * matrixA[1][0];
        steps.push(
          `det(A) = (${matrixA[0][0]} × ${matrixA[1][1]}) - (${matrixA[0][1]} × ${matrixA[1][0]}) = ${det.toFixed(precision)}`
        );
      } else {
        det =
          matrixA[0][0] * (matrixA[1][1] * matrixA[2][2] - matrixA[1][2] * matrixA[2][1]) -
          matrixA[0][1] * (matrixA[1][0] * matrixA[2][2] - matrixA[1][2] * matrixA[2][0]) +
          matrixA[0][2] * (matrixA[1][0] * matrixA[2][1] - matrixA[1][1] * matrixA[2][0]);
        steps.push(
          `det(A) = ${matrixA[0][0]} × (${matrixA[1][1]} × ${matrixA[2][2]} - ${matrixA[1][2]} × ${matrixA[2][1]}) -`
        );
        steps.push(
          `         ${matrixA[0][1]} × (${matrixA[1][0]} × ${matrixA[2][2]} - ${matrixA[1][2]} × ${matrixA[2][0]}) +`
        );
        steps.push(
          `         ${matrixA[0][2]} × (${matrixA[1][0]} × ${matrixA[2][1]} - ${matrixA[1][1]} × ${matrixA[2][0]}) = ${det.toFixed(precision)}`
        );
      }
      return { determinant: det, steps };
    } else if (operation === "transpose") {
      resultMatrix = Array(cols).fill().map(() => Array(rows).fill(0));
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          resultMatrix[j][i] = matrixA[i][j];
          steps.push(`A[${i}][${j}] → Result[${j}][${i}] = ${matrixA[i][j]}`);
        }
      }
    }

    return { matrix: resultMatrix, steps };
  }, [matrixA, matrixB, operation, size, precision]);

  const calculate = () => {
    const calcResult = calculateMatrix();
    if (calcResult?.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setOperation("addition");
    setSize("2x2");
    setMatrixA([[0, 0], [0, 0]]);
    setMatrixB([[0, 0], [0, 0]]);
    setResult(null);
    setError("");
    setShowDetails(false);
    setPrecision(2);
  };

  const downloadResult = () => {
    if (resultRef.current && result) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `matrix-result-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Matrix Calculator
        </h1>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="addition">Addition</option>
              <option value="subtraction">Subtraction</option>
              <option value="multiplication">Multiplication</option>
              <option value="determinant">Determinant</option>
              <option value="transpose">Transpose</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="2x2">2x2</option>
              <option value="3x3">3x3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision ({precision} decimals)
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
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Matrix A */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Matrix A</h3>
              <div className={`grid grid-cols-${size === "2x2" ? 2 : 3} gap-2`}>
                {matrixA.map((row, i) =>
                  row.map((val, j) => (
                    <input
                      key={`A-${i}-${j}`}
                      type="number"
                      value={val}
                      onChange={(e) => updateMatrix(matrixA, setMatrixA, i, j, e.target.value)}
                      className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Matrix B (hidden for determinant and transpose) */}
            {operation !== "determinant" && operation !== "transpose" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Matrix B</h3>
                <div className={`grid grid-cols-${size === "2x2" ? 2 : 3} gap-2`}>
                  {matrixB.map((row, i) =>
                    row.map((val, j) => (
                      <input
                        key={`B-${i}-${j}`}
                        type="number"
                        value={val}
                        onChange={(e) => updateMatrix(matrixB, setMatrixB, i, j, e.target.value)}
                        className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-center"
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculate}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div ref={resultRef} className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Result:</h2>
            {operation === "determinant" ? (
              <p className="text-center text-xl">Determinant = {result.determinant.toFixed(precision)}</p>
            ) : (
              <div className="flex justify-center">
                <div className={`grid grid-cols-${size === "2x2" ? 2 : 3} gap-2`}>
                  {result.matrix.map((row, i) =>
                    row.map((val, j) => (
                      <div
                        key={`R-${i}-${j}`}
                        className="p-2 bg-gray-100 rounded-md text-center"
                      >
                        {val.toFixed(precision)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
              >
                <FaInfoCircle /> {showDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>

            {showDetails && (
              <div className="mt-4 text-sm">
                <p className="font-semibold">Calculation Steps:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {result.steps.map((step, index) => (
                    <li key={index}>{step}</li>
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
            <li>Operations: Addition, Subtraction, Multiplication, Determinant, Transpose</li>
            <li>Matrix sizes: 2x2 and 3x3</li>
            <li>Adjustable decimal precision</li>
            <li>Step-by-step calculation details</li>
            <li>Download result as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatrixCalculator;