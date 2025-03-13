"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const WaveNumberConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("cm-1");
  const [mediumIndex, setMediumIndex] = useState("1");
  const [precision, setPrecision] = useState(4); // Decimal precision for display
  const [displayUnits, setDisplayUnits] = useState({
    "cm-1": true,
    "m-1": true,
    "mm-1": true,
    "um-1": true,
    "nm-1": true,
  });

  // Conversion factors to cm⁻¹ (wavenumber)
  const conversionFactors = {
    "cm-1": 1, // Wavenumber in cm⁻¹
    "m-1": 100, // Wavenumber in m⁻¹
    "mm-1": 10, // Wavenumber in mm⁻¹
    "um-1": 1e4, // Wavenumber in μm⁻¹
    "nm-1": 1e7, // Wavenumber in nm⁻¹
  };

  // Display names for units
  const unitDisplayNames = {
    "cm-1": "cm⁻¹",
    "m-1": "m⁻¹",
    "mm-1": "mm⁻¹",
    "um-1": "μm⁻¹",
    "nm-1": "nm⁻¹",
  };

  // Convert wavenumber between units
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInCmInverse = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInCmInverse / conversionFactors[unit];
        return acc;
      }, {});
    },
    []
  );

  // Calculate related properties (wavelength, frequency)
  const calculateRelatedProperties = useCallback(() => {
    if (!value || isNaN(value) || !mediumIndex || isNaN(mediumIndex)) return null;

    const wavenumberCmInverse = value * conversionFactors[unit];
    const refractiveIndex = parseFloat(mediumIndex);
    const speedOfLight = 2.99792458e8; // m/s

    const wavelengthCm = 1 / wavenumberCmInverse; // Wavelength in vacuum (cm)
    const wavelengthMediumCm = wavelengthCm / refractiveIndex; // Wavelength in medium (cm)
    const frequencyHz = speedOfLight / (wavelengthCm * 1e-2); // Frequency (Hz)

    return {
      wavelengthVacuumCm,
      wavelengthMediumCm,
      frequencyHz,
    };
  }, [value, unit, mediumIndex]);

  // Download results as text file
  const downloadResults = () => {
    const results = convertValue(value, unit);
    const properties = calculateRelatedProperties();
    if (!results || !properties) return;

    const content = [
      `Wave Number Converter Results`,
      `Input: ${value} ${unitDisplayNames[unit]}`,
      `Refractive Index: ${mediumIndex}`,
      `\nWavenumber Conversions:`,
      ...Object.entries(results)
        .filter(([unit]) => displayUnits[unit])
        .map(([unit, val]) => `${unitDisplayNames[unit]}: ${val.toExponential(precision)}`),
      `\nRelated Properties:`,
      `Wavelength (vacuum): ${(properties.wavelengthVacuumCm * 1e7).toExponential(precision)} nm`,
      `Wavelength (medium): ${(properties.wavelengthMediumCm * 1e7).toExponential(precision)} nm`,
      `Frequency: ${properties.frequencyHz.toExponential(precision)} Hz`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `wavenumber-conversion-${Date.now()}.txt`;
    link.click();
  };

  // Reset inputs
  const reset = () => {
    setValue("");
    setUnit("cm-1");
    setMediumIndex("1");
    setPrecision(4);
    setDisplayUnits({
      "cm-1": true,
      "m-1": true,
      "mm-1": true,
      "um-1": true,
      "nm-1": true,
    });
  };

  const results = convertValue(value, unit);
  const properties = calculateRelatedProperties();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Wave Number Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wave Number
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter value"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(conversionFactors).map((u) => (
                    <option key={u} value={u}>
                      {unitDisplayNames[u]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Refractive Index (n)
              </label>
              <input
                type="number"
                value={mediumIndex}
                onChange={(e) => setMediumIndex(e.target.value)}
                placeholder="Enter refractive index"
                step="0.01"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Default: 1 (vacuum)</p>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimal places)
              </label>
              <input
                type="number"
                value={precision}
                onChange={(e) => setPrecision(Math.max(0, Math.min(10, e.target.value)))}
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Units
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(displayUnits).map((u) => (
                  <label key={u} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={displayUnits[u]}
                      onChange={() =>
                        setDisplayUnits((prev) => ({ ...prev, [u]: !prev[u] }))
                      }
                      className="mr-1 accent-blue-500"
                    />
                    <span className="text-sm">{unitDisplayNames[u]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Wavenumber Conversions:</h2>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {Object.entries(results)
                    .filter(([unit]) => displayUnits[unit])
                    .map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {val.toExponential(precision)}
                      </p>
                    ))}
                </div>
              </div>
              {properties && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Related Properties:</h2>
                  <div className="space-y-2 text-sm">
                    <p>
                      Wavelength (vacuum):{" "}
                      {(properties.wavelengthVacuumCm * 1e7).toExponential(precision)} nm
                    </p>
                    <p>
                      Wavelength (medium):{" "}
                      {(properties.wavelengthMediumCm * 1e7).toExponential(precision)} nm
                    </p>
                    <p>Frequency: {properties.frequencyHz.toExponential(precision)} Hz</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={downloadResults}
              disabled={!value}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
                <li>1 cm⁻¹ = 100 m⁻¹</li>
                <li>1 cm⁻¹ = 10 mm⁻¹</li>
                <li>1 cm⁻¹ = 10⁴ μm⁻¹</li>
                <li>1 cm⁻¹ = 10⁷ nm⁻¹</li>
                <li>λ (cm) = 1/ν̃ (cm⁻¹)</li>
                <li>f = c/λ (c = 2.99792458 × 10⁸ m/s)</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaveNumberConverter;