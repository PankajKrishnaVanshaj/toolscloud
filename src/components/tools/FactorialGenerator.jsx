'use client';
import React, { useState, useCallback, useMemo } from 'react';

const FactorialGenerator = () => {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate factorial
  const calculateFactorial = useCallback((n) => {
    const steps = [`Calculating factorial of ${n}:`];
    if (isNaN(n) || n < 0 || !Number.isInteger(n)) {
      return { error: 'Please enter a non-negative integer' };
    }

    if (n > 100) { // Arbitrary limit to prevent overflow or performance issues
      return { error: 'Number too large (max 100)' };
    }

    let factorial = 1n; // Use BigInt to handle large numbers
    steps.push(`${n}! = ${n === 0 ? '1 (by definition)' : `${n} × ${n - 1} × ... × 1`}`);

    if (n === 0) {
      return { factorial: '1', steps };
    }

    const breakdown = [];
    for (let i = n; i >= 1; i--) {
      factorial *= BigInt(i);
      breakdown.push(i);
      if (breakdown.length <= 5 || i === 1) { // Limit steps to first 5 and last term
        steps.push(`Step: ${breakdown.join(' × ')} = ${factorial.toString()}`);
      }
    }
    if (n > 5) steps.splice(2, n - 5, '...'); // Replace middle steps with ellipsis for large n

    return { factorial: factorial.toString(), steps };
  }, []);

  // Handle input change with validation
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setResult(null);

    if (value === '') {
      setErrors((prev) => ({ ...prev, number: 'Number is required' }));
    } else if (isNaN(parseInt(value)) || parseInt(value) < 0 || !Number.isInteger(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, number: 'Must be a non-negative integer' }));
    } else if (parseInt(value) > 100) {
      setErrors((prev) => ({ ...prev, number: 'Max value is 100' }));
    } else {
      setErrors((prev) => ({ ...prev, number: '' }));
    }
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    return (
      number !== '' &&
      !isNaN(parseInt(number)) &&
      parseInt(number) >= 0 &&
      Number.isInteger(parseFloat(number)) &&
      parseInt(number) <= 100 &&
      !errors.number
    );
  }, [number, errors]);

  // Generate factorial
  const generate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide a valid non-negative integer (max 100)',
      }));
      return;
    }

    const calcResult = calculateFactorial(parseInt(number));
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setNumber('');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Factorial Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Number:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={number}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
                aria-label="Number to calculate factorial"
              />
              {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
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
              {number}! = {result.factorial}
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

export default FactorialGenerator;