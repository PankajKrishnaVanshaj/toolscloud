"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const ViscosityConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("Pa_s");
  const [density, setDensity] = useState("");
  const [densityUnit, setDensityUnit] = useState("kg_m3");
  const [viscosityType, setViscosityType] = useState("dynamic");
  const [precision, setPrecision] = useState(4);

  // Conversion factors
  const dynamicViscosityFactors = {
    Pa_s: 1, // Pascal-second
    mPa_s: 1e-3, // Millipascal-second
    cP: 1e-3, // Centipoise
    P: 1e-1, // Poise
    kg_m_s: 1, // kg/(m·s)
    lb_ft_s: 1.488, // lb/(ft·s)
    lb_s_in2: 6894.76, // lb·s/in²
  };

  const kinematicViscosityFactors = {
    m2_s: 1, // Square meter per second
    cm2_s: 1e-4, // Square centimeter per second (Stokes)
    cSt: 1e-6, // Centistokes
    ft2_s: 9.2903e-2, // Square feet per second
    in2_s: 6.4516e-4, // Square inches per second
  };

  const densityFactors = {
    kg_m3: 1, // kg/m³
    g_cm3: 1000, // g/cm³
    lb_ft3: 16.0185, // lb/ft³
    g_L: 1, // g/L (same as kg/m³)
  };

  const displayNames = {
    Pa_s: "Pa·s",
    mPa_s: "mPa·s",
    cP: "cP",
    P: "P",
    kg_m_s: "kg/(m·s)",
    lb_ft_s: "lb/(ft·s)",
    lb_s_in2: "lb·s/in²",
    m2_s: "m²/s",
    cm2_s: "cm²/s (St)",
    cSt: "cSt",
    ft2_s: "ft²/s",
    in2_s: "in²/s",
    kg_m3: "kg/m³",
    g_cm3: "g/cm³",
    lb_ft3: "lb/ft³",
    g_L: "g/L",
  };

  // Convert within same type
  const convertViscosity = useCallback((inputValue, fromUnit, type) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const factors = type === "dynamic" ? dynamicViscosityFactors : kinematicViscosityFactors;
    const baseValue = inputValue * factors[fromUnit];

    return Object.keys(factors).reduce((acc, unit) => {
      acc[unit] = baseValue / factors[unit];
      return acc;
    }, {});
  }, []);

  // Convert between dynamic and kinematic
  const convertBetweenTypes = useCallback(() => {
    if (!value || !density || isNaN(value) || isNaN(density)) return null;

    const densityInKgM3 = density * densityFactors[densityUnit];
    let result = {};

    if (viscosityType === "dynamic") {
      const dynamicInPaS = value * dynamicViscosityFactors[unit];
      const kinematicInM2S = dynamicInPaS / densityInKgM3;
      result = Object.keys(kinematicViscosityFactors).reduce((acc, unit) => {
        acc[unit] = kinematicInM2S / kinematicViscosityFactors[unit];
        return acc;
      }, {});
    } else {
      const kinematicInM2S = value * kinematicViscosityFactors[unit];
      const dynamicInPaS = kinematicInM2S * densityInKgM3;
      result = Object.keys(dynamicViscosityFactors).reduce((acc, unit) => {
        acc[unit] = dynamicInPaS / dynamicViscosityFactors[unit];
        return acc;
      }, {});
    }
    return result;
  }, [value, unit, density, densityUnit, viscosityType]);

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit(viscosityType === "dynamic" ? "Pa_s" : "m2_s");
    setDensity("");
    setDensityUnit("kg_m3");
    setPrecision(4);
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const results = convertViscosity(value, unit, viscosityType);
  const convertedResults = convertBetweenTypes();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Viscosity Converter
        </h1>

        <div className="space-y-6">
          {/* Type Selection */}
          <div className="flex justify-center gap-6">
            {["dynamic", "kinematic"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={viscosityType === type}
                  onChange={() => {
                    setViscosityType(type);
                    setUnit(type === "dynamic" ? "Pa_s" : "m2_s");
                  }}
                  className="accent-blue-500"
                />
                <span className="text-gray-700 capitalize">{type}</span>
              </label>
            ))}
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Viscosity Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter viscosity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(
                  viscosityType === "dynamic"
                    ? dynamicViscosityFactors
                    : kinematicViscosityFactors
                ).map((u) => (
                  <option key={u} value={u}>
                    {displayNames[u]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Density (for type conversion)
              </label>
              <input
                type="number"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
                placeholder="Enter density"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={densityUnit}
                onChange={(e) => setDensityUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(densityFactors).map((u) => (
                  <option key={u} value={u}>
                    {displayNames[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision (decimal places: {precision})
            </label>
            <input
              type="range"
              min="0"
              max="8"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">
                    {viscosityType === "dynamic" ? "Dynamic" : "Kinematic"} Viscosity
                  </h2>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        Object.entries(results)
                          .map(([u, v]) => `${displayNames[u]}: ${v.toFixed(precision)}`)
                          .join("\n")
                      )
                    }
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <FaCopy />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {displayNames[unit]}: {val.toFixed(precision)}
                    </p>
                  ))}
                </div>
              </div>

              {convertedResults && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">
                      {viscosityType === "dynamic" ? "Kinematic" : "Dynamic"} Viscosity
                    </h2>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          Object.entries(convertedResults)
                            .map(([u, v]) => `${displayNames[u]}: ${v.toFixed(precision)}`)
                            .join("\n")
                        )
                      }
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(convertedResults).map(([unit, val]) => (
                      <p key={unit}>
                        {displayNames[unit]}: {val.toFixed(precision)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2 text-blue-600 text-sm">
                <li>Dynamic: 1 Pa·s = 10 P = 1000 cP = 1 kg/(m·s)</li>
                <li>Kinematic: 1 m²/s = 10⁴ St = 10⁶ cSt</li>
                <li>ν = μ/ρ (Kinematic = Dynamic/Density)</li>
                <li>Density: 1 kg/m³ = 1 g/L = 0.001 g/cm³</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViscosityConverter;