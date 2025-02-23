'use client';
import React, { useState, useCallback, useMemo } from 'react';

const PartialFractionDecomposer = () => {
  const [numerator, setNumerator] = useState({ a: '', b: '' }); // ax + b
  const [denominator, setDenominator] = useState({ c: '', d: '', e: '' }); // cx^2 + dx + e
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Decompose the rational function
  const decompose = useCallback(() => {
    const steps = ['Decomposing the rational function into partial fractions:'];
    const numA = parseFloat(numerator.a) || 0; // Coefficient of x in numerator
    const numB = parseFloat(numerator.b) || 0; // Constant in numerator
    const denC = parseFloat(denominator.c) || 0; // Coefficient of x^2
    const denD = parseFloat(denominator.d) || 0; // Coefficient of x
    const denE = parseFloat(denominator.e) || 0; // Constant in denominator

    // Validation
    if (isNaN(denC) || isNaN(denD) || isNaN(denE) || denC === 0) {
      return { error: 'Denominator must be a valid quadratic (x^2 term required)' };
    }
    if (isNaN(numA) || isNaN(numB)) {
      return { error: 'Numerator coefficients must be valid numbers' };
    }

    steps.push(`Given: (${numA}x + ${numB}) / (${denC}x^2 + ${denD}x + ${denE})`);

    // Factor the denominator: cx^2 + dx + e = c(x - r1)(x - r2)
    const discriminant = denD * denD - 4 * denC * denE;
    steps.push(`Discriminant = ${denD}^2 - 4 * ${denC} * ${denE} = ${discriminant}`);

    if (discriminant < 0) {
      steps.push('Discriminant < 0: Denominator has no real linear factors.');
      return { error: 'Denominator cannot be factored into real linear factors' };
    }

    const root1 = (-denD + Math.sqrt(discriminant)) / (2 * denC);
    const root2 = (-denD - Math.sqrt(discriminant)) / (2 * denC);
    steps.push(`Roots: x = ${root1.toFixed(2)}, x = ${root2.toFixed(2)}`);
    steps.push(`Denominator factors as ${denC} * (x - ${root1.toFixed(2)})(x - ${root2.toFixed(2)})`);

    if (root1 === root2) {
      // Repeated linear factor: (x - r)^2
      steps.push('Repeated root detected.');
      steps.push(`Form: A / (x - ${root1.toFixed(2)}) + B / (x - ${root1.toFixed(2)})^2`);

      // Solve: (ax + b) / c(x - r)^2 = A / (x - r) + B / (x - r)^2
      // Equate: ax + b = A(cx - cr) + B
      const r = root1;
      const A = numB / (denC * r * r); // B term when x = 0
      const B = numA - A * denC * r; // Solve for B using x coefficient

      steps.push(`Equate: ${numA}x + ${numB} = A(${denC}x - ${denC * r}) + B`);
      steps.push(`x^0: ${numB} = ${A.toFixed(2)} * ${-denC * r} + ${B.toFixed(2)}`);
      steps.push(`x^1: ${numA} = ${A.toFixed(2)} * ${denC}`);
      steps.push(`A = ${A.toFixed(2)}, B = ${B.toFixed(2)}`);

      const decomposition = `${A.toFixed(2)} / (x - ${r.toFixed(2)}) + ${B.toFixed(2)} / (x - ${r.toFixed(2)})^2`;
      return { decomposition, steps };
    } else {
      // Distinct linear factors: (x - r1)(x - r2)
      steps.push(`Form: A / (x - ${root1.toFixed(2)}) + B / (x - ${root2.toFixed(2)})`);

      // Solve: (ax + b) / c(x - r1)(x - r2) = A / (x - r1) + B / (x - r2)
      // Equate: ax + b = A(x - r2) + B(x - r1)
      const A = (numA * root2 - numB) / (denC * (root2 - root1));
      const B = (numB - numA * root1) / (denC * (root2 - root1));

      steps.push(`Equate: ${numA}x + ${numB} = A(x - ${root2.toFixed(2)}) + B(x - ${root1.toFixed(2)})`);
      steps.push(`x^1: ${numA} = A + B`);
      steps.push(`x^0: ${numB} = ${-A * root2} + ${-B * root1}`);
      steps.push(`Solve: A = ${A.toFixed(2)}, B = ${B.toFixed(2)}`);

      const decomposition = `${A.toFixed(2)} / (x - ${root1.toFixed(2)}) + ${B.toFixed(2)} / (x - ${root2.toFixed(2)})`;
      return { decomposition, steps };
    }
  }, [numerator, denominator]);

  // Handle input changes
  const handleInputChange = (type, field) => (e) => {
    const value = e.target.value;
    if (type === 'numerator') {
      setNumerator((prev) => ({ ...prev, [field]: value }));
    } else {
      setDenominator((prev) => ({ ...prev, [field]: value }));
    }
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${type}${field}`]: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, [`${type}${field}`]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const numA = parseFloat(numerator.a) || 0;
    const numB = parseFloat(numerator.b) || 0;
    const denC = parseFloat(denominator.c) || 0;
    const denD = parseFloat(denominator.d) || 0;
    const denE = parseFloat(denominator.e) || 0;

    return (
      !isNaN(numA) && !isNaN(numB) &&
      !isNaN(denC) && !isNaN(denD) && !isNaN(denE) &&
      denC !== 0 && // Must be quadratic
      Object.values(errors).every(err => !err)
    );
  }, [numerator, denominator, errors]);

  // Perform decomposition
  const decomposeFraction = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid coefficients (denominator must be quadratic)',
      }));
      return;
    }

    const calcResult = decompose();
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setNumerator({ a: '', b: '' });
    setDenominator({ c: '', d: '', e: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Partial Fraction Decomposer
        </h1>

        {/* Numerator Input */}
        <div className="space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-700">Numerator (ax + b):</h3>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">a (x):</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={numerator.a}
                onChange={handleInputChange('numerator', 'a')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1"
                aria-label="Coefficient of x in numerator"
              />
              {errors.numeratora && <p className="text-red-600 text-sm mt-1">{errors.numeratora}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">b (constant):</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={numerator.b}
                onChange={handleInputChange('numerator', 'b')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
                aria-label="Constant in numerator"
              />
              {errors.numeratorb && <p className="text-red-600 text-sm mt-1">{errors.numeratorb}</p>}
            </div>
          </div>

          {/* Denominator Input */}
          <h3 className="text-lg font-semibold text-gray-700 mt-4">Denominator (cx² + dx + e):</h3>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">c (x²):</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={denominator.c}
                onChange={handleInputChange('denominator', 'c')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1"
                aria-label="Coefficient of x^2 in denominator"
              />
              {errors.denominatorc && <p className="text-red-600 text-sm mt-1">{errors.denominatorc}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">d (x):</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={denominator.d}
                onChange={handleInputChange('denominator', 'd')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., -3"
                aria-label="Coefficient of x in denominator"
              />
              {errors.denominatord && <p className="text-red-600 text-sm mt-1">{errors.denominatord}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">e (constant):</label>
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                value={denominator.e}
                onChange={handleInputChange('denominator', 'e')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2"
                aria-label="Constant in denominator"
              />
              {errors.denominatore && <p className="text-red-600 text-sm mt-1">{errors.denominatore}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={decomposeFraction}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Decompose
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Partial Fractions:</h2>
            <p className="text-center text-xl">{result.decomposition}</p>
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

export default PartialFractionDecomposer;