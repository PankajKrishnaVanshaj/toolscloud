'use client';
import React, { useState, useCallback, useMemo } from 'react';

const VectorCalculator = () => {
  const [dimension, setDimension] = useState(2); // 2 for 2D, 3 for 3D
  const [vectorA, setVectorA] = useState(['', '', '']); // [x, y, z], z ignored for 2D
  const [vectorB, setVectorB] = useState(['', '', '']);
  const [operation, setOperation] = useState('add'); // add, subtract, dot, cross
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate vector operation
  const calculateVectorOperation = useCallback((vecA, vecB, dim, op) => {
    const steps = [`Performing ${op} operation on vectors:`];
    const a = vecA.slice(0, dim).map(val => parseFloat(val) || 0);
    const b = vecB.slice(0, dim).map(val => parseFloat(val) || 0);

    // Validate inputs
    if (a.some(isNaN) || b.some(isNaN)) {
      return { error: 'All vector components must be valid numbers' };
    }

    steps.push(`Vector A = <${a.join(', ')}>`);
    steps.push(`Vector B = <${b.join(', ')}>`);

    if (op === 'add') {
      const result = a.map((val, i) => val + b[i]);
      steps.push(`Addition: <${a.map((val, i) => `${val} + ${b[i]}`).join(', ')}>`);
      steps.push(`Result: <${result.join(', ')}>`);
      return { result, steps };
    } else if (op === 'subtract') {
      const result = a.map((val, i) => val - b[i]);
      steps.push(`Subtraction: <${a.map((val, i) => `${val} - ${b[i]}`).join(', ')}>`);
      steps.push(`Result: <${result.join(', ')}>`);
      return { result, steps };
    } else if (op === 'dot') {
      const result = a.reduce((sum, val, i) => sum + val * b[i], 0);
      steps.push(`Dot Product: ${a.map((val, i) => `${val} * ${b[i]}`).join(' + ')}`);
      steps.push(`Result: ${result}`);
      return { result, steps, scalar: true };
    } else if (op === 'cross' && dim === 3) {
      const [ax, ay, az] = a;
      const [bx, by, bz] = b;
      const result = [
        (ay * bz - az * by).toFixed(2),
        (az * bx - ax * bz).toFixed(2),
        (ax * by - ay * bx).toFixed(2),
      ];
      steps.push(`Cross Product: <(ay*bz - az*by), (az*bx - ax*bz), (ax*by - ay*bx)>`);
      steps.push(`= <(${ay}*${bz} - ${az}*${by}), (${az}*${bx} - ${ax}*${bz}), (${ax}*${by} - ${ay}*${bx})>`);
      steps.push(`Result: <${result.join(', ')}>`);
      return { result, steps };
    }
  }, []);

  // Handle vector input changes
  const handleVectorChange = (vector, index) => (e) => {
    const value = e.target.value;
    const setter = vector === 'A' ? setVectorA : setVectorB;
    setter((prev) => {
      const newVector = [...prev];
      newVector[index] = value;
      return newVector;
    });
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [`${vector}${index}`]: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, [`${vector}${index}`]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const activeComponents = dimension;
    const aValid = vectorA.slice(0, activeComponents).every(val => val && !isNaN(parseFloat(val)));
    const bValid = vectorB.slice(0, activeComponents).every(val => val && !isNaN(parseFloat(val)));
    return aValid && bValid && Object.values(errors).every(err => !err);
  }, [vectorA, vectorB, dimension, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: `Please fill all ${dimension} components of both vectors with valid numbers`,
      }));
      return;
    }

    const calcResult = calculateVectorOperation(vectorA, vectorB, dimension, operation);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setDimension(2);
    setVectorA(['', '', '']);
    setVectorB(['', '', '']);
    setOperation('add');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Vector Calculator
        </h1>

        {/* Dimension Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {[2, 3].map((dim) => (
            <button
              key={dim}
              onClick={() => setDimension(dim)}
              className={`px-4 py-2 rounded-lg transition-colors ${dimension === dim ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {dim}D
            </button>
          ))}
        </div>

        {/* Operation Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['add', 'subtract', 'dot', ...(dimension === 3 ? ['cross'] : [])].map((op) => (
            <button
              key={op}
              onClick={() => setOperation(op)}
              className={`px-3 py-1 rounded-lg transition-colors ${operation === op ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {op === 'add' ? 'Add' : op === 'subtract' ? 'Subtract' : op === 'dot' ? 'Dot Product' : 'Cross Product'}
            </button>
          ))}
        </div>

        {/* Vector Inputs */}
        <div className="space-y-4 mb-6">
          {['A', 'B'].map((vec) => (
            <div key={vec} className="flex items-center gap-2">
              <label className="w-24 text-gray-700">Vector {vec}:</label>
              <div className="flex gap-2 flex-1">
                {['x', 'y', ...(dimension === 3 ? ['z'] : [])].map((comp, i) => (
                  <div key={comp} className="flex-1">
                    <input
                      type="number"
                      step="0.01"
                      value={vec === 'A' ? vectorA[i] : vectorB[i]}
                      onChange={handleVectorChange(vec, i)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      placeholder={comp}
                      aria-label={`Vector ${vec} ${comp}-component`}
                    />
                    {errors[`${vec}${i}`] && <p className="text-red-600 text-xs mt-1">{errors[`${vec}${i}`]}</p>}
                  </div>
                ))}
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
              {result.scalar ? result.result : `<${result.result.join(', ')}>`}
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

export default VectorCalculator;