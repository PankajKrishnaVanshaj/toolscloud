"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const MagneticFieldStrengthConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("A_m");
  const [current, setCurrent] = useState("");
  const [distance, setDistance] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("m");
  const [calculationMode, setCalculationMode] = useState("straight"); // New: wire type
  const [precision, setPrecision] = useState(4); // New: decimal precision

  // Conversion factors to A/m
  const conversionFactors = {
    A_m: 1,          // Ampere per meter
    Oe: 79.57747,    // Oersted
    kA_m: 1e3,       // Kiloampere per meter
    mA_m: 1e-3,      // Milliampere per meter
    A_cm: 1e2,       // Ampere per centimeter
    G: 79.57747,     // Gauss (in vacuum, same as Oe)
    kOe: 79577.47,   // Kilo-oersted
    T: 795774.715,   // Tesla (approximate, in vacuum)
    mT: 795.774715,  // milliTesla
  };

  const unitDisplayNames = {
    A_m: "A/m",
    Oe: "Oe",
    kA_m: "kA/m",
    mA_m: "mA/m",
    A_cm: "A/cm",
    G: "G",
    kOe: "kOe",
    T: "T",
    mT: "mT",
  };

  // Distance conversion factors to meters (m)
  const distanceConversion = {
    m: 1,
    cm: 1e-2,
    mm: 1e-3,
    in: 2.54e-2,
    ft: 0.3048,
    km: 1e3,
  };

  const distanceDisplayNames = {
    m: "m",
    cm: "cm",
    mm: "mm",
    in: "in",
    ft: "ft",
    km: "km",
  };

  // Convert field strength
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInAm = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInAm / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  // Calculate field from current based on wire type
  const calculateFieldFromCurrent = useCallback(() => {
    if (!current || !distance || isNaN(current) || isNaN(distance)) return null;

    const currentInAmperes = parseFloat(current);
    const distanceInMeters = distance * distanceConversion[distanceUnit];
    const mu0 = 4 * Math.PI * 1e-7; // Vacuum permeability (H/m)

    let fieldStrength;
    if (calculationMode === "straight") {
      // H = I / (2πr) for a straight wire
      fieldStrength = (mu0 * currentInAmperes) / (2 * Math.PI * distanceInMeters);
    } else if (calculationMode === "loop") {
      // H = I / (2r) for a circular loop (center)
      fieldStrength = (mu0 * currentInAmperes) / (2 * distanceInMeters);
    } else if (calculationMode === "solenoid") {
      // H = nI (approximation, n = 1 turn per meter assumed)
      fieldStrength = currentInAmperes; // Simplified, assumes n=1
    }

    return fieldStrength; // in A/m
  }, [current, distance, distanceUnit, calculationMode]);

  // Reset all fields
  const reset = () => {
    setValue("");
    setUnit("A_m");
    setCurrent("");
    setDistance("");
    setDistanceUnit("m");
    setCalculationMode("straight");
    setPrecision(4);
  };

  // Download results as text
  const downloadResults = () => {
    const results = convertValue(value, unit);
    const calculatedField = calculateFieldFromCurrent();
    let text = "Magnetic Field Strength Conversion Results\n\n";

    if (value) {
      text += "Field Strength Conversions:\n";
      Object.entries(results).forEach(([u, val]) => {
        text += `${unitDisplayNames[u]}: ${val.toExponential(precision)}\n`;
      });
    }

    if (calculatedField) {
      text += "\nCalculated Field Strength:\n";
      text += `A/m: ${calculatedField.toExponential(precision)}\n`;
      text += `Oe: ${(calculatedField * conversionFactors.Oe).toExponential(precision)}\n`;
      text += `Formula: ${calculationMode === "straight" ? "H = μ₀I / (2πr)" : calculationMode === "loop" ? "H = μ₀I / (2r)" : "H = nI (n=1)"}\n`;
    }

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `magnetic-field-results-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const calculatedField = calculateFieldFromCurrent();

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Magnetic Field Strength Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Strength
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
                Current (A)
              </label>
              <input
                type="number"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter current"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="Distance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={distanceUnit}
                  onChange={(e) => setDistanceUnit(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(distanceConversion).map((u) => (
                    <option key={u} value={u}>
                      {distanceDisplayNames[u]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calculation Mode
              </label>
              <select
                value={calculationMode}
                onChange={(e) => setCalculationMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="straight">Straight Wire</option>
                <option value="loop">Circular Loop</option>
                <option value="solenoid">Solenoid (n=1)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimals)
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
          </div>

          {/* Results Section */}
          {(value || calculatedField) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {value && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Conversions</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {val.toExponential(precision)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {calculatedField && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Calculated Field</h2>
                  <p>A/m: {calculatedField.toExponential(precision)}</p>
                  <p>Oe: {(calculatedField * conversionFactors.Oe).toExponential(precision)}</p>
                  <p>T: {(calculatedField / conversionFactors.T).toExponential(precision)}</p>
                  <p className="mt-2 text-xs text-gray-600">
                    Formula:{" "}
                    {calculationMode === "straight"
                      ? "H = μ₀I / (2πr)"
                      : calculationMode === "loop"
                      ? "H = μ₀I / (2r)"
                      : "H = nI (n=1)"}
                  </p>
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
              onClick={downloadResults}
              disabled={!value && !calculatedField}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">References & Notes</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>1 Oe = 79.57747 A/m</li>
              <li>1 T ≈ 795774.715 A/m (in vacuum)</li>
              <li>μ₀ = 4π × 10⁻⁷ H/m</li>
              <li>Solenoid assumes 1 turn/m; adjust for real n</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagneticFieldStrengthConverter;