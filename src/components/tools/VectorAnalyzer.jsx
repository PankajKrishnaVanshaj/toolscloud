'use client';
import React, { useState, useCallback, useMemo } from 'react';

const VectorAnalyzer = () => {
  const [dimension, setDimension] = useState(2); // 2 for 2D, 3 for 3D
  const [vector, setVector] = useState(['', '', '']); // [x, y, z], z ignored for 2D
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSteps, setShowSteps] = useState(false);

  // Analyze vector properties
  const analyzeVector = useCallback((vec, dim) => {
    const steps = [`Analyzing ${dim}D vector:`];
    const components = vec.slice(0, dim).map(val => parseFloat(val) || 0);

    // Validate inputs
    if (components.some(isNaN)) {
      return { error: 'All components must be valid numbers' };
    }

    steps.push(`Vector = <${components.join(', ')}>`);

    // Magnitude (length)
    const magnitude = Math.sqrt(components.reduce((sum, val) => sum + val * val, 0));
    steps.push(`Magnitude = √(${components.map(v => `${v}^2`).join(' + ')})`);
    steps.push(`= √(${components.reduce((sum, v) => sum + v * v, 0).toFixed(4)}) = ${magnitude.toFixed(4)}`);

    // Unit vector (if magnitude > 0)
    let unitVector = null;
    if (magnitude === 0) {
      steps.push('Magnitude = 0: Unit vector is undefined.');
    } else {
      unitVector = components.map(v => (v / magnitude).toFixed(4));
      steps.push(`Unit Vector = <${components.map(v => `${v} / ${magnitude.toFixed(4)}`).join(', ')}>`);
      steps.push(`= <${unitVector.join(', ')}>`);
    }

    // Direction angles (for 3D only)
    let directionAngles = null;
    if (dim === 3 && magnitude !== 0) {
      directionAngles = components.map((v, i) => {
        const cosTheta = v / magnitude;
        const thetaRad = Math.acos(cosTheta);
        const thetaDeg = (thetaRad * 180 / Math.PI).toFixed(2);
        steps.push(`cos(θ_${['x', 'y', 'z'][i]}) = ${v} / ${magnitude.toFixed(4)} = ${cosTheta.toFixed(4)}`);
        steps.push(`θ_${['x', 'y', 'z'][i]} = arccos(${cosTheta.toFixed(4)}) = ${thetaDeg}°`);
        return thetaDeg;
      });
    }

    return { magnitude: magnitude.toFixed(4), unitVector, directionAngles, steps };
  }, []);

  // Handle vector input changes
  const handleVectorChange = (index) => (e) => {
    const value = e.target.value;
    setVector((prev) => {
      const newVector = [...prev];
      newVector[index] = value;
      return newVector;
    });
    setResult(null); // Reset result on change

    if (value && isNaN(parseFloat(value))) {
      setErrors((prev) => ({ ...prev, [index]: 'Must be a number' }));
    } else {
      setErrors((prev) => ({ ...prev, [index]: '' }));
    }
  };

  // Check if inputs are valid
  const isValid = useMemo(() => {
    const activeComponents = dimension;
    return (
      vector.slice(0, activeComponents).every(val => val && !isNaN(parseFloat(val))) &&
      Object.values(errors).every(err => !err)
    );
  }, [vector, dimension, errors]);

  // Perform analysis
  const analyze = () => {
    setErrors({});
    setResult(null);

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        general: `Please fill all ${dimension} components with valid numbers`,
      }));
      return;
    }

    const calcResult = analyzeVector(vector, dimension);
    if (calcResult.error) {
      setErrors({ general: calcResult.error });
    } else {
      setResult(calcResult);
    }
  };

  // Reset state
  const reset = () => {
    setDimension(2);
    setVector(['', '', '']);
    setErrors({});
    setResult(null);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Vector Analyzer
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

        {/* Vector Input */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="w-24 text-gray-700">Vector:</label>
            <div className="flex gap-2 flex-1">
              {['x', 'y', ...(dimension === 3 ? ['z'] : [])].map((comp, i) => (
                <div key={comp} className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    value={vector[i]}
                    onChange={handleVectorChange(i)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    placeholder={comp}
                    aria-label={`${comp}-component`}
                  />
                  {errors[i] && <p className="text-red-600 text-xs mt-1">{errors[i]}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={analyze}
            disabled={!isValid}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-all font-semibold"
          >
            Analyze
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
            <h2 className="text-lg font-semibold text-gray-700 text-center">Analysis:</h2>
            <div className="text-center text-xl space-y-2">
              <p>Magnitude: {result.magnitude}</p>
              <p>Unit Vector: {result.unitVector ? `<${result.unitVector.join(', ')}>` : 'Undefined (zero vector)'}</p>
              {dimension === 3 && result.directionAngles && (
                <div>
                  <p>Direction Angles:</p>
                  <p>θ_x = {result.directionAngles[0]}°</p>
                  <p>θ_y = {result.directionAngles[1]}°</p>
                  <p>θ_z = {result.directionAngles[2]}°</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
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

export default VectorAnalyzer;