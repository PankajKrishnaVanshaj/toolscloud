"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaInfoCircle } from "react-icons/fa";

const SurfaceTensionConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("N_m");
  const [length, setLength] = useState("");
  const [lengthUnit, setLengthUnit] = useState("m");
  const [precision, setPrecision] = useState(4); // Decimal places for output

  // Conversion factors to N/m (Newton per meter)
  const conversionFactors = {
    N_m: 1,           // Newton per meter
    dyn_cm: 1e-3,     // Dyne per centimeter
    mN_m: 1e-3,       // Millinewton per meter
    uN_m: 1e-6,       // Micronewton per meter
    erg_cm2: 1e-3,    // Erg per square centimeter
    lb_in: 17.4975,   // Pound-force per inch
    gf_cm: 0.980665,  // Gram-force per centimeter
    pdl_in: 2.41125,  // Poundal per inch
    kg_m: 9.80665,    // Kilogram-force per meter (new)
    oz_in: 1.09359    // Ounce-force per inch (new)
  };

  const unitDisplayNames = {
    N_m: "N/m",
    dyn_cm: "dyn/cm",
    mN_m: "mN/m",
    uN_m: "μN/m",
    erg_cm2: "erg/cm²",
    lb_in: "lb/in",
    gf_cm: "gf/cm",
    pdl_in: "pdl/in",
    kg_m: "kgf/m",
    oz_in: "oz/in"
  };

  // Length conversion factors to meters (m)
  const lengthConversion = {
    m: 1,
    cm: 0.01,
    mm: 0.001,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,     // Yard (new)
    km: 1000        // Kilometer (new)
  };

  const lengthDisplayNames = {
    m: "m",
    cm: "cm",
    mm: "mm",
    in: "in",
    ft: "ft",
    yd: "yd",
    km: "km"
  };

  // Force units conversion from Newton (N)
  const forceUnits = {
    N: 1,
    dyn: 1e5,
    mN: 1e3,
    kN: 1e-3,
    gf: 101.971621,
    kgf: 0.101971621,
    lbf: 0.224808943
  };

  const forceDisplayNames = {
    N: "N",
    dyn: "dyn",
    mN: "mN",
    kN: "kN",
    gf: "gf",
    kgf: "kgf",
    lbf: "lbf"
  };

  // Convert surface tension
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInNm = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInNm / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  // Calculate force
  const calculateForce = useCallback(() => {
    if (!value || !length || isNaN(value) || isNaN(length)) return null;

    const surfaceTensionInNm = value * conversionFactors[unit];
    const lengthInMeters = length * lengthConversion[lengthUnit];
    const forceInNewtons = surfaceTensionInNm * lengthInMeters; // F = γ × L

    return Object.keys(forceUnits).reduce((acc, unit) => {
      acc[unit] = forceInNewtons * forceUnits[unit];
      return acc;
    }, {});
  }, [value, unit, length, lengthUnit]);

  const reset = () => {
    setValue("");
    setUnit("N_m");
    setLength("");
    setLengthUnit("m");
    setPrecision(4);
  };

  const results = convertValue(value, unit);
  const forceResults = calculateForce();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Surface Tension Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surface Tension
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
                Length (for Force)
              </label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Enter length"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={lengthUnit}
                onChange={(e) => setLengthUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(lengthConversion).map((u) => (
                  <option key={u} value={u}>{lengthDisplayNames[u]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Precision Control */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Precision (decimal places): {precision}
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
          {(value || length) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {value && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Surface Tension Conversions
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {val.toFixed(precision)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {forceResults && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-800 mb-2">
                    Resulting Force (F = γ × L)
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                    {Object.entries(forceResults).map(([unit, val]) => (
                      <p key={unit}>
                        {forceDisplayNames[unit]}: {val.toFixed(precision)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={reset}
            className="w-full sm:w-auto py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> Conversion References
            </h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>1 N/m = 10³ dyn/cm = 10³ mN/m = 10⁶ μN/m</li>
              <li>1 N/m = 10³ erg/cm² = 17.4975 lb/in</li>
              <li>1 N/m = 0.980665 gf/cm = 9.80665 kgf/m</li>
              <li>1 N/m = 2.41125 pdl/in = 1.09359 oz/in</li>
              <li>Force: F (N) = γ (N/m) × L (m)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurfaceTensionConverter;