"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync, FaInfoCircle } from "react-icons/fa";

const AccelerationCalculator = () => {
  const [mode, setMode] = useState("velocity");
  const [inputs, setInputs] = useState({
    initialVelocity: "",
    finalVelocity: "",
    time: "",
    force: "",
    mass: "",
    distance: "",
  });
  const [unit, setUnit] = useState("m/s²");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Conversion factors
  const g = 9.80665; // Standard gravity (m/s²)
  const mToFt = 3.28084; // Meters to feet

  const calculateAcceleration = useCallback(() => {
    setError("");
    setResult(null);

    const values = Object.fromEntries(
      Object.entries(inputs).map(([key, value]) => [key, parseFloat(value) || 0])
    );

    let acceleration;

    try {
      switch (mode) {
        case "velocity":
          if (!values.time || values.time <= 0) throw new Error("Time must be positive");
          acceleration = (values.finalVelocity - values.initialVelocity) / values.time;
          break;
        case "force":
          if (!values.mass || values.mass <= 0) throw new Error("Mass must be positive");
          acceleration = values.force / values.mass;
          break;
        case "distance":
          if (!values.time || values.time <= 0) throw new Error("Time must be positive");
          acceleration = (2 * values.distance) / (values.time * values.time);
          break;
        default:
          throw new Error("Invalid mode");
      }

      let convertedAcceleration;
      switch (unit) {
        case "m/s²":
          convertedAcceleration = acceleration;
          break;
        case "ft/s²":
          convertedAcceleration = acceleration * mToFt;
          break;
        case "g":
          convertedAcceleration = acceleration / g;
          break;
        default:
          throw new Error("Invalid unit");
      }

      const newResult = {
        acceleration,
        convertedAcceleration,
        unit,
        method: mode,
        inputs: { ...values },
      };
      setResult(newResult);
      setHistory((prev) => [...prev, newResult].slice(-5)); // Keep last 5 calculations
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [inputs, mode, unit]);

  const handleInputChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const resetInputs = () => {
    setInputs({
      initialVelocity: "",
      finalVelocity: "",
      time: "",
      force: "",
      mass: "",
      distance: "",
    });
    setResult(null);
    setError("");
  };

  const formatNumber = (num, digits = 2) =>
    num.toLocaleString("en-US", { maximumFractionDigits: digits });

  const applyPreset = (preset) => {
    setMode(preset.mode);
    setInputs(preset.inputs);
    setUnit(preset.unit || "m/s²");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800 flex items-center justify-center gap-2">
          <FaCalculator /> Acceleration Calculator
        </h1>

        <div className="space-y-6">
          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculation Mode
            </label>
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                resetInputs();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="velocity">Δv / t (Velocity Change)</option>
              <option value="force">F / m (Force and Mass)</option>
              <option value="distance">s / t² (Distance and Time)</option>
            </select>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {mode === "velocity" && (
              <>
                {["initialVelocity", "finalVelocity", "time"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field.replace(/([A-Z])/g, " $1")} (
                      {field === "time" ? "s" : "m/s"})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={inputs[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </>
            )}
            {mode === "force" && (
              <>
                {["force", "mass"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field} ({field === "force" ? "N" : "kg"})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={inputs[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </>
            )}
            {mode === "distance" && (
              <>
                {["distance", "time"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field} ({field === "distance" ? "m" : "s"})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={inputs[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Unit Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="m/s²">m/s²</option>
              <option value="ft/s²">ft/s²</option>
              <option value="g">g (9.80665 m/s²)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateAcceleration}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaCalculator className="mr-2" /> Calculate
            </button>
            <button
              onClick={resetInputs}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold mb-2 text-green-700">Acceleration:</h2>
              <p className="text-lg">
                {formatNumber(result.convertedAcceleration)} {unit}
              </p>
              {unit !== "m/s²" && (
                <p className="text-sm text-gray-600">
                  ({formatNumber(result.acceleration)} m/s²)
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Method: {result.method === "velocity" ? "Δv/t" : result.method === "force" ? "F/m" : "2s/t²"}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presets</label>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: "Car (0-10 m/s in 2s)",
                  mode: "velocity",
                  inputs: { initialVelocity: "0", finalVelocity: "10", time: "2", force: "", mass: "", distance: "" },
                },
                {
                  label: "Push (100N, 2kg)",
                  mode: "force",
                  inputs: { initialVelocity: "", finalVelocity: "", time: "", force: "100", mass: "2", distance: "" },
                },
                {
                  label: "Fall (9.8m in 1s)",
                  mode: "distance",
                  inputs: { initialVelocity: "", finalVelocity: "", time: "1", force: "", mass: "", distance: "9.8" },
                },
              ].map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Calculation History</h3>
              <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                {history.slice().reverse().map((item, index) => (
                  <li key={index}>
                    {formatNumber(item.convertedAcceleration)} {item.unit} (
                    {item.method}:{" "}
                    {Object.entries(item.inputs)
                      .filter(([_, v]) => v !== 0)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ")})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
              <FaInfoCircle /> About
            </h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>Calculates acceleration using:</p>
              <ul className="list-disc list-inside">
                <li>Δv/t: a = (v_f - v_i) / t</li>
                <li>F/m: a = F / m (Newton's 2nd Law)</li>
                <li>2s/t²: a = 2s / t² (v_i = 0)</li>
              </ul>
              <p>Supports units: m/s², ft/s², g (9.80665 m/s²).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccelerationCalculator;