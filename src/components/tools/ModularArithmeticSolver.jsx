'use client';
import React, { useState, useCallback, useMemo } from 'react';

const ModularArithmeticSolver = () => {
  const [mode, setMode] = useState('basic'); // basic (a + b mod n), congruence (ax ≡ b mod n), inverse (a⁻¹ mod n)
  const [inputs, setInputs] = useState({ a: '', b: '', n: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Extended Euclidean Algorithm for GCD and coefficients
  const extendedGCD = (a, b) => {
    if (b === 0) return [a, 1, 0];
    const [gcd, x1, y1] = extendedGCD(b, a % b);
    const x = y1;
    const y = x1 - Math.floor(a / b) * y1;
    return [gcd, x, y];
  };

  // Calculate modular solution
  const calculateMod = useCallback((mode, inputs) => {
    const steps = [`Solving for ${mode === 'basic' ? 'modular arithmetic' : mode === 'congruence' ? 'congruence' : 'modular inverse'}:`];
    const a = parseInt(inputs.a);
    const b = mode === 'inverse' ? null : parseInt(inputs.b);
    const n = parseInt(inputs.n);

    if (isNaN(n) || n <= 0) {
      return { error: 'Modulus (n) must be a positive integer' };
    }

    if (mode === 'basic') {
      if (isNaN(a) || isNaN(b)) {
        return { error: 'a and b must be integers' };
      }
      const sum = a + b;
      const result = ((sum % n) + n) % n; // Ensure positive result
      steps.push(`(${a} + ${b}) = ${sum}`);
      steps.push(`${sum} mod ${n} = ${result}`);
      return { result, steps, label: `(${a} + ${b}) mod ${n}` };
    } else if (mode === 'congruence') {
      if (isNaN(a) || isNaN(b)) {
        return { error: 'a and b must be integers' };
      }
      const [gcd, x0] = extendedGCD(a, n);
      if (b % gcd !== 0) {
        steps.push(`gcd(${a}, ${n}) = ${gcd}`);
        steps.push(`${b} is not divisible by ${gcd}: No solution exists`);
        return { error: 'No solution exists (b not divisible by gcd)', steps };
      }
      const x = ((x0 * (b / gcd)) % n + n) % n; // Ensure positive
      steps.push(`${a}x ≡ ${b} (mod ${n})`);
      steps.push(`gcd(${a}, ${n}) = ${gcd}`);
      steps.push(`x = (${x0} * (${b} / ${gcd})) mod ${n} = ${x}`);
      return { result: x, steps, label: 'x' };
    } else if (mode === 'inverse') {
      if (isNaN(a)) {
        return { error: 'a must be an integer' };
      }
      const [gcd, x] = extendedGCD(a, n);
      if (gcd !== 1) {
        steps.push(`gcd(${a}, ${n}) = ${gcd} ≠ 1: No modular inverse exists`);
        return { error: 'No modular inverse exists (gcd ≠ 1)', steps };
      }
      const inverse = (x % n + n) % n; // Ensure positive
      steps.push(`Find x such that ${a}x ≡ 1 (mod ${n})`);
      steps.push(`Using Extended Euclidean: gcd(${a}, ${n}) = ${gcd}`);
      steps.push(`Inverse = ${x} mod ${n} = ${inverse}`);
      return { result: inverse, steps, label: `${a}⁻¹ mod ${n}` };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseInt(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be an integer' }));
    } else if (field === 'n' && value && parseInt(value) <= 0) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be positive' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid based on mode
  const isValid = useMemo(() => {
    const nValid = inputs.n && !isNaN(parseInt(inputs.n)) && parseInt(inputs.n) > 0;
    if (!nValid) return false;

    if (mode === 'basic') {
      return (
        inputs.a && !isNaN(parseInt(inputs.a)) &&
        inputs.b && !isNaN(parseInt(inputs.b)) &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'congruence') {
      return (
        inputs.a && !isNaN(parseInt(inputs.a)) &&
        inputs.b && !isNaN(parseInt(inputs.b)) &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'inverse') {
      return (
        inputs.a && !isNaN(parseInt(inputs.a)) &&
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

    const calcResult = calculateMod(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setMode('basic');
    setInputs({ a: '', b: '', n: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Modular Arithmetic Solver
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['basic', 'congruence', 'inverse'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {m === 'basic' ? 'Basic Mod' : m === 'congruence' ? 'Solve ax ≡ b' : 'Mod Inverse'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">a:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={inputs.a}
                onChange={handleInputChange('a')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={mode === 'basic' ? 'e.g., 5' : mode === 'congruence' ? 'e.g., 3' : 'e.g., 7'}
                aria-label="Value a"
              />
              {errors.a && <p className="text-red-600 text-sm mt-1">{errors.a}</p>}
            </div>
          </div>
          {mode !== 'inverse' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">b:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="1"
                  value={inputs.b}
                  onChange={handleInputChange('b')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={mode === 'basic' ? 'e.g., 3' : 'e.g., 2'}
                  aria-label="Value b"
                />
                {errors.b && <p className="text-red-600 text-sm mt-1">{errors.b}</p>}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Modulus (n):</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={inputs.n}
                onChange={handleInputChange('n')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 4"
                aria-label="Modulus n"
              />
              {errors.n && <p className="text-red-600 text-sm mt-1">{errors.n}</p>}
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

export default ModularArithmeticSolver;