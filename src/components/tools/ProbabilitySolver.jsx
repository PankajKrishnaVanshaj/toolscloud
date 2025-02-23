'use client';
import React, { useState, useCallback, useMemo } from 'react';

const ProbabilitySolver = () => {
  const [mode, setMode] = useState('independent'); // independent, combination, binomial
  const [inputs, setInputs] = useState({ p1: '', p2: '', n: '', k: '', p: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate probability based on mode
  const calculateProbability = useCallback((mode, inputs) => {
    const steps = [`Calculating probability for ${mode} scenario:`];

    if (mode === 'independent') {
      const p1 = parseFloat(inputs.p1);
      const p2 = parseFloat(inputs.p2);

      if (isNaN(p1) || isNaN(p2) || p1 < 0 || p1 > 1 || p2 < 0 || p2 > 1) {
        return { error: 'Probabilities must be between 0 and 1' };
      }

      const prob = p1 * p2;
      steps.push(`P(A and B) = P(A) * P(B)`);
      steps.push(`= ${p1} * ${p2} = ${prob.toFixed(4)}`);
      return { result: prob.toFixed(4), steps, label: 'P(A and B)' };
    } else if (mode === 'combination') {
      const n = parseInt(inputs.n);
      const k = parseInt(inputs.k);

      if (isNaN(n) || isNaN(k) || n < 0 || k < 0 || k > n || !Number.isInteger(n) || !Number.isInteger(k)) {
        return { error: 'n and k must be non-negative integers, k ≤ n' };
      }

      const factorial = (num) => {
        if (num <= 1) return 1;
        return num * factorial(num - 1);
      };
      const comb = factorial(n) / (factorial(k) * factorial(n - k));
      steps.push(`C(n, k) = n! / (k! * (n - k)!)`);
      steps.push(`= ${n}! / (${k}! * ${n - k}!) = ${comb}`);
      return { result: comb, steps, label: `C(${n}, ${k})` };
    } else if (mode === 'binomial') {
      const n = parseInt(inputs.n);
      const k = parseInt(inputs.k);
      const p = parseFloat(inputs.p);

      if (isNaN(n) || isNaN(k) || isNaN(p) || n < 0 || k < 0 || k > n || p < 0 || p > 1 || !Number.isInteger(n) || !Number.isInteger(k)) {
        return { error: 'n and k must be non-negative integers (k ≤ n), p must be between 0 and 1' };
      }

      const factorial = (num) => {
        if (num <= 1) return 1;
        return num * factorial(num - 1);
      };
      const comb = factorial(n) / (factorial(k) * factorial(n - k));
      const prob = comb * Math.pow(p, k) * Math.pow(1 - p, n - k);
      steps.push(`P(X = k) = C(n, k) * p^k * (1 - p)^(n - k)`);
      steps.push(`C(${n}, ${k}) = ${n}! / (${k}! * ${n - k}!) = ${comb}`);
      steps.push(`p^k = ${p}^${k} = ${(Math.pow(p, k)).toFixed(4)}`);
      steps.push(`(1 - p)^(n - k) = ${1 - p}^${n - k} = ${(Math.pow(1 - p, n - k)).toFixed(4)}`);
      steps.push(`P(X = ${k}) = ${comb} * ${(Math.pow(p, k)).toFixed(4)} * ${(Math.pow(1 - p, n - k)).toFixed(4)} = ${prob.toFixed(4)}`);
      return { result: prob.toFixed(4), steps, label: `P(X = ${k})` };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else if ((field === 'p1' || field === 'p2' || field === 'p') && value && (parseFloat(value) < 0 || parseFloat(value) > 1)) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be between 0 and 1' }));
    } else if ((field === 'n' || field === 'k') && value && (!Number.isInteger(parseFloat(value)) || parseFloat(value) < 0)) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a non-negative integer' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid based on mode
  const isValid = useMemo(() => {
    if (mode === 'independent') {
      return (
        inputs.p1 && !isNaN(parseFloat(inputs.p1)) && parseFloat(inputs.p1) >= 0 && parseFloat(inputs.p1) <= 1 &&
        inputs.p2 && !isNaN(parseFloat(inputs.p2)) && parseFloat(inputs.p2) >= 0 && parseFloat(inputs.p2) <= 1 &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'combination') {
      const n = parseInt(inputs.n);
      const k = parseInt(inputs.k);
      return (
        inputs.n && !isNaN(n) && n >= 0 && Number.isInteger(n) &&
        inputs.k && !isNaN(k) && k >= 0 && k <= n && Number.isInteger(k) &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'binomial') {
      const n = parseInt(inputs.n);
      const k = parseInt(inputs.k);
      return (
        inputs.n && !isNaN(n) && n >= 0 && Number.isInteger(n) &&
        inputs.k && !isNaN(k) && k >= 0 && k <= n && Number.isInteger(k) &&
        inputs.p && !isNaN(parseFloat(inputs.p)) && parseFloat(inputs.p) >= 0 && parseFloat(inputs.p) <= 1 &&
        Object.values(errors).every(err => !err)
      );
    }
    return false;
  }, [mode, inputs, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs for the selected mode',
      }));
      return;
    }

    const calcResult = calculateProbability(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setMode('independent');
    setInputs({ p1: '', p2: '', n: '', k: '', p: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Probability Solver
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['independent', 'combination', 'binomial'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {m === 'independent' ? 'Independent Events' : m === 'combination' ? 'Combinations' : 'Binomial Probability'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {mode === 'independent' && (
            <>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">P(A):</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.p1}
                    onChange={handleInputChange('p1')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 0.5"
                    aria-label="Probability of event A"
                  />
                  {errors.p1 && <p className="text-red-600 text-sm mt-1">{errors.p1}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">P(B):</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.p2}
                    onChange={handleInputChange('p2')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 0.3"
                    aria-label="Probability of event B"
                  />
                  {errors.p2 && <p className="text-red-600 text-sm mt-1">{errors.p2}</p>}
                </div>
              </div>
            </>
          )}
          {(mode === 'combination' || mode === 'binomial') && (
            <>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">n (total):</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="1"
                    value={inputs.n}
                    onChange={handleInputChange('n')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5"
                    aria-label="Total number"
                  />
                  {errors.n && <p className="text-red-600 text-sm mt-1">{errors.n}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">k (successes):</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="1"
                    value={inputs.k}
                    onChange={handleInputChange('k')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2"
                    aria-label="Number of successes"
                  />
                  {errors.k && <p className="text-red-600 text-sm mt-1">{errors.k}</p>}
                </div>
              </div>
            </>
          )}
          {mode === 'binomial' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">p (success):</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.p}
                  onChange={handleInputChange('p')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 0.4"
                  aria-label="Probability of success"
                />
                {errors.p && <p className="text-red-600 text-sm mt-1">{errors.p}</p>}
              </div>
            </div>
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl">
              {result.label} = {result.result}
            </p>
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

export default ProbabilitySolver;