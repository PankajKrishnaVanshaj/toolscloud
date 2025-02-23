'use client';
import React, { useState, useCallback, useMemo } from 'react';

const PolynomialFactorizer = () => {
  const [inputs, setInputs] = useState({ a: '', b: '', c: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Factorize quadratic: ax² + bx + c
  const factorQuadratic = useCallback((a, b, c) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);
    const steps = [`Factorizing ${aNum}x² + ${bNum}x + ${cNum}:`];

    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
      return { error: 'All coefficients must be valid numbers' };
    }
    if (aNum === 0) {
      return { error: 'Coefficient of x² (a) cannot be zero' };
    }

    // Calculate discriminant: b² - 4ac
    const discriminant = bNum * bNum - 4 * aNum * cNum;
    steps.push(`Discriminant (Δ) = ${bNum}² - 4 × ${aNum} × ${cNum} = ${discriminant}`);

    if (discriminant < 0) {
      steps.push('Δ < 0: No real factors exist.');
      return { factors: null, steps, isFactorable: false };
    }

    // Find roots using quadratic formula: (-b ± √Δ) / (2a)
    const sqrtDisc = Math.sqrt(discriminant);
    const root1 = (-bNum + sqrtDisc) / (2 * aNum);
    const root2 = (-bNum - sqrtDisc) / (2 * aNum);
    steps.push(`Roots: x = (${-bNum} ± √${discriminant}) / (2 × ${aNum})`);
    steps.push(`x₁ = ${root1.toFixed(2)}, x₂ = ${root2.toFixed(2)}`);

    // Factor based on roots: (x - root1)(x - root2), adjusted for coefficient a
    if (aNum === 1) {
      steps.push(`Factors: (x - ${root1.toFixed(2)})(x - ${root2.toFixed(2)})`);
      return { factors: `(x - ${root1.toFixed(2)})(x - ${root2.toFixed(2)})`, steps, isFactorable: true };
    } else {
      // Normalize factors: a(x - r1)(x - r2)
      const factor1 = `${aNum}(x - ${root1.toFixed(2)})`;
      const factor2 = `(x - ${root2.toFixed(2)})`;
      steps.push(`Factors: ${factor1}(x - ${root2.toFixed(2)})`);
      return { factors: `${factor1}${factor2}`, steps, isFactorable: true };
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

  // Perform factorization
  const factorize = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please fill all fields with valid numbers',
      }));
      return;
    }

    const calcResult = factorQuadratic(inputs.a, inputs.b, inputs.c);
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
          Polynomial Factorizer
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
            onClick={factorize}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Factorize
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
              {result.isFactorable
                ? `${inputs.a}x² + ${inputs.b}x + ${inputs.c} = ${result.factors}`
                : 'No real factors exist.'}
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

export default PolynomialFactorizer;