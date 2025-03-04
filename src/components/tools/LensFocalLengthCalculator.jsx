'use client'
import React, { useState } from 'react';

const LensFocalLengthCalculator = () => {
  const [n, setN] = useState(1.5); // Refractive index of lens material (e.g., glass)
  const [r1, setR1] = useState(20); // Radius of curvature 1 (cm), positive for convex towards incident light
  const [r2, setR2] = useState(-20); // Radius of curvature 2 (cm), negative for concave away from incident light
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculateFocalLength = () => {
    setError('');
    setResult(null);

    const refractiveIndex = parseFloat(n);
    const radius1 = parseFloat(r1);
    const radius2 = parseFloat(r2);

    if (isNaN(refractiveIndex) || refractiveIndex <= 1) {
      setError('Refractive index must be a number greater than 1');
      return;
    }

    if (isNaN(radius1) || isNaN(radius2)) {
      setError('Radii of curvature must be valid numbers');
      return;
    }

    try {
      // Lensmaker's equation: 1/f = (n - 1) * (1/R1 - 1/R2)
      // Note: If R is infinite (flat), use a very large number or handle as special case
      const r1Adjusted = radius1 === 0 ? Infinity : radius1;
      const r2Adjusted = radius2 === 0 ? Infinity : radius2;

      const oneOverF = (refractiveIndex - 1) * (
        (r1Adjusted === Infinity ? 0 : 1 / r1Adjusted) -
        (r2Adjusted === Infinity ? 0 : 1 / r2Adjusted)
      );

      if (oneOverF === 0) {
        setError('Focal length is infinite (flat surfaces)');
        return;
      }

      const focalLength = 1 / oneOverF; // in cm

      setResult({
        focalLength,
        lensType: focalLength > 0 ? 'Converging' : 'Diverging',
      });
    } catch (err) {
      setError('Calculation error: ' + err.message);
    }
  };

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Lens Focal Length Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refractive Index (n)
            </label>
            <input
              type="number"
              min="1"
              step="0.1"
              value={n}
              onChange={(e) => setN(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">e.g., 1.5 for glass</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius of Curvature 1 (R₁, cm)
            </label>
            <input
              type="number"
              step="1"
              value={r1}
              onChange={(e) => setR1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Positive if convex towards incident light</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius of Curvature 2 (R₂, cm)
            </label>
            <input
              type="number"
              step="1"
              value={r2}
              onChange={(e) => setR2(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Negative if concave away from incident light</p>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateFocalLength}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Calculate Focal Length
          </button>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <p>Focal Length: {formatNumber(result.focalLength)} cm</p>
              <p>Lens Type: {result.lensType}</p>
              <p>Power: {formatNumber(100 / result.focalLength)} diopters</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setN(1.5);
                  setR1(20);
                  setR2(-20);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Biconvex Lens
              </button>
              <button
                onClick={() => {
                  setN(1.5);
                  setR1(-20);
                  setR2(20);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Biconcave Lens
              </button>
              <button
                onClick={() => {
                  setN(1.5);
                  setR1(20);
                  setR2(Infinity);
                }}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Plano-convex Lens
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates focal length using the Lensmaker's Equation:</p>
                <p>1/f = (n - 1) * (1/R₁ - 1/R₂)</p>
                <p>Where:</p>
                <ul className="list-disc list-inside">
                  <li>f = focal length (cm)</li>
                  <li>n = refractive index</li>
                  <li>R₁ = radius of curvature 1 (cm)</li>
                  <li>R₂ = radius of curvature 2 (cm)</li>
                </ul>
                <p>Positive f = converging lens, Negative f = diverging lens</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LensFocalLengthCalculator;