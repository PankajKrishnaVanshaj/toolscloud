"use client"
import React, { useState } from 'react';

const ExponentCalculator = () => {
  const [base, setBase] = useState('');
  const [exponent, setExponent] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showSteps, setShowSteps] = useState(false);

  // Calculate exponentiation with detailed steps
  const calculateExponent = (baseNum, expStr) => {
    const steps = [];
    
    // Handle special cases
    if (baseNum === 0 && parseFloat(expStr) <= 0) {
      return { error: '0 raised to 0 or negative power is undefined' };
    }

    // Check if exponent is fractional
    let numerator, denominator;
    if (expStr.includes('/')) {
      const [num, den] = expStr.split('/').map(Number);
      numerator = num;
      denominator = den;
      if (isNaN(numerator) || isNaN(denominator)) {
        return { error: 'Invalid fractional exponent format' };
      }
      if (denominator === 0) {
        return { error: 'Denominator cannot be zero in fractional exponent' };
      }
    } else {
      numerator = parseFloat(expStr);
      denominator = 1;
      if (isNaN(numerator)) {
        return { error: 'Invalid exponent value' };
      }
    }

    // Calculate result
    let finalResult;
    const isNegative = numerator < 0;
    const absNumerator = Math.abs(numerator);

    if (denominator === 1) {
      // Integer exponent
      finalResult = Math.pow(baseNum, absNumerator);
      steps.push(`${baseNum} × ${baseNum} repeated ${absNumerator} times`);
      if (isNegative) {
        finalResult = 1 / finalResult;
        steps.push(`1 / ${baseNum}^${absNumerator} (negative exponent)`);
      }
    } else {
      // Fractional exponent (root)
      if (baseNum < 0 && denominator % 2 === 0) {
        return { error: 'Even root of negative number is not real' };
      }
      finalResult = Math.pow(Math.abs(baseNum), absNumerator / denominator);
      if (baseNum < 0 && denominator % 2 === 1) {
        finalResult = -finalResult;
      }
      steps.push(`${denominator}th root of ${baseNum}^${absNumerator}`);
      if (isNegative) {
        finalResult = 1 / finalResult;
        steps.push(`1 / result (negative exponent)`);
      }
    }

    return {
      result: Number(finalResult.toFixed(6)),
      steps,
      simplified: finalResult === Math.round(finalResult) ? Math.round(finalResult) : null
    };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    const baseNum = parseFloat(base);

    // Validation
    if (isNaN(baseNum) || exponent === '') {
      setError('Please enter valid numbers');
      return;
    }

    const calcResult = calculateExponent(baseNum, exponent);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory(prev => [...prev.slice(-4), {
      base: baseNum,
      exponent: exponent,
      result: calcResult.result
    }]);
  };

  const reset = () => {
    setBase('');
    setExponent('');
    setResult(null);
    setError('');
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Exponent Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-2 items-center">
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
              placeholder="Base"
            />
            <span className="text-2xl text-center">^</span>
            <input
              type="text"
              value={exponent}
              onChange={(e) => setExponent(e.target.value)}
              className="col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
              placeholder="Exponent (e.g., 2 or 1/2)"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-all font-semibold"
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
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <div className="mt-2 space-y-2 text-center">
              <p className="text-xl">
                {base}^{exponent} = {result.result}
                {result.simplified && ` = ${result.simplified}`}
              </p>
              
              {/* Steps Toggle */}
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-green-600 hover:underline"
              >
                {showSteps ? 'Hide Steps' : 'Show Steps'}
              </button>
              
              {showSteps && (
                <div className="text-sm text-left">
                  <p>Calculation Steps:</p>
                  <ul className="list-disc list-inside">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                    <li>Final result: {result.result}</li>
                  </ul>
                </div>
              )}
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
                  {item.base}^{item.exponent} = {item.result}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExponentCalculator;