"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const ElectricFieldConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("V_m");
  const [charge, setCharge] = useState("");
  const [chargeUnit, setChargeUnit] = useState("C"); // Added charge unit
  const [distance, setDistance] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("m");
  const [decimalPlaces, setDecimalPlaces] = useState(4); // Added precision control

  // Conversion factors to V/m (Volts per meter)
  const conversionFactors = {
    V_m: 1,          // Volts per meter
    V_cm: 1e2,       // Volts per centimeter
    V_mm: 1e3,       // Volts per millimeter
    kV_m: 1e3,       // Kilovolts per meter
    MV_m: 1e6,       // Megavolts per meter
    N_C: 1,          // Newtons per Coulomb (equivalent to V/m)
    statV_cm: 299.792458, // Statvolts per centimeter
  };

  const unitDisplayNames = {
    V_m: "V/m",
    V_cm: "V/cm",
    V_mm: "V/mm",
    kV_m: "kV/m",
    MV_m: "MV/m",
    N_C: "N/C",
    statV_cm: "statV/cm",
  };

  // Charge conversion factors to Coulombs
  const chargeConversion = {
    C: 1,         // Coulombs
    mC: 1e-3,     // Millicoulombs
    μC: 1e-6,     // Microcoulombs
    nC: 1e-9,     // Nanocoulombs
    pC: 1e-12,    // Picocoulombs
  };

  const chargeDisplayNames = {
    C: "C",
    mC: "mC",
    μC: "μC",
    nC: "nC",
    pC: "pC",
  };

  // Distance conversion factors to meters
  const distanceConversion = {
    m: 1,
    cm: 1e-2,
    mm: 1e-3,
    km: 1e3,
    in: 2.54e-2,
    ft: 0.3048,
  };

  const distanceDisplayNames = {
    m: "m",
    cm: "cm",
    mm: "mm",
    km: "km",
    in: "in",
    ft: "ft",
  };

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInV_m = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInV_m / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  const calculateElectricField = useCallback(() => {
    if (!charge || !distance || isNaN(charge) || isNaN(distance)) return null;

    const chargeInCoulombs = parseFloat(charge) * chargeConversion[chargeUnit];
    const distanceInMeters = parseFloat(distance) * distanceConversion[distanceUnit];

    const k = 8.9875517923e9; // Coulomb's constant
    const electricField = k * Math.abs(chargeInCoulombs) / (distanceInMeters ** 2);
    return electricField; // Returns in V/m
  }, [charge, chargeUnit, distance, distanceUnit]);

  const reset = () => {
    setValue("");
    setUnit("V_m");
    setCharge("");
    setChargeUnit("C");
    setDistance("");
    setDistanceUnit("m");
    setDecimalPlaces(4);
  };

  const downloadResults = () => {
    const results = convertValue(value, unit);
    const calculatedField = calculateElectricField();
    let text = "Electric Field Conversion Results\n\n";

    if (value) {
      text += "Conversions:\n";
      Object.entries(results).forEach(([unit, val]) => {
        text += `${unitDisplayNames[unit]}: ${val.toFixed(decimalPlaces)}\n`;
      });
    }

    if (calculatedField) {
      text += "\nCalculated Electric Field:\n";
      text += `V/m: ${calculatedField.toFixed(decimalPlaces)}\n`;
      text += `N/C: ${calculatedField.toFixed(decimalPlaces)}\n`;
    }

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `electric-field-results-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const calculatedField = calculateElectricField();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Electric Field Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Electric Field Strength
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
                      <option key={u} value={u}>{unitDisplayNames[u]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charge
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={charge}
                    onChange={(e) => setCharge(e.target.value)}
                    placeholder="Enter charge"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={chargeUnit}
                    onChange={(e) => setChargeUnit(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(chargeConversion).map((u) => (
                      <option key={u} value={u}>{chargeDisplayNames[u]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Enter distance"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(distanceConversion).map((u) => (
                      <option key={u} value={u}>{distanceDisplayNames[u]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Decimal Places ({decimalPlaces})
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={reset}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaSync className="mr-2" /> Reset
                </button>
                <button
                  onClick={downloadResults}
                  disabled={!value && !calculatedField}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {(value || calculatedField) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {value && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Conversions</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {val.toFixed(decimalPlaces)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {calculatedField && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Calculated Field</h2>
                  <p>V/m: {calculatedField.toFixed(decimalPlaces)}</p>
                  <p>N/C: {calculatedField.toFixed(decimalPlaces)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    E = k × |q| / r², k = 8.9875517923 × 10⁹ N·m²/C²
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details open className="text-sm text-blue-600">
              <summary className="cursor-pointer font-semibold text-blue-700 mb-2">
                Conversion References
              </summary>
              <ul className="list-disc list-inside space-y-1">
                <li>1 V/m = 1 N/C</li>
                <li>1 V/cm = 10² V/m</li>
                <li>1 kV/m = 10³ V/m</li>
                <li>1 MV/m = 10⁶ V/m</li>
                <li>1 statV/cm ≈ 299.792458 V/m</li>
                <li>Charge: 1 C = 10³ mC = 10⁶ μC = 10⁹ nC = 10¹² pC</li>
                <li>Distance: 1 m = 10² cm = 10³ mm = 10⁻³ km = 39.37 in = 3.281 ft</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricFieldConverter;