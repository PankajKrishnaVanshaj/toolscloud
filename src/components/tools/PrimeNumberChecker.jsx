'use client';
import React, { useState, useCallback, useMemo } from 'react';

const PrimeNumberChecker = () => {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  // Check if a number is prime
  const isPrime = useCallback((num) => {
    const n = parseInt(num); // Ensure integer
    const steps = [`Checking if ${n} is prime:`];

    // Edge cases
    if (isNaN(n)) {
      return { error: 'Please enter a valid number' };
    }
    if (n <= 1) {
      steps.push(`${n} ≤ 1, so it’s not prime by definition.`);
      return { isPrime: false, steps };
    }
    if (n === 2) {
      steps.push(`2 is the only even prime number.`);
      return { isPrime: true, steps };
    }
    if (n % 2 === 0) {
      steps.push(`${n} is even and greater than 2, so it’s not prime.`);
      return { isPrime: false, steps };
    }

    // Check odd divisors up to sqrt(n)
    const sqrt = Math.sqrt(n);
    steps.push(`Testing divisors up to √${n} ≈ ${sqrt.toFixed(2)}`);
    for (let i = 3; i <= sqrt; i += 2) {
      if (n % i === 0) {
        steps.push(`${n} is divisible by ${i} (${n} / ${i} = ${n / i}), so it’s not prime.`);
        return { isPrime: false, steps };
      }
    }
    steps.push(`No divisors found between 2 and ${Math.floor(sqrt)}. ${n} is prime!`);
    return { isPrime: true, steps };
  }, []);

  // Validate input in real-time
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setError('');
    setResult(null); // Reset result on input change
    if (value && (isNaN(value) || !Number.isInteger(parseFloat(value)))) {
      setError('Please enter a whole number');
    }
  };

  // Check if input is valid for submission
  const isValid = useMemo(() => {
    return number && !isNaN(number) && Number.isInteger(parseFloat(number)) && !error;
  }, [number, error]);

  // Handle prime check
  const checkPrime = () => {
    setError('');
    setResult(null);

    if (!number) {
      setError('Please enter a number');
      return;
    }

    const calcResult = isPrime(number);
    if (calcResult.error) {
      setError(calcResult.error);
    } else {
      setResult(calcResult);
    }
  };

  // Reset everything
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
          Prime Number Checker
        </h1>

        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Number:</label>
            <input
              type="number"
              step="1" // Ensures integers only
              value={number}
              onChange={handleInputChange}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 17"
              aria-label="Number to check"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={checkPrime}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Check
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl">
              {result.isPrime ? `${number} is a prime number!` : `${number} is not a prime number.`}
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

export default PrimeNumberChecker;