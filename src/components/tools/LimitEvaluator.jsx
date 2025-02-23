'use client';
import React, { useState, useCallback, useMemo } from 'react';

const LimitEvaluator = () => {
  const [func, setFunc] = useState(''); // Function as string (e.g., "x^2 - 4")
  const [point, setPoint] = useState(''); // Limit point (e.g., "2" or "infinity")
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Simple function parser and evaluator
  const evaluateFunction = (x, expr) => {
    try {
      // Replace ^ with ** for exponentiation
      const sanitizedExpr = expr.replace(/\^/g, '**').replace(/x/g, `(${x})`);
      return eval(sanitizedExpr); // Note: eval is used for simplicity; in production, use a proper parser
    } catch {
      return NaN;
    }
  };

  // Evaluate limit
  const evaluateLimit = useCallback(() => {
    const steps = ['Evaluating limit:'];
    if (!func) return { error: 'Function is required' };
    if (!point) return { error: 'Limit point is required' };

    const isInfinity = point.toLowerCase() === 'infinity' || point.toLowerCase() === '∞';
    const x0 = isInfinity ? null : parseFloat(point);

    if (!isInfinity && (isNaN(x0) || point.trim() === '')) {
      return { error: 'Limit point must be a number or "infinity"' };
    }

    steps.push(`Function: f(x) = ${func}`);
    steps.push(`Limit as x approaches ${isInfinity ? '∞' : x0}`);

    if (isInfinity) {
      // Handle limit as x -> infinity
      const largeX = 1e6; // Approximation for infinity
      const value = evaluateFunction(largeX, func);
      steps.push(`Approximate at x = ${largeX}: f(x) = ${value.toFixed(4)}`);

      if (!isFinite(value)) {
        steps.push(`Result: ${value > 0 ? '∞' : '-∞'}`);
        return { result: value > 0 ? '∞' : '-∞', steps };
      } else {
        steps.push(`Result appears to approach ${value.toFixed(4)}`);
        return { result: value.toFixed(4), steps };
      }
    } else {
      // Evaluate left and right limits
      const epsilon = 0.0001;
      const leftX = x0 - epsilon;
      const rightX = x0 + epsilon;
      const leftVal = evaluateFunction(leftX, func);
      const rightVal = evaluateFunction(rightX, func);

      steps.push(`Left limit (x = ${leftX}): f(x) = ${isFinite(leftVal) ? leftVal.toFixed(4) : leftVal}`);
      steps.push(`Right limit (x = ${rightX}): f(x) = ${isFinite(rightVal) ? rightVal.toFixed(4) : rightVal}`);

      if (!isFinite(leftVal) || !isFinite(rightVal)) {
        const signMatch = (leftVal > 0 && rightVal > 0) || (leftVal < 0 && rightVal < 0);
        steps.push(`Result: ${signMatch ? (leftVal > 0 ? '∞' : '-∞') : 'Does not exist (diverges)'}`);
        return { result: signMatch ? (leftVal > 0 ? '∞' : '-∞') : 'DNE', steps };
      }

      if (Math.abs(leftVal - rightVal) < 0.01) {
        // Consider them equal within tolerance
        const limitVal = ((leftVal + rightVal) / 2).toFixed(4);
        steps.push(`Left and right limits agree: ${limitVal}`);
        return { result: limitVal, steps };
      } else {
        steps.push('Left and right limits differ: Limit does not exist');
        return { result: 'DNE', steps };
      }

      // Check for indeterminate form (0/0 or ∞/∞) - simplified check
      const atX0 = evaluateFunction(x0, func);
      if (isNaN(atX0) || !isFinite(atX0)) {
        steps.push(`Direct substitution (x = ${x0}) gives indeterminate form`);
        steps.push('Further analysis (e.g., L’Hôpital’s rule) needed, but approximated numerically here');
      }
    }
  }, [func, point]);

  // Handle input changes
  const handleFuncChange = (e) => {
    const value = e.target.value;
    setFunc(value);
    setResult(null);
    setErrors((prev) => ({ ...prev, func: value ? '' : 'Function is required' }));
  };

  const handlePointChange = (e) => {
    const value = e.target.value;
    setPoint(value);
    setResult(null);
    const isInf = value.toLowerCase() === 'infinity' || value.toLowerCase() === '∞';
    if (!value) {
      setErrors((prev) => ({ ...prev, point: 'Limit point is required' }));
    } else if (!isInf && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, point: 'Must be a number or "infinity"' }));
    } else {
      setErrors((prev) => ({ ...prev, point: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const isInf = point.toLowerCase() === 'infinity' || point.toLowerCase() === '∞';
    return (
      func.trim() !== '' &&
      (isInf || (!isNaN(parseFloat(point)) && point.trim() !== '')) &&
      Object.values(errors).every(err => !err)
    );
  }, [func, point, errors]);

  // Evaluate limit
  const evaluate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide a valid function and limit point',
      }));
      return;
    }

    const evalResult = evaluateLimit();
    if (evalResult.error) {
      setErrors({ general: evalResult.error });
    } else {
      setResult(evalResult);
    }
  };

  // Reset state
  const reset = () => {
    setFunc('');
    setPoint('');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Limit Evaluator
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Function f(x):</label>
            <div className="flex-1">
              <input
                type="text"
                value={func}
                onChange={handleFuncChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., x^2 - 4 or 1/x"
                aria-label="Function"
              />
              {errors.func && <p className="text-red-600 text-sm mt-1">{errors.func}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">x approaches:</label>
            <div className="flex-1">
              <input
                type="text"
                value={point}
                onChange={handlePointChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2 or infinity"
                aria-label="Limit point"
              />
              {errors.point && <p className="text-red-600 text-sm mt-1">{errors.point}</p>}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={evaluate}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Evaluate
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Limit:</h2>
            <p className="text-center text-xl">
              lim x→{point} {func} = {result.result}
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

export default LimitEvaluator;