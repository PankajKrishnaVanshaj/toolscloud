'use client';
import React, { useState, useCallback, useMemo } from 'react';

const BinomialTheoremExpander = () => {
  const [inputs, setInputs] = useState({ a: '', b: '', n: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate binomial coefficient (n choose k)
  const binomialCoefficient = (n, k) => {
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 0; i < k; i++) {
      result *= (n - i) / (i + 1);
    }
    return Math.round(result); // Ensure integer result
  };

  // Expand binomial expression
  const expandBinomial = useCallback((inputs) => {
    const a = parseFloat(inputs.a) || 0; // Default to 0 if empty
    const b = parseFloat(inputs.b) || 0;
    const n = parseInt(inputs.n);

    const steps = [`Expanding (${a} + ${b})^${n} using the Binomial Theorem:`];
    steps.push(`Formula: (a + b)^n = Σ (n choose k) * a^(n-k) * b^k, k = 0 to ${n}`);

    if (isNaN(a) || isNaN(b) || isNaN(n) || n < 0 || !Number.isInteger(parseFloat(inputs.n))) {
      return { error: 'a and b must be numbers, n must be a non-negative integer' };
    }

    let expansion = [];
    let terms = [];

    for (let k = 0; k <= n; k++) {
      const coeff = binomialCoefficient(n, k);
      const aPower = n - k;
      const bPower = k;
      const termValue = coeff * Math.pow(a, aPower) * Math.pow(b, bPower);
      
      let term = '';
      if (coeff !== 0) {
        if (termValue === 0) {
          continue; // Skip terms that evaluate to 0
        }
        term += coeff === 1 && (aPower > 0 || bPower > 0) ? '' : coeff;
        if (aPower > 0) term += a === 1 && coeff === 1 ? '' : a === 1 ? '' : a;
        if (aPower > 1) term += `x^${aPower}`;
        else if (aPower === 1) term += 'x';
        if (bPower > 0) term += term ? ' * ' : '';
        if (bPower > 0) term += b === 1 && coeff === 1 ? '' : b === 1 ? '' : b;
        if (bPower > 1) term += `y^${bPower}`;
        else if (bPower === 1) term += 'y';
        terms.push(termValue.toFixed(2));
        steps.push(`Term ${k}: (${n} choose ${k}) * ${a}^${aPower} * ${b}^${k} = ${coeff} * ${Math.pow(a, aPower).toFixed(2)} * ${Math.pow(b, k).toFixed(2)} = ${termValue.toFixed(2)}`);
      }
      expansion.push(term || termValue.toFixed(2));
    }

    const expandedString = expansion.filter(t => t).join(' + ').replace(/\+\s*-/, '- ');
    return { expanded: expandedString, terms, steps };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else if (field === 'n' && value && (parseFloat(value) < 0 || !Number.isInteger(parseFloat(value)))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a non-negative integer' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      (!inputs.a || !isNaN(parseFloat(inputs.a))) &&
      (!inputs.b || !isNaN(parseFloat(inputs.b))) &&
      inputs.n && !isNaN(parseInt(inputs.n)) && parseInt(inputs.n) >= 0 && Number.isInteger(parseFloat(inputs.n)) &&
      Object.values(errors).every(err => !err)
    );
  }, [inputs, errors]);

  // Perform expansion
  const expand = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs: a and b as numbers, n as a non-negative integer',
      }));
      return;
    }

    const calcResult = expandBinomial(inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ a: '', b: '', n: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Binomial Theorem Expander
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">a (first term):</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={inputs.a}
                onChange={handleInputChange('a')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1"
                aria-label="First term (a)"
              />
              {errors.a && <p className="text-red-600 text-sm mt-1">{errors.a}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">b (second term):</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={inputs.b}
                onChange={handleInputChange('b')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
                aria-label="Second term (b)"
              />
              {errors.b && <p className="text-red-600 text-sm mt-1">{errors.b}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">n (exponent):</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={inputs.n}
                onChange={handleInputChange('n')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3"
                aria-label="Exponent (n)"
              />
              {errors.n && <p className="text-red-600 text-sm mt-1">{errors.n}</p>}
            </div>
          </div>
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Expanded Form:</h2>
            <p className="text-center text-xl">{result.expanded}</p>
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

export default BinomialTheoremExpander;