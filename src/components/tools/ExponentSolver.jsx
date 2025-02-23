'use client';
import React, { useState, useCallback, useMemo } from 'react';

const ExponentSolver = () => {
  const [mode, setMode] = useState('evaluate'); // evaluate (a^x), solveExp (a^x = b), solveBase (x^a = b)
  const [inputs, setInputs] = useState({ base: '', exp: '', result: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate exponential solution
  const calculateExp = useCallback((mode, inputs) => {
    const steps = [`Solving for ${mode === 'evaluate' ? 'exponential value' : mode === 'solveExp' ? 'exponent' : 'base'}:`];

    if (mode === 'evaluate') {
      const base = parseFloat(inputs.base);
      const exp = parseFloat(inputs.exp);

      if (isNaN(base) || isNaN(exp) || base <= 0) {
        return { error: 'Base must be positive, exponent must be a number' };
      }

      const value = Math.pow(base, exp);
      steps.push(`${base}^${exp} = ${value.toFixed(4)}`);
      return { result: value.toFixed(4), steps, label: `${base}^${exp}` };
    } else if (mode === 'solveExp') {
      const base = parseFloat(inputs.base);
      const result = parseFloat(inputs.result);

      if (isNaN(base) || isNaN(result) || base <= 0 || result <= 0 || base === 1) {
        return { error: 'Base must be positive and ≠ 1, result must be positive' };
      }

      const exp = Math.log(result) / Math.log(base);
      steps.push(`${base}^x = ${result}`);
      steps.push(`x = log_${base}(${result}) = ln(${result}) / ln(${base})`);
      steps.push(`= ${Math.log(result).toFixed(4)} / ${Math.log(base).toFixed(4)} = ${exp.toFixed(4)}`);
      return { result: exp.toFixed(4), steps, label: 'x (exponent)' };
    } else if (mode === 'solveBase') {
      const exp = parseFloat(inputs.exp);
      const result = parseFloat(inputs.result);

      if (isNaN(exp) || isNaN(result) || result <= 0 || exp === 0) {
        return { error: 'Result must be positive, exponent must be non-zero' };
      }

      const base = Math.pow(result, 1 / exp);
      steps.push(`x^${exp} = ${result}`);
      steps.push(`x = ${result}^(1/${exp})`);
      steps.push(`= ${base.toFixed(4)}`);
      return { result: base.toFixed(4), steps, label: 'x (base)' };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else if (field === 'base' && value && (parseFloat(value) <= 0 || (mode === 'solveExp' && parseFloat(value) === 1))) {
      setErrors((prev) => ({ ...prev, [field]: mode === 'solveExp' ? 'Must be positive and ≠ 1' : 'Must be positive' }));
    } else if ((field === 'result' && value && parseFloat(value) <= 0) || (field === 'exp' && value && parseFloat(value) === 0 && mode === 'solveBase')) {
      setErrors((prev) => ({ ...prev, [field]: field === 'exp' ? 'Must be non-zero' : 'Must be positive' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid based on mode
  const isValid = useMemo(() => {
    if (mode === 'evaluate') {
      return (
        inputs.base && !isNaN(parseFloat(inputs.base)) && parseFloat(inputs.base) > 0 &&
        inputs.exp && !isNaN(parseFloat(inputs.exp)) &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'solveExp') {
      return (
        inputs.base && !isNaN(parseFloat(inputs.base)) && parseFloat(inputs.base) > 0 && parseFloat(inputs.base) !== 1 &&
        inputs.result && !isNaN(parseFloat(inputs.result)) && parseFloat(inputs.result) > 0 &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'solveBase') {
      return (
        inputs.exp && !isNaN(parseFloat(inputs.exp)) && parseFloat(inputs.exp) !== 0 &&
        inputs.result && !isNaN(parseFloat(inputs.result)) && parseFloat(inputs.result) > 0 &&
        Object.values(errors).every(err => !err)
      );
    }
    return false;
  }, [mode, inputs, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs for the selected mode',
      }));
      return;
    }

    const calcResult = calculateExp(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setMode('evaluate');
    setInputs({ base: '', exp: '', result: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Exponent Solver
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['evaluate', 'solveExp', 'solveBase'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {m === 'evaluate' ? 'Evaluate a^x' : m === 'solveExp' ? 'Solve a^x = b' : 'Solve x^a = b'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {(mode === 'evaluate' || mode === 'solveExp') && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Base (a):</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.base}
                  onChange={handleInputChange('base')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
                  aria-label="Base"
                />
                {errors.base && <p className="text-red-600 text-sm mt-1">{errors.base}</p>}
              </div>
            </div>
          )}
          {mode === 'evaluate' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Exponent (x):</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.exp}
                  onChange={handleInputChange('exp')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  aria-label="Exponent"
                />
                {errors.exp && <p className="text-red-600 text-sm mt-1">{errors.exp}</p>}
              </div>
            </div>
          )}
          {(mode === 'solveExp' || mode === 'solveBase') && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Result (b):</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.result}
                  onChange={handleInputChange('result')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8"
                  aria-label="Result"
                />
                {errors.result && <p className="text-red-600 text-sm mt-1">{errors.result}</p>}
              </div>
            </div>
          )}
          {mode === 'solveBase' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Exponent (a):</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.exp}
                  onChange={handleInputChange('exp')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  aria-label="Exponent"
                />
                {errors.exp && <p className="text-red-600 text-sm mt-1">{errors.exp}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={calculate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
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
            <p className="text-center text-xl">
              {result.label} = {result.result}
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

export default ExponentSolver;