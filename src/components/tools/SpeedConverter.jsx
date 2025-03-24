"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCalculator, FaInfoCircle } from "react-icons/fa";

const SpeedConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("m_s");
  const [distance, setDistance] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("m");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("s");
  const [precision, setPrecision] = useState(4);
  const [temperature, setTemperature] = useState(20); // For Mach calculation

  // Conversion factors to meters per second (m/s)
  const conversionFactors = {
    m_s: 1,           // Meters per second
    km_h: 0.277778,   // Kilometers per hour
    mi_h: 0.44704,    // Miles per hour (mph)
    ft_s: 0.3048,     // Feet per second
    kn: 0.514444,     // Knots
    cm_s: 0.01,       // Centimeters per second
    mm_s: 0.001,      // Millimeters per second
    mi_s: 1609.34,    // Miles per second
    mach: (temp) => 331.3 * Math.sqrt(1 + temp / 273.15), // Mach (speed of sound, temperature-dependent)
  };

  const unitDisplayNames = {
    m_s: "m/s",
    km_h: "km/h",
    mi_h: "mi/h",
    ft_s: "ft/s",
    kn: "kn",
    cm_s: "cm/s",
    mm_s: "mm/s",
    mi_s: "mi/s",
    mach: "Mach",
  };

  // Distance conversion factors to meters (m)
  const distanceConversion = {
    m: 1,
    km: 1000,
    mi: 1609.34,
    ft: 0.3048,
    yd: 0.9144,
    cm: 0.01,
    mm: 0.001,
    nm: 1852, // Nautical miles
  };

  // Time conversion factors to seconds (s)
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    ms: 0.001, // Milliseconds
  };

  // Convert speed value
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInMs =
        fromUnit === "mach"
          ? inputValue * conversionFactors.mach(temperature)
          : inputValue * conversionFactors[fromUnit];
      
      return Object.keys(conversionFactors).reduce((acc, unit) => {
        const factor = unit === "mach" ? conversionFactors.mach(temperature) : conversionFactors[unit];
        acc[unit] = valueInMs / factor;
        return acc;
      }, {});
    },
    [temperature]
  );

  // Calculate speed from distance and time
  const calculateDistanceTime = useCallback(() => {
    if (!distance || !time || isNaN(distance) || isNaN(time)) return null;
    
    const distanceInMeters = distance * distanceConversion[distanceUnit];
    const timeInSeconds = time * timeConversion[timeUnit];
    return distanceInMeters / timeInSeconds;
  }, [distance, distanceUnit, time, timeUnit]);

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit("m_s");
    setDistance("");
    setDistanceUnit("m");
    setTime("");
    setTimeUnit("s");
    setPrecision(4);
    setTemperature(20);
  };

  const results = convertValue(value, unit);
  const calculatedSpeed = calculateDistanceTime();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Speed Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Speed Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter speed"
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

            {/* Distance Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distance
              </label>
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(distanceConversion).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Input */}
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
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (Decimals)
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (°C) for Mach
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Affects speed of sound (Mach)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync /> Reset
            </button>
          </div>

          {/* Results Section */}
          {(value || (distance && time)) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {value && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <FaCalculator /> Speed Conversions
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}:{" "}
                        {val.toFixed(precision).replace(/\.?0+$/, "")}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {calculatedSpeed && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <FaCalculator /> Calculated Speed
                  </h2>
                  <div className="text-sm">
                    {Object.entries(convertValue(calculatedSpeed, "m_s")).map(
                      ([unit, val]) => (
                        <p key={unit}>
                          {unitDisplayNames[unit]}:{" "}
                          {val.toFixed(precision).replace(/\.?0+$/, "")}
                        </p>
                      )
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    v = d / t (Speed = Distance / Time)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700 flex items-center gap-2">
                <FaInfoCircle /> Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
                <li>1 m/s = 3.6 km/h</li>
                <li>1 m/s = 2.23694 mi/h</li>
                <li>1 mi/h = 1.60934 km/h</li>
                <li>1 kn = 1.852 km/h</li>
                <li>1 Mach ≈ 331.3 m/s * √(1 + T/273.15) (at {temperature}°C)</li>
                <li>1 nm = 1852 m</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedConverter;