"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaInfoCircle } from "react-icons/fa";

const SoundLevelConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("dB_SPL");
  const [secondValue, setSecondValue] = useState("");
  const [showCombined, setShowCombined] = useState(false);
  const [precision, setPrecision] = useState(4);
  const [comparisonMode, setComparisonMode] = useState("split");

  // Conversion factors relative to dB SPL (Sound Pressure Level)
  const conversionFactors = {
    dB_SPL: 1, // Decibels (Sound Pressure Level)
    dB_A: 1, // A-weighted decibels (approximate, actual varies with frequency)
    dB_B: 1, // B-weighted decibels (approximate)
    dB_C: 1, // C-weighted decibels (approximate)
    dB_Z: 1, // Z-weighted decibels (unweighted)
    Pa: (value) => 2e-5 * Math.pow(10, value / 20), // Pascals (reference: 20 μPa)
    uPa: (value) => 20 * Math.pow(10, value / 20), // Micropascals
    dB_SIL: 1, // Sound Intensity Level (approximate)
    W_m2: (value) => 1e-12 * Math.pow(10, value / 10), // Watts per square meter
  };

  // Display names for units
  const unitDisplayNames = {
    dB_SPL: "dB SPL",
    dB_A: "dB(A)",
    dB_B: "dB(B)",
    dB_C: "dB(C)",
    dB_Z: "dB(Z)",
    Pa: "Pa",
    uPa: "μPa",
    dB_SIL: "dB SIL",
    W_m2: "W/m²",
  };

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};

    let valueInDbSPL;
    if (typeof conversionFactors[fromUnit] === "function") {
      valueInDbSPL =
        fromUnit === "Pa"
          ? 20 * Math.log10(inputValue / 2e-5)
          : fromUnit === "uPa"
          ? 20 * Math.log10(inputValue / 20)
          : fromUnit === "W_m2"
          ? 10 * Math.log10(inputValue / 1e-12)
          : inputValue;
    } else {
      valueInDbSPL = inputValue * conversionFactors[fromUnit];
    }

    const results = {};
    Object.keys(conversionFactors).forEach((unit) => {
      if (typeof conversionFactors[unit] === "function") {
        results[unit] = conversionFactors[unit](valueInDbSPL);
      } else {
        results[unit] = valueInDbSPL / conversionFactors[unit];
      }
    });
    return results;
  }, []);

  const calculateCombinedLevel = useCallback(() => {
    if (!value || !secondValue || isNaN(value) || isNaN(secondValue)) return null;

    const intensity1 = conversionFactors.W_m2(convertValue(value, unit).dB_SPL);
    const intensity2 = conversionFactors.W_m2(convertValue(secondValue, unit).dB_SPL);
    const totalIntensity = intensity1 + intensity2;
    return 10 * Math.log10(totalIntensity / 1e-12);
  }, [value, secondValue, unit, convertValue]);

  const reset = () => {
    setValue("");
    setSecondValue("");
    setUnit("dB_SPL");
    setShowCombined(false);
    setPrecision(4);
    setComparisonMode("split");
  };

  const downloadResults = () => {
    const results = convertValue(value, unit);
    const combined = calculateCombinedLevel();
    let text = `Sound Level Conversion Results\n\n`;
    text += `Input: ${value} ${unitDisplayNames[unit]}\n\n`;
    text += "Conversions:\n";
    Object.entries(results).forEach(([u, v]) => {
      text += `${unitDisplayNames[u]}: ${v.toFixed(precision)}\n`;
    });
    if (combined) {
      text += `\nCombined Level: ${combined.toFixed(precision)} dB SPL\n`;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sound-level-conversion-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const secondResults = convertValue(secondValue, unit);
  const combinedLevel = calculateCombinedLevel();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Sound Level Converter
        </h1>

        {/* Input and Settings */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sound Level 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sound Level 1
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

            {/* Sound Level 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sound Level 2 (Optional)
              </label>
              <input
                type="number"
                value={secondValue}
                onChange={(e) => setSecondValue(e.target.value)}
                placeholder="Enter second value"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setShowCombined(!showCombined)}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {showCombined ? "Hide" : "Show"} Combined Level
              </button>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Precision ({precision})
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={precision}
                onChange={(e) => setPrecision(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comparison Mode
              </label>
              <select
                value={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="split">Split View</option>
                <option value="combined">Combined View</option>
              </select>
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
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>
        </div>

        {/* Results Section */}
        {(value || secondValue) && (
          <div className="mt-6 space-y-4">
            {comparisonMode === "split" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {value && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Sound Level 1</h2>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(results).map(([unit, val]) => (
                        <p key={unit}>
                          {unitDisplayNames[unit]}: {val.toFixed(precision)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {secondValue && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Sound Level 2</h2>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(secondResults).map(([unit, val]) => (
                        <p key={unit}>
                          {unitDisplayNames[unit]}: {val.toFixed(precision)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Conversions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val.toFixed(precision)}
                      {secondValue && (
                        <span className="ml-1 text-gray-500">
                          ({secondResults[unit].toFixed(precision)})
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {showCombined && secondValue && combinedLevel && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Combined Level</h2>
                <p className="text-sm">
                  dB SPL: {combinedLevel.toFixed(precision)}
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  Combined using intensity addition
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
            <FaInfoCircle className="mr-2" /> Conversion References
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Reference pressure: 20 μPa = 0 dB SPL</li>
            <li>Reference intensity: 10⁻¹² W/m² = 0 dB SIL</li>
            <li>dB(A), dB(B), dB(C) are frequency-weighted scales (approximated here)</li>
            <li>Lp = 20 log₁₀(P/P₀) for pressure</li>
            <li>LI = 10 log₁₀(I/I₀) for intensity</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SoundLevelConverter;