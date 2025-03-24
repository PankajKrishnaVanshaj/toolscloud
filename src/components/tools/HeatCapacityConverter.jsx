"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const HeatCapacityConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("J_K");
  const [mass, setMass] = useState("");
  const [massUnit, setMassUnit] = useState("kg");
  const [tempScale, setTempScale] = useState("K"); // Kelvin, Celsius, Fahrenheit
  const [decimalPlaces, setDecimalPlaces] = useState(4);

  // Conversion factors to J/K (Joules per Kelvin)
  const conversionFactors = {
    J_K: 1, // Joules per Kelvin
    kJ_K: 1e3, // Kilojoules per Kelvin
    cal_K: 4.184, // Calories per Kelvin
    kcal_K: 4184, // Kilocalories per Kelvin
    BTU_F: 1899.1, // BTU per Fahrenheit (converted to J/K)
    J_C: 1, // Joules per Celsius (same as J/K)
    erg_K: 1e-7, // Ergs per Kelvin
  };

  const unitDisplayNames = {
    J_K: "J/K",
    kJ_K: "kJ/K",
    cal_K: "cal/K",
    kcal_K: "kcal/K",
    BTU_F: "BTU/°F",
    J_C: "J/°C",
    erg_K: "erg/K",
  };

  // Mass conversion factors to kilograms (kg)
  const massConversion = {
    kg: 1,
    g: 1e-3,
    mg: 1e-6,
    lb: 0.453592,
    oz: 0.0283495,
  };

  const massDisplayNames = {
    kg: "kg",
    g: "g",
    mg: "mg",
    lb: "lb",
    oz: "oz",
  };

  // Temperature scale adjustment (for display purposes)
  const tempScaleAdjust = (valueInJK, fromScale, toScale) => {
    if (fromScale === toScale) return valueInJK;
    if (fromScale === "F" && toScale === "K") return valueInJK * (5 / 9);
    if (fromScale === "K" && toScale === "F") return valueInJK * (9 / 5);
    return valueInJK; // C and K are equivalent for heat capacity
  };

  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInJK = inputValue * conversionFactors[fromUnit];
      const adjustedValue = tempScaleAdjust(valueInJK, unit === "BTU_F" ? "F" : "K", tempScale);

      return Object.keys(conversionFactors).reduce((acc, unitKey) => {
        const factor = conversionFactors[unitKey];
        acc[unitKey] = tempScaleAdjust(adjustedValue, tempScale, unitKey === "BTU_F" ? "F" : "K") / factor;
        return acc;
      }, {});
    },
    [tempScale]
  );

  const calculateSpecificHeat = useCallback(() => {
    if (!value || !mass || isNaN(value) || isNaN(mass)) return null;

    const heatCapacityInJK = value * conversionFactors[unit];
    const massInKg = mass * massConversion[massUnit];
    const specificHeatInJKgK = heatCapacityInJK / massInKg;

    return {
      "J/kg·K": specificHeatInJKgK,
      "cal/g·K": specificHeatInJKgK / 4184 / 1e3,
      "BTU/lb·F": specificHeatInJKgK / 1899.1 / 0.453592 * (5 / 9),
    };
  }, [value, unit, mass, massUnit]);

  const reset = () => {
    setValue("");
    setUnit("J_K");
    setMass("");
    setMassUnit("kg");
    setTempScale("K");
    setDecimalPlaces(4);
  };

  const downloadResults = () => {
    const results = convertValue(value, unit);
    const specificHeat = calculateSpecificHeat();
    const text = [
      "Heat Capacity Conversions:",
      ...Object.entries(results).map(
        ([u, v]) => `${unitDisplayNames[u]}: ${v.toFixed(decimalPlaces)}`
      ),
      "",
      "Specific Heat Capacity:",
      specificHeat
        ? Object.entries(specificHeat).map(
            ([u, v]) => `${u}: ${v.toFixed(decimalPlaces)}`
          ).join("\n")
        : "N/A",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `heat-capacity-results-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const specificHeat = calculateSpecificHeat();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Heat Capacity Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heat Capacity
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
                Mass
              </label>
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
                Temperature Scale
              </label>
              <select
                value={tempScale}
                onChange={(e) => setTempScale(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="K">Kelvin (K)</option>
                <option value="C">Celsius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decimal Places
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(Math.max(0, Math.min(10, e.target.value)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
                <h2 className="text-lg font-semibold mb-2">Heat Capacity Conversions:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unitKey, val]) => (
                    <p key={unitKey}>
                      {unitDisplayNames[unitKey]}: {val.toFixed(decimalPlaces)}
                    </p>
                  ))}
                </div>
              </div>

              {specificHeat && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Specific Heat Capacity:</h2>
                  <div className="text-sm">
                    {Object.entries(specificHeat).map(([unitKey, val]) => (
                      <p key={unitKey}>
                        {unitKey}: {val.toFixed(decimalPlaces)}
                      </p>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-600">c = C / m</p>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between multiple heat capacity units</li>
              <li>Calculate specific heat capacity with mass input</li>
              <li>Adjustable temperature scale (K, °C, °F)</li>
              <li>Customizable decimal precision</li>
              <li>Download results as text file</li>
              <li>Note: J/K = J/°C; BTU/°F adjusted for Kelvin scale</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatCapacityConverter;