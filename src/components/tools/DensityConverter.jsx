"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const DensityConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg_m3");
  const [mass, setMass] = useState("");
  const [massUnit, setMassUnit] = useState("kg");
  const [volume, setVolume] = useState("");
  const [volumeUnit, setVolumeUnit] = useState("m3");
  const [precision, setPrecision] = useState(4); // Decimal precision for results

  // Conversion factors to kg/m³
  const conversionFactors = {
    kg_m3: 1,            // Kilograms per cubic meter
    g_cm3: 1000,         // Grams per cubic centimeter
    kg_L: 1000,          // Kilograms per liter
    g_mL: 1000,          // Grams per milliliter
    lb_ft3: 16.0185,     // Pounds per cubic foot
    lb_in3: 27679.9,     // Pounds per cubic inch
    oz_in3: 1728,        // Ounces per cubic inch
    slug_ft3: 515.379,   // Slugs per cubic foot
    mg_L: 0.001,         // Milligrams per liter (new)
    t_m3: 1000,          // Tonnes per cubic meter (new)
  };

  const unitDisplayNames = {
    kg_m3: "kg/m³",
    g_cm3: "g/cm³",
    kg_L: "kg/L",
    g_mL: "g/mL",
    lb_ft3: "lb/ft³",
    lb_in3: "lb/in³",
    oz_in3: "oz/in³",
    slug_ft3: "slug/ft³",
    mg_L: "mg/L",
    t_m3: "t/m³",
  };

  // Mass conversion factors to kg
  const massConversion = {
    kg: 1,
    g: 1e-3,
    lb: 0.453592,
    oz: 0.0283495,
    slug: 14.5939,
    mg: 1e-6,       // New
    t: 1000,        // New (metric tonne)
  };

  // Volume conversion factors to m³
  const volumeConversion = {
    m3: 1,
    cm3: 1e-6,
    L: 1e-3,
    mL: 1e-6,
    ft3: 0.0283168,
    in3: 1.6387e-5,
    gal: 0.00378541, // New (US gallon)
    qt: 0.000946353, // New (US quart)
  };

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInKgM3 = inputValue * conversionFactors[fromUnit];
    
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInKgM3 / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  const calculateMassVolume = useCallback(() => {
    const results = {};
    
    if (value && volume && !mass) {
      const densityInKgM3 = value * conversionFactors[unit];
      const volumeInM3 = volume * volumeConversion[volumeUnit];
      const massInKg = densityInKgM3 * volumeInM3;
      results.mass = Object.keys(massConversion).reduce((acc, unit) => {
        acc[unit] = massInKg / massConversion[unit];
        return acc;
      }, {});
    }
    
    if (value && mass && !volume) {
      const densityInKgM3 = value * conversionFactors[unit];
      const massInKg = mass * massConversion[massUnit];
      const volumeInM3 = massInKg / densityInKgM3;
      results.volume = Object.keys(volumeConversion).reduce((acc, unit) => {
        acc[unit] = volumeInM3 / volumeConversion[unit];
        return acc;
      }, {});
    }
    
    return Object.keys(results).length ? results : null;
  }, [value, unit, mass, massUnit, volume, volumeUnit]);

  const reset = () => {
    setValue("");
    setUnit("kg_m3");
    setMass("");
    setMassUnit("kg");
    setVolume("");
    setVolumeUnit("m3");
    setPrecision(4);
  };

  const downloadResults = () => {
    const results = convertValue(value, unit);
    const massVolumeResults = calculateMassVolume();
    let text = "Density Conversion Results\n\n";
    if (value) {
      text += "Density Conversions:\n";
      Object.entries(results).forEach(([unit, val]) => {
        text += `${unitDisplayNames[unit]}: ${val.toExponential(precision)}\n`;
      });
    }
    if (massVolumeResults) {
      text += `\n${massVolumeResults.mass ? "Mass Results" : "Volume Results"}:\n`;
      const data = massVolumeResults.mass || massVolumeResults.volume;
      Object.entries(data).forEach(([unit, val]) => {
        text += `${unit}: ${val.toExponential(precision)}\n`;
      });
    }
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `density-conversion-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const massVolumeResults = calculateMassVolume();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Density Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Density", value, setValue, unit, setUnit, options: conversionFactors, displayNames: unitDisplayNames },
              { label: "Mass", value: mass, setValue: setMass, unit: massUnit, setUnit: setMassUnit, options: massConversion },
              { label: "Volume", value: volume, setValue: setVolume, unit: volumeUnit, setUnit: setVolumeUnit, options: volumeConversion },
            ].map(({ label, value, setValue, unit, setUnit, options, displayNames }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(options).map((u) => (
                    <option key={u} value={u}>
                      {displayNames ? displayNames[u] : u}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Precision Control */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Precision ({precision} decimals)
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
              disabled={!value && !massVolumeResults}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Results Section */}
          {(value || massVolumeResults) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {value && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Density Conversions</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {val.toExponential(precision)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {massVolumeResults && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">
                    {massVolumeResults.mass ? "Mass Results" : "Volume Results"}
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(massVolumeResults.mass || massVolumeResults.volume) &&
                      Object.entries(massVolumeResults.mass || massVolumeResults.volume).map(
                        ([unit, val]) => (
                          <p key={unit}>
                            {unit}: {val.toExponential(precision)}
                          </p>
                        )
                      )}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">ρ = m / V</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Info</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between multiple density units</li>
            <li>Calculate mass or volume using density (ρ = m / V)</li>
            <li>Adjustable precision for results</li>
            <li>Download results as a text file</li>
            <li>
              Common conversions:
              <ul className="list-circle list-inside ml-4">
                <li>1 kg/m³ = 0.001 g/cm³</li>
                <li>1 lb/ft³ = 16.0185 kg/m³</li>
                <li>1 slug/ft³ = 515.379 kg/m³</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DensityConverter;