"use client"
import React, { useState } from 'react';

const LogarithmCalculator = () => {
  const [number, setNumber] = useState('');
  const [base, setBase] = useState(''); // Empty string for custom base, 'e' for ln, '10' for log10
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showSteps, setShowSteps] = useState(false);

  // Calculate logarithm with detailed steps
  const calculateLogarithm = (num, logBase) => {
    const steps = [];
    
    // Handle special cases and validation
    if (num <= 0) {
      return { error: 'Logarithm argument must be positive' };
    }
    
    let finalResult;
    let baseDisplay;

    if (logBase === 'e') {
      // Natural logarithm (ln)
      if (num === 1) {
        steps.push('ln(1) = 0 (since e^0 = 1)');
        return { result: 0, steps };
      }
      finalResult = Math.log(num);
      baseDisplay = 'e';
      steps.push(`ln(${num}) = log base e of ${num}`);
      steps.push(`Using natural logarithm: ${num} = e^x`);
    } else if (logBase === '10') {
      // Common logarithm (log10)
      if (num === 1) {
        steps.push('log₁₀(1) = 0 (since 10^0 = 1)');
        return { result: 0, steps };
      }
      finalResult = Math.log10(num);
      baseDisplay = '10';
      steps.push(`log₁₀(${num}) = log base 10 of ${num}`);
      steps.push(`Using common logarithm: ${num} = 10^x`);
    } else {
      // Custom base
      const baseNum = parseFloat(logBase);
      if (isNaN(baseNum)) {
        return { error: 'Invalid base value' };
      }
      if (baseNum <= 0 || baseNum === 1) {
        return { error: 'Base must be positive and not equal to 1' };
      }
      if (num === 1) {
        steps.push(`log_${baseNum}(1) = 0 (since ${baseNum}^0 = 1)`);
        return { result: 0, steps };
      }
      finalResult = Math.log(num) / Math.log(baseNum); // Change of base formula
      baseDisplay = baseNum;
      steps.push(`log_${baseNum}(${num}) = log base ${baseNum} of ${num}`);
      steps.push(`Using change of base: log(${num}) / log(${baseNum})`);
    }

    finalResult = Number(finalResult.toFixed(6));
    steps.push(`Result ≈ ${finalResult}`);
    const simplified = finalResult === Math.round(finalResult) ? Math.round(finalResult) : null;

    return { result: finalResult, steps, simplified, baseDisplay };
  };

  const calculate = () => {
    setError('');
    setResult(null);

    const num = parseFloat(number);

    // Validation
    if (isNaN(num) || (base !== 'e' && base !== '10' && base === '')) {
      setError('Please enter valid numbers');
      return;
    }

    const calcResult = calculateLogarithm(num, base || '10'); // Default to log10 if base empty
    if (calcResult.error) {
      setError(calcResult.error);
      return;
    }

    setResult(calcResult);
    setHistory(prev => [...prev.slice(-4), {
      number: num,
      base: calcResult.baseDisplay,
      result: calcResult.result
    }]);
  };

  const reset = () => {
    setNumber('');
    setBase('');
    setResult(null);
    setError('');
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Logarithm Calculator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-2 items-center">
            <span className="text-xl text-center">log</span>
            <input
              type="text"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              placeholder="Base (e, 10, or number)"
            />
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="col-span-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
              placeholder="Number"
            />
          </div>

          {/* Quick Base Buttons */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setBase('10')}
              className={`px-3 py-1 rounded-lg ${base === '10' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              log₁₀
            </button>
            <button
              onClick={() => setBase('e')}
              className={`px-3 py-1 rounded-lg ${base === 'e' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              ln
            </button>
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
        {result && (
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <div className="mt-2 space-y-2 text-center">
              <p className="text-xl">
                log<sub>{result.baseDisplay}</sub>({number}) = {result.result}
                {result.simplified && ` = ${result.simplified}`}
              </p>
              
              {/* Steps Toggle */}
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="text-sm text-purple-600 hover:underline"
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
                  log<sub>{item.base}</sub>({item.number}) = {item.result}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogarithmCalculator;