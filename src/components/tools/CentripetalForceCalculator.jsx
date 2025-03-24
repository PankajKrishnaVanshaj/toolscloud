"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const CentripetalForceCalculator = () => {
  const [mass, setMass] = useState("");
  const [velocity, setVelocity] = useState("");
  const [radius, setRadius] = useState("");
  const [unitSystem, setUnitSystem] = useState("metric"); // Metric or Imperial
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const calculateCentripetalForce = useCallback(() => {
    setError("");
    setResult(null);

    const m = parseFloat(mass);
    const v = parseFloat(velocity);
    const r = parseFloat(radius);

    if (isNaN(m) || isNaN(v) || isNaN(r) || m <= 0 || v < 0 || r <= 0) {
      setError("Please enter valid positive values for mass, velocity, and radius");
      return;
    }

    try {
      // Convert to metric if imperial
      const massKg = unitSystem === "imperial" ? m * 0.453592 : m; // lb to kg
      const velocityMs = unitSystem === "imperial" ? v * 0.3048 : v; // ft/s to m/s
      const radiusM = unitSystem === "imperial" ? r * 0.3048 : r; // ft to m

      // Calculations in metric
      const force = (massKg * velocityMs * velocityMs) / radiusM; // N
      const angularVelocity = velocityMs / radiusM; // rad/s
      const period = (2 * Math.PI * radiusM) / velocityMs; // s
      const acceleration = (velocityMs * velocityMs) / radiusM; // m/s²

      // Convert back to imperial if needed
      const resultForce = unitSystem === "imperial" ? force * 0.224809 : force; // N to lbf
      const resultAcceleration =
        unitSystem === "imperial" ? acceleration * 3.28084 : acceleration; // m/s² to ft/s²
      const resultVelocity = unitSystem === "imperial" ? velocityMs * 3.28084 : velocityMs; // m/s to ft/s
      const resultRadius = unitSystem === "imperial" ? radiusM * 3.28084 : radiusM; // m to ft

      const newResult = {
        force: resultForce,
        angularVelocity,
        period,
        acceleration: resultAcceleration,
        mass: unitSystem === "imperial" ? m : massKg,
        velocity: resultVelocity,
        radius: resultRadius,
      };

      setResult(newResult);
      setHistory((prev) => [...prev, newResult].slice(-5)); // Keep last 5 calculations
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [mass, velocity, radius, unitSystem]);

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const reset = () => {
    setMass("");
    setVelocity("");
    setRadius("");
    setResult(null);
    setError("");
  };

  const downloadResults = () => {
    if (!result) return;
    const text = `
Centripetal Force Calculator Results
-------------------------------
Unit System: ${unitSystem === "metric" ? "Metric" : "Imperial"}
Mass: ${formatNumber(result.mass)} ${unitSystem === "metric" ? "kg" : "lb"}
Velocity: ${formatNumber(result.velocity)} ${unitSystem === "metric" ? "m/s" : "ft/s"}
Radius: ${formatNumber(result.radius)} ${unitSystem === "metric" ? "m" : "ft"}
Centripetal Force: ${formatNumber(result.force)} ${unitSystem === "metric" ? "N" : "lbf"}
Centripetal Acceleration: ${formatNumber(result.acceleration)} ${
      unitSystem === "metric" ? "m/s²" : "ft/s²"
    }
Angular Velocity: ${formatNumber(result.angularVelocity)} rad/s
Period: ${formatNumber(result.period)} s
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `centripetal-force-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Centripetal Force Calculator
        </h1>

        <div className="space-y-6">
          {/* Unit System Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit System
            </label>
            <select
              value={unitSystem}
              onChange={(e) => setUnitSystem(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="metric">Metric (kg, m, s)</option>
              <option value="imperial">Imperial (lb, ft, s)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="grid gap-4">
            {[
              { label: "Mass", value: mass, setter: setMass, unit: unitSystem === "metric" ? "kg" : "lb" },
              {
                label: "Velocity",
                value: velocity,
                setter: setVelocity,
                unit: unitSystem === "metric" ? "m/s" : "ft/s",
              },
              { label: "Radius", value: radius, setter: setRadius, unit: unitSystem === "metric" ? "m" : "ft" },
            ].map(({ label, value, setter, unit }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label} ({unit})
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={`e.g., ${label === "Mass" ? "1" : label === "Velocity" ? "10" : "2"}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateCentripetalForce}
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
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Results:</h2>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>
                  Centripetal Force: {formatNumber(result.force)}{" "}
                  {unitSystem === "metric" ? "N" : "lbf"}
                </li>
                <li>
                  Centripetal Acceleration: {formatNumber(result.acceleration)}{" "}
                  {unitSystem === "metric" ? "m/s²" : "ft/s²"}
                </li>
                <li>Angular Velocity: {formatNumber(result.angularVelocity)} rad/s</li>
                <li>Period: {formatNumber(result.period)} s</li>
                <li className="text-gray-600 mt-2">
                  Inputs - Mass: {formatNumber(result.mass)} {unitSystem === "metric" ? "kg" : "lb"} |
                  Velocity: {formatNumber(result.velocity)} {unitSystem === "metric" ? "m/s" : "ft/s"} |
                  Radius: {formatNumber(result.radius)} {unitSystem === "metric" ? "m" : "ft"}
                </li>
              </ul>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Car on Curve", m: 1, v: 10, r: 2 },
                { name: "Swinging Ball", m: 0.1, v: 5, r: 0.5 },
                { name: "Planet Orbit", m: 1000, v: 100, r: 1000 },
              ].map(({ name, m, v, r }) => (
                <button
                  key={name}
                  onClick={() => {
                    setMass(m);
                    setVelocity(v);
                    setRadius(r);
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-700 mb-2">Calculation History</h3>
              <ul className="space-y-2 text-sm text-blue-600 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((item, index) => (
                  <li key={index}>
                    F: {formatNumber(item.force)} {unitSystem === "metric" ? "N" : "lbf"} | m:{" "}
                    {formatNumber(item.mass)} {unitSystem === "metric" ? "kg" : "lb"} | v:{" "}
                    {formatNumber(item.velocity)} {unitSystem === "metric" ? "m/s" : "ft/s"} | r:{" "}
                    {formatNumber(item.radius)} {unitSystem === "metric" ? "m" : "ft"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">Formulas & Info</summary>
              <div className="mt-2 space-y-2">
                <p>Calculates properties of circular motion:</p>
                <ul className="list-disc list-inside">
                  <li>F = mv²/r (Centripetal Force)</li>
                  <li>a = v²/r (Centripetal Acceleration)</li>
                  <li>ω = v/r (Angular Velocity)</li>
                  <li>T = 2πr/v (Period)</li>
                </ul>
                <p>Supports Metric (kg, m, s) and Imperial (lb, ft, s) units.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentripetalForceCalculator;