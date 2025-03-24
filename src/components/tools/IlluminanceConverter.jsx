"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const IlluminanceConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("lx");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [precision, setPrecision] = useState(4);
  const [format, setFormat] = useState("exponential");

  // Conversion factors to Lux (lx)
  const conversionFactors = {
    lx: 1, // Lux
    fc: 10.76391, // Foot-candle
    ph: 1e4, // Phot
    nx: 1e-3, // Nox
    lm_m2: 1, // Lumen per square meter (equivalent to Lux)
    lm_cm2: 1e4, // Lumen per square centimeter
    lm_ft2: 10.76391, // Lumen per square foot (equivalent to Foot-candle)
    fl: 3.426, // Foot-lambert (added)
  };

  const unitDisplayNames = {
    lx: "lx",
    fc: "fc",
    ph: "ph",
    nx: "nx",
    lm_m2: "lm/m²",
    lm_cm2: "lm/cm²",
    lm_ft2: "lm/ft²",
    fl: "fl",
  };

  // Area conversion factors to square meters (m²)
  const areaConversion = {
    m2: 1,
    cm2: 1e-4,
    mm2: 1e-6,
    ft2: 9.2903e-2,
    in2: 6.4516e-4,
    yd2: 0.836127, // Added yard²
  };

  const areaDisplayNames = {
    m2: "m²",
    cm2: "cm²",
    mm2: "mm²",
    ft2: "ft²",
    in2: "in²",
    yd2: "yd²",
  };

  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInLux = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        const result = valueInLux / conversionFactors[unit];
        acc[unit] =
          format === "exponential"
            ? result.toExponential(precision)
            : result.toFixed(precision);
        return acc;
      }, {});
    },
    [precision, format]
  );

  const calculateLuminousFlux = useCallback(() => {
    if (!value || !area || isNaN(value) || isNaN(area)) return null;

    const illuminanceInLux = value * conversionFactors[unit];
    const areaInSquareMeters = area * areaConversion[areaUnit];
    const luminousFlux = illuminanceInLux * areaInSquareMeters;
    return format === "exponential"
      ? luminousFlux.toExponential(precision)
      : luminousFlux.toFixed(precision);
  }, [value, unit, area, areaUnit, precision, format]);

  const results = convertValue(value, unit);
  const luminousFlux = calculateLuminousFlux();

  const reset = () => {
    setValue("");
    setUnit("lx");
    setArea("");
    setAreaUnit("m2");
    setPrecision(4);
    setFormat("exponential");
  };

  const downloadResults = () => {
    if (!value) return;
    const text = [
      "Illuminance Conversion Results",
      `Input: ${value} ${unitDisplayNames[unit]}`,
      "",
      "Conversions:",
      ...Object.entries(results).map(
        ([u, v]) => `${unitDisplayNames[u]}: ${v}`
      ),
      "",
      luminousFlux
        ? `Luminous Flux: ${luminousFlux} lm (with area ${area} ${areaDisplayNames[areaUnit]})`
        : "Luminous Flux: N/A (missing area)",
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `illuminance-conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Illuminance Converter
        </h1>

        {/* Input and Settings */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Illuminance
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
                Area (for Flux)
              </label>
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Enter area"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={areaUnit}
                onChange={(e) => setAreaUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(areaConversion).map((u) => (
                  <option key={u} value={u}>
                    {areaDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (Decimals)
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="exponential">Exponential</option>
                <option value="fixed">Fixed</option>
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
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Results */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val}
                    </p>
                  ))}
                </div>
              </div>

              {luminousFlux && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Luminous Flux:</h2>
                  <p>Lumens (lm): {luminousFlux}</p>
                  <p className="mt-2 text-sm text-gray-600">Φv = E × A</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <details open className="text-sm text-blue-600">
            <summary className="cursor-pointer font-semibold text-blue-700 mb-2">
              Conversion References
            </summary>
            <ul className="list-disc list-inside space-y-1">
              <li>1 lx = 1 lm/m²</li>
              <li>1 fc = 10.76391 lx</li>
              <li>1 ph = 10⁴ lx</li>
              <li>1 nx = 10⁻³ lx</li>
              <li>1 lm/ft² = 10.76391 lx</li>
              <li>1 fl = 3.426 lx</li>
              <li>Area conversions: 1 ft² = 0.092903 m², 1 yd² = 0.836127 m²</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default IlluminanceConverter;