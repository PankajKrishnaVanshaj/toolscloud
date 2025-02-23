'use client';
import React, { useState, useCallback, useMemo } from 'react';

const PermutationCalculator = () => {
  const [mode, setMode] = useState('standard'); // standard (P(n, r)), repetition
  const [inputs, setInputs] = useState({ n: '', r: '', repetition: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Factorial function
  const factorial = (num) => {
    if (num === 0 || num === 1) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
  };

  // Calculate permutations
  const calculatePermutation = useCallback((mode, inputs) => {
    const steps = [`Calculating ${mode === 'standard' ? 'P(n, r)' : 'permutations with repetition'}:`];

    if (mode === 'standard') {
      const n = parseInt(inputs.n);
      const r = parseInt(inputs.r);

      if (isNaN(n) || isNaN(r) || n < 0 || r < 0 || r > n) {
        return { error: 'n and r must be non-negative integers, r ≤ n' };
      }

      const permutation = factorial(n) / factorial(n - r);
      steps.push(`Formula: P(n, r) = n! / (n - r)!`);
      steps.push(`P(${n}, ${r}) = ${n}! / (${n} - ${r})!`);
      steps.push(`= ${factorial(n)} / ${factorial(n - r)} = ${permutation}`);
      return { result: permutation, steps, label: `P(${n}, ${r})` };
    } else if (mode === 'repetition') {
      const counts = inputs.repetition.split(',').map(val => parseInt(val.trim())).filter(val => !isNaN(val));
      
      if (counts.length === 0 || counts.some(val => val < 0)) {
        return { error: 'Enter a comma-separated list of non-negative integers (e.g., 2, 3, 1)' };
      }

      const total = counts.reduce((sum, val) => sum + val, 0);
      const numerator = factorial(total);
      const denominator = counts.reduce((prod, val) => prod * factorial(val), 1);
      const permutation = numerator / denominator;

      steps.push(`Formula: n! / (n₁! * n₂! * ... * nₖ!), where n = total items, nᵢ = repetitions`);
      steps.push(`Total items (n) = ${total}`);
      steps.push(`Repetitions = ${counts.join(', ')}`);
      steps.push(`P = ${total}! / (${counts.map(val => `${val}!`).join(' * ')})`);
      steps.push(`= ${numerator} / ${denominator} = ${permutation}`);
      return { result: permutation, steps, label: `Permutations with repetition` };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (field === 'repetition') {
      const counts = value.split(',').map(val => parseInt(val.trim())).filter(val => !isNaN(val));
      if (value && (counts.length === 0 || counts.some(val => val < 0))) {
        setErrors((prev) => ({ ...prev, [field]: 'Must be comma-separated non-negative integers' }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    } else {
      if (value && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
        setErrors((prev) => ({ ...prev, [field]: 'Must be a non-negative integer' }));
      } else if (field === 'r' && inputs.n && value && parseInt(value) > parseInt(inputs.n)) {
        setErrors((prev) => ({ ...prev, [field]: 'r must be ≤ n' }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    }
  };

  // Check if inputs are valid based on mode
  const isValid = useMemo(() => {
    if (mode === 'standard') {
      return (
        inputs.n && !isNaN(parseInt(inputs.n)) && parseInt(inputs.n) >= 0 &&
        inputs.r && !isNaN(parseInt(inputs.r)) && parseInt(inputs.r) >= 0 && parseInt(inputs.r) <= parseInt(inputs.n) &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'repetition') {
      const counts = inputs.repetition.split(',').map(val => parseInt(val.trim())).filter(val => !isNaN(val));
      return (
        inputs.repetition && counts.length > 0 && counts.every(val => val >= 0) &&
        Object.values(errors).every(err => !err)
      );
    }
    return false;
  }, [mode, inputs, errors]);

  // Calculate permutation
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

    const calcResult = calculatePermutation(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setMode('standard');
    setInputs({ n: '', r: '', repetition: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Permutation Calculator
        </h1>

        {/* Mode Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {['standard', 'repetition'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {m === 'standard' ? 'P(n, r)' : 'With Repetition'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {mode === 'standard' && (
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
                    aria-label="Total items (n)"
                  />
                  {errors.n && <p className="text-red-600 text-sm mt-1">{errors.n}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">r (arrange):</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="1"
                    value={inputs.r}
                    onChange={handleInputChange('r')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3"
                    aria-label="Items to arrange (r)"
                  />
                  {errors.r && <p className="text-red-600 text-sm mt-1">{errors.r}</p>}
                </div>
              </div>
            </>
          )}
          {mode === 'repetition' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Repetitions:</label>
              <div className="flex-1">
                <input
                  type="text"
                  value={inputs.repetition}
                  onChange={handleInputChange('repetition')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2, 3, 1"
                  aria-label="Comma-separated repetition counts"
                />
                {errors.repetition && <p className="text-red-600 text-sm mt-1">{errors.repetition}</p>}
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

export default PermutationCalculator;