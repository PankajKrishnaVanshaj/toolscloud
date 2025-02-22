'use client'
import React, { useState } from 'react';

const FactorialCalculator = () => {
  const [number, setNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Calculate factorial
  const calculateFactorial = (n) => {
    const num = parseInt(n);
    if (isNaN(num) || num < 0) {
      return { error: 'Please enter a non-negative integer' };
    }
    if (num > 1000) { // Reasonable limit to prevent overflow
      return { error: 'Number too large (max 1000)' };
    }

    let factorial = 1n; // Use BigInt for large numbers
    const steps = [];
    
    if (num === 0 || num === 1) {
      steps.push(`${num}! = 1 (by definition)`);
    } else {
      let stepExpr = `${num}! = `;
      for (let i = num; i >= 1; i--) {
        factorial *= BigInt(i);
        stepExpr += `${i}${i > 1 ? ' × ' : ''}`;
      }
      steps.push(`${stepExpr} = ${factorial.toString()}`);
    }

    return {
      number: num,
      factorial: factorial.toString(), // Convert BigInt to string for display
      steps
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (!number) {
      setError('Please enter a number');
      return;
    }

    const calcResult = calculateFactorial(number);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
  };

  const reset = () => {
    setNumber('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Factorial Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Number:</label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g., 5"
              min="0"
              max="1000"
            />
            <span className="text-gray-700">!</span>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-all font-semibold"
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
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-teal-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Factorial Result:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-center text-xl">
                {result.number}! = {result.factorial}
              </p>
              
              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-teal-600 hover:underline"
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
              
              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Calculation Steps:</p>
                  <ul className="list-disc list-inside">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactorialCalculator;