"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator, FaInfoCircle } from "react-icons/fa";

const OrbitalPeriodCalculator = () => {
  const [mass, setMass] = useState("1.989e30"); // Default: Sun's mass
  const [massUnit, setMassUnit] = useState("kg");
  const [semiMajorAxis, setSemiMajorAxis] = useState("1.496e11"); // Default: 1 AU
  const [distanceUnit, setDistanceUnit] = useState("m");
  const [eccentricity, setEccentricity] = useState("0"); // New: Orbital eccentricity
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Constants
  const G = 6.67430e-11; // Gravitational constant (m³ kg⁻¹ s⁻²)
  const solarMass = 1.989e30; // kg
  const earthMass = 5.972e24; // kg
  const auToM = 1.496e11; // meters per AU
  const kmToM = 1e3; // meters per km

  const calculateOrbitalPeriod = useCallback(() => {
    setError("");
    setResult(null);

    const m = parseFloat(mass);
    const a = parseFloat(semiMajorAxis);
    const e = parseFloat(eccentricity);

    if (isNaN(m) || m <= 0 || isNaN(a) || a <= 0 || isNaN(e) || e < 0 || e >= 1) {
      setError("Please enter valid values: Mass > 0, Distance > 0, 0 ≤ Eccentricity < 1");
      return;
    }

    try {
      // Convert to SI units
      let massKg = m;
      switch (massUnit) {
        case "solar":
          massKg *= solarMass;
          break;
        case "earth":
          massKg *= earthMass;
          break;
        default:
          break; // kg
      }

      let distanceM = a;
      switch (distanceUnit) {
        case "au":
          distanceM *= auToM;
          break;
        case "km":
          distanceM *= kmToM;
          break;
        default:
          break; // m
      }

      // Adjust for eccentricity (simplified: uses semi-major axis directly)
      const mu = G * massKg; // Standard gravitational parameter
      const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(distanceM, 3) / mu);

      // Velocity at periapsis and apoapsis (optional info)
      const periapsis = distanceM * (1 - e);
      const apoapsis = distanceM * (1 + e);
      const vPeri = Math.sqrt(mu * (2 / periapsis - 1 / distanceM));
      const vApo = Math.sqrt(mu * (2 / apoapsis - 1 / distanceM));

      setResult({
        periodSeconds,
        periodDays: periodSeconds / (24 * 3600),
        periodYears: periodSeconds / (365.25 * 24 * 3600),
        mass: massKg,
        semiMajorAxis: distanceM,
        eccentricity: e,
        periapsisVelocity: vPeri,
        apoapsisVelocity: vApo,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [mass, massUnit, semiMajorAxis, distanceUnit, eccentricity]);

  const formatNumber = (num, digits = 2) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const reset = () => {
    setMass("1.989e30");
    setMassUnit("kg");
    setSemiMajorAxis("1.496e11");
    setDistanceUnit("m");
    setEccentricity("0");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Orbital Period Calculator
        </h1>

        <div className="space-y-6">
          {/* Mass Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Central Body Mass
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1.989e30"
              />
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kg">kg</option>
                <option value="solar">Solar Masses</option>
                <option value="earth">Earth Masses</option>
              </select>
            </div>
          </div>

          {/* Semi-Major Axis Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semi-Major Axis
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={semiMajorAxis}
                onChange={(e) => setSemiMajorAxis(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1.496e11"
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="m">m</option>
                <option value="km">km</option>
                <option value="au">AU</option>
              </select>
            </div>
          </div>

          {/* Eccentricity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Eccentricity {`(0 to < 1)`}
            </label>
            <input
              type="text"
              value={eccentricity}
              onChange={(e) => setEccentricity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 0.0167"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateOrbitalPeriod}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
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
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Results:</h2>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Orbital Period:</strong> {formatNumber(result.periodSeconds)} s
                </p>
                <p>{formatNumber(result.periodDays)} days</p>
                <p>{formatNumber(result.periodYears)} years</p>
                <p>
                  <strong>Periapsis Velocity:</strong> {formatNumber(result.periapsisVelocity)} m/s
                </p>
                <p>
                  <strong>Apoapsis Velocity:</strong> {formatNumber(result.apoapsisVelocity)} m/s
                </p>
                <p className="text-gray-600">
                  Mass: {formatNumber(result.mass)} kg | Distance: {formatNumber(result.semiMajorAxis)} m | e: {result.eccentricity}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700 text-sm">
              <p>{error}</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  name: "Earth around Sun",
                  mass: "1.989e30",
                  massUnit: "kg",
                  distance: "1.496e11",
                  distanceUnit: "m",
                  ecc: "0.0167",
                },
                {
                  name: "Moon around Earth",
                  mass: "5.972e24",
                  massUnit: "kg",
                  distance: "384400",
                  distanceUnit: "km",
                  ecc: "0.0549",
                },
                {
                  name: "Mercury around Sun",
                  mass: "1.989e30",
                  massUnit: "kg",
                  distance: "5.791e10",
                  distanceUnit: "m",
                  ecc: "0.2056",
                },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setMass(preset.mass);
                    setMassUnit(preset.massUnit);
                    setSemiMajorAxis(preset.distance);
                    setDistanceUnit(preset.distanceUnit);
                    setEccentricity(preset.ecc);
                    setResult(null);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details className="text-sm text-blue-700">
              <summary className="cursor-pointer font-semibold flex items-center gap-2">
                <FaInfoCircle /> About
              </summary>
              <div className="mt-2 space-y-2 text-blue-600">
                <p>Calculates orbital period using Kepler's Third Law:</p>
                <p>T = 2π √(a³ / μ), where μ = GM</p>
                <p>Variables:</p>
                <ul className="list-disc list-inside">
                  <li>T = Orbital period</li>
                  <li>a = Semi-major axis</li>
                  <li>μ = Standard gravitational parameter</li>
                  <li>G = Gravitational constant</li>
                  <li>M = Mass of central body</li>
                  <li>e = Eccentricity (affects velocity)</li>
                </ul>
                <p>Assumes a two-body problem with circular or elliptical orbit.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrbitalPeriodCalculator;