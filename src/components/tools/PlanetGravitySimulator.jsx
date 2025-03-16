"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaRocket, FaInfoCircle } from "react-icons/fa";

const PlanetGravitySimulator = () => {
  const [massPlanet, setMassPlanet] = useState("");
  const [radiusPlanet, setRadiusPlanet] = useState("");
  const [massObject, setMassObject] = useState(1);
  const [height, setHeight] = useState(10);
  const [usePreset, setUsePreset] = useState(true);
  const [preset, setPreset] = useState("earth");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [units, setUnits] = useState("metric"); // metric or imperial
  const [showDetails, setShowDetails] = useState(false);

  // Gravitational constant
  const G = 6.67430e-11; // m³ kg⁻¹ s⁻²

  // Preset planetary data
  const presets = {
    earth: { mass: 5.972e24, radius: 6.371e6, name: "Earth" },
    moon: { mass: 7.342e22, radius: 1.738e6, name: "Moon" },
    mars: { mass: 6.417e23, radius: 3.39e6, name: "Mars" },
    jupiter: { mass: 1.898e27, radius: 6.991e7, name: "Jupiter" },
    venus: { mass: 4.867e24, radius: 6.051e6, name: "Venus" },
    mercury: { mass: 3.301e23, radius: 2.439e6, name: "Mercury" },
  };

  // Unit conversions
  const convertToImperial = (value, type) => {
    if (type === "mass") return value * 2.20462; // kg to lb
    if (type === "length") return value * 3.28084; // m to ft
    if (type === "acceleration") return value * 3.28084; // m/s² to ft/s²
    if (type === "force") return value * 0.224809; // N to lbf
    return value;
  };

  const calculateGravity = useCallback(() => {
    setError("");
    setResult(null);

    let mPlanet, rPlanet;
    if (usePreset) {
      mPlanet = presets[preset].mass;
      rPlanet = presets[preset].radius;
    } else {
      mPlanet = parseFloat(massPlanet);
      rPlanet = parseFloat(radiusPlanet);
    }

    const mObject = parseFloat(massObject);
    const h = parseFloat(height);

    if (isNaN(mPlanet) || isNaN(rPlanet) || isNaN(mObject) || isNaN(h)) {
      setError("Please enter valid numeric values");
      return;
    }

    if (mPlanet <= 0 || rPlanet <= 0 || mObject <= 0 || h < 0) {
      setError("Values must be positive (height can be zero)");
      return;
    }

    try {
      // Gravitational acceleration: g = GM/r²
      let g = (G * mPlanet) / (rPlanet * rPlanet);
      let force = (G * mPlanet * mObject) / (rPlanet * rPlanet);
      let fallTime = Math.sqrt(2 * h / g);
      let finalVelocity = Math.sqrt(2 * g * h);

      // Convert to imperial units if selected
      const unitLabels = units === "metric" ? 
        { mass: "kg", length: "m", acceleration: "m/s²", force: "N" } :
        { mass: "lb", length: "ft", acceleration: "ft/s²", force: "lbf" };

      if (units === "imperial") {
        g = convertToImperial(g, "acceleration");
        force = convertToImperial(force, "force");
        fallTime = fallTime; // Time remains in seconds
        finalVelocity = convertToImperial(finalVelocity, "length");
      }

      setResult({
        g,
        force,
        fallTime,
        finalVelocity,
        planetName: usePreset ? presets[preset].name : "Custom Body",
        massPlanet: units === "metric" ? mPlanet : convertToImperial(mPlanet, "mass"),
        radiusPlanet: units === "metric" ? rPlanet : convertToImperial(rPlanet, "length"),
        unitLabels,
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [massPlanet, radiusPlanet, massObject, height, usePreset, preset, units]);

  const formatNumber = (num, digits = 2) => {
    if (num < 1e-6 || num > 1e6) {
      return num.toExponential(digits);
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const reset = () => {
    setMassPlanet("");
    setRadiusPlanet("");
    setMassObject(1);
    setHeight(10);
    setUsePreset(true);
    setPreset("earth");
    setResult(null);
    setError("");
    setUnits("metric");
    setShowDetails(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
          <FaRocket /> Planet Gravity Simulator
        </h1>

        <div className="space-y-6">
          {/* Units Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Units
            </label>
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="metric">Metric (kg, m)</option>
              <option value="imperial">Imperial (lb, ft)</option>
            </select>
          </div>

          {/* Preset or Custom Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planet Selection
            </label>
            <select
              value={usePreset ? "preset" : "custom"}
              onChange={(e) => setUsePreset(e.target.value === "preset")}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="preset">Use Preset Planet</option>
              <option value="custom">Custom Planet</option>
            </select>
          </div>

          {/* Preset Planet */}
          {usePreset && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Planet
              </label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(presets).map(([key, { name }]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Planet Inputs */}
          {!usePreset && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planet Mass ({units === "metric" ? "kg" : "lb"})
                </label>
                <input
                  type="number"
                  value={massPlanet}
                  onChange={(e) => setMassPlanet(e.target.value)}
                  placeholder="e.g., 5.972e24"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planet Radius ({units === "metric" ? "m" : "ft"})
                </label>
                <input
                  type="number"
                  value={radiusPlanet}
                  onChange={(e) => setRadiusPlanet(e.target.value)}
                  placeholder="e.g., 6.371e6"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Object Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Object Mass ({units === "metric" ? "kg" : "lb"})
              </label>
              <input
                type="number"
                value={massObject}
                onChange={(e) => setMassObject(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drop Height ({units === "metric" ? "m" : "ft"})
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateGravity}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaRocket className="mr-2" /> Calculate
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
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">
                Gravity Results ({result.planetName}):
              </h2>
              <ul className="space-y-1 text-gray-700">
                <li>
                  Gravitational Acceleration: {formatNumber(result.g)}{" "}
                  {result.unitLabels.acceleration}
                </li>
                <li>
                  Gravitational Force: {formatNumber(result.force)}{" "}
                  {result.unitLabels.force}
                </li>
                <li>
                  Fall Time from {formatNumber(height)} {result.unitLabels.length}:{" "}
                  {formatNumber(result.fallTime)} s
                </li>
                <li>
                  Final Velocity: {formatNumber(result.finalVelocity)}{" "}
                  {result.unitLabels.length}/s
                </li>
                <li className="text-sm text-gray-600 mt-2">
                  Planet Mass: {formatNumber(result.massPlanet)} {result.unitLabels.mass} |{" "}
                  Radius: {formatNumber(result.radiusPlanet)} {result.unitLabels.length}
                </li>
              </ul>
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
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-blue-700 font-semibold mb-2 focus:outline-none"
            >
              <FaInfoCircle className="mr-2" /> {showDetails ? "Hide" : "Show"} Details
            </button>
            {showDetails && (
              <div className="text-sm text-blue-600 space-y-2">
                <p>Simulates gravity on planetary bodies using:</p>
                <ul className="list-disc list-inside">
                  <li>g = GM/r² (acceleration)</li>
                  <li>F = GMm/r² (force)</li>
                  <li>t = √(2h/g) (fall time)</li>
                  <li>v = √(2gh) (final velocity)</li>
                </ul>
                <p>G = 6.67430 × 10⁻¹¹ m³ kg⁻¹ s⁻²</p>
                <p>
                  Supports metric (kg, m) and imperial (lb, ft) units. Results adjust based on
                  selected unit system.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetGravitySimulator;