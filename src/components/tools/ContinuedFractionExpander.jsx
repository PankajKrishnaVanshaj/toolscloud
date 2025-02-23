'use client';
import React, { useState, useCallback, useMemo } from 'react';

const ContinuedFractionExpander = () => {
  const [number, setNumber] = useState(''); // Input number (e.g., "3.14159" or "13/11")
  const [maxTerms, setMaxTerms] = useState('10'); // Maximum number of terms
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Compute continued fraction expansion
  const expandContinuedFraction = useCallback(() => {
    const steps = ['Expanding as continued fraction:'];
    let num;

    // Parse input (decimal or fraction)
    if (number.includes('/')) {
      const [numerator, denominator] = number.split('/').map(n => parseFloat(n.trim()));
      if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        return { error: 'Invalid fraction format (use e.g., 13/11)' };
      }
      num = numerator / denominator;
    } else {
      num = parseFloat(number);
    }

    if (isNaN(num) || num <= 0) {
      return { error: 'Input must be a positive number' };
    }

    const terms = [];
    const convergents = [];
    let x = num;
    const limit = parseInt(maxTerms) || 10;

    steps.push(`Starting with ${num}`);

    // Generate terms
    while (terms.length < limit && x !== 0) {
      const a = Math.floor(x);
      terms.push(a);
      steps.push(`Term ${terms.length}: ⌊${x}⌋ = ${a}`);
      
      // Compute convergent
      let p = a, q = 1;
      for (let i = terms.length - 2; i >= 0; i--) {
        const tempP = p;
        p = terms[i] * p + (i === terms.length - 1 ? 1 : convergents[i].p);
        q = terms[i] * q + (i === terms.length - 1 ? 0 : convergents[i].q);
      }
      convergents.push({ p, q, value: p / q });
      steps.push(`Convergent ${terms.length}: ${p}/${q} = ${(p / q).toFixed(6)}`);

      x = 1 / (x - a);
      if (!isFinite(x) || x < 1e-10) break; // Stop if x becomes infinite or very small
    }

    steps.push(`Continued fraction: [${terms.join('; ')}]`);
    return { terms, convergents, steps };
  }, [number, maxTerms]);

  // Handle input changes
  const handleNumberChange = (e) => {
    const value = e.target.value;
    setNumber(value);
    setResult(null);
    
    if (!value) {
      setErrors((prev) => ({ ...prev, number: 'Number is required' }));
    } else if (value.includes('/') && !/^\d+\s*\/\s*\d+$/.test(value)) {
      setErrors((prev) => ({ ...prev, number: 'Invalid fraction (e.g., 13/11)' }));
    } else if (!value.includes('/') && (isNaN(parseFloat(value)) || parseFloat(value) <= 0)) {
      setErrors((prev) => ({ ...prev, number: 'Must be a positive number' }));
    } else {
      setErrors((prev) => ({ ...prev, number: '' }));
    }
  };

  const handleMaxTermsChange = (e) => {
    const value = e.target.value;
    setMaxTerms(value);
    setResult(null);
    
    if (value && (isNaN(parseInt(value)) || parseInt(value) <= 0)) {
      setErrors((prev) => ({ ...prev, maxTerms: 'Must be a positive integer' }));
    } else {
      setErrors((prev) => ({ ...prev, maxTerms: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const numValid = number && (
      (number.includes('/') && /^\d+\s*\/\s*\d+$/.test(number) && parseFloat(number.split('/')[1]) !== 0) ||
      (!number.includes('/') && !isNaN(parseFloat(number)) && parseFloat(number) > 0)
    );
    const termsValid = !maxTerms || (!isNaN(parseInt(maxTerms)) && parseInt(maxTerms) > 0);
    return numValid && termsValid && Object.values(errors).every(err => !err);
  }, [number, maxTerms, errors]);

  // Generate expansion
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

    const expResult = expandContinuedFraction();
    if (expResult.error) {
      setErrors({ general: expResult.error });
    } else {
      setResult(expResult);
    }
  };

  // Reset state
  const reset = () => {
    setNumber('');
    setMaxTerms('10');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Continued Fraction Expander
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Number:</label>
            <div className="flex-1">
              <input
                type="text"
                value={number}
                onChange={handleNumberChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 3.14159 or 13/11"
                aria-label="Number to expand"
              />
              {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Max Terms:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={maxTerms}
                onChange={handleMaxTermsChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 10"
                aria-label="Maximum number of terms"
              />
              {errors.maxTerms && <p className="text-red-600 text-sm mt-1">{errors.maxTerms}</p>}
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Continued Fraction:</h2>
            <p className="text-center text-xl">[ {result.terms.join('; ')} ]</p>
            <h3 className="text-md font-semibold text-gray-700 text-center mt-2">Convergents:</h3>
            <ul className="text-center text-sm space-y-1 max-h-40 overflow-y-auto">
              {result.convergents.map((conv, i) => (
                <li key={i}>{`${conv.p}/${conv.q} ≈ ${(conv.value).toFixed(6)}`}</li>
              ))}
            </ul>
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

export default ContinuedFractionExpander;