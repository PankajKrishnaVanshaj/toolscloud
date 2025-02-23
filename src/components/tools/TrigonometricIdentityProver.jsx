'use client';
import React, { useState, useCallback, useMemo } from 'react';

const TrigonometricIdentityProver = () => {
  const [lhs, setLhs] = useState(''); // Left-hand side expression
  const [rhs, setRhs] = useState(''); // Right-hand side expression
  const [angle, setAngle] = useState(''); // Angle value
  const [unit, setUnit] = useState('degrees'); // Degrees or radians
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Evaluate expression at a given angle
  const evaluateExpression = (expr, rad) => {
    try {
      // Replace trigonometric functions and variables with Math equivalents
      let evalExpr = expr.toLowerCase()
        .replace(/sin\(([^)]+)\)/g, (_, arg) => `Math.sin(${arg === 'x' ? rad : parseFloat(arg)})`)
        .replace(/cos\(([^)]+)\)/g, (_, arg) => `Math.cos(${arg === 'x' ? rad : parseFloat(arg)})`)
        .replace(/tan\(([^)]+)\)/g, (_, arg) => `Math.tan(${arg === 'x' ? rad : parseFloat(arg)})`)
        .replace(/\^/g, '**'); // Replace ^ with **
      
      return eval(evalExpr); // Caution: eval() is used here for simplicity; consider a safer parser for production
    } catch (e) {
      throw new Error('Invalid expression');
    }
  };

  // Verify identity
  const verifyIdentity = useCallback(() => {
    const steps = ['Verifying trigonometric identity:'];
    
    if (!lhs || !rhs || !angle) {
      return { error: 'All fields are required' };
    }

    const angleValue = parseFloat(angle);
    if (isNaN(angleValue)) {
      return { error: 'Angle must be a valid number' };
    }

    const rad = unit === 'degrees' ? (angleValue * Math.PI) / 180 : angleValue;
    steps.push(`Angle: ${angleValue} ${unit} = ${rad.toFixed(6)} radians`);

    let leftValue, rightValue;
    try {
      leftValue = evaluateExpression(lhs, rad);
      rightValue = evaluateExpression(rhs, rad);
    } catch (e) {
      return { error: 'Invalid expression format (use sin(x), cos(x), tan(x), ^ for power)' };
    }

    steps.push(`LHS: ${lhs} = ${leftValue.toFixed(6)}`);
    steps.push(`RHS: ${rhs} = ${rightValue.toFixed(6)}`);

    // Check if values are approximately equal (tolerance for floating-point)
    const tolerance = 1e-6;
    const isEqual = Math.abs(leftValue - rightValue) < tolerance;
    steps.push(`Difference: |${leftValue.toFixed(6)} - ${rightValue.toFixed(6)}| = ${Math.abs(leftValue - rightValue).toFixed(6)}`);
    steps.push(isEqual ? 'Identity holds within tolerance' : 'Identity does not hold for this angle');

    // Add predefined identity steps if recognized
    const normalizedLhs = lhs.toLowerCase().replace(/\s+/g, '');
    const normalizedRhs = rhs.toLowerCase().replace(/\s+/g, '');
    if (normalizedLhs === 'sin(x)^2+cos(x)^2' && normalizedRhs === '1') {
      steps.push('Recognized identity: sin²(x) + cos²(x) = 1 (Pythagorean identity)');
    } else if (normalizedLhs === 'sin(2*x)' && normalizedRhs === '2*sin(x)*cos(x)') {
      steps.push('Recognized identity: sin(2x) = 2sin(x)cos(x) (Double-angle identity)');
    }

    return { leftValue, rightValue, isEqual, steps };
  }, [lhs, rhs, angle, unit]);

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    if (field === 'lhs') {
      setLhs(value);
      setErrors((prev) => ({ ...prev, lhs: value ? '' : 'LHS is required' }));
    } else if (field === 'rhs') {
      setRhs(value);
      setErrors((prev) => ({ ...prev, rhs: value ? '' : 'RHS is required' }));
    } else if (field === 'angle') {
      setAngle(value);
      setErrors((prev) => ({ ...prev, angle: value && !isNaN(parseFloat(value)) ? '' : 'Angle must be a number' }));
    }
    setResult(null);
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return (
      lhs && rhs && angle && !isNaN(parseFloat(angle)) &&
      Object.values(errors).every(err => !err)
    );
  }, [lhs, rhs, angle, errors]);

  // Verify identity
  const verify = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs',
      }));
      return;
    }

    const verResult = verifyIdentity();
    if (verResult.error) {
      setErrors({ general: verResult.error });
    } else {
      setResult(verResult);
    }
  };

  // Reset state
  const reset = () => {
    setLhs('');
    setRhs('');
    setAngle('');
    setUnit('degrees');
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Trigonometric Identity Prover
        </h1>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">LHS:</label>
            <div className="flex-1">
              <input
                type="text"
                value={lhs}
                onChange={handleInputChange('lhs')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., sin(x)^2 + cos(x)^2"
                aria-label="Left-hand side"
              />
              {errors.lhs && <p className="text-red-600 text-sm mt-1">{errors.lhs}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">RHS:</label>
            <div className="flex-1">
              <input
                type="text"
                value={rhs}
                onChange={handleInputChange('rhs')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1"
                aria-label="Right-hand side"
              />
              {errors.rhs && <p className="text-red-600 text-sm mt-1">{errors.rhs}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="w-32 text-gray-700">Angle:</label>
            <div className="flex-1 flex gap-2">
              <input
                type="number"
                step="0.01"
                value={angle}
                onChange={handleInputChange('angle')}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 30"
                aria-label="Angle"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Angle unit"
              >
                <option value="degrees">Degrees</option>
                <option value="radians">Radians</option>
              </select>
            </div>
            {errors.angle && <p className="text-red-600 text-sm mt-1">{errors.angle}</p>}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={verify}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Verify
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
              {result.isEqual ? 'Identity holds' : 'Identity does not hold'} at {angle} {unit}
            </p>
            <p className="text-center text-sm mt-2">
              LHS = {result.leftValue.toFixed(6)}, RHS = {result.rightValue.toFixed(6)}
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

export default TrigonometricIdentityProver;