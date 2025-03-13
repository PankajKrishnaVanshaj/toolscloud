"use client";
import React, { useState, useCallback } from "react";
import { FaSync } from "react-icons/fa";

const MagneticFluxDensityConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("T");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState("m2");
  const [precision, setPrecision] = useState(4); // Decimal precision for results

  // Conversion factors to Tesla (T)
  const conversionFactors = {
    T: 1,          // Tesla
    G: 1e-4,       // Gauss
    mT: 1e-3,      // Millitesla
    uT: 1e-6,      // Microtesla
    nT: 1e-9,      // Nanotesla
    kG: 1e-1,      // Kilogauss
    Wb_m2: 1,      // Weber per square meter
    Mx_cm2: 1e-8,  // Maxwell per square centimeter
    gamma: 1e-9,   // Gamma
    line_cm2: 1e-8 // Line per square centimeter (added)
  };

  // Display names for units
  const unitDisplayNames = {
    T: "T",
    G: "G",
    mT: "mT",
    uT: "μT",
    nT: "nT",
    kG: "kG",
    Wb_m2: "Wb/m²",
    Mx_cm2: "Mx/cm²",
    gamma: "γ",
    line_cm2: "line/cm²"
  };

  // Area conversion factors to square meters (m²)
  const areaConversion = {
    m2: 1,
    cm2: 1e-4,
    mm2: 1e-6,
    in2: 6.4516e-4,
    ft2: 9.2903e-2,
    yd2: 0.836127 // Added yard²
  };

  const areaDisplayNames = {
    m2: "m²",
    cm2: "cm²",
    mm2: "mm²",
    in2: "in²",
    ft2: "ft²",
    yd2: "yd²"
  };

  // Convert flux density
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInTesla = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInTesla / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  // Calculate magnetic flux
  const calculateMagneticFlux = useCallback(() => {
    if (!value || !area || isNaN(value) || isNaN(area)) return null;

    const fluxDensityInTesla = value * conversionFactors[unit];
    const areaInSquareMeters = area * areaConversion[areaUnit];
    const magneticFlux = fluxDensityInTesla * areaInSquareMeters;
    return magneticFlux;
  }, [value, unit, area, areaUnit]);

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit("T");
    setArea("");
    setAreaUnit("m2");
    setPrecision(4);
  };

  const results = convertValue(value, unit);
  const magneticFlux = calculateMagneticFlux();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Magnetic Flux Density Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flux Density
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

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decimal Precision ({precision})
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

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Flux Density Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}:{" "}
                      {val.toFixed(precision).replace(/\.?0+$/, "")}
                    </p>
                  ))}
                </div>
              </div>

              {magneticFlux && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Magnetic Flux</h2>
                  <p>
                    Weber (Wb): {magneticFlux.toFixed(precision).replace(/\.?0+$/, "")}
                  </p>
                  <p>
                    Maxwell (Mx): {(magneticFlux * 1e8)
                      .toFixed(precision)
                      .replace(/\.?0+$/, "")}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">Φ = B × A</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <details>
              <summary className="cursor-pointer font-semibold text-blue-700">
                Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
                <li>1 T = 10⁴ G</li>
                <li>1 T = 1 Wb/m²</li>
                <li>1 G = 10⁵ γ</li>
                <li>1 Wb = 10⁸ Mx</li>
                <li>1 kG = 10³ G</li>
                <li>1 Mx/cm² = 1 line/cm²</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagneticFluxDensityConverter;