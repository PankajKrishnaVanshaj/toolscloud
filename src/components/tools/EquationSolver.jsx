'use client'
import React, { useState } from 'react';

const EquationSolver = () => {
  const [equationType, setEquationType] = useState('linear'); // linear or quadratic
  const [linearA, setLinearA] = useState(''); // ax + b = c: coefficient a
  const [linearB, setLinearB] = useState(''); // constant b
  const [linearC, setLinearC] = useState(''); // constant c
  const [quadA, setQuadA] = useState(''); // ax² + bx + c = 0: coefficient a
  const [quadB, setQuadB] = useState(''); // coefficient b
  const [quadC, setQuadC] = useState(''); // constant c
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  // Solve linear equation: ax + b = c
  const solveLinear = (a, b, c) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);

    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
      return { error: 'Please enter valid numbers for all coefficients' };
    }
    if (aNum === 0) {
      return { error: 'Coefficient of x (a) cannot be zero in a linear equation' };
    }

    // ax + b = c => ax = c - b => x = (c - b) / a
    const x = (cNum - bNum) / aNum;
    const steps = [
      `${aNum}x + ${bNum} = ${cNum}`,
      `${aNum}x = ${cNum} - ${bNum} = ${(cNum - bNum).toFixed(2)}`,
      `x = ${(cNum - bNum).toFixed(2)} / ${aNum} = ${x.toFixed(2)}`
    ];

    return {
      solution: x.toFixed(2),
      steps,
      type: 'linear'
    };
  };

  // Solve quadratic equation: ax² + bx + c = 0
  const solveQuadratic = (a, b, c) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    const cNum = parseFloat(c);

    if (isNaN(aNum) || isNaN(bNum) || isNaN(cNum)) {
      return { error: 'Please enter valid numbers for all coefficients' };
    }
    if (aNum === 0) {
      return { error: 'Coefficient of x² (a) cannot be zero in a quadratic equation' };
    }

    // Discriminant: b² - 4ac
    const discriminant = bNum * bNum - 4 * aNum * cNum;
    const steps = [
      `${aNum}x² + ${bNum}x + ${cNum} = 0`,
      `Discriminant (Δ) = b² - 4ac = ${bNum}² - 4 × ${aNum} × ${cNum} = ${discriminant.toFixed(2)}`
    ];

    if (discriminant < 0) {
      const realPart = (-bNum / (2 * aNum)).toFixed(2);
      const imagPart = (Math.sqrt(-discriminant) / (2 * aNum)).toFixed(2);
      steps.push(
        'Δ < 0, complex roots:',
        `x₁ = (${-bNum} + √(${discriminant})) / (2 × ${aNum}) = ${realPart} + ${imagPart}i`,
        `x₂ = (${-bNum} - √(${discriminant})) / (2 × ${aNum}) = ${realPart} - ${imagPart}i`
      );
      return {
        solutions: [`${realPart} + ${imagPart}i`, `${realPart} - ${imagPart}i`],
        steps,
        type: 'quadratic'
      };
    } else {
      const x1 = (-bNum + Math.sqrt(discriminant)) / (2 * aNum);
      const x2 = (-bNum - Math.sqrt(discriminant)) / (2 * aNum);
      steps.push(
        `x₁ = (-b + √Δ) / (2a) = (${-bNum} + √${discriminant.toFixed(2)}) / (2 × ${aNum}) = ${x1.toFixed(2)}`,
        `x₂ = (-b - √Δ) / (2a) = (${-bNum} - √${discriminant.toFixed(2)}) / (2 × ${aNum}) = ${x2.toFixed(2)}`
      );
      return {
        solutions: [x1.toFixed(2), x2.toFixed(2)],
        steps,
        type: 'quadratic'
      };
    }
  };

  const calculate = () => {
    setError('');
    setResult(null);

    if (equationType === 'linear') {
      if (!linearA || !linearB || !linearC) {
        setError('Please fill in all fields for the linear equation');
        return;
      }
      const calcResult = solveLinear(linearA, linearB, linearC);
      if (calcResult.error) {
        setError(calcResult.error);
        return;
      }
      setResult(calcResult);
    } else if (equationType === 'quadratic') {
      if (!quadA || !quadB || !quadC) {
        setError('Please fill in all fields for the quadratic equation');
        return;
      }
      const calcResult = solveQuadratic(quadA, quadB, quadC);
      if (calcResult.error) {
        setError(calcResult.error);
        return;
      }
      setResult(calcResult);
    }
  };

  const reset = () => {
    setEquationType('linear');
    setLinearA('');
    setLinearB('');
    setLinearC('');
    setQuadA('');
    setQuadB('');
    setQuadC('');
    setResult(null);
    setError('');
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Equation Solver
        </h1>

        {/* Equation Type Selection */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setEquationType('linear')}
            className={`px-3 py-1 rounded-lg ${equationType === 'linear' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Linear (ax + b = c)
          </button>
          <button
            onClick={() => setEquationType('quadratic')}
            className={`px-3 py-1 rounded-lg ${equationType === 'quadratic' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            Quadratic (ax² + bx + c = 0)
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-6">
          {equationType === 'linear' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">a (x coefficient):</label>
                <input
                  type="number"
                  step="0.01"
                  value={linearA}
                  onChange={(e) => setLinearA(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">b (constant):</label>
                <input
                  type="number"
                  step="0.01"
                  value={linearB}
                  onChange={(e) => setLinearB(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">c (equals):</label>
                <input
                  type="number"
                  step="0.01"
                  value={linearC}
                  onChange={(e) => setLinearC(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 7"
                />
              </div>
            </div>
          )}
          {equationType === 'quadratic' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">a (x² coefficient):</label>
                <input
                  type="number"
                  step="0.01"
                  value={quadA}
                  onChange={(e) => setQuadA(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 1"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">b (x coefficient):</label>
                <input
                  type="number"
                  step="0.01"
                  value={quadB}
                  onChange={(e) => setQuadB(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -5"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">c (constant):</label>
                <input
                  type="number"
                  step="0.01"
                  value={quadC}
                  onChange={(e) => setQuadC(e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 6"
                />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={calculate}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              Solve Equation
            </button>
            <button
              onClick={reset}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 text-center">Solution:</h2>
            <div className="mt-2 space-y-2">
              {result.type === 'linear' && (
                <p className="text-center text-xl">x = {result.solution}</p>
              )}
              {result.type === 'quadratic' && (
                <p className="text-center text-xl">
                  x = {result.solutions[0]}{result.solutions.length > 1 ? `, x = ${result.solutions[1]}` : ''}
                </p>
              )}

              {/* Details Toggle */}
              <div className="text-center">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showDetails ? 'Hide Steps' : 'Show Steps'}
                </button>
              </div>

              {showDetails && (
                <div className="text-sm space-y-2">
                  <p>Solving Steps:</p>
                  <ul className="list-disc list-inside">
                    {result.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquationSolver;