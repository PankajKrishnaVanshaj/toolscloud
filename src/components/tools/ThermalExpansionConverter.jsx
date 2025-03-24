"use client";
import React, { useState, useCallback } from "react";
import { FaSync } from "react-icons/fa";

const ThermalExpansionConverter = () => {
  const [length, setLength] = useState("");
  const [lengthUnit, setLengthUnit] = useState("m");
  const [tempChange, setTempChange] = useState("");
  const [tempUnit, setTempUnit] = useState("C");
  const [material, setMaterial] = useState("aluminum");
  const [customCoefficient, setCustomCoefficient] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(4);

  // Linear thermal expansion coefficients (in 1/K or 1/°C)
  const materialCoefficients = {
    aluminum: 23.1e-6,
    steel: 13.0e-6,
    copper: 17.0e-6,
    glass: 8.5e-6,
    concrete: 12.0e-6,
    wood: 5.0e-6,
    brass: 19.0e-6,
    iron: 11.8e-6,
    plastic: 50.0e-6, // Approximate average for common plastics
  };

  // Length conversion to meters
  const lengthConversion = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
  };

  // Display names
  const lengthDisplayNames = {
    m: "m",
    cm: "cm",
    mm: "mm",
    in: "in",
    ft: "ft",
    yd: "yd",
  };

  // Reset all inputs
  const reset = () => {
    setLength("");
    setLengthUnit("m");
    setTempChange("");
    setTempUnit("C");
    setMaterial("aluminum");
    setCustomCoefficient("");
    setUseCustom(false);
    setDecimalPlaces(4);
  };

  // Calculate thermal expansion
  const calculateExpansion = useCallback(() => {
    if ((!length || !tempChange || isNaN(length) || isNaN(tempChange)) && !useCustom) return null;
    if (useCustom && (!customCoefficient || isNaN(customCoefficient))) return null;

    const lengthInMeters = length * lengthConversion[lengthUnit];
    const coefficient = useCustom
      ? parseFloat(customCoefficient) * 1e-6
      : materialCoefficients[material];

    // Linear expansion: ΔL = L₀ × α × ΔT
    const linearExpansion = lengthInMeters * coefficient * tempChange;

    // Area expansion: γ ≈ 2α
    const areaExpansionCoefficient = 2 * coefficient;
    const areaExpansion = lengthInMeters * lengthInMeters * areaExpansionCoefficient * tempChange;

    // Volume expansion: β ≈ 3α
    const volumeExpansionCoefficient = 3 * coefficient;
    const volumeExpansion = lengthInMeters ** 3 * volumeExpansionCoefficient * tempChange;

    return { linearExpansion, areaExpansion, volumeExpansion };
  }, [
    length,
    lengthUnit,
    tempChange,
    material,
    customCoefficient,
    useCustom,
  ]);

  const results = calculateExpansion();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Thermal Expansion Calculator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Length
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="Enter length"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={lengthUnit}
                  onChange={(e) => setLengthUnit(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(lengthConversion).map((u) => (
                    <option key={u} value={u}>
                      {lengthDisplayNames[u]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temperature Change (ΔT)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tempChange}
                  onChange={(e) => setTempChange(e.target.value)}
                  placeholder="Enter ΔT"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={tempUnit}
                  onChange={(e) => setTempUnit(e.target.value)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="C">°C</option>
                  <option value="K">K</option>
                  <option value="F">°F</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  disabled={useCustom}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {Object.keys(materialCoefficients).map((m) => (
                    <option key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)} (α ={" "}
                      {materialCoefficients[m].toExponential(1)} /K)
                    </option>
                  ))}
                </select>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useCustom}
                    onChange={(e) => setUseCustom(e.target.checked)}
                    className="mr-1 accent-blue-500"
                  />
                  <span className="text-sm">Custom</span>
                </label>
              </div>
              {useCustom && (
                <input
                  type="number"
                  value={customCoefficient}
                  onChange={(e) => setCustomCoefficient(e.target.value)}
                  placeholder="Enter α (×10⁻⁶ /K)"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Places
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={decimalPlaces}
                onChange={(e) => setDecimalPlaces(Math.max(1, Math.min(8, e.target.value)))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={reset}
              className="mt-4 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-md shadow-sm">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Linear Expansion</h2>
                <p>m: {results.linearExpansion.toFixed(decimalPlaces)}</p>
                <p>mm: {(results.linearExpansion * 1000).toFixed(decimalPlaces)}</p>
                <p>in: {(results.linearExpansion / 0.0254).toFixed(decimalPlaces)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-md shadow-sm">
                <h2 className="text-lg font-semibold mb-2 text-blue-700">Area Expansion</h2>
                <p>m²: {results.areaExpansion.toFixed(decimalPlaces)}</p>
                <p>cm²: {(results.areaExpansion * 1e4).toFixed(decimalPlaces)}</p>
                <p>in²: {(results.areaExpansion / 6.4516e-4).toFixed(decimalPlaces)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-md shadow-sm">
                <h2 className="text-lg font-semibold mb-2 text-green-700">Volume Expansion</h2>
                <p>m³: {results.volumeExpansion.toFixed(decimalPlaces)}</p>
                <p>cm³: {(results.volumeExpansion * 1e6).toFixed(decimalPlaces)}</p>
                <p>in³: {(results.volumeExpansion / 1.6387e-5).toFixed(decimalPlaces)}</p>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                Formulas & Notes
              </summary>
              <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
                <li>Linear: ΔL = L₀ × α × ΔT</li>
                <li>Area: ΔA ≈ A₀ × 2α × ΔT</li>
                <li>Volume: ΔV ≈ V₀ × 3α × ΔT</li>
                <li>ΔT in °C = ΔT in K; °F converted as ΔT_F / 1.8 = ΔT_C</li>
                <li>Approximations valid for small expansions</li>
                <li>Custom α in 10⁻⁶ /K (e.g., enter 23.1 for aluminum)</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalExpansionConverter;