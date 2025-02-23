'use client';
import React, { useState, useCallback, useMemo } from 'react';

const InequalitySolver = () => {
  const [inputs, setInputs] = useState({ a: '', b: '', c: '', operator: '<' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Solve the inequality ax + b [operator] c
  const solveInequality = useCallback((a, b, c, operator) => {
    const steps = [`Solving ${a}x + ${b} ${operator} ${c} for x:`];
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);

    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
      return { error: 'All coefficients must be valid numbers' };
    }
    if (aNum === 0) {
      return { error: 'Coefficient of x (a) cannot be zero' };
    }

    // Step 1: Subtract b from both sides
    const rhs = cNum - bNum;
    steps.push(`Subtract ${bNum} from both sides: ${aNum}x ${operator} ${rhs}`);

    // Step 2: Divide by a and handle inequality direction
    const solution = rhs / aNum;
    let finalOperator = operator;

    if (aNum < 0) {
      // Reverse inequality when dividing by a negative number
      finalOperator = operator === '<' ? '>' : operator === '>' ? '<' : operator === '≤' ? '≥' : '≤';
      steps.push(`Divide both sides by ${aNum} (negative, so reverse inequality): x ${finalOperator} ${solution.toFixed(2)}`);
    } else {
      steps.push(`Divide both sides by ${aNum}: x ${finalOperator} ${solution.toFixed(2)}`);
    }

    // Convert to interval notation
    const interval = aNum < 0
      ? (operator === '<' || operator === '≤' 
          ? `(${solution.toFixed(2)}, ∞)` 
          : `(-∞, ${solution.toFixed(2)}]`)
      : (operator === '<' || operator === '≤' 
          ? `(-∞, ${solution.toFixed(2)}${operator === '≤' ? ']' : ')'}` 
          : `[${solution.toFixed(2)}, ∞)`);

    steps.push(`Solution in interval notation: ${interval}`);
    return {
      solution: `x ${finalOperator} ${solution.toFixed(2)}`,
      interval,
      steps,
    };
  }, []);

  // Handle coef input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null);

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else if (field === 'a' && value && parseFloat(value) === 0) {
      setErrors((prev) => ({ ...prev, [field]: 'Cannot be zero' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Handle operator change
  const handleOperatorChange = (e) => {
    setInputs((prev) => ({ ...prev, operator: e.target.value }));
    setResult(null);
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

  // Solve the inequality
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

    const calcResult = solveInequality(inputs.a, inputs.b, inputs.c, inputs.operator);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ a: '', b: '', c: '', operator: '<' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Inequality Solver
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-2 items-center">
              <input
                type="number"
                step="0.01"
                value={inputs.a}
                onChange={handleInputChange('a')}
                className="w-16 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                placeholder="a"
                aria-label="Coefficient of x"
              />
              <span>x +</span>
              <input
                type="number"
                step="0.01"
                value={inputs.b}
                onChange={handleInputChange('b')}
                className="w-16 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                placeholder="b"
                aria-label="Constant b"
              />
              <select
                value={inputs.operator}
                onChange={handleOperatorChange}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Inequality operator"
              >
                {['<', '>', '≤', '≥'].map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                value={inputs.c}
                onChange={handleInputChange('c')}
                className="w-16 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                placeholder="c"
                aria-label="Right-hand side constant"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            {['a', 'b', 'c'].map((field) => (
              errors[field] && <p key={field} className="text-red-600 text-sm">{errors[field]}</p>
            ))}
          </div>
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
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg transition-all">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Solution:</h2>
            <p className="text-center text-xl">{result.solution}</p>
            <p className="text-center text-lg">Interval: {result.interval}</p>
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

export default InequalitySolver;