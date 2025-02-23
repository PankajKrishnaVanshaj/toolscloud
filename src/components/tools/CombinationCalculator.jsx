'use client';
import React, { useState, useCallback, useMemo } from 'react';

const CombinationCalculator = () => {
  const [type, setType] = useState('combination'); // combination, permutation, factorial
  const [inputs, setInputs] = useState({ n: '', k: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Factorial helper function
  const factorial = (num) => {
    if (num === 0 || num === 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
  };

  // Calculate combinatorial result
  const calculateCombinatorial = useCallback((type, inputs) => {
    const steps = [`Calculating ${type === 'combination' ? 'C(n, k)' : type === 'permutation' ? 'P(n, k)' : 'n!'}:`];
    const n = parseInt(inputs.n);
    const k = parseInt(inputs.k);

    if (type !== 'factorial' && (isNaN(n) || isNaN(k) || n < 0 || k < 0 || k > n)) {
      return { error: 'n and k must be non-negative integers, k ≤ n' };
    }
    if (type === 'factorial' && (isNaN(n) || n < 0)) {
      return { error: 'n must be a non-negative integer' };
    }

    if (type === 'combination') {
      const numerator = factorial(n);
      const denominator = factorial(k) * factorial(n - k);
      const value = numerator / denominator;
      steps.push(`Formula: C(n, k) = n! / (k! * (n-k)!)`);
      steps.push(`C(${n}, ${k}) = ${n}! / (${k}! * ${n - k}!)`);
      steps.push(`= ${numerator} / (${factorial(k)} * ${factorial(n - k)}) = ${value}`);
      return { result: value, steps, label: `C(${n}, ${k})` };
    } else if (type === 'permutation') {
      const numerator = factorial(n);
      const denominator = factorial(n - k);
      const value = numerator / denominator;
      steps.push(`Formula: P(n, k) = n! / (n-k)!)`);
      steps.push(`P(${n}, ${k}) = ${n}! / ${n - k}!`);
      steps.push(`= ${numerator} / ${denominator} = ${value}`);
      return { result: value, steps, label: `P(${n}, ${k})` };
    } else if (type === 'factorial') {
      const value = factorial(n);
      steps.push(`Formula: n! = n * (n-1) * ... * 1`);
      steps.push(`${n}! = ${value}`);
      return { result: value, steps, label: `${n}!` };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && (isNaN(parseInt(value)) || parseInt(value) < 0 || !Number.isInteger(parseFloat(value)))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a non-negative integer' }));
    } else if (field === 'k' && value && parseInt(value) > parseInt(inputs.n)) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be ≤ n' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid based on type
  const isValid = useMemo(() => {
    const nValid = inputs.n && !isNaN(parseInt(inputs.n)) && parseInt(inputs.n) >= 0 && Number.isInteger(parseFloat(inputs.n));
    if (!nValid) return false;

    if (type === 'factorial') {
      return Object.values(errors).every(err => !err);
    }

    const kValid = inputs.k && !isNaN(parseInt(inputs.k)) && parseInt(inputs.k) >= 0 && Number.isInteger(parseFloat(inputs.k)) && parseInt(inputs.k) <= parseInt(inputs.n);
    return kValid && Object.values(errors).every(err => !err);
  }, [type, inputs, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs for the selected calculation type',
      }));
      return;
    }

    const calcResult = calculateCombinatorial(type, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setType('combination');
    setInputs({ n: '', k: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Combination Calculator
        </h1>

        {/* Type Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['combination', 'permutation', 'factorial'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-lg transition-colors ${type === t ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {t === 'combination' ? 'Combination' : t === 'permutation' ? 'Permutation' : 'Factorial'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
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
                aria-label="Total items (n)"
              />
              {errors.n && <p className="text-red-600 text-sm mt-1">{errors.n}</p>}
            </div>
          </div>
          {type !== 'factorial' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">k (choose):</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="1"
                  value={inputs.k}
                  onChange={handleInputChange('k')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
                  aria-label="Items to choose (k)"
                />
                {errors.k && <p className="text-red-600 text-sm mt-1">{errors.k}</p>}
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

export default CombinationCalculator;