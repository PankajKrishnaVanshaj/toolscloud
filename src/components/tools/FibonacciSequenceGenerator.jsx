'use client';
import React, { useState, useCallback, useMemo } from 'react';

const FibonacciSequenceGenerator = () => {
  const [start, setStart] = useState('0'); // Starting number (default 0)
  const [terms, setTerms] = useState(''); // Number of terms
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Generate Fibonacci sequence
  const generateFibonacci = useCallback(() => {
    const steps = ['Generating Fibonacci sequence:'];
    const startNum = parseFloat(start) || 0; // Default to 0 if invalid
    const numTerms = parseInt(terms);

    if (isNaN(numTerms) || numTerms <= 0 || !Number.isInteger(numTerms)) {
      return { error: 'Number of terms must be a positive integer' };
    }

    const sequence = [];
    steps.push(`Starting with ${startNum}, next term is ${startNum + 1}`);
    steps.push('Formula: F(n) = F(n-1) + F(n-2)');

    // First two terms
    sequence.push(startNum.toFixed(2));
    if (numTerms > 1) sequence.push((startNum + 1).toFixed(2));

    // Generate subsequent terms
    for (let n = 2; n < numTerms; n++) {
      const term = parseFloat(sequence[n - 1]) + parseFloat(sequence[n - 2]);
      sequence.push(term.toFixed(2));
      if (n < 5) {
        steps.push(`F(${n + 1}): ${sequence[n - 1]} + ${sequence[n - 2]} = ${term.toFixed(2)}`);
      }
    }
    if (numTerms > 5) steps.push(`...and so on up to ${numTerms} terms`);

    return { sequence, steps };
  }, [start, terms]);

  // Handle input changes with validation
  const handleStartChange = (e) => {
    const value = e.target.value;
    setStart(value);
    setResult(null);
    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, start: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, start: '' }));
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
      (!start || !isNaN(parseFloat(start))) &&
      terms && !isNaN(parseInt(terms)) && parseInt(terms) > 0 && Number.isInteger(parseFloat(terms)) &&
      Object.values(errors).every(err => !err)
    );
  }, [start, terms, errors]);

  // Generate sequence
  const generate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide a valid starting number and number of terms',
      }));
      return;
    }

    const genResult = generateFibonacci();
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
  };

  // Reset state
  const reset = () => {
    setStart('0');
    setTerms('');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Fibonacci Sequence Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Starting Number:</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={start}
                onChange={handleStartChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 0"
                aria-label="Starting number"
              />
              {errors.start && <p className="text-red-600 text-sm mt-1">{errors.start}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Number of Terms:</label>
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Fibonacci Sequence:</h2>
            <p className="text-center text-xl">{result.sequence.join(', ')}</p>
            <p className="text-center mt-2">Total Terms: {result.sequence.length}</p>
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

export default FibonacciSequenceGenerator;