"use client"
import React, { useState } from 'react';

const RootCalculator = () => {
  const [number, setNumber] = useState('');
  const [root, setRoot] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showSteps, setShowSteps] = useState(false);

  // Calculate nth root with detailed steps
  const calculateRoot = (num, n) => {
    const steps = [];
    
    // Handle special cases
    if (n === 0) {
      return { error: 'Root index cannot be zero' };
    }
    if (num === 0) {
      steps.push('Any root of 0 is 0');
      return { result: 0, steps };
    }
    if (n < 0) {
      return { error: 'Negative root index is not supported' };
    }
    if (num < 0 && n % 2 === 0) {
      return { error: 'Even root of negative number is not real' };
    }

    // Calculate result
    const absNum = Math.abs(num);
    const rootResult = Math.pow(absNum, 1 / n);
    let finalResult = num < 0 && n % 2 === 1 ? -rootResult : rootResult;

    steps.push(`Calculate ${n}th root of ${absNum}`);
    steps.push(`${n}th root = ${absNum}^(1/${n})`);
    if (num < 0 && n % 2 === 1) {
      steps.push('Apply negative sign due to odd root of negative number');
    }

    finalResult = Number(finalResult.toFixed(6));
    const simplified = finalResult === Math.round(finalResult) ? Math.round(finalResult) : null;

    return { result: finalResult, steps, simplified };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    const num = parseFloat(number);
    const n = parseInt(root);

    // Validation
    if (isNaN(num) || isNaN(n)) {
      setError('Please enter valid numbers');
      return;
    }

    const calcResult = calculateRoot(num, n);
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory(prev => [...prev.slice(-4), {
      number: num,
      root: n,
      result: calcResult.result
    }]);
  };

  const reset = () => {
    setNumber('');
    setRoot('');
    setResult(null);
    setError('');
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Root Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-2 items-center">
            <span className="text-2xl text-center">√</span>
            <input
              type="number"
              value={root}
              onChange={(e) => setRoot(e.target.value)}
              className="col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Root (n)"
            />
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              placeholder="Number"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-4">
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
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <div className="mt-2 space-y-2 text-center">
              <p className="text-xl">
                {root}√{number} = {result.result}
                {result.simplified && ` = ${result.simplified}`}
              </p>
              
              {/* Steps Toggle */}
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-blue-600 hover:underline"
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
                  {item.root}√{item.number} = {item.result}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RootCalculator;