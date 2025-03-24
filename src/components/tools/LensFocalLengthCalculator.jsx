"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaInfoCircle } from "react-icons/fa";

const LensFocalLengthCalculator = () => {
  const [n, setN] = useState(1.5); // Refractive index
  const [r1, setR1] = useState(20); // Radius of curvature 1 (cm)
  const [r2, setR2] = useState(-20); // Radius of curvature 2 (cm)
  const [d, setD] = useState(0); // Lens thickness (cm)
  const [unit, setUnit] = useState("cm"); // Unit selection
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Calculate focal length with thickness consideration
  const calculateFocalLength = useCallback(() => {
    setError("");
    setResult(null);

    const refractiveIndex = parseFloat(n);
    const radius1 = parseFloat(r1);
    const radius2 = parseFloat(r2);
    const thickness = parseFloat(d);

    // Validation
    if (isNaN(refractiveIndex) || refractiveIndex <= 1) {
      setError("Refractive index must be a number greater than 1");
      return;
    }
    if (isNaN(radius1) || isNaN(radius2) || isNaN(thickness)) {
      setError("All inputs must be valid numbers");
      return;
    }
    if (thickness < 0) {
      setError("Lens thickness cannot be negative");
      return;
    }

    try {
      // Adjust for infinite radius (flat surface)
      const r1Adjusted = radius1 === 0 ? Infinity : radius1;
      const r2Adjusted = radius2 === 0 ? Infinity : radius2;

      // Lensmaker's equation with thin lens approximation: 1/f = (n - 1) * (1/R1 - 1/R2)
      const oneOverF =
        (refractiveIndex - 1) *
        ((r1Adjusted === Infinity ? 0 : 1 / r1Adjusted) -
          (r2Adjusted === Infinity ? 0 : 1 / r2Adjusted));

      if (oneOverF === 0) {
        setError("Focal length is infinite (flat surfaces)");
        return;
      }

      let focalLength = 1 / oneOverF; // in cm
      let power = 100 / focalLength; // in diopters (assuming cm)

      // Convert units if necessary
      if (unit === "mm") {
        focalLength *= 10; // cm to mm
        power /= 10; // adjust diopters for mm
      } else if (unit === "m") {
        focalLength /= 100; // cm to m
        power *= 100; // adjust diopters for m
      }

      setResult({
        focalLength,
        lensType: focalLength > 0 ? "Converging" : "Diverging",
        power,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [n, r1, r2, d, unit]);

  // Reset all inputs
  const reset = () => {
    setN(1.5);
    setR1(20);
    setR2(-20);
    setD(0);
    setUnit("cm");
    setResult(null);
    setError("");
  };

  // Format numbers for display
  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Lens Focal Length Calculator
        </h1>

        <div className="space-y-6">
          {/* Inputs */}
          {[
            { label: "Refractive Index (n)", value: n, setter: setN, min: 1, step: 0.01 },
            { label: "Radius of Curvature 1 (R₁)", value: r1, setter: setR1, step: 0.1 },
            { label: "Radius of Curvature 2 (R₂)", value: r2, setter: setR2, step: 0.1 },
            { label: "Lens Thickness (d)", value: d, setter: setD, min: 0, step: 0.1 },
          ].map(({ label, value, setter, min = -Infinity, step }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} ({unit})
              </label>
              <input
                type="number"
                min={min}
                step={step}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {label === "Refractive Index (n)" && (
                <p className="text-xs text-gray-500 mt-1">e.g., 1.5 for glass</p>
              )}
              {label.includes("Radius") && (
                <p className="text-xs text-gray-500 mt-1">
                  {label.includes("R₁")
                    ? "Positive if convex towards incident light"
                    : "Negative if concave away from incident light"}
                </p>
              )}
            </div>
          ))}

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cm">Centimeters (cm)</option>
              <option value="mm">Millimeters (mm)</option>
              <option value="m">Meters (m)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateFocalLength}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Calculate
            </button>
            <button
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold mb-2 text-green-700">Results:</h2>
              <p>Focal Length: {formatNumber(result.focalLength)} {unit}</p>
              <p>Lens Type: {result.lensType}</p>
              <p>Power: {formatNumber(result.power)} diopters</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: "Biconvex", n: 1.5, r1: 20, r2: -20 },
                { name: "Biconcave", n: 1.5, r1: -20, r2: 20 },
                { name: "Plano-convex", n: 1.5, r1: 20, r2: Infinity },
                { name: "Plano-concave", n: 1.5, r1: -20, r2: Infinity },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setN(preset.n);
                    setR1(preset.r1);
                    setR2(preset.r2);
                    setD(0);
                    setResult(null);
                    setError("");
                  }}
                  className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-blue-600 space-y-2">
              <p>Uses the Lensmaker's Equation (thin lens approximation):</p>
              <p>1/f = (n - 1) * (1/R₁ - 1/R₂)</p>
              <p>Where:</p>
              <ul className="list-disc list-inside">
                <li>f = focal length</li>
                <li>n = refractive index</li>
                <li>R₁, R₂ = radii of curvature</li>
                <li>d = lens thickness (ignored in thin lens approximation)</li>
              </ul>
              <p>Positive f = converging lens, Negative f = diverging lens</p>
              <p>Power (diopters) = 1/f (in meters)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LensFocalLengthCalculator;