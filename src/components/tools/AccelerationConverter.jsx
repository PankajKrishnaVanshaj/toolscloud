"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const AccelerationConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("m_s2");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("s");
  const [initialVelocity, setInitialVelocity] = useState("0");
  const [velocityUnit, setVelocityUnit] = useState("m_s");
  const [decimalPlaces, setDecimalPlaces] = useState(4);

  // Conversion factors to meters per second squared (m/s²)
  const conversionFactors = {
    m_s2: 1,           // Meters per second squared
    cm_s2: 0.01,       // Centimeters per second squared
    ft_s2: 0.3048,     // Feet per second squared
    in_s2: 0.0254,     // Inches per second squared
    km_h2: 7.716e-5,   // Kilometers per hour squared
    mi_h2: 0.0001242,  // Miles per hour squared
    g: 9.80665,        // Standard gravity
    Gal: 0.01          // Gal (cm/s²)
  };

  const unitDisplayNames = {
    m_s2: "m/s²",
    cm_s2: "cm/s²",
    ft_s2: "ft/s²",
    in_s2: "in/s²",
    km_h2: "km/h²",
    mi_h2: "mi/h²",
    g: "g",
    Gal: "Gal"
  };

  // Velocity conversion factors to meters per second (m/s)
  const velocityConversion = {
    m_s: 1,        // Meters per second
    km_h: 0.277778, // Kilometers per hour
    mi_h: 0.44704,  // Miles per hour
    ft_s: 0.3048    // Feet per second
  };

  const velocityDisplayNames = {
    m_s: "m/s",
    km_h: "km/h",
    mi_h: "mi/h",
    ft_s: "ft/s"
  };

  // Time conversion factors to seconds
  const timeConversion = {
    s: 1,
    ms: 0.001,
    min: 60,
    h: 3600
  };

  const timeDisplayNames = {
    s: "seconds (s)",
    ms: "milliseconds (ms)",
    min: "minutes (min)",
    h: "hours (h)"
  };

  // Convert acceleration
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInMs2 = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = (valueInMs2 / conversionFactors[unit]).toFixed(decimalPlaces);
      return acc;
    }, {});
  }, [decimalPlaces]);

  // Calculate kinematics (distance and final velocity)
  const calculateKinematics = useCallback(() => {
    if (!value || !time || isNaN(value) || isNaN(time) || isNaN(initialVelocity)) return null;

    const accelerationInMs2 = value * conversionFactors[unit];
    const timeInSeconds = time * timeConversion[timeUnit];
    const initialVelocityInMs = initialVelocity * velocityConversion[velocityUnit];

    // Distance = v₀t + ½at²
    const distance = initialVelocityInMs * timeInSeconds + 0.5 * accelerationInMs2 * timeInSeconds * timeInSeconds;
    // Final velocity = v₀ + at
    const finalVelocity = initialVelocityInMs + accelerationInMs2 * timeInSeconds;

    return { distance, finalVelocity };
  }, [value, unit, time, timeUnit, initialVelocity, velocityUnit]);

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit("m_s2");
    setTime("");
    setTimeUnit("s");
    setInitialVelocity("0");
    setVelocityUnit("m_s");
    setDecimalPlaces(4);
  };

  // Download results as text
  const downloadResults = () => {
    const results = convertValue(value, unit);
    const kinematics = calculateKinematics();
    let text = `Acceleration Converter Results\n\nInput: ${value} ${unitDisplayNames[unit]}\n\nConversions:\n`;
    for (const [u, v] of Object.entries(results)) {
      text += `${unitDisplayNames[u]}: ${v}\n`;
    }
    if (kinematics) {
      text += `\nKinematics (Time: ${time} ${timeDisplayNames[timeUnit]}, Initial Velocity: ${initialVelocity} ${velocityDisplayNames[velocityUnit]}):\n`;
      text += `Distance: ${kinematics.distance.toFixed(decimalPlaces)} m\n`;
      text += `Final Velocity: ${kinematics.finalVelocity.toFixed(decimalPlaces)} m/s\n`;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `acceleration-conversion-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const kinematics = calculateKinematics();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Acceleration Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acceleration
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
                  <option key={u} value={u}>{unitDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Enter time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(timeConversion).map((u) => (
                  <option key={u} value={u}>{timeDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Velocity
              </label>
              <input
                type="number"
                value={initialVelocity}
                onChange={(e) => setInitialVelocity(e.target.value)}
                placeholder="Enter velocity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={velocityUnit}
                onChange={(e) => setVelocityUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(velocityConversion).map((u) => (
                  <option key={u} value={u}>{velocityDisplayNames[u]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places ({decimalPlaces})
              </label>
              <input
                type="range"
                min="0"
                max="8"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadResults}
                disabled={!value}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Acceleration Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val}
                    </p>
                  ))}
                </div>
              </div>

              {kinematics && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Kinematics</h2>
                  <div className="text-sm">
                    <p>
                      Distance: {kinematics.distance.toFixed(decimalPlaces)} m (
                      {(kinematics.distance / 0.3048).toFixed(decimalPlaces)} ft)
                    </p>
                    <p>
                      Final Velocity: {kinematics.finalVelocity.toFixed(decimalPlaces)} m/s (
                      {(kinematics.finalVelocity / 0.44704).toFixed(decimalPlaces)} mi/h)
                    </p>
                    <p className="mt-2 text-xs text-gray-600">
                      d = v₀t + ½at², v = v₀ + at
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                Conversion References & Formulas
              </summary>
              <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
                <li>1 m/s² = 100 cm/s² = 3.28084 ft/s²</li>
                <li>1 g = 9.80665 m/s²</li>
                <li>1 km/h² ≈ 7.716 × 10⁻⁵ m/s²</li>
                <li>Distance: d = v₀t + ½at²</li>
                <li>Final Velocity: v = v₀ + at</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccelerationConverter;