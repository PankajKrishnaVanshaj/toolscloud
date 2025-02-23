'use client';
import React, { useState, useCallback, useMemo } from 'react';

const ExponentSimplifier = () => {
  const [expression, setExpression] = useState(''); // Input expression
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Simplify exponent expression
  const simplifyExponent = useCallback(() => {
    const steps = ['Simplifying exponent expression:'];
    steps.push(`Original: ${expression}`);

    // Trim and normalize input
    const trimmedExpr = expression.replace(/\s+/g, '');
    if (!trimmedExpr) {
      return { error: 'Expression is required' };
    }

    // Supported operations: *, /, and parentheses for powers
    const powerMatch = trimmedExpr.match(/^\(([^()]+)\)\^(\d+)$/); // e.g., (x^2)^3
    const productMatch = trimmedExpr.match(/^([^*/]+)\*([^*/]+)$/); // e.g., x^2 * x^3
    const quotientMatch = trimmedExpr.match(/^([^*/]+)\/([^*/]+)$/); // e.g., x^4 / x^2

    if (!powerMatch && !productMatch && !quotientMatch) {
      // Check if it's a single term like x^3 or 2^4
      const singleMatch = trimmedExpr.match(/^([a-zA-Z]|\d+)\^(\d+)$/);
      if (singleMatch) {
        steps.push('Single term, no further simplification needed');
        return { simplified: trimmedExpr, steps };
      }
      return { error: 'Invalid format (use e.g., "x^2 * x^3", "2^4 / 2^2", "(x^2)^3")' };
    }

    let simplified;
    if (powerMatch) {
      // Power rule: (a^m)^n = a^(m*n)
      const [, inner, power] = powerMatch;
      const innerMatch = inner.match(/^([a-zA-Z]|\d+)\^(\d+)$/);
      if (!innerMatch) {
        return { error: 'Invalid inner expression in parentheses (use e.g., "x^2")' };
      }
      const [_, base, exp] = innerMatch;
      const newExp = parseInt(exp) * parseInt(power);
      simplified = `${base}^${newExp}`;
      steps.push(`Power rule: (${base}^${exp})^${power} = ${base}^(${exp} * ${power}) = ${simplified}`);
    } else if (productMatch) {
      // Product rule: a^m * a^n = a^(m+n)
      const [, left, right] = productMatch;
      const leftMatch = left.match(/^([a-zA-Z]|\d+)\^(\d+)$/);
      const rightMatch = right.match(/^([a-zA-Z]|\d+)\^(\d+)$/);
      if (!leftMatch || !rightMatch || leftMatch[1] !== rightMatch[1]) {
        return { error: 'Bases must match and be in form base^exp (e.g., "x^2 * x^3")' };
      }
      const [_, base, leftExp] = leftMatch;
      const [, , rightExp] = rightMatch;
      const newExp = parseInt(leftExp) + parseInt(rightExp);
      simplified = `${base}^${newExp}`;
      steps.push(`Product rule: ${base}^${leftExp} * ${base}^${rightExp} = ${base}^(${leftExp} + ${rightExp}) = ${simplified}`);
    } else if (quotientMatch) {
      // Quotient rule: a^m / a^n = a^(m-n)
      const [, left, right] = quotientMatch;
      const leftMatch = left.match(/^([a-zA-Z]|\d+)\^(\d+)$/);
      const rightMatch = right.match(/^([a-zA-Z]|\d+)\^(\d+)$/);
      if (!leftMatch || !rightMatch || leftMatch[1] !== rightMatch[1]) {
        return { error: 'Bases must match and be in form base^exp (e.g., "x^4 / x^2")' };
      }
      const [_, base, leftExp] = leftMatch;
      const [, , rightExp] = rightMatch;
      const newExp = parseInt(leftExp) - parseInt(rightExp);
      simplified = newExp === 0 ? '1' : `${base}^${newExp}`;
      steps.push(`Quotient rule: ${base}^${leftExp} / ${base}^${rightExp} = ${base}^(${leftExp} - ${rightExp}) = ${simplified}`);
    }

    // Evaluate numerically if all bases are numbers
    const numMatch = simplified.match(/^(\d+)\^(\d+)$/);
    if (numMatch) {
      const [, base, exp] = numMatch;
      const value = Math.pow(parseInt(base), parseInt(exp));
      steps.push(`Numerical evaluation: ${base}^${exp} = ${value}`);
      return { simplified, value, steps };
    }

    return { simplified, steps };
  }, [expression]);

  // Handle input changes
  const handleExpressionChange = (e) => {
    const value = e.target.value;
    setExpression(value);
    setResult(null);
    
    if (!value) {
      setErrors((prev) => ({ ...prev, expression: 'Expression is required' }));
    } else {
      setErrors((prev) => ({ ...prev, expression: '' }));
    }
  };

  // Check if input is valid
  const isValid = useMemo(() => {
    return expression.trim() !== '' && !errors.expression;
  }, [expression, errors]);

  // Simplify expression
  const simplify = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide a valid exponent expression',
      }));
      return;
    }

    const simpResult = simplifyExponent();
    if (simpResult.error) {
      setErrors({ general: simpResult.error });
    } else {
      setResult(simpResult);
    }
  };

  // Reset state
  const reset = () => {
    setExpression('');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Exponent Simplifier
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Expression:</label>
            <div className="flex-1">
              <input
                type="text"
                value={expression}
                onChange={handleExpressionChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., x^2 * x^3 or (2^2)^3"
                aria-label="Exponent expression"
              />
              {errors.expression && <p className="text-red-600 text-sm mt-1">{errors.expression}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={simplify}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Simplify
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Simplified:</h2>
            <p className="text-center text-xl">{result.simplified}</p>
            {result.value && (
              <p className="text-center text-sm mt-2">Value: {result.value}</p>
            )}
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

export default ExponentSimplifier;