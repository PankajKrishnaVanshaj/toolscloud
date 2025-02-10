"use client";

import { useState } from "react";

const MatrixCalculator = () => {
  const [matrixA, setMatrixA] = useState([
    [0, 0],
    [0, 0],
  ]);
  const [matrixB, setMatrixB] = useState([
    [0, 0],
    [0, 0],
  ]);
  const [result, setResult] = useState(null);
  const [operation, setOperation] = useState("add");

  // Function to handle input change
  const handleInputChange = (matrix, row, col, value) => {
    const newMatrix = matrix === "A" ? [...matrixA] : [...matrixB];
    newMatrix[row][col] = parseFloat(value) || 0;
    matrix === "A" ? setMatrixA(newMatrix) : setMatrixB(newMatrix);
  };

  // Function to add matrices
  const addMatrices = () => {
    return matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));
  };

  // Function to subtract matrices
  const subtractMatrices = () => {
    return matrixA.map((row, i) => row.map((val, j) => val - matrixB[i][j]));
  };

  // Function to multiply matrices
  const multiplyMatrices = () => {
    const rowsA = matrixA.length,
      colsA = matrixA[0].length;
    const rowsB = matrixB.length,
      colsB = matrixB[0].length;

    if (colsA !== rowsB) return "Invalid Dimensions for Multiplication";

    let resultMatrix = Array(rowsA)
      .fill(0)
      .map(() => Array(colsB).fill(0));

    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        for (let k = 0; k < colsA; k++) {
          resultMatrix[i][j] += matrixA[i][k] * matrixB[k][j];
        }
      }
    }
    return resultMatrix;
  };

  // Function to perform selected operation
  const calculate = () => {
    let res;
    switch (operation) {
      case "add":
        res = addMatrices();
        break;
      case "subtract":
        res = subtractMatrices();
        break;
      case "multiply":
        res = multiplyMatrices();
        break;
      default:
        res = "Invalid Operation";
    }
    setResult(res);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">

      <div className="mb-4">
        <label className="font-medium">Select Operation:</label>
        <select
          className="w-full p-2 border rounded mt-2"
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
        >
          <option value="add">Addition</option>
          <option value="subtract">Subtraction</option>
          <option value="multiply">Multiplication</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Matrix A */}
        <div>
          <h3 className="text-lg font-medium mb-2">Matrix A</h3>
          {matrixA.map((row, i) => (
            <div key={i} className="flex space-x-2">
              {row.map((val, j) => (
                <input
                  key={j}
                  type="number"
                  value={val}
                  className="w-14 p-1 border text-center"
                  onChange={(e) => handleInputChange("A", i, j, e.target.value)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Matrix B */}
        <div>
          <h3 className="text-lg font-medium mb-2">Matrix B</h3>
          {matrixB.map((row, i) => (
            <div key={i} className="flex space-x-2">
              {row.map((val, j) => (
                <input
                  key={j}
                  type="number"
                  value={val}
                  className="w-14 p-1 border text-center"
                  onChange={(e) => handleInputChange("B", i, j, e.target.value)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <button
        className="w-full mt-4 p-2 bg-blue-500 text-white rounded"
        onClick={calculate}
      >
        Calculate
      </button>

      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-center">
          <h3 className="text-lg font-medium">Result</h3>
          {typeof result === "string" ? (
            <p>{result}</p>
          ) : (
            result.map((row, i) => (
              <div key={i} className="flex justify-center space-x-2">
                {row.map((val, j) => (
                  <span key={j} className="w-14 p-2 bg-white border text-center">
                    {val}
                  </span>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MatrixCalculator;
