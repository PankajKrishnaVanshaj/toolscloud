"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const AngularVelocityConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("rad_s");
  const [radius, setRadius] = useState("");
  const [radiusUnit, setRadiusUnit] = useState("m");
  const [precision, setPrecision] = useState(4);
  const [showFormulas, setShowFormulas] = useState(false);

  // Conversion factors to radians per second (rad/s)
  const conversionFactors = {
    rad_s: 1, // Radians per second
    deg_s: Math.PI / 180, // Degrees per second
    rpm: (2 * Math.PI) / 60, // Revolutions per minute
    rps: 2 * Math.PI, // Revolutions per second
    rad_min: 1 / 60, // Radians per minute
    deg_min: Math.PI / (180 * 60), // Degrees per minute
    rad_h: 1 / 3600, // Radians per hour
    deg_h: Math.PI / (180 * 3600), // Degrees per hour
  };

  const unitDisplayNames = {
    rad_s: "rad/s",
    deg_s: "deg/s",
    rpm: "rpm",
    rps: "rps",
    rad_min: "rad/min",
    deg_min: "deg/min",
    rad_h: "rad/h",
    deg_h: "deg/h",
  };

  // Radius conversion factors to meters (m)
  const radiusConversion = {
    m: 1,
    cm: 1e-2,
    mm: 1e-3,
    km: 1e3,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
  };

  const radiusDisplayNames = {
    m: "m",
    cm: "cm",
    mm: "mm",
    km: "km",
    in: "in",
    ft: "ft",
    yd: "yd",
  };

  // Linear velocity units
  const linearVelocityUnits = {
    m_s: 1, // Meters per second
    km_h: 3.6, // Kilometers per hour
    mph: 2.23694, // Miles per hour
    ft_s: 3.28084, // Feet per second
  };

  const linearVelocityDisplayNames = {
    m_s: "m/s",
    km_h: "km/h",
    mph: "mph",
    ft_s: "ft/s",
  };

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInRadS = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInRadS / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  const calculateLinearVelocity = useCallback(() => {
    if (!value || !radius || isNaN(value) || isNaN(radius)) return null;

    const angularVelocityInRadS = value * conversionFactors[unit];
    const radiusInMeters = radius * radiusConversion[radiusUnit];
    const linearVelocity = angularVelocityInRadS * radiusInMeters; // m/s

    return Object.keys(linearVelocityUnits).reduce((acc, unit) => {
      acc[unit] = linearVelocity * linearVelocityUnits[unit];
      return acc;
    }, {});
  }, [value, unit, radius, radiusUnit]);

  const reset = () => {
    setValue("");
    setUnit("rad_s");
    setRadius("");
    setRadiusUnit("m");
    setPrecision(4);
    setShowFormulas(false);
  };

  const downloadResults = () => {
    const results = convertValue(value, unit);
    const linearResults = calculateLinearVelocity();
    const text = [
      "Angular Velocity Conversions:",
      ...Object.entries(results).map(
        ([u, v]) => `${unitDisplayNames[u]}: ${v.toFixed(precision)}`
      ),
      "",
      "Linear Velocity:",
      ...(linearResults
        ? Object.entries(linearResults).map(
            ([u, v]) => `${linearVelocityDisplayNames[u]}: ${v.toFixed(precision)}`
          )
        : ["Not calculated (requires radius)"]),
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `velocity-conversion-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const linearVelocity = calculateLinearVelocity();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Angular Velocity Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angular Velocity
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(conversionFactors).map((u) => (
                  <option key={u} value={u}>
                    {unitDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (for Linear Velocity)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                placeholder="Enter radius"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={radiusUnit}
                onChange={(e) => setRadiusUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(radiusConversion).map((u) => (
                  <option key={u} value={u}>
                    {radiusDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimal places)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showFormulas}
                  onChange={(e) => setShowFormulas(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Formulas</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResults}
              disabled={!value}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Angular Velocity:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val.toFixed(precision)}
                    </p>
                  ))}
                </div>
              </div>

              {linearVelocity && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Linear Velocity:</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(linearVelocity).map(([unit, val]) => (
                      <p key={unit}>
                        {linearVelocityDisplayNames[unit]}: {val.toFixed(precision)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between multiple angular velocity units</li>
            <li>Calculate linear velocity with radius input</li>
            <li>Adjustable precision for results</li>
            <li>Download results as a text file</li>
          </ul>
        </div>

        {showFormulas && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Formulas</h3>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
              <li>ω (rad/s) = Value × Conversion Factor</li>
              <li>v (m/s) = ω (rad/s) × r (m)</li>
              <li>1 rad/s = (180/π) deg/s ≈ 57.2958 deg/s</li>
              <li>1 rpm = (2π/60) rad/s ≈ 0.10472 rad/s</li>
              <li>1 rps = 2π rad/s ≈ 6.2832 rad/s</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AngularVelocityConverter;