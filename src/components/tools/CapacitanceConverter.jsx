"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const CapacitanceConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("F");
  const [voltage, setVoltage] = useState("");
  const [displayPrecision, setDisplayPrecision] = useState(4);
  const [displayMode, setDisplayMode] = useState("exponential");

  // Conversion factors to Farad (F)
  const conversionFactors = {
    F: 1, // Farad
    mF: 1e-3, // Millifarad
    uF: 1e-6, // Microfarad
    nF: 1e-9, // Nanofarad
    pF: 1e-12, // Picofarad
    kF: 1e3, // Kilofarad
    aF: 1e-18, // Attofarad
    abF: 1e9, // Abfarad (electromagnetic unit)
    statF: 1.11265e-12, // Statfarad (electrostatic unit)
  };

  // Display names for units
  const unitDisplayNames = {
    F: "F",
    mF: "mF",
    uF: "μF",
    nF: "nF",
    pF: "pF",
    kF: "kF",
    aF: "aF",
    abF: "abF",
    statF: "statF",
  };

  // Convert value to all units
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInFarad = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        const converted = valueInFarad / conversionFactors[unit];
        acc[unit] =
          displayMode === "exponential"
            ? converted.toExponential(displayPrecision)
            : converted.toFixed(displayPrecision);
        return acc;
      }, {});
    },
    [displayMode, displayPrecision]
  );

  // Calculate stored energy
  const calculateEnergy = useCallback(() => {
    if (!value || !voltage || isNaN(value) || isNaN(voltage)) return null;

    const capacitanceInFarad = value * conversionFactors[unit];
    const voltageInVolts = parseFloat(voltage);
    const energy = 0.5 * capacitanceInFarad * voltageInVolts * voltageInVolts; // Joules

    return {
      joules:
        displayMode === "exponential"
          ? energy.toExponential(displayPrecision)
          : energy.toFixed(displayPrecision),
      eV:
        displayMode === "exponential"
          ? (energy * 6.242e18).toExponential(displayPrecision)
          : (energy * 6.242e18).toFixed(displayPrecision),
    };
  }, [value, unit, voltage, displayMode, displayPrecision]);

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit("F");
    setVoltage("");
    setDisplayPrecision(4);
    setDisplayMode("exponential");
  };

  // Copy results to clipboard
  const copyToClipboard = () => {
    const results = convertValue(value, unit);
    const energy = calculateEnergy();
    const text = [
      "Capacitance Conversions:",
      ...Object.entries(results).map(
        ([u, v]) => `${unitDisplayNames[u]}: ${v}`
      ),
      energy
        ? [
            "\nStored Energy:",
            `Joules (J): ${energy.joules}`,
            `Electronvolts (eV): ${energy.eV}`,
          ]
        : [],
    ]
      .flat()
      .join("\n");
    navigator.clipboard.writeText(text);
    alert("Results copied to clipboard!");
  };

  const results = convertValue(value, unit);
  const storedEnergy = calculateEnergy();

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Capacitance Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacitance
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter capacitance"
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
                Voltage (V)
              </label>
              <input
                type="number"
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
                placeholder="Enter voltage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">For energy calculation</p>
            </div>
          </div>

          {/* Display Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Precision
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={displayPrecision}
                onChange={(e) =>
                  setDisplayPrecision(Math.max(0, Math.min(10, e.target.value)))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="exponential">Exponential</option>
                <option value="decimal">Decimal</option>
              </select>
            </div>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val}
                    </p>
                  ))}
                </div>
              </div>
              {storedEnergy && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Stored Energy</h2>
                  <p>Joules (J): {storedEnergy.joules}</p>
                  <p>Electronvolts (eV): {storedEnergy.eV}</p>
                  <p className="mt-2 text-sm text-gray-600">E = ½ × C × V²</p>
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
            {value && (
              <button
                onClick={copyToClipboard}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Copy Results
              </button>
            )}
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between 9 capacitance units</li>
              <li>Calculate stored energy in Joules and eV</li>
              <li>Customizable display precision and mode</li>
              <li>Copy results to clipboard</li>
            </ul>
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-blue-700">
                Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2 text-blue-600 text-sm">
                <li>1 F = 10³ mF = 10⁶ μF</li>
                <li>1 F = 10⁹ nF = 10¹² pF</li>
                <li>1 kF = 10³ F</li>
                <li>1 abF = 10⁹ F</li>
                <li>1 statF ≈ 1.11265 × 10⁻¹² F</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapacitanceConverter;