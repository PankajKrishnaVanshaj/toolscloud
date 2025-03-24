"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaInfoCircle } from "react-icons/fa";

const LuminousFluxConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("lm");
  const [solidAngle, setSolidAngle] = useState("");
  const [angleUnit, setAngleUnit] = useState("sr");
  const [precision, setPrecision] = useState(4);

  // Conversion factors to Lumens (lm)
  const conversionFactors = {
    lm: 1,          // Lumen
    mlm: 1e-3,      // Millilumen
    ulm: 1e-6,      // Microlumen
    cd_sr: 1,       // Candela-steradian (equivalent to lumen)
    lx_m2: 1,       // Lux square meter
    ph: 1e4,        // Phot
    nox: 1e-3,      // Nox
    fc_m2: 10.76391 // Footcandle square meter (1 fc·m² ≈ 10.76391 lm)
  };

  const unitDisplayNames = {
    lm: "lm",
    mlm: "mlm",
    ulm: "μlm",
    cd_sr: "cd·sr",
    lx_m2: "lx·m²",
    ph: "ph",
    nox: "nox",
    fc_m2: "fc·m²"
  };

  // Solid angle conversion factors to steradians (sr)
  const angleConversion = {
    sr: 1,                        // Steradian
    deg2: (Math.PI / 180) ** 2,   // Square degree
    sp: 4 * Math.PI,             // Sphere
    msr: 1e-3                    // Millisteradian
  };

  const angleDisplayNames = {
    sr: "sr",
    deg2: "deg²",
    sp: "sphere",
    msr: "msr"
  };

  // Convert luminous flux
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInLumens = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInLumens / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  // Calculate luminous intensity
  const calculateLuminousIntensity = useCallback(() => {
    if (!value || !solidAngle || isNaN(value) || isNaN(solidAngle)) return null;

    const luminousFluxInLumens = value * conversionFactors[unit];
    const solidAngleInSteradians = solidAngle * angleConversion[angleUnit];
    return luminousFluxInLumens / solidAngleInSteradians; // cd = lm / sr
  }, [value, unit, solidAngle, angleUnit]);

  const results = convertValue(value, unit);
  const luminousIntensity = calculateLuminousIntensity();

  // Reset all fields
  const reset = () => {
    setValue("");
    setUnit("lm");
    setSolidAngle("");
    setAngleUnit("sr");
    setPrecision(4);
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Luminous Flux Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Luminous Flux
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
                  <option key={u} value={u}>{unitDisplayNames[u]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Solid Angle (for Intensity)
              </label>
              <input
                type="number"
                value={solidAngle}
                onChange={(e) => setSolidAngle(e.target.value)}
                placeholder="Enter solid angle"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={angleUnit}
                onChange={(e) => setAngleUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(angleConversion).map((u) => (
                  <option key={u} value={u}>{angleDisplayNames[u]}</option>
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
              max="8"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                  Conversions
                  <button
                    onClick={() =>
                      copyToClipboard(
                        Object.entries(results)
                          .map(([u, v]) => `${unitDisplayNames[u]}: ${v.toFixed(precision)}`)
                          .join("\n")
                      )
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaCopy />
                  </button>
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val.toFixed(precision)}
                    </p>
                  ))}
                </div>
              </div>

              {luminousIntensity && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                    Luminous Intensity
                    <button
                      onClick={() =>
                        copyToClipboard(`Candela (cd): ${luminousIntensity.toFixed(precision)}`)
                      }
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaCopy />
                    </button>
                  </h2>
                  <p>Candela (cd): {luminousIntensity.toFixed(precision)}</p>
                  <p className="mt-2 text-sm text-gray-600">I = Φ / Ω</p>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync /> Reset
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
            <FaInfoCircle /> Conversion References
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>1 lm = 1 cd·sr = 1 lx·m²</li>
            <li>1 ph = 10⁴ lm</li>
            <li>1 nox = 10⁻³ lm</li>
            <li>1 fc·m² ≈ 10.76391 lm</li>
            <li>1 sr ≈ 0.0003046174 deg²</li>
            <li>1 sphere = 4π sr</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LuminousFluxConverter;