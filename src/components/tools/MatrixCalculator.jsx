"use client";
import React, { useState, useEffect } from "react";

const MatrixCalculator = () => {
  const [operation, setOperation] = useState("addition");
  const [size, setSize] = useState("2x2");
  const [matrixA, setMatrixA] = useState([
    [0, 0],
    [0, 0],
  ]); // Initial 2x2
  const [matrixB, setMatrixB] = useState([
    [0, 0],
    [0, 0],
  ]); // Initial 2x2
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // Update matrices when size changes
  useEffect(() => {
    const newMatrix =
      size === "2x2"
        ? [
            [0, 0],
            [0, 0],
          ]
        : [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ];
    setMatrixA(newMatrix);
    setMatrixB(newMatrix);
    setResult(null);
  }, [size]);

  // Handle matrix input changes
  const updateMatrix = (matrix, setMatrix, row, col, value) => {
    const newMatrix = [...matrix];
    newMatrix[row][col] = value === "" ? 0 : parseFloat(value);
    setMatrix(newMatrix);
  };

  // Matrix operations
  const calculateMatrix = () => {
    setError("");
    setResult(null);

    const rows = size === "2x2" ? 2 : 3;
    const cols = rows;

    // Validate inputs
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (
          isNaN(matrixA[i][j]) ||
          (operation !== "determinant" && isNaN(matrixB[i][j]))
        ) {
          return { error: "All matrix entries must be valid numbers" };
        }
      }
    }

    let resultMatrix;
    const steps = [];

    if (operation === "addition" || operation === "subtraction") {
      resultMatrix = Array(rows)
        .fill()
        .map(() => Array(cols).fill(0));
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          resultMatrix[i][j] =
            operation === "addition"
              ? matrixA[i][j] + matrixB[i][j]
              : matrixA[i][j] - matrixB[i][j];
          steps.push(
            `${matrixA[i][j]} ${operation === "addition" ? "+" : "-"} ${
              matrixB[i][j]
            } = ${resultMatrix[i][j]}`
          );
        }
      }
    } else if (operation === "multiplication") {
      resultMatrix = Array(rows)
        .fill()
        .map(() => Array(cols).fill(0));
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          resultMatrix[i][j] = 0;
          let step = "";
          for (let k = 0; k < cols; k++) {
            resultMatrix[i][j] += matrixA[i][k] * matrixB[k][j];
            step += `${matrixA[i][k]} × ${matrixB[k][j]}${
              k < cols - 1 ? " + " : ""
            }`;
          }
          steps.push(
            `Row ${i + 1}, Col ${j + 1}: ${step} = ${resultMatrix[i][j]}`
          );
        }
      }
    } else if (operation === "determinant") {
      let det;
      if (size === "2x2") {
        det = matrixA[0][0] * matrixA[1][1] - matrixA[0][1] * matrixA[1][0];
        steps.push(
          `det(A) = (${matrixA[0][0]} × ${matrixA[1][1]}) - (${matrixA[0][1]} × ${matrixA[1][0]}) = ${det}`
        );
      } else {
        // 3x3
        det =
          matrixA[0][0] *
            (matrixA[1][1] * matrixA[2][2] - matrixA[1][2] * matrixA[2][1]) -
          matrixA[0][1] *
            (matrixA[1][0] * matrixA[2][2] - matrixA[1][2] * matrixA[2][0]) +
          matrixA[0][2] *
            (matrixA[1][0] * matrixA[2][1] - matrixA[1][1] * matrixA[2][0]);
        steps.push(
          `det(A) = ${matrixA[0][0]} × (${matrixA[1][1]} × ${matrixA[2][2]} - ${matrixA[1][2]} × ${matrixA[2][1]}) -`
        );
        steps.push(
          `         ${matrixA[0][1]} × (${matrixA[1][0]} × ${matrixA[2][2]} - ${matrixA[1][2]} × ${matrixA[2][0]}) +`
        );
        steps.push(
          `         ${matrixA[0][2]} × (${matrixA[1][0]} × ${matrixA[2][1]} - ${matrixA[1][1]} × ${matrixA[2][0]}) = ${det}`
        );
      }
      return { determinant: det, steps };
    }

    return { matrix: resultMatrix, steps };
  };

  const calculate = () => {
    const calcResult = calculateMatrix();
    if (calcResult && calcResult.error) {
      setError(calcResult.error);
      return;
    }
    setResult(calcResult);
  };

  const reset = () => {
    setOperation("addition");
    setSize("2x2");
    setMatrixA([
      [0, 0],
      [0, 0],
    ]);
    setMatrixB([
      [0, 0],
      [0, 0],
    ]);
    setResult(null);
    setError("");
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Matrix Calculator
        </h1>

        {/* Operation and Size Selection */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="flex gap-2">
            {["addition", "subtraction", "multiplication", "determinant"].map(
              (op) => (
                <button
                  key={op}
                  onClick={() => setOperation(op)}
                  className={`px-3 py-1 rounded-lg capitalize ${
                    operation === op
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {op}
                </button>
              )
            )}
          </div>
          <div className="flex gap-2">
            {["2x2", "3x3"].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`px-3 py-1 rounded-lg ${
                  size === s
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Matrix A */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Matrix A
              </h3>
              <div
                className={`grid ${
                  size === "2x2" ? "grid-cols-2" : "grid-cols-3"
                } gap-2`}
              >
                {matrixA.map((row, i) =>
                  row.map((val, j) => (
                    <input
                      key={`A-${i}-${j}`}
                      type="number"
                      value={val}
                      onChange={(e) =>
                        updateMatrix(matrixA, setMatrixA, i, j, e.target.value)
                      }
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Matrix B (hidden for determinant) */}
            {operation !== "determinant" && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Matrix B
                </h3>
                <div
                  className={`grid ${
                    size === "2x2" ? "grid-cols-2" : "grid-cols-3"
                  } gap-2`}
                >
                  {matrixB.map((row, i) =>
                    row.map((val, j) => (
                      <input
                        key={`B-${i}-${j}`}
                        type="number"
                        value={val}
                        onChange={(e) =>
                          updateMatrix(
                            matrixB,
                            setMatrixB,
                            i,
                            j,
                            e.target.value
                          )
                        }
                        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-all font-semibold"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">
              Result:
            </h2>
            <div className="mt-2 space-y-2">
              {operation === "determinant" ? (
                <p className="text-center text-xl">
                  Determinant = {result.determinant}
                </p>
              ) : (
                <div className="flex justify-center">
                  <div
                    className={`grid ${
                      size === "2x2" ? "grid-cols-2" : "grid-cols-3"
                    } gap-2`}
                  >
                    {result.matrix.map((row, i) =>
                      row.map((val, j) => (
                        <div
                          key={`R-${i}-${j}`}
                          className="p-2 bg-gray-100 rounded-lg text-center"
                        >
                          {val}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Steps:</p>
                  <ul className="list-disc list-inside">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixCalculator;
