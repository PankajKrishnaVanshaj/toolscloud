"use client";
import React, { useState, useCallback } from "react";
import { FaCalculator, FaSync } from "react-icons/fa";

const VelocityCalculator = () => {
  const [mode, setMode] = useState("distance-time");
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [initialVelocity, setInitialVelocity] = useState("");
  const [acceleration, setAcceleration] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("m");
  const [timeUnit, setTimeUnit] = useState("s");
  const [velocityUnit, setVelocityUnit] = useState("m/s");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Unit conversion factors to base units (m, s, m/s)
  const distanceUnits = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,
    mi: 1609.34,
    ft: 0.3048,
  };

  const timeUnits = {
    s: 1,
    min: 60,
    h: 3600,
    ms: 0.001,
    day: 86400,
  };

  const velocityUnits = {
    "m/s": 1,
    "km/h": 0.277778,
    mph: 0.44704,
    "cm/s": 0.01,
    "ft/s": 0.3048,
  };

  const calculateVelocity = useCallback(() => {
    setError("");
    setResult(null);

    try {
      if (mode === "distance-time") {
        if (!distance || !time || isNaN(distance) || isNaN(time)) {
          setError("Please enter valid distance and time");
          return;
        }

        const d = parseFloat(distance) * distanceUnits[distanceUnit];
        const t = parseFloat(time) * timeUnits[timeUnit];

        if (t <= 0) {
          setError("Time must be positive");
          return;
        }

        const velocity = d / t; // m/s
        const newResult = {
          velocity,
          mode: "Distance / Time",
          inputs: { distance: d, time: t, distanceUnit, timeUnit },
          timestamp: new Date().toLocaleString(),
        };
        setResult(newResult);
        setHistory((prev) => [...prev, newResult].slice(-5)); // Keep last 5
      } else {
        if (
          !initialVelocity ||
          !acceleration ||
          !time ||
          isNaN(initialVelocity) ||
          isNaN(acceleration) ||
          isNaN(time)
        ) {
          setError("Please enter valid initial velocity, acceleration, and time");
          return;
        }

        const v0 = parseFloat(initialVelocity) * velocityUnits[velocityUnit];
        const a =
          parseFloat(acceleration) * velocityUnits[velocityUnit] / timeUnits.s; // m/s²
        const t = parseFloat(time) * timeUnits[timeUnit];

        if (t < 0) {
          setError("Time must be non-negative");
          return;
        }

        const velocity = v0 + a * t; // v = v₀ + at (m/s)
        const newResult = {
          velocity,
          mode: "v₀ + at",
          inputs: {
            initialVelocity: v0,
            acceleration: a,
            time: t,
            velocityUnit,
            timeUnit,
          },
          timestamp: new Date().toLocaleString(),
        };
        setResult(newResult);
        setHistory((prev) => [...prev, newResult].slice(-5));
      }
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [
    mode,
    distance,
    time,
    initialVelocity,
    acceleration,
    distanceUnit,
    timeUnit,
    velocityUnit,
  ]);

  const formatNumber = (num, digits = 2) => {
    return num.toLocaleString("en-US", { maximumFractionDigits: digits });
  };

  const convertVelocity = (velocity, unit) => {
    return velocity / velocityUnits[unit];
  };

  const reset = () => {
    setDistance("");
    setTime("");
    setInitialVelocity("");
    setAcceleration("");
    setDistanceUnit("m");
    setTimeUnit("s");
    setVelocityUnit("m/s");
    setResult(null);
    setError("");
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Velocity Calculator
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
                reset();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance-time">Distance / Time</option>
              <option value="accel-time">
                Initial Velocity + Acceleration × Time
              </option>
            </select>
          </div>

          {/* Inputs */}
          {mode === "distance-time" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance
                  </label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(distanceUnits).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(timeUnits).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Velocity
                  </label>
                  <input
                    type="number"
                    value={initialVelocity}
                    onChange={(e) => setInitialVelocity(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(velocityUnits).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acceleration
                  </label>
                  <input
                    type="number"
                    value={acceleration}
                    onChange={(e) => setAcceleration(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 9.8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={velocityUnit}
                    onChange={(e) => setVelocityUnit(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(velocityUnits).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}/s
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="number"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(timeUnits).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={calculateVelocity}
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
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h2 className="text-lg font-semibold text-green-700 mb-2">Velocity:</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <p>{formatNumber(result.velocity)} m/s</p>
                <p>{formatNumber(convertVelocity(result.velocity, "km/h"))} km/h</p>
                <p>{formatNumber(convertVelocity(result.velocity, "mph"))} mph</p>
                <p>{formatNumber(convertVelocity(result.velocity, "ft/s"))} ft/s</p>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Calculated using: {result.mode}
              </p>
              {mode === "distance-time" ? (
                <p className="text-sm text-green-600">
                  Distance: {formatNumber(result.inputs.distance)} m | Time:{" "}
                  {formatNumber(result.inputs.time)} s
                </p>
              ) : (
                <p className="text-sm text-green-600">
                  v₀: {formatNumber(result.inputs.initialVelocity)} m/s | a:{" "}
                  {formatNumber(result.inputs.acceleration)} m/s² | t:{" "}
                  {formatNumber(result.inputs.time)} s
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700">Calculation History</h3>
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:underline"
                >
                  Clear
                </button>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                {history
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <li key={index}>
                      <span className="font-medium">
                        {formatNumber(entry.velocity)} m/s
                      </span>{" "}
                      ({entry.mode}) - {entry.timestamp}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Two calculation modes: d/t and v₀ + at</li>
              <li>Multiple unit conversions</li>
              <li>Calculation history (last 5)</li>
              <li>Detailed result display</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VelocityCalculator;