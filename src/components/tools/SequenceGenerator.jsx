'use client';
import React, { useState, useCallback, useMemo } from 'react';

const SequenceGenerator = () => {
  const [type, setType] = useState('arithmetic'); // arithmetic, geometric, fibonacci
  const [inputs, setInputs] = useState({ first: '', diff: '', ratio: '', terms: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Generate sequence based on type
  const generateSequence = useCallback((type, inputs) => {
    const steps = [`Generating ${type} sequence:`];
    const terms = parseInt(inputs.terms);

    if (isNaN(terms) || terms <= 0) {
      return { error: 'Number of terms must be a positive integer' };
    }

    let sequence = [];

    if (type === 'arithmetic') {
      const first = parseFloat(inputs.first);
      const diff = parseFloat(inputs.diff);

      if (isNaN(first) || isNaN(diff)) {
        return { error: 'First term and difference must be valid numbers' };
      }

      steps.push(`First term = ${first}, Common difference = ${diff}`);
      steps.push(`Formula: a_n = a_1 + (n-1)d`);

      for (let n = 0; n < terms; n++) {
        const term = first + n * diff;
        sequence.push(term.toFixed(2));
        if (n < 5) steps.push(`Term ${n + 1}: ${first} + ${n} * ${diff} = ${term.toFixed(2)}`);
      }
      if (terms > 5) steps.push(`...and so on up to ${terms} terms`);
    } else if (type === 'geometric') {
      const first = parseFloat(inputs.first);
      const ratio = parseFloat(inputs.ratio);

      if (isNaN(first) || isNaN(ratio)) {
        return { error: 'First term and ratio must be valid numbers' };
      }

      steps.push(`First term = ${first}, Common ratio = ${ratio}`);
      steps.push(`Formula: a_n = a_1 * r^(n-1)`);

      for (let n = 0; n < terms; n++) {
        const term = first * Math.pow(ratio, n);
        sequence.push(term.toFixed(2));
        if (n < 5) steps.push(`Term ${n + 1}: ${first} * ${ratio}^${n} = ${term.toFixed(2)}`);
      }
      if (terms > 5) steps.push(`...and so on up to ${terms} terms`);
    } else if (type === 'fibonacci') {
      const first = parseFloat(inputs.first) || 0; // Default to 0 if empty

      if (isNaN(first)) {
        return { error: 'First term must be a valid number' };
      }

      steps.push(`Starting with ${first}, next term is ${first + 1}`);
      steps.push(`Formula: a_n = a_(n-1) + a_(n-2)`);

      sequence.push(first.toFixed(2));
      if (terms > 1) sequence.push((first + 1).toFixed(2));

      for (let n = 2; n < terms; n++) {
        const term = parseFloat(sequence[n - 1]) + parseFloat(sequence[n - 2]);
        sequence.push(term.toFixed(2));
        if (n < 5) steps.push(`Term ${n + 1}: ${sequence[n - 1]} + ${sequence[n - 2]} = ${term.toFixed(2)}`);
      }
      if (terms > 5) steps.push(`...and so on up to ${terms} terms`);
    }

    return { sequence, steps };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else if (field === 'terms' && value && (parseInt(value) <= 0 || !Number.isInteger(parseFloat(value)))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a positive integer' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid based on type
  const isValid = useMemo(() => {
    const termsValid = inputs.terms && !isNaN(parseInt(inputs.terms)) && parseInt(inputs.terms) > 0 && Number.isInteger(parseFloat(inputs.terms));
    if (!termsValid) return false;

    if (type === 'arithmetic') {
      return (
        inputs.first && !isNaN(parseFloat(inputs.first)) &&
        inputs.diff && !isNaN(parseFloat(inputs.diff)) &&
        Object.values(errors).every(err => !err)
      );
    } else if (type === 'geometric') {
      return (
        inputs.first && !isNaN(parseFloat(inputs.first)) &&
        inputs.ratio && !isNaN(parseFloat(inputs.ratio)) &&
        Object.values(errors).every(err => !err)
      );
    } else if (type === 'fibonacci') {
      return (
        (!inputs.first || !isNaN(parseFloat(inputs.first))) &&
        Object.values(errors).every(err => !err)
      );
    }
    return false;
  }, [type, inputs, errors]);

  // Generate sequence
  const generate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs for the selected sequence type',
      }));
      return;
    }

    const genResult = generateSequence(type, inputs);
    if (genResult.error) {
      setErrors({ general: genResult.error });
    } else {
      setResult(genResult);
    }
  };

  // Reset state
  const reset = () => {
    setType('arithmetic');
    setInputs({ first: '', diff: '', ratio: '', terms: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Sequence Generator
        </h1>

        {/* Type Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['arithmetic', 'geometric', 'fibonacci'].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1 rounded-lg transition-colors ${type === t ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">First Term:</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={inputs.first}
                onChange={handleInputChange('first')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={type === 'fibonacci' ? 'e.g., 0 (optional)' : 'e.g., 2'}
                aria-label="First term"
              />
              {errors.first && <p className="text-red-600 text-sm mt-1">{errors.first}</p>}
            </div>
          </div>
          {type === 'arithmetic' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Difference:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.diff}
                  onChange={handleInputChange('diff')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  aria-label="Common difference"
                />
                {errors.diff && <p className="text-red-600 text-sm mt-1">{errors.diff}</p>}
              </div>
            </div>
          )}
          {type === 'geometric' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Ratio:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.ratio}
                  onChange={handleInputChange('ratio')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
                  aria-label="Common ratio"
                />
                {errors.ratio && <p className="text-red-600 text-sm mt-1">{errors.ratio}</p>}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Terms:</label>
            <div className="flex-1">
              <input
                type="number"
                step="1"
                value={inputs.terms}
                onChange={handleInputChange('terms')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 5"
                aria-label="Number of terms"
              />
              {errors.terms && <p className="text-red-600 text-sm mt-1">{errors.terms}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={generate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Generate
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Sequence:</h2>
            <p className="text-center text-xl">{result.sequence.join(', ')}</p>
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

export default SequenceGenerator;