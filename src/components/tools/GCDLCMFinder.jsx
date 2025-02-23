'use client';
import React, { useState, useCallback, useMemo } from 'react';

const GCDLCMFinder = () => {
  const [inputs, setInputs] = useState({ num1: '', num2: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate GCD using Euclidean algorithm and LCM
  const calculateGCDLCM = useCallback((num1, num2) => {
    const steps = ['Finding GCD using Euclidean algorithm:'];
    let a = Math.abs(parseInt(num1)); // Ensure integers
    let b = Math.abs(parseInt(num2));

    if (isNaN(a) || isNaN(b) || a === 0 || b === 0) {
      return { error: 'Both numbers must be positive integers' };
    }

    // Euclidean algorithm
    while (b !== 0) {
      steps.push(`GCD(${a}, ${b}) = GCD(${b}, ${a % b})`);
      const temp = b;
      b = a % b;
      a = temp;
    }
    const gcd = a;
    steps.push(`GCD = ${gcd}`);

    // Calculate LCM
    const lcm = (Math.abs(parseInt(num1)) * Math.abs(parseInt(num2))) / gcd;
    steps.push(`LCM = (${num1} * ${num2}) / GCD = ${lcm}`);

    return { gcd, lcm, steps };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0 || !Number.isInteger(parseFloat(value)))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a positive integer' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      inputs.num1 && !isNaN(parseInt(inputs.num1)) && parseInt(inputs.num1) > 0 && Number.isInteger(parseFloat(inputs.num1)) &&
      inputs.num2 && !isNaN(parseInt(inputs.num2)) && parseInt(inputs.num2) > 0 && Number.isInteger(parseFloat(inputs.num2)) &&
      Object.values(errors).every(err => !err)
    );
  }, [inputs, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please enter two positive integers',
      }));
      return;
    }

    const calcResult = calculateGCDLCM(inputs.num1, inputs.num2);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ num1: '', num2: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          GCD & LCM Finder
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Number 1:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1" // Ensures integers
                value={inputs.num1}
                onChange={handleInputChange('num1')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 12"
                aria-label="First number"
              />
              {errors.num1 && <p className="text-red-600 text-sm mt-1">{errors.num1}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Number 2:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={inputs.num2}
                onChange={handleInputChange('num2')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 18"
                aria-label="Second number"
              />
              {errors.num2 && <p className="text-red-600 text-sm mt-1">{errors.num2}</p>}
            </div>
          </div>
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Results:</h2>
            <p className="text-center text-xl">GCD: {result.gcd}</p>
            <p className="text-center text-xl">LCM: {result.lcm}</p>
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

export default GCDLCMFinder;