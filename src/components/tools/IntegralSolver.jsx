'use client';
import React, { useState, useCallback, useMemo } from 'react';

const IntegralSolver = () => {
  const [type, setType] = useState('indefinite'); // indefinite or definite
  const [inputs, setInputs] = useState({ a: '', b: '', c: '', lower: '', upper: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Compute the integral
  const calculateIntegral = useCallback((type, inputs) => {
    const steps = [`Integrating ${type === 'indefinite' ? 'indefinite' : 'definite'} integral:`];
    const a = parseFloat(inputs.a) || 0;
    const b = parseFloat(inputs.b) || 0;
    const c = parseFloat(inputs.c) || 0;

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      return { error: 'Coefficients must be valid numbers' };
    }

    // Function string for display
    const fn = `${a !== 0 ? `${a}x²` : ''}${b !== 0 ? (a !== 0 && b > 0 ? ' + ' : ' ') + `${b}x` : ''}${c !== 0 ? (a !== 0 || b !== 0) && c > 0 ? ' + ' : ' ' + c : ''}`.trim() || '0';
    steps.push(`f(x) = ${fn}`);

    // Indefinite integral using power rule: ∫x^n dx = (x^(n+1))/(n+1) + C
    const intA = a / 3; // ∫ax² dx = (a/3)x³
    const intB = b / 2; // ∫bx dx = (b/2)x²
    const intC = c;     // ∫c dx = cx

    steps.push(`Power rule: ∫x^n dx = (x^(n+1))/(n+1) + C`);
    steps.push(`∫${a}x² dx = (${a}/3)x³ = ${intA.toFixed(2)}x³`);
    steps.push(`∫${b}x dx = (${b}/2)x² = ${intB.toFixed(2)}x²`);
    steps.push(`∫${c} dx = ${c}x`);

    let integral = '';
    if (intA !== 0) integral += `${intA.toFixed(2)}x³`;
    if (intB !== 0) integral += `${intB > 0 && integral ? ' + ' : ' '}${intB.toFixed(2)}x²`;
    if (intC !== 0) integral += `${intC > 0 && integral ? ' + ' : ' '}${intC.toFixed(2)}x`;
    integral = integral.trim() || '0';

    if (type === 'indefinite') {
      integral += ' + C';
      steps.push(`∫(${fn}) dx = ${integral}`);
      return { result: integral, steps };
    } else {
      const lower = parseFloat(inputs.lower);
      const upper = parseFloat(inputs.upper);

      if (isNaN(lower) || isNaN(upper)) {
        return { error: 'Bounds must be valid numbers' };
      }
      if (lower >= upper) {
        return { error: 'Upper bound must be greater than lower bound' };
      }

      // Definite integral: F(upper) - F(lower)
      const F = (x) => intA * Math.pow(x, 3) + intB * Math.pow(x, 2) + intC * x;
      const value = F(upper) - F(lower);

      steps.push(`∫[${lower}, ${upper}] (${fn}) dx = F(${upper}) - F(${lower})`);
      steps.push(`F(x) = ${integral.replace(' + C', '')}`);
      steps.push(`F(${upper}) = ${intA.toFixed(2)}*${upper}^3 + ${intB.toFixed(2)}*${upper}^2 + ${intC.toFixed(2)}*${upper} = ${F(upper).toFixed(2)}`);
      steps.push(`F(${lower}) = ${intA.toFixed(2)}*${lower}^3 + ${intB.toFixed(2)}*${lower}^2 + ${intC.toFixed(2)}*${lower} = ${F(lower).toFixed(2)}`);
      steps.push(`Result = ${F(upper).toFixed(2)} - ${F(lower).toFixed(2)} = ${value.toFixed(2)}`);

      return { result: value.toFixed(2), steps };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const polyValid = ['a', 'b', 'c'].every(field => !inputs[field] || !isNaN(parseFloat(inputs[field])));
    if (!polyValid) return false;

    const hasPoly = ['a', 'b', 'c'].some(field => inputs[field] && parseFloat(inputs[field]) !== 0);
    if (!hasPoly) return false;

    if (type === 'definite') {
      return (
        inputs.lower && !isNaN(parseFloat(inputs.lower)) &&
        inputs.upper && !isNaN(parseFloat(inputs.upper)) &&
        parseFloat(inputs.lower) < parseFloat(inputs.upper) &&
        Object.values(errors).every(err => !err)
      );
    }
    return Object.values(errors).every(err => !err);
  }, [type, inputs, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: type === 'definite' ? 'Please provide valid coefficients and bounds' : 'Please provide at least one non-zero coefficient',
      }));
      return;
    }

    const calcResult = calculateIntegral(type, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setType('indefinite');
    setInputs({ a: '', b: '', c: '', lower: '', upper: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Integral Solver
        </h1>

        {/* Type Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {['indefinite', 'definite'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg transition-colors ${type === t ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {t === 'indefinite' ? 'Indefinite' : 'Definite'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          {['a', 'b', 'c'].map((field) => (
            <div key={field} className="flex items-center gap-2">
              <label className="w-32 text-gray-700">
                {field} ({field === 'a' ? 'x²' : field === 'b' ? 'x' : 'constant'}):
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === 'a' ? '2' : field === 'b' ? '-3' : '5'}`}
                  aria-label={`${field} coefficient`}
                />
                {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
              </div>
            </div>
          ))}
          {type === 'definite' && (
            <>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Lower Bound:</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.lower}
                    onChange={handleInputChange('lower')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 0"
                    aria-label="Lower bound"
                  />
                  {errors.lower && <p className="text-red-600 text-sm mt-1">{errors.lower}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Upper Bound:</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.upper}
                    onChange={handleInputChange('upper')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1"
                    aria-label="Upper bound"
                  />
                  {errors.upper && <p className="text-red-600 text-sm mt-1">{errors.upper}</p>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
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
              {type === 'indefinite' ? `∫(${inputs.a || 0}x² + ${inputs.b || 0}x + ${inputs.c || 0}) dx = ${result.result}` : `∫[${inputs.lower}, ${inputs.upper}] (${inputs.a || 0}x² + ${inputs.b || 0}x + ${inputs.c || 0}) dx = ${result.result}`}
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

export default IntegralSolver;