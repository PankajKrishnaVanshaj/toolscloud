"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator, FaInfoCircle } from "react-icons/fa";

const GravitationalForceCalculator = () => {
  const [mass1, setMass1] = useState("");
  const [mass2, setMass2] = useState("");
  const [distance, setDistance] = useState("");
  const [massUnit1, setMassUnit1] = useState("kg");
  const [massUnit2, setMassUnit2] = useState("kg");
  const [distanceUnit, setDistanceUnit] = useState("m");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState(4); // Decimal precision for results

  // Gravitational constant
  const G = 6.67430e-11; // m³ kg⁻¹ s⁻²

  // Unit conversion factors
  const massUnits = {
    kg: 1,
    g: 1e-3,
    tonnes: 1e3,
    "solar masses": 1.989e30, // Mass of the Sun
  };

  const distanceUnits = {
    m: 1,
    km: 1e3,
    AU: 1.496e11, // Astronomical Unit
    ly: 9.461e15, // Light-year
  };

  // Calculate gravitational force
  const calculateForce = useCallback(() => {
    setError("");
    setResult(null);

    if (!mass1 || !mass2 || !distance || isNaN(mass1) || isNaN(mass2) || isNaN(distance)) {
      setError("Please enter valid numeric values for masses and distance");
      return;
    }

    const m1 = parseFloat(mass1) * massUnits[massUnit1];
    const m2 = parseFloat(mass2) * massUnits[massUnit2];
    const r = parseFloat(distance) * distanceUnits[distanceUnit];

    if (m1 <= 0 || m2 <= 0 || r <= 0) {
      setError("Masses and distance must be positive");
      return;
    }

    try {
      const force = (G * m1 * m2) / (r * r);
      setResult({
        force, // in Newtons
        m1,
        m2,
        r,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [mass1, mass2, distance, massUnit1, massUnit2, distanceUnit]);

  // Format numbers based on precision
  const formatNumber = (num) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(precision);
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: precision });
  };

  // Reset all inputs
  const reset = () => {
    setMass1("");
    setMass2("");
    setDistance("");
    setMassUnit1("kg");
    setMassUnit2("kg");
    setDistanceUnit("m");
    setResult(null);
    setError("");
    setPrecision(4);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Gravitational Force Calculator
        </h1>

        <div className="space-y-6">
          {/* Mass 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mass 1</label>
              <input
                type="number"
                value={mass1}
                onChange={(e) => setMass1(e.target.value)}
                placeholder="Enter mass"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={massUnit1}
                onChange={(e) => setMassUnit1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(massUnits).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mass 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mass 2</label>
              <input
                type="number"
                value={mass2}
                onChange={(e) => setMass2(e.target.value)}
                placeholder="Enter mass"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={massUnit2}
                onChange={(e) => setMassUnit2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(massUnits).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Distance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance</label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(distanceUnits).map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Precision Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision ({precision} digits)
            </label>
            <input
              type="range"
              min="2"
              max="8"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateForce}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate Force
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold mb-2 text-green-700">Gravitational Force:</h2>
              <p>{formatNumber(result.force)} N (Newtons)</p>
              <p>{formatNumber(result.force * 1e3)} mN (milliNewtons)</p>
              <p>{formatNumber(result.force / 9.80665)} kgf (kilogram-force)</p>
              <p className="text-sm text-green-600 mt-2">
                m₁: {formatNumber(result.m1)} kg | m₂: {formatNumber(result.m2)} kg | r:{" "}
                {formatNumber(result.r)} m
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: "Earth-Moon",
                  m1: 5.972e24,
                  m2: 7.342e22,
                  r: 384400,
                  mu: "kg",
                  du: "km",
                },
                {
                  label: "Sun-Earth",
                  m1: 1,
                  m2: 5.972e24,
                  r: 1,
                  mu: "solar masses",
                  du: "AU",
                },
                {
                  label: "Two 1kg Objects",
                  m1: 1,
                  m2: 1,
                  r: 1,
                  mu: "kg",
                  du: "m",
                },
                {
                  label: "Earth-Jupiter",
                  m1: 5.972e24,
                  m2: 1.898e27,
                  r: 5.2,
                  mu: "kg",
                  du: "AU",
                },
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMass1(preset.m1);
                    setMass2(preset.m2);
                    setDistance(preset.r);
                    setMassUnit1(preset.mu);
                    setMassUnit2(preset.mu);
                    setDistanceUnit(preset.du);
                    setResult(null);
                    setError("");
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> About
            </h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>Calculates gravitational force using Newton&apos;s Law:</p>
              <p>F = G * (m₁ * m₂) / r²</p>
              <p>Where G = 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻²</p>
              <p>Supports multiple units and adjustable precision.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GravitationalForceCalculator;