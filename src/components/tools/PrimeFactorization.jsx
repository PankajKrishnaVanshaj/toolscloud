'use client';
import React, { useState, useCallback, useMemo } from 'react';

const PrimeFactorization = () => {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  // Compute prime factorization
  const factorize = useCallback((num) => {
    const steps = [`Factorizing ${num}:`];
    let n = parseInt(num);
    const factors = {};

    if (isNaN(n) || n <= 0) {
      return { error: 'Please enter a positive integer' };
    }
    if (n === 1) {
      steps.push('1 has no prime factors.');
      return { factors: {}, steps };
    }

    // Trial division
    while (n % 2 === 0) {
      factors[2] = (factors[2] || 0) + 1;
      steps.push(`${n} ÷ 2 = ${n / 2}`);
      n /= 2;
    }
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      while (n % i === 0) {
        factors[i] = (factors[i] || 0) + 1;
        steps.push(`${n} ÷ ${i} = ${n / i}`);
        n /= i;
      }
    }
    if (n > 2) {
      factors[n] = (factors[n] || 0) + 1;
      steps.push(`Remaining factor: ${n}`);
    }

    // Construct factorization string
    const factorization = Object.entries(factors)
      .map(([factor, count]) => (count > 1 ? `${factor}^${count}` : factor))
      .join(' × ');
    steps.push(`Prime factorization: ${factorization}`);

    return { factors, steps, factorization };
  }, []);

  // Handle input change with validation
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setResult(null); // Reset result on change
    setError('');

    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0 || !Number.isInteger(parseFloat(value)))) {
      setError('Please enter a positive integer');
    }
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    return number && !isNaN(parseInt(number)) && parseInt(number) > 0 && Number.isInteger(parseFloat(number)) && !error;
  }, [number, error]);

  // Perform factorization
  const calculate = () => {
    setError('');
    setResult(null);

    if (!isValid) {
      setError('Please enter a valid positive integer');
      return;
    }

    const calcResult = factorize(number);
    if (calcResult.error) {
      setError(calcResult.error);
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setNumber('');
    setResult(null);
    setError('');
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Prime Factorization
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
                placeholder="e.g., 60"
                aria-label="Number to factorize"
              />
              {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Factorize
          </button>
          <button
            onClick={reset}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
          >
            Reset
          </button>
        </div>

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Prime Factorization:</h2>
            <p className="text-center text-xl">
              {number} = {result.factorization || '1'}
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

export default PrimeFactorization;