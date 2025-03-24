"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const SpecificHeatConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("J_kgK");
  const [mass, setMass] = useState("");
  const [massUnit, setMassUnit] = useState("kg");
  const [tempChange, setTempChange] = useState("");
  const [tempUnit, setTempUnit] = useState("K");
  const [material, setMaterial] = useState("custom"); // New: Predefined materials

  // Predefined specific heats (J/(kg·K))
  const materialSpecificHeats = {
    custom: null,
    water: 4186,    // Water at 25°C
    aluminum: 900,  // Aluminum
    copper: 385,    // Copper
    iron: 450,      // Iron
    glass: 840,     // Glass (typical)
  };

  // Conversion factors to J/(kg·K)
  const conversionFactors = {
    J_kgK: 1,          // Joules per kilogram Kelvin
    kJ_kgK: 1e3,      // Kilojoules per kilogram Kelvin
    J_gK: 1e3,        // Joules per gram Kelvin
    cal_gC: 4186.8,   // Calories per gram Celsius
    kcal_kgC: 4186.8, // Kilocalories per kilogram Celsius
    BTU_lbF: 4186.8,  // BTU per pound Fahrenheit
    J_kgC: 1,         // Joules per kilogram Celsius (same as J/kg·K)
    Wh_kgK: 3600,     // Watt-hours per kilogram Kelvin
  };

  const unitDisplayNames = {
    J_kgK: "J/(kg·K)",
    kJ_kgK: "kJ/(kg·K)",
    J_gK: "J/(g·K)",
    cal_gC: "cal/(g·°C)",
    kcal_kgC: "kcal/(kg·°C)",
    BTU_lbF: "BTU/(lb·°F)",
    J_kgC: "J/(kg·°C)",
    Wh_kgK: "Wh/(kg·K)",
  };

  // Mass conversion factors to kg
  const massConversion = {
    kg: 1,
    g: 1e-3,
    lb: 0.453592,
    oz: 0.0283495,
    t: 1000, // Tonnes
  };

  const massDisplayNames = {
    kg: "kg",
    g: "g",
    lb: "lb",
    oz: "oz",
    t: "t",
  };

  // Temperature change conversion factors to Kelvin
  const tempConversion = {
    K: 1,
    C: 1,      // Δ°C = ΔK
    F: 5 / 9,  // Δ°F = 5/9 ΔK
  };

  const tempDisplayNames = {
    K: "K",
    C: "°C",
    F: "°F",
  };

  // Conversion logic
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInJkgK = inputValue * conversionFactors[fromUnit];
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInJkgK / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  // Energy calculation
  const calculateEnergy = useCallback(() => {
    if ((!value && material === "custom") || !mass || !tempChange || isNaN(mass) || isNaN(tempChange)) {
      return null;
    }

    const specificHeatInJkgK =
      material !== "custom" && materialSpecificHeats[material]
        ? materialSpecificHeats[material]
        : value * conversionFactors[unit];
    if (isNaN(specificHeatInJkgK)) return null;

    const massInKg = mass * massConversion[massUnit];
    const tempChangeInK = tempChange * tempConversion[tempUnit];

    // Q = m × c × ΔT (Joules)
    return massInKg * specificHeatInJkgK * tempChangeInK;
  }, [value, unit, mass, massUnit, tempChange, tempUnit, material]);

  // Reset function
  const reset = () => {
    setValue("");
    setUnit("J_kgK");
    setMass("");
    setMassUnit("kg");
    setTempChange("");
    setTempUnit("K");
    setMaterial("custom");
  };

  // Download results as text
  const downloadResults = () => {
    const results = convertValue(
      material !== "custom" ? materialSpecificHeats[material] : value,
      unit
    );
    const energy = calculateEnergy();
    let text = "Specific Heat Converter Results\n\n";
    text += "Input:\n";
    if (material !== "custom") {
      text += `Material: ${material} (${materialSpecificHeats[material]} J/(kg·K))\n`;
    } else {
      text += `Specific Heat: ${value} ${unitDisplayNames[unit]}\n`;
    }
    text += `Mass: ${mass} ${massDisplayNames[massUnit]}\n`;
    text += `Temperature Change: ${tempChange} ${tempDisplayNames[tempUnit]}\n\n`;
    if (results) {
      text += "Conversions:\n";
      for (const [u, val] of Object.entries(results)) {
        text += `${unitDisplayNames[u]}: ${val.toExponential(4)}\n`;
      }
    }
    if (energy) {
      text += "\nEnergy Required:\n";
      text += `Joules (J): ${energy.toExponential(4)}\n`;
      text += `kJ: ${(energy / 1e3).toExponential(4)}\n`;
      text += `Calories: ${(energy / 4186.8).toExponential(4)}\n`;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `specific-heat-results-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(
    material !== "custom" ? materialSpecificHeats[material] : value,
    unit
  );
  const energy = calculateEnergy();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Specific Heat Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material / Specific Heat
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="custom">Custom</option>
                {Object.keys(materialSpecificHeats)
                  .filter((m) => m !== "custom")
                  .map((m) => (
                    <option key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)} ({materialSpecificHeats[m]} J/(kg·K))
                    </option>
                  ))}
              </select>
              {material === "custom" && (
                <>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mass</label>
              <input
                type="number"
                value={mass}
                onChange={(e) => setMass(e.target.value)}
                placeholder="Enter mass"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={massUnit}
                onChange={(e) => setMassUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(massConversion).map((u) => (
                  <option key={u} value={u}>
                    {massDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temp Change (ΔT)
              </label>
              <input
                type="number"
                value={tempChange}
                onChange={(e) => setTempChange(e.target.value)}
                placeholder="Enter ΔT"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={tempUnit}
                onChange={(e) => setTempUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(tempConversion).map((u) => (
                  <option key={u} value={u}>
                    {tempDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={reset}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadResults}
                disabled={!results && !energy}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>

          {/* Results Section */}
          {(value || material !== "custom") && results && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val.toExponential(4)}
                    </p>
                  ))}
                </div>
              </div>

              {energy && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2 text-blue-700">Energy Required</h2>
                  <div className="text-sm text-blue-600">
                    <p>Joules (J): {energy.toExponential(4)}</p>
                    <p>kJ: {(energy / 1e3).toExponential(4)}</p>
                    <p>Calories: {(energy / 4186.8).toExponential(4)}</p>
                    <p>kWh: {(energy / 3.6e6).toExponential(4)}</p>
                    <p className="mt-2 text-xs text-blue-500">Q = m × c × ΔT</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details className="cursor-pointer">
              <summary className="font-semibold text-blue-700">References & Features</summary>
              <div className="mt-2 text-sm text-blue-600">
                <p className="font-medium">Conversion Factors:</p>
                <ul className="list-disc list-inside">
                  <li>1 cal/(g·°C) = 4186.8 J/(kg·K)</li>
                  <li>1 BTU/(lb·°F) = 4186.8 J/(kg·K)</li>
                  <li>1 Wh/(kg·K) = 3600 J/(kg·K)</li>
                  <li>ΔK = Δ°C, Δ°F = 5/9 × ΔK</li>
                </ul>
                <p className="mt-2 font-medium">Features:</p>
                <ul className="list-disc list-inside">
                  <li>Predefined materials with specific heats</li>
                  <li>Expanded unit options (e.g., Wh/(kg·K), tonnes)</li>
                  <li>Download results as text file</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificHeatConverter;