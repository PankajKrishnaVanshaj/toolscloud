'use client'
import React, { useState } from 'react';

const GCDLCMCalculator = () => {
  const [number1, setNumber1] = useState('');
  const [number2, setNumber2] = useState('');
  const [result, setResult] = useState({ gcd: null, lcm: null });
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // Calculate GCD using Euclidean algorithm
  const calculateGCD = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  // Calculate LCM using GCD
  const calculateLCM = (a, b, gcd) => {
    return Math.abs(a * b) / gcd;
  };

  // Prime factorization (for detailed breakdown)
  const getPrimeFactors = (num) => {
    const factors = {};
    let n = Math.abs(num);
    for (let i = 2; i <= n; i++) {
      while (n % i === 0) {
        factors[i] = (factors[i] || 0) + 1;
        n /= i;
      }
    }
    return factors;
  };

  const calculate = () => {
    setError('');
    const num1 = parseInt(number1);
    const num2 = parseInt(number2);

    // Validation
    if (isNaN(num1) || isNaN(num2)) {
      setError('Please enter valid numbers');
      setResult({ gcd: null, lcm: null });
      return;
    }

    if (num1 === 0 && num2 === 0) {
      setError('GCD and LCM are undefined for two zeros');
      setResult({ gcd: null, lcm: null });
      return;
    }

    const gcd = calculateGCD(num1, num2);
    const lcm = calculateLCM(num1, num2, gcd);
    const factors1 = getPrimeFactors(num1);
    const factors2 = getPrimeFactors(num2);

    setResult({ gcd, lcm, factors1, factors2 });
    setHistory(prev => [...prev.slice(-4), {
      num1,
      num2,
      gcd,
      lcm
    }]);
  };

  const reset = () => {
    setNumber1('');
    setNumber2('');
    setResult({ gcd: null, lcm: null });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          GCD & LCM Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="flex gap-4 justify-center">
            <input
              type="number"
              value={number1}
              onChange={(e) => setNumber1(e.target.value)}
              className="w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              placeholder="First Number"
            />
            <input
              type="number"
              value={number2}
              onChange={(e) => setNumber2(e.target.value)}
              className="w-32 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              placeholder="Second Number"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all font-semibold"
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
        {result.gcd !== null && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <div className="mt-2 space-y-2">
              <p className="text-xl text-center">GCD: {result.gcd}</p>
              <p className="text-xl text-center">LCM: {result.lcm}</p>
              
              {/* Prime Factorization */}
              <div className="text-sm">
                <p>Prime Factors:</p>
                <p>{number1}: {Object.entries(result.factors1)
                  .map(([factor, power]) => `${factor}${power > 1 ? `^${power}` : ''}`)
                  .join(' × ')}</p>
                <p>{number2}: {Object.entries(result.factors2)
                  .map(([factor, power]) => `${factor}${power > 1 ? `^${power}` : ''}`)
                  .join(' × ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700">History:</h3>
            <ul className="mt-2 space-y-2">
              {history.map((item, index) => (
                <li key={index} className="text-sm bg-gray-50 p-2 rounded">
                  {item.num1} & {item.num2}: GCD = {item.gcd}, LCM = {item.lcm}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GCDLCMCalculator;