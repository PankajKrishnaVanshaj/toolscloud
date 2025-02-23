'use client';
import React, { useState, useCallback, useMemo } from 'react';

const QuadraticEquationSolver = () => {
  const [inputs, setInputs] = useState({ a: '', b: '', c: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Solve quadratic equation: ax² + bx + c = 0
  const solveQuadratic = useCallback((a, b, c) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);
    const steps = [`Solving ${aNum}x² + ${bNum}x + ${cNum} = 0:`];

    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
      return { error: 'All coefficients must be valid numbers' };
    }
    if (aNum === 0) {
      return { error: 'Coefficient of x² (a) cannot be zero for a quadratic equation' };
    }

    // Calculate discriminant: b² - 4ac
    const discriminant = bNum * bNum - 4 * aNum * cNum;
    steps.push(`Discriminant (Δ) = ${bNum}² - 4 × ${aNum} × ${cNum} = ${discriminant}`);

    // Quadratic formula: x = [-b ± √(b² - 4ac)] / (2a)
    if (discriminant < 0) {
      const realPart = (-bNum / (2 * aNum)).toFixed(2);
      const imagPart = (Math.sqrt(-discriminant) / (2 * aNum)).toFixed(2);
      steps.push(`Δ < 0: Complex roots`);
      steps.push(`x = (${-bNum} ± √(${discriminant})) / (2 × ${aNum})`);
      steps.push(`x₁ = ${realPart} + ${imagPart}i, x₂ = ${realPart} - ${imagPart}i`);
      return {
        roots: [`${realPart} + ${imagPart}i`, `${realPart} - ${imagPart}i`],
        steps,
        type: 'complex',
      };
    } else if (discriminant === 0) {
      const root = (-bNum / (2 * aNum)).toFixed(2);
      steps.push(`Δ = 0: One real root`);
      steps.push(`x = -${bNum} / (2 × ${aNum}) = ${root}`);
      return { roots: [root], steps, type: 'real' };
    } else {
      const root1 = ((-bNum + Math.sqrt(discriminant)) / (2 * aNum)).toFixed(2);
      const root2 = ((-bNum - Math.sqrt(discriminant)) / (2 * aNum)).toFixed(2);
      steps.push(`Δ > 0: Two real roots`);
      steps.push(`x = (${-bNum} ± √${discriminant}) / (2 × ${aNum})`);
      steps.push(`x₁ = ${root1}, x₂ = ${root2}`);
      return { roots: [root1, root2], steps, type: 'real' };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (!value) {
      setErrors((prev) => ({ ...prev, [field]: 'This field is required' }));
    } else if (isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a valid number' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    return ['a', 'b', 'c'].every(
      (field) => inputs[field] && !isNaN(parseFloat(inputs[field])) && !errors[field]
    );
  }, [inputs, errors]);

  // Solve the equation
  const solve = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please fill all fields with valid numbers',
      }));
      return;
    }

    const calcResult = solveQuadratic(inputs.a, inputs.b, inputs.c);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setInputs({ a: '', b: '', c: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Quadratic Equation Solver
        </h1>

        {/* Input Section */}
        <div className="space-y-4">
          {['a', 'b', 'c'].map((field) => (
            <div key={field} className="flex items-center gap-2">
              <label className="w-32 text-gray-700">
                {field} ({field === 'a' ? 'x²' : field === 'b' ? 'x' : 'constant'}):
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs[field]}
                  onChange={handleInputChange(field)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`e.g., ${field === 'a' ? '1' : field === 'b' ? '-5' : '6'}`}
                  aria-label={`${field} coefficient`}
                />
                {errors[field] && <p className="text-red-600 text-sm mt-1">{errors[field]}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-6">
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Roots:</h2>
            <p className="text-center text-xl">
              {result.roots.length === 1
                ? `x = ${result.roots[0]}`
                : `x₁ = ${result.roots[0]}, x₂ = ${result.roots[1]}`}
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

export default QuadraticEquationSolver;