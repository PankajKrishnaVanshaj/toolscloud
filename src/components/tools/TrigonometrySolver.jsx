'use client';
import React, { useState, useCallback, useMemo } from 'react';

const TrigonometrySolver = () => {
  const [mode, setMode] = useState('side'); // side, angle, conversion
  const [inputs, setInputs] = useState({ sideA: '', sideB: '', angle: '', value: '' });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Calculate trigonometric solution
  const calculateTrig = useCallback((mode, inputs) => {
    const steps = [`Solving for ${mode}:`];

    if (mode === 'side') {
      const sideA = parseFloat(inputs.sideA);
      const sideB = parseFloat(inputs.sideB);
      const angle = parseFloat(inputs.angle);
      
      if (isNaN(sideA) || isNaN(angle) || sideA <= 0 || angle <= 0 || angle >= 90) {
        return { error: 'Side A and angle must be positive numbers, angle < 90°' };
      }

      const rad = (angle * Math.PI) / 180;
      steps.push(`Angle = ${angle}° = ${rad.toFixed(4)} radians`);

      if (sideB === '') {
        // Adjacent and angle given, find hypotenuse
        const hypotenuse = sideA / Math.cos(rad);
        steps.push(`cos(${angle}°) = Adjacent / Hypotenuse`);
        steps.push(`Hypotenuse = ${sideA} / cos(${angle}°) = ${hypotenuse.toFixed(2)}`);
        return { result: hypotenuse.toFixed(2), steps, label: 'Hypotenuse' };
      } else if (!isNaN(sideB) && sideB > 0) {
        // Hypotenuse and angle given, find adjacent
        const adjacent = sideB * Math.cos(rad);
        steps.push(`cos(${angle}°) = Adjacent / ${sideB}`);
        steps.push(`Adjacent = ${sideB} * cos(${angle}°) = ${adjacent.toFixed(2)}`);
        return { result: adjacent.toFixed(2), steps, label: 'Adjacent' };
      }
    } else if (mode === 'angle') {
      const sideA = parseFloat(inputs.sideA);
      const sideB = parseFloat(inputs.sideB);

      if (isNaN(sideA) || isNaN(sideB) || sideA <= 0 || sideB <= 0) {
        return { error: 'Both sides must be positive numbers' };
      }

      if (sideA < sideB) {
        // sideA = opposite, sideB = hypotenuse
        const rad = Math.asin(sideA / sideB);
        const deg = (rad * 180) / Math.PI;
        steps.push(`sin(θ) = Opposite / Hypotenuse = ${sideA} / ${sideB}`);
        steps.push(`θ = arcsin(${sideA / sideB}) = ${deg.toFixed(2)}°`);
        return { result: deg.toFixed(2), steps, label: 'Angle (degrees)' };
      } else {
        // sideA = hypotenuse, sideB = adjacent
        const rad = Math.acos(sideB / sideA);
        const deg = (rad * 180) / Math.PI;
        steps.push(`cos(θ) = Adjacent / Hypotenuse = ${sideB} / ${sideA}`);
        steps.push(`θ = arccos(${sideB / sideA}) = ${deg.toFixed(2)}°`);
        return { result: deg.toFixed(2), steps, label: 'Angle (degrees)' };
      }
    } else if (mode === 'conversion') {
      const value = parseFloat(inputs.value);
      if (isNaN(value)) {
        return { error: 'Value must be a valid number' };
      }

      const rad = (value * Math.PI) / 180;
      const deg = (value * 180) / Math.PI;
      steps.push(`Converting ${value}:`);
      steps.push(`${value}° = ${value} * π / 180 = ${rad.toFixed(4)} radians`);
      steps.push(`${value} radians = ${value} * 180 / π = ${deg.toFixed(2)}°`);
      return { result: { degrees: deg.toFixed(2), radians: rad.toFixed(4) }, steps, label: 'Converted Values' };
    }
  }, []);

  // Handle input changes with validation
  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setInputs((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be a number' }));
    } else if (field !== 'sideB' && value && parseFloat(value) <= 0) {
      setErrors((prev) => ({ ...prev, [field]: 'Must be positive' }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Check if inputs are valid based on mode
  const isValid = useMemo(() => {
    if (mode === 'side') {
      return (
        inputs.sideA && !isNaN(parseFloat(inputs.sideA)) && parseFloat(inputs.sideA) > 0 &&
        inputs.angle && !isNaN(parseFloat(inputs.angle)) && parseFloat(inputs.angle) > 0 && parseFloat(inputs.angle) < 90 &&
        (inputs.sideB === '' || (!isNaN(parseFloat(inputs.sideB)) && parseFloat(inputs.sideB) > 0)) &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'angle') {
      return (
        inputs.sideA && !isNaN(parseFloat(inputs.sideA)) && parseFloat(inputs.sideA) > 0 &&
        inputs.sideB && !isNaN(parseFloat(inputs.sideB)) && parseFloat(inputs.sideB) > 0 &&
        Object.values(errors).every(err => !err)
      );
    } else if (mode === 'conversion') {
      return inputs.value && !isNaN(parseFloat(inputs.value)) && !errors.value;
    }
    return false;
  }, [mode, inputs, errors]);

  // Perform calculation
  const calculate = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: 'Please provide valid inputs for the selected mode',
      }));
      return;
    }

    const calcResult = calculateTrig(mode, inputs);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setMode('side');
    setInputs({ sideA: '', sideB: '', angle: '', value: '' });
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Trigonometry Solver
        </h1>

        {/* Mode Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['side', 'angle', 'conversion'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-lg transition-colors ${mode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {m === 'side' ? 'Find Side' : m === 'angle' ? 'Find Angle' : 'Deg ↔ Rad'}
            </button>
          ))}
        </div>

        {/* Input Section */}
        <div className="space-y-4 mb-6">
          {mode === 'side' && (
            <>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Side A (adj):</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.sideA}
                    onChange={handleInputChange('sideA')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3"
                    aria-label="Adjacent side"
                  />
                  {errors.sideA && <p className="text-red-600 text-sm mt-1">{errors.sideA}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Side B (hyp):</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.sideB}
                    onChange={handleInputChange('sideB')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5 (optional)"
                    aria-label="Hypotenuse (optional)"
                  />
                  {errors.sideB && <p className="text-red-600 text-sm mt-1">{errors.sideB}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Angle (°):</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.angle}
                    onChange={handleInputChange('angle')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 30"
                    aria-label="Angle in degrees"
                  />
                  {errors.angle && <p className="text-red-600 text-sm mt-1">{errors.angle}</p>}
                </div>
              </div>
            </>
          )}
          {mode === 'angle' && (
            <>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Side A:</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.sideA}
                    onChange={handleInputChange('sideA')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3"
                    aria-label="Side A"
                  />
                  {errors.sideA && <p className="text-red-600 text-sm mt-1">{errors.sideA}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-32 text-gray-700">Side B:</label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={inputs.sideB}
                    onChange={handleInputChange('sideB')}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5"
                    aria-label="Side B"
                  />
                  {errors.sideB && <p className="text-red-600 text-sm mt-1">{errors.sideB}</p>}
                </div>
              </div>
            </>
          )}
          {mode === 'conversion' && (
            <div className="flex items-center gap-2">
              <label className="w-32 text-gray-700">Value:</label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  value={inputs.value}
                  onChange={handleInputChange('value')}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 45"
                  aria-label="Value to convert"
                />
                {errors.value && <p className="text-red-600 text-sm mt-1">{errors.value}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={calculate}
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Result:</h2>
            <p className="text-center text-xl">
              {mode === 'conversion'
                ? `${result.result.degrees}° or ${result.result.radians} radians`
                : `${result.label}: ${result.result}`}
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

export default TrigonometrySolver;