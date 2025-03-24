"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const MassFlowRateConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg_s");
  const [density, setDensity] = useState("");
  const [densityUnit, setDensityUnit] = useState("kg_m3");
  const [precision, setPrecision] = useState(4);
  const [displayMode, setDisplayMode] = useState("exponential");

  // Conversion factors to kg/s
  const conversionFactors = {
    kg_s: 1,          // Kilograms per second
    g_s: 1e-3,        // Grams per second
    kg_h: 1 / 3600,   // Kilograms per hour
    t_h: 1000 / 3600, // Tonnes per hour
    lb_s: 0.453592,   // Pounds per second
    lb_h: 0.453592 / 3600, // Pounds per hour
    kg_min: 1 / 60,   // Kilograms per minute
    t_d: 1000 / 86400, // Tonnes per day
    oz_s: 0.0283495,  // Ounces per second
    mt_s: 1000,       // Metric tonnes per second
  };

  const unitDisplayNames = {
    kg_s: "kg/s",
    g_s: "g/s",
    kg_h: "kg/h",
    t_h: "t/h",
    lb_s: "lb/s",
    lb_h: "lb/h",
    kg_min: "kg/min",
    t_d: "t/d",
    oz_s: "oz/s",
    mt_s: "mt/s",
  };

  // Density conversion factors to kg/m³
  const densityConversion = {
    kg_m3: 1,         // Kilograms per cubic meter
    g_cm3: 1000,      // Grams per cubic centimeter
    kg_L: 1000,       // Kilograms per liter
    lb_ft3: 16.0185,  // Pounds per cubic foot
    g_mL: 1000,       // Grams per milliliter
    lb_in3: 27679.9,  // Pounds per cubic inch
  };

  const densityDisplayNames = {
    kg_m3: "kg/m³",
    g_cm3: "g/cm³",
    kg_L: "kg/L",
    lb_ft3: "lb/ft³",
    g_mL: "g/mL",
    lb_in3: "lb/in³",
  };

  // Volume flow rate units to m³/s
  const volumeFlowUnits = {
    m3_s: 1,          // Cubic meters per second
    L_s: 1e-3,        // Liters per second
    m3_h: 1 / 3600,   // Cubic meters per hour
    ft3_s: 0.0283168, // Cubic feet per second
    gal_h: 0.00378541 / 3600, // Gallons per hour (US)
    L_min: 1e-3 / 60, // Liters per minute
    gal_s: 0.00378541, // Gallons per second (US)
  };

  const volumeDisplayNames = {
    m3_s: "m³/s",
    L_s: "L/s",
    m3_h: "m³/h",
    ft3_s: "ft³/s",
    gal_h: "gal/h",
    L_min: "L/min",
    gal_s: "gal/s",
  };

  // Conversion logic
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInKgS = inputValue * conversionFactors[fromUnit];
      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInKgS / conversionFactors[unit];
        return acc;
      }, {});
    },
    []
  );

  const calculateVolumeFlow = useCallback(() => {
    if (!value || !density || isNaN(value) || isNaN(density)) return null;
    const massFlowInKgS = value * conversionFactors[unit];
    const densityInKgM3 = density * densityConversion[densityUnit];
    const volumeFlowInM3S = massFlowInKgS / densityInKgM3;
    return Object.keys(volumeFlowUnits).reduce((acc, unit) => {
      acc[unit] = volumeFlowInM3S / volumeFlowUnits[unit];
      return acc;
    }, {});
  }, [value, unit, density, densityUnit]);

  const formatNumber = (num) =>
    displayMode === "exponential"
      ? num.toExponential(precision)
      : num.toFixed(precision);

  const results = convertValue(value, unit);
  const volumeFlowResults = calculateVolumeFlow();

  // Reset function
  const reset = () => {
    setValue("");
    setUnit("kg_s");
    setDensity("");
    setDensityUnit("kg_m3");
    setPrecision(4);
    setDisplayMode("exponential");
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const text = [
      "Mass Flow Rate:",
      ...Object.entries(results).map(([u, v]) => `${unitDisplayNames[u]}: ${formatNumber(v)}`),
      ...(volumeFlowResults
        ? [
            "\nVolume Flow Rate:",
            ...Object.entries(volumeFlowResults).map(
              ([u, v]) => `${volumeDisplayNames[u]}: ${formatNumber(v)}`
            ),
          ]
        : []),
    ].join("\n");
    navigator.clipboard.writeText(text);
    alert("Results copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Mass Flow Rate Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mass Flow Rate
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
                Density (for Volume Flow)
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
                {Object.keys(densityConversion).map((u) => (
                  <option key={u} value={u}>
                    {densityDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Settings
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="exponential">Exponential</option>
                <option value="decimal">Decimal</option>
              </select>
              <div className="mt-2">
                <label className="text-sm text-gray-600">
                  Precision: {precision}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={precision}
                  onChange={(e) => setPrecision(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          {(value || density) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {value && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Mass Flow Rate</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {formatNumber(val)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {volumeFlowResults && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Volume Flow Rate</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(volumeFlowResults).map(([unit, val]) => (
                      <p key={unit}>
                        {volumeDisplayNames[unit]}: {formatNumber(val)}
                      </p>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">Q = ṁ / ρ</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!value && !density}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy Results
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Info</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between multiple mass flow rate units</li>
              <li>Calculate volume flow rate with density input</li>
              <li>Adjustable precision and display format</li>
              <li>Copy results to clipboard</li>
              <li>
                Common conversions: 1 kg/s = 3600 kg/h, 1 m³/s = 1000 L/s
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MassFlowRateConverter;