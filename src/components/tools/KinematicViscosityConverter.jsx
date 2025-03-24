"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const KinematicViscosityConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("m2_s");
  const [density, setDensity] = useState("");
  const [densityUnit, setDensityUnit] = useState("kg_m3");
  const [temperature, setTemperature] = useState(""); // New: Temperature for fluid context
  const [tempUnit, setTempUnit] = useState("C"); // Celsius or Fahrenheit
  const [fluidType, setFluidType] = useState("custom"); // Predefined fluids or custom

  // Conversion factors to m²/s
  const conversionFactors = {
    m2_s: 1,          // Square meters per second
    cm2_s: 1e-4,      // Square centimeters per second (Stokes)
    mm2_s: 1e-6,      // Square millimeters per second
    ft2_s: 9.2903e-2, // Square feet per second
    in2_s: 6.4516e-4, // Square inches per second
    St: 1e-4,         // Stokes
    cSt: 1e-6,        // Centistokes
  };

  const unitDisplayNames = {
    m2_s: "m²/s",
    cm2_s: "cm²/s (St)",
    mm2_s: "mm²/s",
    ft2_s: "ft²/s",
    in2_s: "in²/s",
    St: "St",
    cSt: "cSt",
  };

  // Density conversion factors to kg/m³
  const densityConversion = {
    kg_m3: 1,         // Kilograms per cubic meter
    g_cm3: 1000,      // Grams per cubic centimeter
    lb_ft3: 16.0185,  // Pounds per cubic foot
    kg_l: 1000,       // Kilograms per liter
  };

  const densityDisplayNames = {
    kg_m3: "kg/m³",
    g_cm3: "g/cm³",
    lb_ft3: "lb/ft³",
    kg_l: "kg/L",
  };

  // Predefined fluid densities at 20°C (kg/m³)
  const fluidDensities = {
    water: 998,      // Water
    oil: 850,        // Typical oil (e.g., olive oil)
    air: 1.225,      // Air
    honey: 1420,     // Honey
    custom: null,    // User-defined
  };

  // Temperature conversion
  const convertTemperature = (temp, fromUnit) => {
    if (fromUnit === "C") return parseFloat(temp);
    if (fromUnit === "F") return (parseFloat(temp) - 32) * (5 / 9);
    return null;
  };

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInM2s = inputValue * conversionFactors[fromUnit];
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInM2s / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  const calculateDynamicViscosity = useCallback(() => {
    if (!value || isNaN(value)) return null;
    const kinematicViscosityInM2s = value * conversionFactors[unit];
    const effectiveDensity =
      fluidType === "custom"
        ? density && !isNaN(density)
          ? density * densityConversion[densityUnit]
          : null
        : fluidDensities[fluidType];
    if (!effectiveDensity) return null;

    // Dynamic viscosity (μ) = ν × ρ (Pa·s = m²/s × kg/m³)
    return kinematicViscosityInM2s * effectiveDensity;
  }, [value, unit, density, densityUnit, fluidType]);

  const reset = () => {
    setValue("");
    setUnit("m2_s");
    setDensity("");
    setDensityUnit("kg_m3");
    setTemperature("");
    setTempUnit("C");
    setFluidType("custom");
  };

  const downloadResults = () => {
    const results = convertValue(value, unit);
    const dynamicViscosity = calculateDynamicViscosity();
    let text = `Kinematic Viscosity Conversion Results\n\nInput: ${value} ${unitDisplayNames[unit]}\n`;
    if (temperature) text += `Temperature: ${temperature} °${tempUnit}\n`;
    text += `Fluid: ${fluidType !== "custom" ? fluidType : "Custom (Density: ${density} ${densityDisplayNames[densityUnit]})"}\n\n`;

    text += "Conversions:\n";
    for (const [u, val] of Object.entries(results)) {
      text += `${unitDisplayNames[u]}: ${val.toExponential(4)}\n`;
    }

    if (dynamicViscosity) {
      text += `\nDynamic Viscosity:\nPa·s: ${dynamicViscosity.toExponential(4)}\ncP: ${(dynamicViscosity * 1000).toExponential(4)}\n`;
    }

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `viscosity-conversion-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const dynamicViscosity = calculateDynamicViscosity();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Kinematic Viscosity Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kinematic Viscosity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kinematic Viscosity
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

            {/* Fluid Selection and Density */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fluid Type
              </label>
              <select
                value={fluidType}
                onChange={(e) => setFluidType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(fluidDensities).map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0).toUpperCase() + f.slice(1)} {f !== "custom" ? `(${fluidDensities[f]} kg/m³)` : ""}
                  </option>
                ))}
              </select>
              {fluidType === "custom" && (
                <>
                  <input
                    type="number"
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    placeholder="Enter density"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={densityUnit}
                    onChange={(e) => setDensityUnit(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(densityConversion).map((u) => (
                      <option key={u} value={u}>
                        {densityDisplayNames[u]}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature (Optional)
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Enter temperature"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">
                  Kinematic Viscosity Conversions
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val.toExponential(4)}
                    </p>
                  ))}
                </div>
              </div>

              {dynamicViscosity && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 text-blue-800">
                    Dynamic Viscosity
                  </h2>
                  <p className="text-sm text-blue-700">
                    Pa·s: {dynamicViscosity.toExponential(4)}
                  </p>
                  <p className="text-sm text-blue-700">
                    cP: {(dynamicViscosity * 1000).toExponential(4)}
                  </p>
                  <p className="mt-2 text-xs text-blue-600">
                    μ = ν × ρ {temperature && `at ${temperature} °${tempUnit}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <details>
            <summary className="cursor-pointer font-semibold text-blue-700">
              Conversion References & Features
            </summary>
            <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
              <li>1 m²/s = 10⁴ St</li>
              <li>1 St = 10² cSt</li>
              <li>1 cm²/s = 1 St</li>
              <li>1 Pa·s = 10³ cP</li>
              <li>1 ft²/s = 929.03 St</li>
              <li>Features: Fluid presets, temperature input, download results</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default KinematicViscosityConverter;