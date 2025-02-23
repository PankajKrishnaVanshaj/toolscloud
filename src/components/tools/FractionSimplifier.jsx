'use client';
import React, { useState, useCallback, useMemo } from 'react';

const FractionSimplifier = () => {
  const [inputs, setInputs] = useState({ numerator: '', denominator: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate GCD using Euclidean algorithm
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  };

  // Simplify the fraction
  const simplifyFraction = useCallback((numer, denom) => {
    const steps = ['Simplifying the fraction:'];

    const numerator = parseInt(numer);
    const denominator = parseInt(denom);

    if (isNaN(numerator) || isNaN(denominator)) {
      return { error: 'Numerator and denominator must be integers' };
    }
    if (denominator === 0) {
      return { error: 'Denominator cannot be zero' };
    }

    steps.push(`Original fraction: ${numerator}/${denominator}`);

    // Handle negative fractions
    const sign = (numerator < 0 && denominator > 0) || (numerator > 0 && denominator < 0) ? -1 : 1;
    const absNumer = Math.abs(numerator);
    const absDenom = Math.abs(denominator);

    // Calculate GCD
    const divisor = gcd(absNumer, absDenom);
    steps.push(`Find GCD of ${absNumer} and ${absDenom} = ${divisor}`);

    // Simplify
    const simplifiedNumer = (sign * absNumer) / divisor;
    const simplifiedDenom = absDenom / divisor;
    steps.push(`Divide numerator and denominator by ${divisor}:`);
    steps.push(`${numerator} / ${divisor} = ${simplifiedNumer}`);
    steps.push(`${denominator} / ${divisor} = ${simplifiedDenom}`);
    steps.push(`Simplified fraction: ${simplifiedNumer}/${simplifiedDenom}`);

    return { 
      simplifiedNumer, 
      simplifiedDenom, 
      steps 
    };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && (isNaN(parseInt(value)) || !Number.isInteger(parseFloat(value)))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be an integer' }));
    } else if (field === 'denominator' && value && parseInt(value) === 0) {
      setErrors((prev) => ({ ...prev, [field]: 'Cannot be zero' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      inputs.numerator && !isNaN(parseInt(inputs.numerator)) && Number.isInteger(parseFloat(inputs.numerator)) &&
      inputs.denominator && !isNaN(parseInt(inputs.denominator)) && Number.isInteger(parseFloat(inputs.denominator)) && parseInt(inputs.denominator) !== 0 &&
      Object.values(errors).every(err => !err)
    );
  }, [inputs, errors]);

  // Simplify fraction
  const simplify = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid integer inputs (denominator ≠ 0)',
      }));
      return;
    }

    const calcResult = simplifyFraction(inputs.numerator, inputs.denominator);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ numerator: '', denominator: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Fraction Simplifier
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Numerator:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={inputs.numerator}
                onChange={handleInputChange('numerator')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12"
                aria-label="Numerator"
              />
              {errors.numerator && <p className="text-red-600 text-sm mt-1">{errors.numerator}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Denominator:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={inputs.denominator}
                onChange={handleInputChange('denominator')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 18"
                aria-label="Denominator"
              />
              {errors.denominator && <p className="text-red-600 text-sm mt-1">{errors.denominator}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={simplify}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Simplify
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Simplified Fraction:</h2>
            <p className="text-center text-xl">
              {result.simplifiedNumer}/{result.simplifiedDenom}
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

export default FractionSimplifier;