'use client';
import React, { useState, useCallback, useMemo } from 'react';

const IntegralCalculator = () => {
  const [inputs, setInputs] = useState({ a: '', b: '', c: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Compute the indefinite integral of ax² + bx + c
  const calculateIntegral = useCallback((a, b, c) => {
    const aNum = parseFloat(a) || 0; // Default to 0 if empty
    const bNum = parseFloat(b) || 0;
    const cNum = parseFloat(c) || 0;
    const steps = [`Integrating ${aNum}x² + ${bNum}x + ${cNum}:`];

    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
      return { error: 'All coefficients must be valid numbers' };
    }

    // Apply power rule: ∫x^n dx = (x^(n+1))/(n+1) + C
    const intA = aNum / 3; // ∫ax² dx = (a/3)x³
    const intB = bNum / 2; // ∫bx dx = (b/2)x²
    const intC = cNum;     // ∫c dx = cx

    steps.push(`Power rule: ∫x^n dx = (x^(n+1))/(n+1) + C`);
    steps.push(`∫${aNum}x² dx = (${aNum}/3)x³ = ${intA.toFixed(2)}x³`);
    steps.push(`∫${bNum}x dx = (${bNum}/2)x² = ${intB.toFixed(2)}x²`);
    steps.push(`∫${cNum} dx = ${cNum}x`);

    // Construct integral string
    let integral = '';
    if (intA !== 0) integral += `${intA.toFixed(2)}x³`;
    if (intB !== 0) {
      if (integral && intB > 0) integral += ' + ';
      integral += `${intB.toFixed(2)}x²`;
    }
    if (intC !== 0) {
      if (integral && intC > 0) integral += ' + ';
      integral += `${intC.toFixed(2)}x`;
    }
    integral += integral ? ' + C' : 'C'; // Add constant of integration

    steps.push(`Indefinite Integral: ${integral}`);
    return { integral, steps };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a valid number' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid (at least one field must be numeric for a meaningful integral)
  const isValid = useMemo(() => {
    const hasNumber = ['a', 'b', 'c'].some((field) => inputs[field] && !isNaN(parseFloat(inputs[field])));
    const allValid = ['a', 'b', 'c'].every((field) => !inputs[field] || !isNaN(parseFloat(inputs[field])));
    return hasNumber && allValid && Object.values(errors).every((err) => !err);
  }, [inputs, errors]);

  // Perform integration
  const integrate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide at least one valid coefficient',
      }));
      return;
    }

    const calcResult = calculateIntegral(inputs.a, inputs.b, inputs.c);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ a: '', b: '', c: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  // Construct original function string for display
  const getFunctionString = () => {
    const { a, b, c } = inputs;
    let fn = '';
    if (a && parseFloat(a) !== 0) fn += `${parseFloat(a)}x²`;
    if (b && parseFloat(b) !== 0) {
      if (fn && parseFloat(b) > 0) fn += ' + ';
      fn += `${parseFloat(b)}x`;
    }
    if (c && parseFloat(c) !== 0) {
      if (fn && parseFloat(c) > 0) fn += ' + ';
      fn += parseFloat(c);
    }
    return fn || '0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Integral Calculator
        </h1>

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
                  placeholder={`e.g., ${field === 'a' ? '3' : field === 'b' ? '-2' : '5'}`}
                  aria-label={`${field} coefficient`}
                />
                {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={integrate}
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
              ∫({getFunctionString()}) dx = {result.integral}
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

export default IntegralCalculator;