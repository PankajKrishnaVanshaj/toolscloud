'use client';
import React, { useState, useCallback, useMemo } from 'react';

const ComplexNumberCalculator = () => {
  const [complexA, setComplexA] = useState({ real: '', imag: '' });
  const [complexB, setComplexB] = useState({ real: '', imag: '' });
  const [operation, setOperation] = useState('add'); // add, subtract, multiply, divide
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate complex number operation
  const calculateComplex = useCallback((a, b, op) => {
    const steps = [`Performing ${op} on complex numbers:`];
    const aReal = parseFloat(a.real) || 0;
    const aImag = parseFloat(a.imag) || 0;
    const bReal = parseFloat(b.real) || 0;
    const bImag = parseFloat(b.imag) || 0;

    // Validate inputs
    if (isNaN(aReal) || isNaN(aImag) || isNaN(bReal) || isNaN(bImag)) {
      return { error: 'All parts must be valid numbers' };
    }

    steps.push(`A = ${aReal} + ${aImag}i`);
    steps.push(`B = ${bReal} + ${bImag}i`);

    let real, imag;
    if (op === 'add') {
      real = aReal + bReal;
      imag = aImag + bImag;
      steps.push(`(${aReal} + ${aImag}i) + (${bReal} + ${bImag}i)`);
      steps.push(`= (${aReal} + ${bReal}) + (${aImag} + ${bImag})i`);
      steps.push(`= ${real} + ${imag}i`);
    } else if (op === 'subtract') {
      real = aReal - bReal;
      imag = aImag - bImag;
      steps.push(`(${aReal} + ${aImag}i) - (${bReal} + ${bImag}i)`);
      steps.push(`= (${aReal} - ${bReal}) + (${aImag} - ${bImag})i`);
      steps.push(`= ${real} + ${imag}i`);
    } else if (op === 'multiply') {
      real = aReal * bReal - aImag * bImag; // (a + bi)(c + di) = (ac - bd) + (ad + bc)i
      imag = aReal * bImag + aImag * bReal;
      steps.push(`(${aReal} + ${aImag}i) * (${bReal} + ${bImag}i)`);
      steps.push(`= (${aReal} * ${bReal} - ${aImag} * ${bImag}) + (${aReal} * ${bImag} + ${aImag} * ${bReal})i`);
      steps.push(`= ${real} + ${imag}i`);
    } else if (op === 'divide') {
      const denom = bReal * bReal + bImag * bImag; // |B|^2
      if (denom === 0) {
        return { error: 'Division by zero (B = 0 + 0i)' };
      }
      real = (aReal * bReal + aImag * bImag) / denom; // (a + bi)/(c + di) = (ac + bd)/(c² + d²) + (bc - ad)/(c² + d²)i
      imag = (aImag * bReal - aReal * bImag) / denom;
      steps.push(`(${aReal} + ${aImag}i) / (${bReal} + ${bImag}i)`);
      steps.push(`Multiply by conjugate: (${bReal} - ${bImag}i) / (${bReal} - ${bImag}i)`);
      steps.push(`Numerator: (${aReal} * ${bReal} + ${aImag} * ${bImag}) + (${aImag} * ${bReal} - ${aReal} * ${bImag})i`);
      steps.push(`Denominator: ${bReal}^2 + ${bImag}^2 = ${denom}`);
      steps.push(`= (${real.toFixed(4)}) + (${imag.toFixed(4)})i`);
    }

    // Polar form: magnitude = √(real² + imag²), angle = atan2(imag, real)
    const magnitude = Math.sqrt(real * real + imag * imag);
    const angleRad = Math.atan2(imag, real);
    const angleDeg = (angleRad * 180 / Math.PI).toFixed(2);
    steps.push(`Polar form: Magnitude = √(${real}^2 + ${imag}^2) = ${magnitude.toFixed(4)}`);
    steps.push(`Angle = atan2(${imag}, ${real}) = ${angleDeg}°`);

    return {
      result: { real: real.toFixed(4), imag: imag.toFixed(4) },
      polar: { magnitude: magnitude.toFixed(4), angle: angleDeg },
      steps,
    };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (complex, field) => (e) => {
    const value = e.target.value;
    const setter = complex === 'A' ? setComplexA : setComplexB;
    setter((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${complex}${field}`]: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, [`${complex}${field}`]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      complexA.real && !isNaN(parseFloat(complexA.real)) &&
      complexA.imag && !isNaN(parseFloat(complexA.imag)) &&
      complexB.real && !isNaN(parseFloat(complexB.real)) &&
      complexB.imag && !isNaN(parseFloat(complexB.imag)) &&
      Object.values(errors).every(err => !err)
    );
  }, [complexA, complexB, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please fill all fields with valid numbers',
      }));
      return;
    }

    const calcResult = calculateComplex(complexA, complexB, operation);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setComplexA({ real: '', imag: '' });
    setComplexB({ real: '', imag: '' });
    setOperation('add');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Complex Number Calculator
        </h1>

        {/* Operation Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['add', 'subtract', 'multiply', 'divide'].map((op) => (
            <button
              key={op}
              onClick={() => setOperation(op)}
              className={`px-3 py-1 rounded-lg transition-colors ${operation === op ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {op === 'add' ? 'Add' : op === 'subtract' ? 'Subtract' : op === 'multiply' ? 'Multiply' : 'Divide'}
            </button>
          ))}
        </div>

        {/* Complex Number Inputs */}
        <div className="space-y-4 mb-6">
          {['A', 'B'].map((c) => (
            <div key={c} className="space-y-2">
              <h3 className="text-gray-700 font-semibold">Complex Number {c}:</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={c === 'A' ? complexA.real : complexB.real}
                    onChange={handleInputChange(c, 'real')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Real (a)"
                    aria-label={`Real part of complex number ${c}`}
                  />
                  {errors[`${c}real`] && <p className="text-red-600 text-sm mt-1">{errors[`${c}real`]}</p>}
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={c === 'A' ? complexA.imag : complexB.imag}
                    onChange={handleInputChange(c, 'imag')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Imag (b)"
                    aria-label={`Imaginary part of complex number ${c}`}
                  />
                  {errors[`${c}imag`] && <p className="text-red-600 text-sm mt-1">{errors[`${c}imag`]}</p>}
                </div>
              </div>
            </div>
          ))}
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
              {result.result.real} + {result.result.imag}i
            </p>
            <p className="text-center text-sm text-gray-600 mt-1">
              Polar: {result.polar.magnitude} ∠ {result.polar.angle}°
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

export default ComplexNumberCalculator;