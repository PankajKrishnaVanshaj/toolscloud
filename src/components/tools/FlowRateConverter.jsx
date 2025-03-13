"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const FlowRateConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("m3_s");
  const [density, setDensity] = useState("");
  const [densityUnit, setDensityUnit] = useState("kg_m3");
  const [precision, setPrecision] = useState(4);
  const [showReferences, setShowReferences] = useState(false);

  // Volume flow rate conversion factors to cubic meters per second (m³/s)
  const volumeFlowFactors = {
    m3_s: 1, // Cubic meters per second
    m3_h: 1 / 3600, // Cubic meters per hour
    L_s: 0.001, // Liters per second
    L_min: 0.001 / 60, // Liters per minute
    L_h: 0.001 / 3600, // Liters per hour
    gal_s: 0.0037854118, // US gallons per second
    gal_min: 0.0037854118 / 60, // US gallons per minute
    gal_h: 0.0037854118 / 3600, // US gallons per hour
    ft3_s: 0.0283168466, // Cubic feet per second
    ft3_min: 0.0283168466 / 60, // Cubic feet per minute
  };

  // Mass flow rate conversion factors to kilograms per second (kg/s)
  const massFlowFactors = {
    kg_s: 1, // Kilograms per second
    kg_h: 1 / 3600, // Kilograms per hour
    g_s: 0.001, // Grams per second
    g_min: 0.001 / 60, // Grams per minute
    lb_s: 0.45359237, // Pounds per second
    lb_h: 0.45359237 / 3600, // Pounds per hour
    t_h: 1000 / 3600, // Tonnes per hour
    t_d: 1000 / (3600 * 24), // Tonnes per day
  };

  // Density conversion factors to kg/m³
  const densityFactors = {
    kg_m3: 1, // Kilograms per cubic meter
    g_cm3: 1000, // Grams per cubic centimeter
    kg_L: 1000, // Kilograms per liter
    lb_ft3: 16.018463, // Pounds per cubic foot
    lb_gal: 119.826427, // Pounds per US gallon
  };

  const densityDisplayNames = {
    kg_m3: "kg/m³",
    g_cm3: "g/cm³",
    kg_L: "kg/L",
    lb_ft3: "lb/ft³",
    lb_gal: "lb/gal",
  };

  const convertVolumeFlow = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInM3s = inputValue * volumeFlowFactors[fromUnit];
      return Object.keys(volumeFlowFactors).reduce((acc, unit) => {
        acc[unit] = valueInM3s / volumeFlowFactors[unit];
        return acc;
      }, {});
    },
    [volumeFlowFactors]
  );

  const convertMassFlow = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInKgs = inputValue * massFlowFactors[fromUnit];
      return Object.keys(massFlowFactors).reduce((acc, unit) => {
        acc[unit] = valueInKgs / massFlowFactors[unit];
        return acc;
      }, {});
    },
    [massFlowFactors]
  );

  const convertBetweenFlowTypes = useCallback(() => {
    if (!value || !density || isNaN(value) || isNaN(density)) return null;
    const densityInKgM3 = density * densityFactors[densityUnit];
    const isVolumeUnit = unit in volumeFlowFactors;

    if (isVolumeUnit) {
      const volumeFlowInM3s = value * volumeFlowFactors[unit];
      const massFlowInKgs = volumeFlowInM3s * densityInKgM3;
      return convertMassFlow(massFlowInKgs, "kg_s");
    } else {
      const massFlowInKgs = value * massFlowFactors[unit];
      const volumeFlowInM3s = massFlowInKgs / densityInKgM3;
      return convertVolumeFlow(volumeFlowInM3s, "m3_s");
    }
  }, [value, unit, density, densityUnit, volumeFlowFactors, massFlowFactors]);

  const volumeResults = unit in volumeFlowFactors ? convertVolumeFlow(value, unit) : null;
  const massResults = unit in massFlowFactors ? convertMassFlow(value, unit) : null;
  const convertedResults = convertBetweenFlowTypes();

  const reset = () => {
    setValue("");
    setUnit("m3_s");
    setDensity("");
    setDensityUnit("kg_m3");
    setPrecision(4);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Flow Rate Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flow Rate
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
                <optgroup label="Volume Flow Rates">
                  {Object.keys(volumeFlowFactors).map((u) => (
                    <option key={u} value={u}>
                      {u.replace("_", "/")}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Mass Flow Rates">
                  {Object.keys(massFlowFactors).map((u) => (
                    <option key={u} value={u}>
                      {u.replace("_", "/")}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Density (for conversion)
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
                    {densityDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Precision Control */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Decimal Precision: {precision}
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
          <div className="flex justify-end gap-4">
            <button
              onClick={reset}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  {unit in volumeFlowFactors ? "Volume Flow Rates" : "Mass Flow Rates"}
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(unit in volumeFlowFactors ? volumeResults : massResults) &&
                    Object.entries(unit in volumeFlowFactors ? volumeResults : massResults).map(
                      ([unit, val]) => (
                        <div key={unit} className="flex justify-between items-center">
                          <span>
                            {unit.replace("_", "/")}: {val.toFixed(precision)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(val.toFixed(precision))}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FaCopy />
                          </button>
                        </div>
                      )
                    )}
                </div>
              </div>

              {convertedResults && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-700 mb-2">
                    {unit in volumeFlowFactors ? "Converted Mass Flow" : "Converted Volume Flow"}
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(convertedResults).map(([unit, val]) => (
                      <div key={unit} className="flex justify-between items-center">
                        <span>
                          {unit.replace("_", "/")}: {val.toFixed(precision)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(val.toFixed(precision))}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Conversion References */}
          <div className="mt-6">
            <button
              onClick={() => setShowReferences(!showReferences)}
              className="text-blue-600 hover:underline font-medium"
            >
              {showReferences ? "Hide" : "Show"} Conversion References
            </button>
            {showReferences && (
              <div className="mt-2 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                <ul className="list-disc list-inside space-y-1">
                  <li>1 m³/s = 3600 m³/h</li>
                  <li>1 L/s = 0.001 m³/s</li>
                  <li>1 gal/s = 3.7854118 L/s</li>
                  <li>1 ft³/s = 28.3168466 L/s</li>
                  <li>1 kg/s = 3600 kg/h</li>
                  <li>1 lb/s = 0.45359237 kg/s</li>
                  <li>1 t/h = 1000 kg/h</li>
                  <li>Mass Flow = Volume Flow × Density</li>
                  <li>Volume Flow = Mass Flow ÷ Density</li>
                </ul>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between volume and mass flow rates</li>
              <li>Multiple units for flow and density</li>
              <li>Adjustable decimal precision</li>
              <li>Copy results to clipboard</li>
              <li>Conversion reference guide</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowRateConverter;