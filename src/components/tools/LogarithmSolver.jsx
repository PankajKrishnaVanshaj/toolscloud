'use client';
import React, { useState, useCallback, useMemo } from 'react';

const LogarithmSolver = () => {
  const [mode, setMode] = useState('evaluate'); // evaluate (log_b(a)), solve (log_b(a) = x), convert
  const [inputs, setInputs] = useState({ base: '', arg: '', result: '', newBase: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate logarithmic solution
  const calculateLog = useCallback((mode, inputs) => {
    const steps = [`Solving for ${mode === 'evaluate' ? 'log value' : mode === 'solve' ? 'exponent' : 'converted log'}:`];
    
    if (mode === 'evaluate') {
      const base = parseFloat(inputs.base);
      const arg = parseFloat(inputs.arg);

      if (isNaN(base) || isNaN(arg) || base <= 0 || base === 1 || arg <= 0) {
        return { error: 'Base must be positive and ≠ 1, argument must be positive' };
      }

      const logValue = Math.log(arg) / Math.log(base);
      steps.push(`log_${base}(${arg}) = ln(${arg}) / ln(${base})`);
      steps.push(`= ${Math.log(arg).toFixed(4)} / ${Math.log(base).toFixed(4)} = ${logValue.toFixed(4)}`);
      return { result: logValue.toFixed(4), steps, label: `log_${base}(${arg})` };
    } else if (mode === 'solve') {
      const base = parseFloat(inputs.base);
      const result = parseFloat(inputs.result);

      if (isNaN(base) || isNaN(result) || base <= 0 || base === 1) {
        return { error: 'Base must be positive and ≠ 1' };
      }

      const arg = Math.pow(base, result);
      steps.push(`log_${base}(x) = ${result}`);
      steps.push(`x = ${base}^${result} = ${arg.toFixed(4)}`);
      return { result: arg.toFixed(4), steps, label: 'x' };
    } else if (mode === 'convert') {
      const base = parseFloat(inputs.base);
      const arg = parseFloat(inputs.arg);
      const newBase = parseFloat(inputs.newBase);

      if (isNaN(base) || isNaN(arg) || isNaN(newBase) || base <= 0 || base === 1 || arg <= 0 || newBase <= 0 || newBase === 1) {
        return { error: 'Bases must be positive and ≠ 1, argument must be positive' };
      }

      const logValue = Math.log(arg) / Math.log(base);
      const newLogValue = Math.log(arg) / Math.log(newBase);
      steps.push(`log_${base}(${arg}) = ln(${arg}) / ln(${base}) = ${logValue.toFixed(4)}`);
      steps.push(`Convert to base ${newBase}: log_${newBase}(${arg}) = ln(${arg}) / ln(${newBase})`);
      steps.push(`= ${Math.log(arg).toFixed(4)} / ${Math.log(newBase).toFixed(4)} = ${newLogValue.toFixed(4)}`);
      return { result: newLogValue.toFixed(4), steps, label: `log_${newBase}(${arg})` };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else if (value && parseFloat(value) <= 0) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be positive' }));
    } else if (field === 'base' && value && parseFloat(value) === 1) {
      setErrors((prev) => ({ ...prev, [field]: 'Base cannot be 1' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid based on mode
  const isValid = useMemo(() => {
    if (mode === 'evaluate') {
      return (
        inputs.base && !isNaN(parseFloat(inputs.base)) && parseFloat(inputs.base) > 0 && parseFloat(inputs.base) !== 1 &&
        inputs.arg && !isNaN(parseFloat(inputs.arg)) && parseFloat(inputs.arg) > 0 &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'solve') {
      return (
        inputs.base && !isNaN(parseFloat(inputs.base)) && parseFloat(inputs.base) > 0 && parseFloat(inputs.base) !== 1 &&
        inputs.result && !isNaN(parseFloat(inputs.result)) &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'convert') {
      return (
        inputs.base && !isNaN(parseFloat(inputs.base)) && parseFloat(inputs.base) > 0 && parseFloat(inputs.base) !== 1 &&
        inputs.arg && !isNaN(parseFloat(inputs.arg)) && parseFloat(inputs.arg) > 0 &&
        inputs.newBase && !isNaN(parseFloat(inputs.newBase)) && parseFloat(inputs.newBase) > 0 && parseFloat(inputs.newBase) !== 1 &&
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

    const calcResult = calculateLog(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setMode('evaluate');
    setInputs({ base: '', arg: '', result: '', newBase: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Logarithm Solver
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['evaluate', 'solve', 'convert'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {m === 'evaluate' ? 'Evaluate Log' : m === 'solve' ? 'Solve for x' : 'Change Base'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Base:</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={inputs.base}
                onChange={handleInputChange('base')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
                aria-label="Logarithm base"
              />
              {errors.base && <p className="text-red-600 text-sm mt-1">{errors.base}</p>}
            </div>
          </div>
          {mode !== 'solve' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Argument:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.arg}
                  onChange={handleInputChange('arg')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8"
                  aria-label="Logarithm argument"
                />
                {errors.arg && <p className="text-red-600 text-sm mt-1">{errors.arg}</p>}
              </div>
            </div>
          )}
          {mode === 'solve' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Result:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.result}
                  onChange={handleInputChange('result')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  aria-label="Logarithm result"
                />
                {errors.result && <p className="text-red-600 text-sm mt-1">{errors.result}</p>}
              </div>
            </div>
          )}
          {mode === 'convert' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">New Base:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.newBase}
                  onChange={handleInputChange('newBase')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10"
                  aria-label="New logarithm base"
                />
                {errors.newBase && <p className="text-red-600 text-sm mt-1">{errors.newBase}</p>}
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

export default LogarithmSolver;