'use client';
import React, { useState, useCallback, useMemo } from 'react';

const DerivativeFinder = () => {
  const [functionInput, setFunctionInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSteps, setShowSteps] = useState(false);

  // Parse and differentiate the function
  const differentiateFunction = useCallback((func) => {
    const steps = [`Differentiating f(x) = ${func}:`];
    const terms = func.replace(/\s+/g, '').split(/(?=[+-])/); // Split by + or - with lookbehind
    let derivativeTerms = [];
    let isValid = true;

    steps.push('Applying power rule: d/dx(ax^n) = nax^(n-1), d/dx(c) = 0');

    terms.forEach((term, index) => {
      let coeff = 1, exp = 0, sign = term[0] === '-' ? -1 : 1;
      if (term[0] === '+' || term[0] === '-') term = term.slice(1);

      // Parse term (e.g., "3x^2", "-2x", "5")
      const match = term.match(/^(-?\d*\.?\d*)(x)?(?:\^(-?\d*\.?\d*))?$/);
      if (!match) {
        isValid = false;
        return;
      }

      const [, num, x, pow] = match;
      coeff = num ? parseFloat(num) * sign : (x ? sign : parseFloat(term) * sign);
      exp = pow ? parseFloat(pow) : (x ? 1 : 0);

      if (exp === 0) {
        steps.push(`Term ${index + 1}: ${sign === -1 ? '-' : ''}${num || ''}${x || ''}${pow ? '^' + pow : ''} → Constant, derivative = 0`);
        return; // Constant term, derivative is 0
      }

      const newCoeff = (coeff * exp).toFixed(2);
      const newExp = exp - 1;
      const derivTerm = newExp === 0 ? newCoeff : `${newCoeff}x${newExp > 1 ? `^${newExp}` : ''}`;
      derivativeTerms.push(`${newCoeff >= 0 && index > 0 ? '+' : ''}${derivTerm}`);
      steps.push(`Term ${index + 1}: ${sign === -1 ? '-' : ''}${num || ''}${x}${pow ? '^' + pow : ''} → ${newCoeff} * x^${newExp - 1 + 1} * ${exp - 1 + 1} = ${derivTerm}`);
    });

    if (!isValid || terms.length === 0) {
      return { error: 'Invalid function format. Use terms like ax^n, bx, or c (e.g., 3x^2 + 2x - 1)' };
    }

    const derivative = derivativeTerms.join('') || '0';
    steps.push(`f'(x) = ${derivative}`);
    return { derivative, steps };
  }, []);

  // Handle function input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setFunctionInput(value);
    setResult(null);
    setError('');
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    return functionInput.trim() !== '';
  }, [functionInput]);

  // Calculate derivative
  const calculate = () => {
    setError('');
    setResult(null);

    if (!isValid) {
      setError('Please enter a function');
      return;
    }

    const calcResult = differentiateFunction(functionInput);
    if (calcResult.error) {
      setError(calcResult.error);
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setFunctionInput('');
    setResult(null);
    setError('');
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Derivative Finder
        </h1>

        {/* Function Input */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">f(x) =</label>
            <input
              type="text"
              value={functionInput}
              onChange={handleInputChange}
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3x^2 + 2x - 1"
              aria-label="Function input"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Find Derivative
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Derivative:</h2>
            <p className="text-center text-xl">f'(x) = {result.derivative}</p>
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

export default DerivativeFinder;