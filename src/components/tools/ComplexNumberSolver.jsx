'use client';
import React, { useState, useCallback, useMemo } from 'react';

const ComplexNumberSolver = () => {
  const [operation, setOperation] = useState('add'); // add, subtract, multiply, divide, magnitude, conjugate
  const [num1, setNum1] = useState({ real: '', imag: '' }); // First complex number: a + bi
  const [num2, setNum2] = useState({ real: '', imag: '' }); // Second complex number: c + di
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate complex number operation
  const calculateComplex = useCallback((op, n1, n2) => {
    const steps = [`Performing ${op} on complex numbers:`];
    const a = parseFloat(n1.real) || 0;
    const b = parseFloat(n1.imag) || 0;
    const c = parseFloat(n2.real) || 0;
    const d = parseFloat(n2.imag) || 0;

    // Validate inputs
    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
      return { error: 'All parts must be valid numbers' };
    }

    steps.push(`z₁ = ${a} + ${b}i`);
    if (op !== 'magnitude' && op !== 'conjugate') steps.push(`z₂ = ${c} + ${d}i`);

    let real, imag;
    switch (op) {
      case 'add':
        real = a + c;
        imag = b + d;
        steps.push(`Addition: (${a} + ${c}) + (${b} + ${d})i`);
        steps.push(`Result: ${real} + ${imag}i`);
        break;
      case 'subtract':
        real = a - c;
        imag = b - d;
        steps.push(`Subtraction: (${a} - ${c}) + (${b} - ${d})i`);
        steps.push(`Result: ${real} + ${imag}i`);
        break;
      case 'multiply':
        real = a * c - b * d;
        imag = a * d + b * c;
        steps.push(`Multiplication: (${a} + ${b}i) * (${c} + ${d}i)`);
        steps.push(`= (${a} * ${c} - ${b} * ${d}) + (${a} * ${d} + ${b} * ${c})i`);
        steps.push(`= ${real} + ${imag}i`);
        break;
      case 'divide':
        const denominator = c * c + d * d;
        if (denominator === 0) {
          steps.push('Division by zero is undefined.');
          return { error: 'Cannot divide by zero (z₂ = 0 + 0i)' };
        }
        real = (a * c + b * d) / denominator;
        imag = (b * c - a * d) / denominator;
        steps.push(`Division: (${a} + ${b}i) / (${c} + ${d}i)`);
        steps.push(`Multiply by conjugate: [(${a} + ${b}i) * (${c} - ${d}i)] / [(${c} + ${d}i) * (${c} - ${d}i)]`);
        steps.push(`= [${a * c + b * d} + ${b * c - a * d}i] / ${denominator}`);
        steps.push(`= ${real.toFixed(4)} + ${imag.toFixed(4)}i`);
        break;
      case 'magnitude':
        const mag = Math.sqrt(a * a + b * b);
        steps.push(`Magnitude: |z₁| = √(${a}^2 + ${b}^2)`);
        steps.push(`= √(${a * a + b * b}) = ${mag.toFixed(4)}`);
        return { result: mag.toFixed(4), steps, scalar: true };
      case 'conjugate':
        real = a;
        imag = -b;
        steps.push(`Conjugate: z₁* = ${a} - ${b}i`);
        break;
      default:
        return { error: 'Invalid operation' };
    }

    return { result: { real: real.toFixed(4), imag: imag.toFixed(4) }, steps };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (num, field) => (e) => {
    const value = e.target.value;
    const setter = num === 'num1' ? setNum1 : setNum2;
    setter((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${num}${field}`]: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, [`${num}${field}`]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const num1Valid = (num1.real || num1.real === '0') && !isNaN(parseFloat(num1.real)) && 
                     (num1.imag || num1.imag === '0') && !isNaN(parseFloat(num1.imag));
    const num2Valid = (num2.real || num2.real === '0') && !isNaN(parseFloat(num2.real)) && 
                     (num2.imag || num2.imag === '0') && !isNaN(parseFloat(num2.imag));
    return (
      num1Valid && 
      (operation === 'magnitude' || operation === 'conjugate' ? true : num2Valid) &&
      Object.values(errors).every(err => !err)
    );
  }, [num1, num2, operation, errors]);

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

    const calcResult = calculateComplex(operation, num1, num2);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setOperation('add');
    setNum1({ real: '', imag: '' });
    setNum2({ real: '', imag: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Complex Number Solver
        </h1>

        {/* Operation Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['add', 'subtract', 'multiply', 'divide', 'magnitude', 'conjugate'].map((op) => (
            <button
              key={op}
              onClick={() => setOperation(op)}
              className={`px-3 py-1 rounded-lg transition-colors ${operation === op ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {op === 'add' ? 'Add' : op === 'subtract' ? 'Subtract' : op === 'multiply' ? 'Multiply' : op === 'divide' ? 'Divide' : op === 'magnitude' ? 'Magnitude' : 'Conjugate'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {/* Number 1 */}
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">z₁ (a + bi):</label>
            <div className="flex flex-1 gap-2">
              <input
                type="number"
                step="0.01"
                value={num1.real}
                onChange={handleInputChange('num1', 'real')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Real (a)"
                aria-label="Real part of z1"
              />
              <span>+</span>
              <input
                type="number"
                step="0.01"
                value={num1.imag}
                onChange={handleInputChange('num1', 'imag')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Imag (b)"
                aria-label="Imaginary part of z1"
              />
              <span>i</span>
            </div>
          </div>
          {(errors['num1real'] || errors['num1imag']) && (
            <div className="text-red-600 text-sm">
              {errors['num1real'] || errors['num1imag']}
            </div>
          )}

          {/* Number 2 */}
          {operation !== 'magnitude' && operation !== 'conjugate' && (
            <>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">z₂ (c + di):</label>
                <div className="flex flex-1 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={num2.real}
                    onChange={handleInputChange('num2', 'real')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Real (c)"
                    aria-label="Real part of z2"
                  />
                  <span>+</span>
                  <input
                    type="number"
                    step="0.01"
                    value={num2.imag}
                    onChange={handleInputChange('num2', 'imag')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Imag (d)"
                    aria-label="Imaginary part of z2"
                  />
                  <span>i</span>
                </div>
              </div>
              {(errors['num2real'] || errors['num2imag']) && (
                <div className="text-red-600 text-sm">
                  {errors['num2real'] || errors['num2imag']}
                </div>
              )}
            </>
          )}
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
              {result.scalar ? result.result : `${result.result.real} + ${result.result.imag}i`}
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

export default ComplexNumberSolver;