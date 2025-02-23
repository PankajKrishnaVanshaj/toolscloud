'use client';
import React, { useState, useCallback, useMemo } from 'react';

const SystemOfEquationsSolver = () => {
  const [size, setSize] = useState(2); // 2 for 2x2, 3 for 3x3
  const [equations, setEquations] = useState(
    Array(3).fill().map(() => Array(4).fill('')) // [a, b, c, d] for ax + by + cz = d
  ); 
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate determinant of a matrix
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

  // Solve system using Cramer's rule
  const solveSystem = useCallback((eqs, n) => {
    const steps = [`Solving ${n}x${n} system using Cramer's rule:`];

    // Validate all inputs
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n + 1; j++) {
        if (isNaN(parseFloat(eqs[i][j]))) {
          return { error: 'All coefficients and constants must be valid numbers' };
        }
      }
    }

    const numEqs = eqs.map(row => row.map(val => parseFloat(val)));

    // Coefficient matrix (A)
    const A = numEqs.map(row => row.slice(0, n));
    const detA = calculateDeterminant(A, n);
    steps.push(`Main determinant (det A) = ${detA}`);

    if (detA === 0) {
      steps.push('det A = 0: System has no unique solution (infinite or none).');
      return { error: 'System has no unique solution (determinant = 0)', steps };
    }

    // Constants (right-hand side)
    const b = numEqs.map(row => row[n]);
    steps.push(`Equations:`);
    for (let i = 0; i < n; i++) {
      steps.push(`${A[i].map((coef, j) => `${coef}${['x', 'y', 'z'][j]}`).join(' + ')} = ${b[i]}`);
    }

    // Solve for each variable using Cramer's rule
    const solutions = [];
    for (let i = 0; i < n; i++) {
      const Ai = A.map(row => [...row]);
      for (let j = 0; j < n; j++) {
        Ai[j][i] = b[j]; // Replace column i with constants
      }
      const detAi = calculateDeterminant(Ai, n);
      steps.push(`det A_${['x', 'y', 'z'][i]} = ${detAi}`);
      const solution = detAi / detA;
      solutions.push(solution.toFixed(2));
    }

    steps.push(`Solutions:`);
    steps.push(`x = det A_x / det A = ${solutions[0]}`);
    steps.push(`y = det A_y / det A = ${solutions[1]}`);
    if (n === 3) steps.push(`z = det A_z / det A = ${solutions[2]}`);

    return { solutions, steps };
  }, []);

  // Handle equation input changes
  const handleInputChange = (i, j) => (e) => {
    const value = e.target.value;
    setEquations((prev) => {
      const newEqs = prev.map(row => [...row]);
      newEqs[i][j] = value;
      return newEqs;
    });
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${i}${j}`]: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, [`${i}${j}`]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const activeCells = size * (size + 1);
    let filledCount = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size + 1; j++) {
        if (equations[i][j]) filledCount++;
        if (equations[i][j] && isNaN(parseFloat(equations[i][j]))) return false;
      }
    }
    return filledCount === activeCells && Object.values(errors).every(err => !err);
  }, [equations, size, errors]);

  // Solve system
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

  // Reset state
  const reset = () => {
    setSize(2);
    setEquations(Array(3).fill().map(() => Array(4).fill('')));
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          System of Equations Solver
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

        {/* Equations Input */}
        <div className="space-y-4 mb-6">
          {Array(size).fill().map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-1 gap-2">
                {Array(size).fill().map((_, j) => (
                  <div key={j} className="flex items-center">
                    <input
                      type="number"
                      step="0.01"
                      value={equations[i][j]}
                      onChange={handleInputChange(i, j)}
                      className="w-16 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder="0"
                      aria-label={`Coefficient of ${['x', 'y', 'z'][j]} in equation ${i + 1}`}
                    />
                    <span className="mx-1">{['x', 'y', 'z'][j]}</span>
                    {j < size - 1 && <span>+</span>}
                    {errors[`${i}${j}`] && <p className="text-red-600 text-xs ml-2">{errors[`${i}${j}`]}</p>}
                  </div>
                ))}
                <span>=</span>
                <input
                  type="number"
                  step="0.01"
                  value={equations[i][size]}
                  onChange={handleInputChange(i, size)}
                  className="w-16 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  placeholder="0"
                  aria-label={`Constant in equation ${i + 1}`}
                />
                {errors[`${i}${size}`] && <p className="text-red-600 text-xs ml-2">{errors[`${i}${size}`]}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={solve}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Solve
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
        {result && result.solutions && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Solutions:</h2>
            <div className="text-center text-xl space-y-2">
              <p>x = {result.solutions[0]}</p>
              <p>y = {result.solutions[1]}</p>
              {size === 3 && <p>z = {result.solutions[2]}</p>}
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

export default SystemOfEquationsSolver;