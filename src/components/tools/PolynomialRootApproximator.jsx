'use client';
import React, { useState, useCallback, useMemo } from 'react';

const PolynomialRootApproximator = () => {
  const [coefficients, setCoefficients] = useState({ a: '', b: '', c: '' }); // ax² + bx + c
  const [initialGuess, setInitialGuess] = useState('0'); // Starting point for Newton-Raphson
  const [maxIterations, setMaxIterations] = useState('20'); // Max iterations
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Evaluate polynomial at x
  const evaluatePoly = (coeffs, x) => {
    const { a, b, c } = coeffs;
    return (a || 0) * x * x + (b || 0) * x + (c || 0);
  };

  // Evaluate derivative of polynomial at x
  const evaluateDerivative = (coeffs, x) => {
    const { a, b } = coeffs;
    return 2 * (a || 0) * x + (b || 0);
  };

  // Newton-Raphson method to approximate a root
  const newtonRaphson = (coeffs, x0, maxIter) => {
    const steps = [`Approximating root with Newton-Raphson, initial guess x₀ = ${x0}:`];
    let x = x0;
    const tolerance = 1e-6;
    const polyStr = `${coeffs.a || 0}x² + ${coeffs.b || 0}x + ${coeffs.c || 0}`;

    for (let i = 0; i < maxIter; i++) {
      const fx = evaluatePoly(coeffs, x);
      const dfx = evaluateDerivative(coeffs, x);
      
      if (Math.abs(dfx) < tolerance) {
        steps.push(`Iteration ${i + 1}: Derivative ≈ 0 at x = ${x.toFixed(6)}, method stalled`);
        return { root: null, steps, converged: false };
      }

      const nextX = x - fx / dfx;
      steps.push(`Iteration ${i + 1}: x_${i + 1} = ${x.toFixed(6)} - f(${x.toFixed(6)}) / f'(${x.toFixed(6)}) = ${nextX.toFixed(6)}`);
      steps.push(`f(${x.toFixed(6)}) = ${fx.toFixed(6)}, f'(${x.toFixed(6)}) = ${dfx.toFixed(6)}`);

      if (Math.abs(nextX - x) < tolerance) {
        steps.push(`Converged to root x ≈ ${nextX.toFixed(6)} after ${i + 1} iterations`);
        return { root: nextX.toFixed(6), steps, converged: true };
      }
      x = nextX;
    }

    steps.push(`Did not converge within ${maxIter} iterations, last approximation: ${x.toFixed(6)}`);
    return { root: x.toFixed(6), steps, converged: false };
  };

  // Approximate roots
  const approximateRoots = useCallback(() => {
    const coeffs = {
      a: parseFloat(coefficients.a) || 0,
      b: parseFloat(coefficients.b) || 0,
      c: parseFloat(coefficients.c) || 0,
    };
    const x0 = parseFloat(initialGuess) || 0;
    const maxIter = parseInt(maxIterations) || 20;

    if (coeffs.a === 0 && coeffs.b === 0) {
      return { error: 'Polynomial must have at least one non-zero coefficient (excluding constant)' };
    }

    const roots = [];
    const rootResult = newtonRaphson(coeffs, x0, maxIter);
    if (rootResult.root) roots.push(rootResult.root);

    // For quadratics, try a second initial guess to find another root
    if (coeffs.a !== 0) {
      const secondGuess = x0 + 1; // Offset initial guess
      const secondResult = newtonRaphson(coeffs, secondGuess, maxIter);
      if (secondResult.root && secondResult.root !== roots[0]) {
        roots.push(secondResult.root);
        rootResult.steps.push(...secondResult.steps.slice(1)); // Combine steps
      }
    }

    return { roots, steps: rootResult.steps };
  }, [coefficients, initialGuess, maxIterations]);

  // Handle input changes
  const handleCoefficientChange = (field) => (e) => {
    const value = e.target.value;
    setCoefficients((prev) => ({ ...prev, [field]: value }));
    setResult(null);
    
    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleInitialGuessChange = (e) => {
    const value = e.target.value;
    setInitialGuess(value);
    setResult(null);
    
    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, initialGuess: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, initialGuess: '' }));
    }
  };

  const handleMaxIterationsChange = (e) => {
    const value = e.target.value;
    setMaxIterations(value);
    setResult(null);
    
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
      setErrors((prev) => ({ ...prev, maxIterations: 'Must be a positive integer' }));
    } else {
      setErrors((prev) => ({ ...prev, maxIterations: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const coeffsValid = Object.values(coefficients).some(val => val && !isNaN(parseFloat(val)));
    const guessValid = initialGuess && !isNaN(parseFloat(initialGuess));
    const iterValid = maxIterations && !isNaN(parseInt(maxIterations)) && parseInt(maxIterations) > 0;
    return coeffsValid && guessValid && iterValid && Object.values(errors).every(err => !err);
  }, [coefficients, initialGuess, maxIterations, errors]);

  // Approximate roots
  const approximate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs',
      }));
      return;
    }

    const approxResult = approximateRoots();
    if (approxResult.error) {
      setErrors({ general: approxResult.error });
    } else {
      setResult(approxResult);
    }
  };

  // Reset state
  const reset = () => {
    setCoefficients({ a: '', b: '', c: '' });
    setInitialGuess('0');
    setMaxIterations('20');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Polynomial Root Approximator
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {['a', 'b', 'c'].map((field) => (
            <div key={field} className="flex items-center gap-2">
              <label className="w-32 text-gray-700">
                {field} ({field === 'a' ? 'x²' : field === 'b' ? 'x' : 'constant'}):
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={coefficients[field]}
                  onChange={handleCoefficientChange(field)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === 'a' ? '1' : field === 'b' ? '-4' : '4'}`}
                  aria-label={`${field} coefficient`}
                />
                {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Initial Guess:</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={initialGuess}
                onChange={handleInitialGuessChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0"
                aria-label="Initial guess"
              />
              {errors.initialGuess && <p className="text-red-600 text-sm mt-1">{errors.initialGuess}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Max Iterations:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={maxIterations}
                onChange={handleMaxIterationsChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 20"
                aria-label="Maximum iterations"
              />
              {errors.maxIterations && <p className="text-red-600 text-sm mt-1">{errors.maxIterations}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={approximate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Approximate
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Approximated Roots:</h2>
            {result.roots.length > 0 ? (
              <ul className="text-center text-xl space-y-1">
                {result.roots.map((root, i) => (
                  <li key={i}>{root}</li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-xl">No roots found within iterations</p>
            )}
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-2 text-sm text-blue-600 hover:underline"
            >
              {showSteps ? 'Hide Steps' : 'Show Steps'}
            </button>
            {showSteps && (
              <ul className="mt-2 text-sm list-disc list-inside transition-opacity max-h-40 overflow-y-auto">
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

export default PolynomialRootApproximator;