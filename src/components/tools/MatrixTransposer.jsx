'use client';
import React, { useState, useCallback, useMemo } from 'react';

const MatrixTransposer = () => {
  const [rows, setRows] = useState(2); // Number of rows
  const [cols, setCols] = useState(2); // Number of columns
  const [matrix, setMatrix] = useState(
    Array(3).fill().map(() => Array(3).fill('')) // Max 3x3, initialized empty
  );
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Transpose the matrix
  const transposeMatrix = useCallback((mat, r, c) => {
    const steps = [`Transposing ${r}x${c} matrix:`];

    // Validate all elements are numeric
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        if (isNaN(parseFloat(mat[i][j]))) {
          return { error: 'All matrix elements must be valid numbers' };
        }
      }
    }

    const numMat = mat.slice(0, r).map(row => row.slice(0, c).map(val => parseFloat(val)));
    steps.push('Original matrix:');
    numMat.forEach((row, i) => steps.push(`Row ${i + 1}: [${row.join(', ')}]`));

    // Transpose: swap rows and columns
    const transposed = Array(c).fill().map(() => Array(r).fill(0));
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        transposed[j][i] = numMat[i][j];
      }
    }

    steps.push('Transposed matrix (rows become columns):');
    transposed.forEach((row, i) => steps.push(`Row ${i + 1}: [${row.join(', ')}]`));

    return { transposed, steps };
  }, []);

  // Handle matrix input changes
  const handleInputChange = (i, j) => (e) => {
    const value = e.target.value;
    setMatrix((prev) => {
      const newMatrix = prev.map(row => [...row]);
      newMatrix[i][j] = value;
      return newMatrix;
    });
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${i}${j}`]: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, [`${i}${j}`]: '' }));
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
    return filledCount === activeCells && Object.values(errors).every(err => !err);
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
    setMatrix(Array(3).fill().map(() => Array(3).fill('')));
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Matrix Transposer
        </h1>

        {/* Size Selection */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Rows:</label>
            <select
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Columns:</label>
            <select
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value))}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Matrix Input */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array(rows).fill().map((_, i) =>
            Array(cols).fill().map((_, j) => (
              <div key={`${i}${j}`} className="flex flex-col items-center">
                <input
                  type="number"
                  step="0.01"
                  value={matrix[i][j]}
                  onChange={handleInputChange(i, j)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  placeholder="0"
                  aria-label={`Matrix element at row ${i + 1}, column ${j + 1}`}
                />
                {errors[`${i}${j}`] && <p className="text-red-600 text-xs mt-1">{errors[`${i}${j}`]}</p>}
              </div>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={transpose}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Transpose
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
          >
            Reset
          </button>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Transposed Matrix:</h2>
            <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: `repeat(${rows}, minmax(0, 1fr))` }}>
              {result.transposed.map((row, i) =>
                row.map((val, j) => (
                  <div key={`${i}${j}`} className="text-center text-xl">
                    {val}
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? 'Hide Steps' : 'Show Steps'}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity">
                {result.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatrixTransposer;