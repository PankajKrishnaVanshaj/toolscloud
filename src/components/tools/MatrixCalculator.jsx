"use client";

import { useState } from "react";

const MatrixCalculator = () => {
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const [matrixA, setMatrixA] = useState(Array.from({ length: 2 }, () => Array(2).fill(0)));
  const [matrixB, setMatrixB] = useState(Array.from({ length: 2 }, () => Array(2).fill(0)));
  const [result, setResult] = useState(null);
  const [operation, setOperation] = useState("add");

  // Function to handle input change for matrix values
  const handleInputChange = (matrix, row, col, value) => {
    const newMatrix = matrix === "A" 
      ? matrixA.map((r) => [...r]) 
      : matrixB.map((r) => [...r]);
    newMatrix[row][col] = parseFloat(value) || 0;
    matrix === "A" ? setMatrixA(newMatrix) : setMatrixB(newMatrix);
  };

  // Function to resize matrices
  const resizeMatrices = () => {
    const newMatrixA = Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) => (matrixA[i]?.[j] || 0))
    );
    const newMatrixB = Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) => (matrixB[i]?.[j] || 0))
    );
    setMatrixA(newMatrixA);
    setMatrixB(newMatrixB);
  };

  // Function to add matrices
  const addMatrices = () => matrixA.map((row, i) => row.map((val, j) => val + matrixB[i][j]));

  // Function to subtract matrices
  const subtractMatrices = () => matrixA.map((row, i) => row.map((val, j) => val - matrixB[i][j]));

  // Function to multiply matrices
  const multiplyMatrices = () => {
    const rowsA = matrixA.length;
    const colsA = matrixA[0].length;
    const rowsB = matrixB.length;
    const colsB = matrixB[0].length;

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

  // Function to perform the selected operation
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

  // Function to clear matrices and result
  const clearMatrices = () => {
    setMatrixA(Array.from({ length: rows }, () => Array(cols).fill(0)));
    setMatrixB(Array.from({ length: rows }, () => Array(cols).fill(0)));
    setResult(null); // Clear the result
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Matrix Calculator</h1>

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

      <div className="mb-4">
        <label className="font-medium">Matrix Size:</label>
        <div className="flex space-x-2 mt-2">
          <input
            type="number"
            min="1"
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="w-20 p-2 border rounded text-center"
            placeholder="Rows"
          />
          <input
            type="number"
            min="1"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="w-20 p-2 border rounded text-center"
            placeholder="Columns"
          />
          <button
            className="p-2 bg-primary text-white rounded hover:bg-primary/90"
            onClick={resizeMatrices}
          >
            Set Size
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        className="w-full mt-4 p-2 bg-primary text-white rounded hover:bg-primary/90"
        onClick={calculate}
      >
        Calculate
      </button>

      <button
        className="w-full mt-2 p-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        onClick={clearMatrices}
      >
        Clear
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
