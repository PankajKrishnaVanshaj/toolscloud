'use client'
import React, { useState, useEffect } from 'react';

const FractionCalculator = () => {
  const [fraction1, setFraction1] = useState({ num: '', den: '' });
  const [fraction2, setFraction2] = useState({ num: '', den: '' });
  const [operation, setOperation] = useState('+');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // GCD calculation
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  // Simplify fraction and convert to mixed number
  const processFraction = (num, den) => {
    if (den === 0) return { error: 'Division by zero' };
    const divisor = gcd(num, den);
    const simplifiedNum = num / divisor;
    const simplifiedDen = den / divisor;
    
    // Convert to mixed number
    const whole = Math.floor(Math.abs(simplifiedNum) / simplifiedDen);
    const remainder = Math.abs(simplifiedNum) % simplifiedDen;
    
    return {
      num: simplifiedNum,
      den: simplifiedDen,
      mixed: whole > 0 ? { whole, num: remainder, den: simplifiedDen } : null
    };
  };

  const calculate = () => {
    setError('');
    const f1Num = parseInt(fraction1.num) || 0;
    const f1Den = parseInt(fraction1.den) || 1;
    const f2Num = parseInt(fraction2.num) || 0;
    const f2Den = parseInt(fraction2.den) || 1;

    if (f1Den === 0 || f2Den === 0) {
      setError('Denominator cannot be zero');
      setResult(null);
      return;
    }

    let resultNum, resultDen;
    switch (operation) {
      case '+':
        resultNum = f1Num * f2Den + f2Num * f1Den;
        resultDen = f1Den * f2Den;
        break;
      case '-':
        resultNum = f1Num * f2Den - f2Num * f1Den;
        resultDen = f1Den * f2Den;
        break;
      case '×':
        resultNum = f1Num * f2Num;
        resultDen = f1Den * f2Den;
        break;
      case '÷':
        if (f2Num === 0) {
          setError('Division by zero');
          setResult(null);
          return;
        }
        resultNum = f1Num * f2Den;
        resultDen = f1Den * f2Num;
        break;
      default:
        return;
    }

    const processed = processFraction(resultNum, resultDen);
    if (processed.error) {
      setError(processed.error);
      setResult(null);
      return;
    }

    setResult(processed);
    setHistory(prev => [...prev.slice(-4), {
      f1: `${f1Num}/${f1Den}`,
      op: operation,
      f2: `${f2Num}/${f2Den}`,
      result: `${processed.num}/${processed.den}`
    }]);
  };

  const reset = () => {
    setFraction1({ num: '', den: '' });
    setFraction2({ num: '', den: '' });
    setResult(null);
    setError('');
    setOperation('+');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Advanced Fraction Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2 items-center">
            <input
              type="number"
              value={fraction1.num}
              onChange={(e) => setFraction1({ ...fraction1, num: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Num"
            />
            <span className="text-2xl text-center">/</span>
            <input
              type="number"
              value={fraction1.den}
              onChange={(e) => setFraction1({ ...fraction1, den: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Den"
            />
          </div>

          <div className="flex justify-center gap-2">
            {['+', '-', '×', '÷'].map((op) => (
              <button
                key={op}
                onClick={() => setOperation(op)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  operation === op
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 items-center">
            <input
              type="number"
              value={fraction2.num}
              onChange={(e) => setFraction2({ ...fraction2, num: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Num"
            />
            <span className="text-2xl text-center">/</span>
            <input
              type="number"
              value={fraction2.den}
              onChange={(e) => setFraction2({ ...fraction2, den: e.target.value })}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Den"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={calculate}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold"
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

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-gray-700">Result:</h2>
            <div className="text-xl mt-2">
              {result.mixed && (
                <span>
                  {result.num < 0 ? '-' : ''}{result.mixed.whole} {result.mixed.num}/{result.mixed.den}<br />
                </span>
              )}
              <span>{result.num}/{result.den}</span>
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
                  {item.f1} {item.op} {item.f2} = {item.result}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default FractionCalculator;