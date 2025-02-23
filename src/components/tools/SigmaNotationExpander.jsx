'use client';
import React, { useState, useCallback, useMemo } from 'react';

const SigmaNotationExpander = () => {
  const [expression, setExpression] = useState(''); // e.g., "2*i + 1"
  const [start, setStart] = useState(''); // Start index
  const [end, setEnd] = useState(''); // End index (can be 'n')
  const [nValue, setNValue] = useState(''); // Specific n value if end is 'n'
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Parse and evaluate the expression for a given i
  const evaluateExpression = (expr, i) => {
    try {
      const safeExpr = expr.replace(/i/g, i); // Replace 'i' with the current index
      return eval(safeExpr); // Simple evaluation (for basic arithmetic)
    } catch {
      throw new Error('Invalid expression');
    }
  };

  // Expand and sum the sigma notation
  const expandSigma = useCallback(() => {
    const steps = ['Expanding sigma notation:'];
    const startNum = parseInt(start);
    let endNum = end.toLowerCase() === 'n' ? parseInt(nValue) : parseInt(end);

    // Validation
    if (!expression) return { error: 'Expression is required' };
    if (isNaN(startNum) || startNum < 0) return { error: 'Start index must be a non-negative number' };
    if (end.toLowerCase() !== 'n' && (isNaN(endNum) || endNum < startNum)) {
      return { error: 'End index must be a number >= start index' };
    }
    if (end.toLowerCase() === 'n' && (isNaN(endNum) || endNum < startNum)) {
      return { error: 'n must be a number >= start index' };
    }

    steps.push(`∑(i=${startNum} to ${end}) ${expression}`);

    // Expand terms
    const terms = [];
    let sum = 0;
    for (let i = startNum; i <= endNum; i++) {
      try {
        const value = evaluateExpression(expression, i);
        terms.push(value.toFixed(2));
        sum += value;
        if (terms.length <= 5) steps.push(`i = ${i}: ${expression.replace(/i/g, i)} = ${value.toFixed(2)}`);
      } catch {
        return { error: 'Invalid expression format (use i as variable, e.g., "2*i + 1")' };
      }
    }
    if (terms.length > 5) steps.push(`...and ${terms.length - 5} more terms`);

    steps.push(`Expanded: ${terms.join(' + ')}`);
    steps.push(`Sum = ${sum.toFixed(2)}`);

    return { terms, sum: sum.toFixed(2), steps };
  }, [expression, start, end, nValue]);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    const setters = {
      expression: setExpression,
      start: setStart,
      end: setEnd,
      nValue: setNValue,
    };
    setters[field](value);
    setResult(null);

    if (field === 'expression') {
      setErrors((prev) => ({ ...prev, expression: value ? '' : 'Required' }));
    } else if (field === 'start') {
      if (value && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
        setErrors((prev) => ({ ...prev, start: 'Must be a non-negative number' }));
      } else {
        setErrors((prev) => ({ ...prev, start: '' }));
      }
    } else if (field === 'end') {
      if (value.toLowerCase() !== 'n' && value && (isNaN(parseInt(value)) || parseInt(value) < parseInt(start))) {
        setErrors((prev) => ({ ...prev, end: 'Must be >= start or "n"' }));
      } else {
        setErrors((prev) => ({ ...prev, end: '' }));
      }
    } else if (field === 'nValue' && end.toLowerCase() === 'n') {
      if (value && (isNaN(parseInt(value)) || parseInt(value) < parseInt(start))) {
        setErrors((prev) => ({ ...prev, nValue: 'Must be >= start' }));
      } else {
        setErrors((prev) => ({ ...prev, nValue: '' }));
      }
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const startNum = parseInt(start);
    const endNum = end.toLowerCase() === 'n' ? parseInt(nValue) : parseInt(end);
    return (
      expression &&
      !isNaN(startNum) && startNum >= 0 &&
      (end.toLowerCase() === 'n' ? !isNaN(endNum) && endNum >= startNum : !isNaN(endNum) && endNum >= startNum) &&
      Object.values(errors).every(err => !err)
    );
  }, [expression, start, end, nValue, errors]);

  // Expand and calculate
  const expand = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs',
      }));
      return;
    }

    const calcResult = expandSigma();
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setExpression('');
    setStart('');
    setEnd('');
    setNValue('');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Sigma Notation Expander
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Expression:</label>
            <div className="flex-1">
              <input
                type="text"
                value={expression}
                onChange={handleInputChange('expression')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2*i + 1"
                aria-label="Sigma expression"
              />
              {errors.expression && <p className="text-red-600 text-sm mt-1">{errors.expression}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Start Index:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={start}
                onChange={handleInputChange('start')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1"
                aria-label="Start index"
              />
              {errors.start && <p className="text-red-600 text-sm mt-1">{errors.start}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">End Index:</label>
            <div className="flex-1">
              <input
                type="text"
                value={end}
                onChange={handleInputChange('end')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5 or n"
                aria-label="End index"
              />
              {errors.end && <p className="text-red-600 text-sm mt-1">{errors.end}</p>}
            </div>
          </div>
          {end.toLowerCase() === 'n' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">n Value:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="1"
                  value={nValue}
                  onChange={handleInputChange('nValue')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                  aria-label="n value"
                />
                {errors.nValue && <p className="text-red-600 text-sm mt-1">{errors.nValue}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={expand}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Expand
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
            <p className="text-center text-xl">Expanded: {result.terms.join(' + ')}</p>
            <p className="text-center text-xl mt-2">Sum = {result.sum}</p>
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

export default SigmaNotationExpander;