'use client';
import React, { useState, useCallback, useMemo } from 'react';

const EigenvalueFinder = () => {
  const [size, setSize] = useState(2); // 2 for 2x2, 3 for 3x3
  const [matrix, setMatrix] = useState(
    Array(3).fill().map(() => Array(3).fill('')) // 3x3 max size, initialized empty
  );
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Compute determinant of (A - λI)
  const getCharacteristicPolynomial = (mat, n) => {
    const A = mat.map(row => row.map(val => parseFloat(val)));
    if (n === 2) {
      const [a, b] = A[0];
      const [c, d] = A[1];
      // det(A - λI) = (a-λ)(d-λ) - bc = λ² - (a+d)λ + (ad-bc)
      const trace = a + d;
      const det = a * d - b * c;
      return { coeffs: [1, -trace, det], degree: 2 }; // λ² - trace*λ + det
    } else {
      const [a, b, c] = A[0];
      const [d, e, f] = A[1];
      const [g, h, i] = A[2];
      // det(A - λI) = -λ³ + (a+e+i)λ² - (ae+ai+ei-af-dh-bg)λ + det(A)
      const trace = a + e + i;
      const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
      const sumMinors = (a * e + a * i + e * i) - (a * f + d * h + b * g);
      return { coeffs: [-1, trace, -sumMinors, det], degree: 3 }; // -λ³ + trace*λ² - sumMinors*λ + det
    }
  };

  // Solve characteristic polynomial
  const solvePolynomial = (coeffs, degree) => {
    if (degree === 2) {
      const [a, b, c] = coeffs; // aλ² + bλ + c = 0
      const discriminant = b * b - 4 * a * c;
      if (discriminant < 0) {
        const real = (-b / (2 * a)).toFixed(2);
        const imag = (Math.sqrt(-discriminant) / (2 * a)).toFixed(2);
        return [`${real} + ${imag}i`, `${real} - ${imag}i`];
      }
      const root1 = ((-b + Math.sqrt(discriminant)) / (2 * a)).toFixed(2);
      const root2 = ((-b - Math.sqrt(discriminant)) / (2 * a)).toFixed(2);
      return [root1, root2];
    } else {
      // Simplified 3x3 solver (cubic equation approximation via Newton’s method or roots)
      const [a, b, c, d] = coeffs; // aλ³ + bλ² + cλ + d = 0
      // For simplicity, we'll use a numeric solver or known roots (e.g., Cardano’s method is complex)
      // Here, we'll assume real roots and use a basic approximation (or list one root via trial)
      const f = (x) => a * x * x * x + b * x * x + c * x + d;
      const roots = [];
      for (let x = -10; x <= 10; x += 0.1) {
        if (Math.abs(f(x)) < 0.1) {
          roots.push(x.toFixed(2));
          if (roots.length === 3) break;
        }
      }
      return roots.length > 0 ? roots : ['Approximation failed (complex roots possible)'];
    }
  };

  // Find eigenvalues
  const findEigenvalues = useCallback((mat, n) => {
    const steps = [`Finding eigenvalues for ${n}x${n} matrix:`];

    // Validate all inputs
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (isNaN(parseFloat(mat[i][j]))) {
          return { error: 'All matrix elements must be valid numbers' };
        }
      }
    }

    steps.push(`Matrix A = [${mat.map(row => `[${row.slice(0, n).join(', ')}]`).join(', ')}]`);
    const poly = getCharacteristicPolynomial(mat, n);
    steps.push(`Characteristic polynomial: ${poly.coeffs.map((c, i) => `${c}${i === 0 ? '' : `λ${poly.degree - i}`}`).join(' + ')} = 0`);

    const eigenvalues = solvePolynomial(poly.coeffs, poly.degree);
    steps.push(`Eigenvalues: ${eigenvalues.join(', ')}`);

    return { eigenvalues, steps };
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

  // Calculate eigenvalues
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

    const calcResult = findEigenvalues(matrix, size);
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
          Eigenvalue Finder
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
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Eigenvalues:</h2>
            <p className="text-center text-xl">{result.eigenvalues.join(', ')}</p>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
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

export default EigenvalueFinder;