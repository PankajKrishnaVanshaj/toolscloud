'use client';
import React, { useState, useCallback, useMemo } from 'react';

const RationalEquationSolver = () => {
  const [type, setType] = useState('type1'); // type1: a/x + b = c, type2: a/(x - b) = c
  const [inputs, setInputs] = useState({ a: '', b: '', c: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Solve rational equation
  const solveRational = useCallback((type, inputs) => {
    const steps = [`Solving ${type === 'type1' ? 'a/x + b = c' : 'a/(x - b) = c'}:`];
    const a = parseFloat(inputs.a);
    const b = parseFloat(inputs.b);
    const c = parseFloat(inputs.c);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      return { error: 'All coefficients must be valid numbers' };
    }
    if (a === 0) {
      return { error: 'Coefficient a cannot be zero' };
    }

    steps.push(`Given: ${type === 'type1' ? `${a}/x + ${b} = ${c}` : `${a}/(x - ${b}) = ${c}`}`);

    let x;
    if (type === 'type1') {
      // a/x + b = c
      // a/x = c - b
      // x = a / (c - b)
      const denominator = c - b;
      if (denominator === 0) {
        steps.push(`c - b = ${c} - ${b} = 0`);
        steps.push('Denominator is zero: No solution (x ≠ 0)');
        return { error: 'No solution (division by zero)', steps };
      }
      x = a / denominator;
      steps.push(`Subtract ${b} from both sides: ${a}/x = ${c} - ${b} = ${denominator}`);
      steps.push(`Multiply both sides by x: ${a} = ${denominator}x`);
      steps.push(`Divide both sides by ${denominator}: x = ${a} / ${denominator} = ${x.toFixed(2)}`);
    } else {
      // a/(x - b) = c
      // a = c(x - b)
      // a/c = x - b
      // x = a/c + b
      if (c === 0) {
        steps.push(`c = 0: ${a}/(x - ${b}) = 0 implies a = 0, but a = ${a}`);
        return { error: 'No solution (division by zero or contradiction)', steps };
      }
      x = (a / c) + b;
      const denominator = x - b;
      if (denominator === 0) {
        steps.push(`x - b = ${x.toFixed(2)} - ${b} = 0`);
        steps.push('Denominator is zero: No solution');
        return { error: 'No solution (denominator zero)', steps };
      }
      steps.push(`Multiply both sides by (x - ${b}): ${a} = ${c}(x - ${b})`);
      steps.push(`Divide both sides by ${c}: ${a}/${c} = x - ${b}`);
      steps.push(`Add ${b} to both sides: x = ${a}/${c} + ${b} = ${x.toFixed(2)}`);
    }

    steps.push(`Solution: x = ${x.toFixed(2)}`);
    return { solution: x.toFixed(2), steps };
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else if (field === 'a' && value && parseFloat(value) === 0) {
      setErrors((prev) => ({ ...prev, [field]: 'Cannot be zero' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      inputs.a && !isNaN(parseFloat(inputs.a)) && parseFloat(inputs.a) !== 0 &&
      inputs.b && !isNaN(parseFloat(inputs.b)) &&
      inputs.c && !isNaN(parseFloat(inputs.c)) &&
      Object.values(errors).every(err => !err)
    );
  }, [inputs, errors]);

  // Solve equation
  const solve = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please fill all fields with valid numbers (a ≠ 0)',
      }));
      return;
    }

    const calcResult = solveRational(type, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setType('type1');
    setInputs({ a: '', b: '', c: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Rational Equation Solver
        </h1>

        {/* Type Selection */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setType('type1')}
            className={`px-4 py-2 rounded-lg transition-colors ${type === 'type1' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            a/x + b = c
          </button>
          <button
            onClick={() => setType('type2')}
            className={`px-4 py-2 rounded-lg transition-colors ${type === 'type2' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            a/(x - b) = c
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {['a', 'b', 'c'].map((field) => (
            <div key={field} className="flex items-center gap-2">
              <label className="w-32 text-gray-700">
                {field} {field === 'a' ? '(numerator)' : field === 'b' && type === 'type1' ? '(addend)' : field === 'b' ? '(shift)' : '(equals)'}:
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === 'a' ? '2' : field === 'b' ? '1' : '3'}`}
                  aria-label={`${field} coefficient`}
                />
                {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={solve}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Solve
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
        {result && result.solution && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Solution:</h2>
            <p className="text-center text-xl">x = {result.solution}</p>
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

export default RationalEquationSolver;