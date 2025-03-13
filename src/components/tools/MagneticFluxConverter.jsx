"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const MagneticFluxConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("Wb");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [precision, setPrecision] = useState(4);
  const [history, setHistory] = useState([]);

  // Conversion factors to Weber (Wb)
  const conversionFactors = {
    Wb: 1, // Weber
    mWb: 1e-3, // Milliweber
    uWb: 1e-6, // Microweber
    nWb: 1e-9, // Nanoweber
    Mx: 1e-8, // Maxwell
    kMx: 1e-5, // Kilomaxwell
    MMx: 1e-2, // Megamaxwell
    line: 1e-8, // Line (equivalent to Maxwell)
    GWb: 1e9, // Gigaweber (new)
    TWb: 1e12, // Teraweber (new)
  };

  const unitDisplayNames = {
    Wb: "Wb",
    mWb: "mWb",
    uWb: "μWb",
    nWb: "nWb",
    Mx: "Mx",
    kMx: "kMx",
    MMx: "MMx",
    line: "line",
    GWb: "GWb",
    TWb: "TWb",
  };

  // Area conversion factors to square meters (m²)
  const areaConversion = {
    m2: 1,
    cm2: 1e-4,
    mm2: 1e-6,
    in2: 6.4516e-4,
    ft2: 9.2903e-2,
    yd2: 0.836127, // New: square yards
    km2: 1e6, // New: square kilometers
  };

  const areaDisplayNames = {
    m2: "m²",
    cm2: "cm²",
    mm2: "mm²",
    in2: "in²",
    ft2: "ft²",
    yd2: "yd²",
    km2: "km²",
  };

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInWeber = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInWeber / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  const calculateFluxDensity = useCallback(() => {
    if (!value || !area || isNaN(value) || isNaN(area)) return null;

    const fluxInWeber = value * conversionFactors[unit];
    const areaInSquareMeters = area * areaConversion[areaUnit];
    const fluxDensity = fluxInWeber / areaInSquareMeters; // Tesla
    return fluxDensity;
  }, [value, unit, area, areaUnit]);

  const saveToHistory = () => {
    if (!value || isNaN(value)) return;
    const results = convertValue(value, unit);
    const fluxDensity = calculateFluxDensity();
    setHistory((prev) => [
      { value, unit, area, areaUnit, results, fluxDensity, timestamp: Date.now() },
      ...prev.slice(0, 9), // Keep last 10 entries
    ]);
  };

  const reset = () => {
    setValue("");
    setUnit("Wb");
    setArea("");
    setAreaUnit("m2");
    setPrecision(4);
  };

  const downloadResults = () => {
    const results = convertValue(value, unit);
    const fluxDensity = calculateFluxDensity();
    const text = [
      `Magnetic Flux Conversion Results (${new Date().toLocaleString()}):`,
      `Input: ${value} ${unitDisplayNames[unit]}`,
      `Area: ${area ? `${area} ${areaDisplayNames[areaUnit]}` : "Not provided"}`,
      "\nConverted Values:",
      ...Object.entries(results).map(
        ([u, v]) => `${unitDisplayNames[u]}: ${v.toExponential(precision)}`
      ),
      ...(fluxDensity
        ? [
            "\nFlux Density:",
            `Tesla (T): ${fluxDensity.toExponential(precision)}`,
            `Gauss (G): ${(fluxDensity * 1e4).toExponential(precision)}`,
          ]
        : []),
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `flux-conversion-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const fluxDensity = calculateFluxDensity();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Magnetic Flux Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magnetic Flux
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
                Area (for Flux Density)
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

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision (Decimal Places): {precision}
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
              onClick={() => {
                saveToHistory();
              }}
              disabled={!value}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Save to History
            </button>
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

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Conversions:</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val.toExponential(precision)}
                    </p>
                  ))}
                </div>
              </div>

              {fluxDensity && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Flux Density:</h2>
                  <p>Tesla (T): {fluxDensity.toExponential(precision)}</p>
                  <p>Gauss (G): {(fluxDensity * 1e4).toExponential(precision)}</p>
                  <p className="mt-2 text-sm text-gray-600">B = Φ / A</p>
                </div>
              )}
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-100 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Calculation History:</h2>
              <ul className="text-sm space-y-2 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index} className="border-b py-1">
                    {new Date(entry.timestamp).toLocaleString()}: {entry.value}{" "}
                    {unitDisplayNames[entry.unit]}
                    {entry.area &&
                      ` over ${entry.area} ${areaDisplayNames[entry.areaUnit]}`}
                    {entry.fluxDensity &&
                      ` → ${entry.fluxDensity.toExponential(precision)} T`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Conversion References</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>1 Wb = 10⁸ Mx = 10⁸ lines</li>
            <li>1 kMx = 10³ Mx</li>
            <li>1 MMx = 10⁶ Mx</li>
            <li>1 GWb = 10⁹ Wb</li>
            <li>1 TWb = 10¹² Wb</li>
            <li>1 T = 1 Wb/m² = 10⁴ G</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MagneticFluxConverter;