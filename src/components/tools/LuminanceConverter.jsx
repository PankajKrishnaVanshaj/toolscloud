"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const LuminanceConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("cd_m2");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [precision, setPrecision] = useState(4);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Conversion factors to candela per square meter (cd/m²)
  const conversionFactors = {
    cd_m2: 1, // Candela per square meter (nit)
    fL: 3.426, // Foot-lambert
    nt: 1, // Nit (same as cd/m²)
    mL: 3.183e-3, // Millilambert
    L: 3.183, // Lambert
    sb: 1e4, // Stilb
    cd_cm2: 1e4, // Candela per square centimeter
    cd_ft2: 10.764, // Candela per square foot
    cd_in2: 1550, // Candela per square inch
  };

  // Display names for units
  const unitDisplayNames = {
    cd_m2: "cd/m² (nit)",
    fL: "fL",
    nt: "nt",
    mL: "mL",
    L: "L",
    sb: "sb",
    cd_cm2: "cd/cm²",
    cd_ft2: "cd/ft²",
    cd_in2: "cd/in²",
  };

  // Area conversion factors to square meters (m²)
  const areaConversion = {
    m2: 1,
    cm2: 1e-4,
    mm2: 1e-6,
    in2: 6.4516e-4,
    ft2: 9.2903e-2,
    yd2: 0.836127,
  };

  const areaDisplayNames = {
    m2: "m²",
    cm2: "cm²",
    mm2: "mm²",
    in2: "in²",
    ft2: "ft²",
    yd2: "yd²",
  };

  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInCdM2 = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInCdM2 / conversionFactors[unit];
        return acc;
      }, {});
    },
    []
  );

  const calculateIlluminance = useCallback(() => {
    if (!value || !area || isNaN(value) || isNaN(area)) return null;

    const luminanceInCdM2 = value * conversionFactors[unit];
    const areaInSquareMeters = area * areaConversion[areaUnit];
    const illuminance = luminanceInCdM2 * areaInSquareMeters; // Lux
    return {
      lx: illuminance,
      fc: illuminance / 10.764, // Foot-candles
    };
  }, [value, unit, area, areaUnit]);

  const formatNumber = (num) => {
    return showAdvanced
      ? num.toFixed(precision)
      : num.toExponential(precision);
  };

  const results = convertValue(value, unit);
  const illuminance = calculateIlluminance();

  // Reset function
  const reset = () => {
    setValue("");
    setUnit("cd_m2");
    setArea("");
    setAreaUnit("m2");
    setPrecision(4);
    setShowAdvanced(false);
  };

  // Download results as CSV
  const downloadCSV = () => {
    if (!value) return;

    const headers = ["Unit", "Value"];
    const rows = Object.entries(results).map(([unit, val]) => [
      unitDisplayNames[unit],
      formatNumber(val),
    ]);
    if (illuminance) {
      rows.push(["Illuminance (lx)", formatNumber(illuminance.lx)]);
      rows.push(["Illuminance (fc)", formatNumber(illuminance.fc)]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `luminance-conversion-${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Luminance Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Luminance
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
                Area (for Illuminance)
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

          {/* Advanced Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Advanced Options
              </label>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 hover:underline"
              >
                {showAdvanced ? "Hide" : "Show"}
              </button>
            </div>
            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!showAdvanced}
                      onChange={() => setShowAdvanced(!showAdvanced)}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="text-sm text-gray-700">Use Scientific Notation</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">
                  Luminance Conversions
                </h2>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {formatNumber(val)}
                    </p>
                  ))}
                </div>
              </div>

              {illuminance && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2 text-blue-800">
                    Illuminance
                  </h2>
                  <p className="text-sm text-blue-600">
                    Lux (lx): {formatNumber(illuminance.lx)}
                  </p>
                  <p className="text-sm text-blue-600">
                    Foot-candles (fc): {formatNumber(illuminance.fc)}
                  </p>
                  <p className="mt-2 text-xs text-blue-500">
                    E = L × A
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
              onClick={downloadCSV}
              disabled={!value}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download CSV
            </button>
          </div>

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between 9 luminance units</li>
              <li>Calculate illuminance in lux and foot-candles</li>
              <li>Customizable precision and notation</li>
              <li>Download results as CSV</li>
              <li>Area conversion with 6 units</li>
            </ul>
          </div>

          {/* Conversion References */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <details open={false}>
              <summary className="cursor-pointer font-medium text-gray-700">
                Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                <li>1 cd/m² = 1 nit</li>
                <li>1 cd/m² = 0.2919 fL</li>
                <li>1 L = 3,183 cd/m²</li>
                <li>1 sb = 10⁴ cd/m²</li>
                <li>1 lx = 0.0929 fc</li>
                <li>1 m² = 10.764 ft²</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LuminanceConverter;