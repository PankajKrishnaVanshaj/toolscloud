"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync } from "react-icons/fa";

const BlackHoleEventHorizonCalculator = () => {
  const [mass, setMass] = useState("");
  const [unit, setUnit] = useState("kg");
  const [rotation, setRotation] = useState(0); // Angular momentum parameter (0-1)
  const [charge, setCharge] = useState(0); // Charge in coulombs (for Reissner-Nordström)
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [displayUnits, setDisplayUnits] = useState("km"); // For result display

  // Physical constants
  const G = 6.67430e-11; // m³ kg⁻¹ s⁻²
  const c = 299792458; // m/s
  const k = 8.9875517923e9; // Coulomb constant (N·m²/C²)
  const solarMass = 1.989e30; // kg
  const earthMass = 5.972e24; // kg
  const jupiterMass = 1.898e27; // kg

  // Preset examples
  const presets = [
    { name: "Sun", mass: 1, unit: "solar", rotation: 0, charge: 0 },
    { name: "Earth", mass: 1, unit: "earth", rotation: 0, charge: 0 },
    { name: "Sagittarius A*", mass: 4.1e6, unit: "solar", rotation: 0.9, charge: 0 },
    { name: "Charged BH", mass: 1e6, unit: "solar", rotation: 0, charge: 1e18 },
  ];

  const calculateBlackHoleProperties = useCallback(() => {
    setError("");
    setResult(null);

    if (!mass || isNaN(mass) || mass <= 0) {
      setError("Please enter a valid positive mass");
      return;
    }
    if (rotation < 0 || rotation > 1) {
      setError("Rotation parameter must be between 0 and 1");
      return;
    }
    if (isNaN(charge)) {
      setError("Charge must be a valid number");
      return;
    }

    try {
      let massInKg = parseFloat(mass);
      switch (unit) {
        case "solar": massInKg *= solarMass; break;
        case "earth": massInKg *= earthMass; break;
        case "jupiter": massInKg *= jupiterMass; break;
        default: break; // kg
      }

      // Schwarzschild radius (non-rotating, uncharged)
      const schwarzschildRadius = (2 * G * massInKg) / (c * c);

      // Kerr parameters (rotating black hole)
      const a = rotation * schwarzschildRadius / 2; // Spin parameter
      const kerrEventHorizon =
        (schwarzschildRadius +
          Math.sqrt(schwarzschildRadius * schwarzschildRadius - 4 * a * a)) /
        2;

      // Reissner-Nordström (charged, non-rotating)
      const Q = charge * charge * G * k / (c * c * c * c); // Charge term
      const rnInnerHorizon =
        (schwarzschildRadius -
          Math.sqrt(schwarzschildRadius * schwarzschildRadius - 4 * Q)) /
        2;
      const rnOuterHorizon =
        (schwarzschildRadius +
          Math.sqrt(schwarzschildRadius * schwarzschildRadius - 4 * Q)) /
        2;

      // General case (Kerr-Newman: charged and rotating) simplified
      const eventHorizon =
        rotation === 0 && charge === 0
          ? schwarzschildRadius
          : rotation > 0 && charge === 0
          ? kerrEventHorizon
          : charge !== 0 && rotation === 0
          ? rnOuterHorizon
          : (schwarzschildRadius +
              Math.sqrt(
                schwarzschildRadius * schwarzschildRadius - 4 * (a * a + Q)
              )) /
            2;

      const innerHorizon =
        charge !== 0 || rotation > 0
          ? (schwarzschildRadius -
              Math.sqrt(
                schwarzschildRadius * schwarzschildRadius - 4 * (a * a + Q)
              )) /
            2
          : null;

      // Surface gravity (simplified for Schwarzschild)
      const surfaceGravity = (c * c * c * c) / (4 * G * massInKg);

      // Hawking temperature (simplified)
      const hbar = 1.0545718e-34; // J·s
      const kB = 1.380649e-23; // J/K
      const hawkingTemp = (hbar * c * c * c) / (8 * Math.PI * G * massInKg * kB);

      setResult({
        schwarzschildRadius,
        eventHorizon,
        innerHorizon,
        surfaceGravity,
        hawkingTemp,
        massInKg,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [mass, unit, rotation, charge]);

  const formatNumber = (num, digits = 2) => {
    const factor = displayUnits === "km" ? 1000 : 1;
    return (num / factor).toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const getComparison = (radius) => {
    if (radius < 0.01) return "Smaller than a grape";
    if (radius < 1) return "About the size of a basketball";
    if (radius < 6371e3) return "Smaller than Earth";
    if (radius < 696000e3) return "Smaller than the Sun";
    return "Larger than the Sun";
  };

  const reset = () => {
    setMass("");
    setUnit("kg");
    setRotation(0);
    setCharge(0);
    setResult(null);
    setError("");
    setDisplayUnits("km");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Advanced Black Hole Calculator
        </h1>

        <div className="space-y-6">
          {/* Mass Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mass</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="Enter mass"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">Kilograms</option>
                <option value="solar">Solar Masses</option>
                <option value="earth">Earth Masses</option>
                <option value="jupiter">Jupiter Masses</option>
              </select>
            </div>
          </div>

          {/* Rotation Parameter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rotation Parameter (0-1)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              {rotation} (0 = Non-rotating, 1 = Maximally rotating)
            </p>
          </div>

          {/* Charge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charge (Coulombs)
            </label>
            <input
              type="number"
              value={charge}
              onChange={(e) => setCharge(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Electric charge (e.g., 1e18 for significant effect)
            </p>
          </div>

          {/* Display Units */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Units
            </label>
            <select
              value={displayUnits}
              onChange={(e) => setDisplayUnits(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="km">Kilometers</option>
              <option value="m">Meters</option>
            </select>
          </div>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setMass(preset.mass);
                    setUnit(preset.unit);
                    setRotation(preset.rotation);
                    setCharge(preset.charge);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateBlackHoleProperties}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
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
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Black Hole Properties
              </h2>
              <p>
                Event Horizon: {formatNumber(result.eventHorizon)}{" "}
                {displayUnits}
              </p>
              {result.innerHorizon && (
                <p>
                  Inner Horizon: {formatNumber(result.innerHorizon)}{" "}
                  {displayUnits}
                </p>
              )}
              {(rotation > 0 || charge !== 0) && (
                <p>
                  Schwarzschild Radius: {formatNumber(result.schwarzschildRadius)}{" "}
                  {displayUnits}
                </p>
              )}
              <p>Surface Gravity: {formatNumber(result.surfaceGravity)} m/s²</p>
              <p>
                Hawking Temperature: {formatNumber(result.hawkingTemp, 6)} K
              </p>
              <p>Mass: {formatNumber(result.massInKg)} kg</p>
              <p className="text-sm text-gray-600">
                Size Comparison: {getComparison(result.eventHorizon)}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                About This Calculator
              </summary>
              <div className="mt-2 text-sm text-blue-600 space-y-2">
                <p>
                  Calculates properties for Schwarzschild (non-rotating), Kerr
                  (rotating), Reissner-Nordström (charged), and Kerr-Newman
                  (rotating + charged) black holes.
                </p>
                <p>Key equations:</p>
                <ul className="list-disc list-inside">
                  <li>Rₛ = 2GM/c² (Schwarzschild radius)</li>
                  <li>
                    R₊ = (Rₛ + √(Rₛ² - 4(a² + Q²)))/2 (Outer horizon, general)
                  </li>
                  <li>κ = c⁴/(4GM) (Surface gravity, simplified)</li>
                  <li>T = ħc³/(8πGMk_B) (Hawking temperature)</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackHoleEventHorizonCalculator;