'use client';
import React, { useState, useCallback, useMemo } from 'react';

const TaylorSeriesGenerator = () => {
  const [func, setFunc] = useState('sin'); // sin, cos, exp
  const [center, setCenter] = useState('0'); // Center point a
  const [terms, setTerms] = useState('5'); // Number of terms
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Factorial helper
  const factorial = (n) => {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
  };

  // Derivative functions
  const getDerivative = (func, k, a) => {
    const x = parseFloat(a);
    if (func === 'sin') {
      const cycle = k % 4;
      if (cycle === 0) return Math.sin(x);       // sin(x)
      if (cycle === 1) return Math.cos(x);       // cos(x)
      if (cycle === 2) return -Math.sin(x);      // -sin(x)
      if (cycle === 3) return -Math.cos(x);      // -cos(x)
    } else if (func === 'cos') {
      const cycle = k % 4;
      if (cycle === 0) return Math.cos(x);       // cos(x)
      if (cycle === 1) return -Math.sin(x);      // -sin(x)
      if (cycle === 2) return -Math.cos(x);      // -cos(x)
      if (cycle === 3) return Math.sin(x);       // sin(x)
    } else if (func === 'exp') {
      return Math.exp(x);                        // e^x (all derivatives are e^x)
    }
    return 0;
  };

  // Generate Taylor series
  const generateTaylorSeries = useCallback(() => {
    const steps = [`Generating Taylor series for ${func === 'sin' ? 'sin(x)' : func === 'cos' ? 'cos(x)' : 'e^x'} around x = ${center}:`];
    const a = parseFloat(center);
    const n = parseInt(terms);

    if (isNaN(a)) {
      return { error: 'Center point must be a valid number' };
    }
    if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
      return { error: 'Number of terms must be a positive integer' };
    }

    steps.push(`Formula: f(x) = Σ [f^(k)(a) / k!] * (x - a)^k from k = 0 to ${n - 1}`);

    const seriesTerms = [];
    for (let k = 0; k < n; k++) {
      const deriv = getDerivative(func, k, a);
      const coeff = deriv / factorial(k);
      const term = coeff === 0 ? null : k === 0 ? coeff.toFixed(4) : `${coeff.toFixed(4)} * (x - ${a})^${k}`;
      if (term) seriesTerms.push(term);

      steps.push(`k = ${k}: f^(${k})(${a}) = ${deriv.toFixed(4)}, ${k}! = ${factorial(k)}, Term = ${coeff.toFixed(4)} * (x - ${a})^${k === 0 ? '' : k}`);
    }

    const series = seriesTerms.join(' + ').replace(/\+\s*-/, '- ');
    steps.push(`Taylor Series: ${series}`);
    return { series, steps };
  }, [func, center, terms]);

  // Handle input changes
  const handleCenterChange = (e) => {
    const value = e.target.value;
    setCenter(value);
    setResult(null);
    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, center: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, center: '' }));
    }
  };

  const handleTermsChange = (e) => {
    const value = e.target.value;
    setTerms(value);
    setResult(null);
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0 || !Number.isInteger(parseFloat(value)))) {
      setErrors((prev) => ({ ...prev, terms: 'Must be a positive integer' }));
    } else {
      setErrors((prev) => ({ ...prev, terms: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      center && !isNaN(parseFloat(center)) &&
      terms && !isNaN(parseInt(terms)) && parseInt(terms) > 0 && Number.isInteger(parseFloat(terms)) &&
      Object.values(errors).every(err => !err)
    );
  }, [center, terms, errors]);

  // Generate series
  const generate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs',
      }));
      return;
    }

    const genResult = generateTaylorSeries();
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
  };

  // Reset state
  const reset = () => {
    setFunc('sin');
    setCenter('0');
    setTerms('5');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Taylor Series Generator
        </h1>

        {/* Function Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {['sin', 'cos', 'exp'].map((f) => (
            <button
              key={f}
              onClick={() => setFunc(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${func === f ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {f === 'sin' ? 'sin(x)' : f === 'cos' ? 'cos(x)' : 'e^x'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Center (a):</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={center}
                onChange={handleCenterChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0"
                aria-label="Center point"
              />
              {errors.center && <p className="text-red-600 text-sm mt-1">{errors.center}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Terms (n):</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={terms}
                onChange={handleTermsChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
                aria-label="Number of terms"
              />
              {errors.terms && <p className="text-red-600 text-sm mt-1">{errors.terms}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={generate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Generate
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Taylor Series:</h2>
            <p className="text-center text-xl mt-2">{result.series}</p>
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

export default TaylorSeriesGenerator;