'use client';
import React, { useState, useCallback, useMemo } from 'react';

const MatrixInverse = () => {
  const [size, setSize] = useState(2); // 2 for 2x2, 3 for 3x3
  const [matrix, setMatrix] = useState(
    Array(3).fill().map(() => Array(3).fill(''))
  ); // 3x3 max size, initialized empty
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Compute determinant (helper function)
  const calculateDeterminant = (mat, n) => {
    const numMat = mat.map(row => row.map(val => parseFloat(val)));
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

  // Compute inverse of the matrix
  const calculateInverse = useCallback((mat, n) => {
    const steps = [`Calculating inverse of ${n}x${n} matrix:`];

    // Validate all elements are numeric
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (isNaN(parseFloat(mat[i][j]))) {
          return { error: 'All matrix elements must be valid numbers' };
        }
      }
    }

    const numMat = mat.map(row => row.map(val => parseFloat(val)));
    const det = calculateDeterminant(numMat, n);
    steps.push(`Determinant = ${det}`);

    if (det === 0) {
      steps.push('Determinant is 0: Matrix is not invertible.');
      return { error: 'Matrix is not invertible (determinant = 0)', steps };
    }

    let inverse;
    if (n === 2) {
      // 2x2 inverse: (1/det) * [[d, -b], [-c, a]]
      const [a, b] = numMat[0];
      const [c, d] = numMat[1];
      const scalar = 1 / det;
      inverse = [
        [(d * scalar).toFixed(2), (-b * scalar).toFixed(2)],
        [(-c * scalar).toFixed(2), (a * scalar).toFixed(2)],
      ];
      steps.push(`Formula: (1/det) * [[d, -b], [-c, a]]`);
      steps.push(`Adjugate = [[${d}, ${-b}], [${-c}, ${a}]]`);
      steps.push(`Inverse = (1/${det}) * adj = [[${inverse[0][0]}, ${inverse[0][1]}], [${inverse[1][0]}, ${inverse[1][1]}]]`);
    } else {
      // 3x3 inverse: (1/det) * adj(A), where adj(A) is the transpose of the cofactor matrix
      const [a, b, c] = numMat[0];
      const [d, e, f] = numMat[1];
      const [g, h, i] = numMat[2];

      // Cofactors
      const c11 = e * i - f * h;
      const c12 = -(d * i - f * g);
      const c13 = d * h - e * g;
      const c21 = -(b * i - c * h);
      const c22 = a * i - c * g;
      const c23 = -(a * h - b * g);
      const c31 = b * f - c * e;
      const c32 = -(a * f - c * d);
      const c33 = a * e - b * d;

      // Adjugate (transpose of cofactor matrix)
      const adj = [
        [c11, c21, c31],
        [c12, c22, c32],
        [c13, c23, c33],
      ];
      steps.push(`Cofactor matrix = [[${c11}, ${c12}, ${c13}], [${c21}, ${c22}, ${c23}], [${c31}, ${c32}, ${c33}]]`);
      steps.push(`Adjugate = transpose of cofactors = [[${c11}, ${c21}, ${c31}], [${c12}, ${c22}, ${c32}], [${c13}, ${c23}, ${c33}]]`);

      // Multiply by 1/det
      const scalar = 1 / det;
      inverse = adj.map(row => row.map(val => (val * scalar).toFixed(2)));
      steps.push(`Inverse = (1/${det}) * adj = [[${inverse[0].join(', ')}], [${inverse[1].join(', ')}], [${inverse[2].join(', ')}]]`);
    }

    return { inverse, steps };
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
    const activeCells = size * size;
    let filledCount = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (matrix[i][j]) filledCount++;
        if (matrix[i][j] && isNaN(parseFloat(matrix[i][j]))) return false;
      }
    }
    return filledCount === activeCells && Object.values(errors).every(err => !err);
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
    setMatrix(Array(3).fill().map(() => Array(3).fill('')));
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Matrix Inverse Calculator
        </h1>

        {/* Size Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {[2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setSize(n)}
              className={`px-4 py-2 rounded-lg transition-colors ${size === n ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {n}x{n}
            </button>
          ))}
        </div>

        {/* Matrix Input */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {Array(size).fill().map((_, i) =>
            Array(size).fill().map((_, j) => (
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
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
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

        {/* General Error */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {errors.general}
          </div>
        )}

        {/* Result Display */}
        {result && result.inverse && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Inverse Matrix:</h2>
            <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
              {result.inverse.map((row, i) =>
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

export default MatrixInverse;