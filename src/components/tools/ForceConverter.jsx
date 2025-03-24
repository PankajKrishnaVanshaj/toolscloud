"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const ForceConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("N");
  const [mass, setMass] = useState("");
  const [massUnit, setMassUnit] = useState("kg");
  const [acceleration, setAcceleration] = useState("");
  const [accUnit, setAccUnit] = useState("m_s2");
  const [precision, setPrecision] = useState(4);

  // Conversion factors to Newton (N)
  const conversionFactors = {
    N: 1,           // Newton
    dyn: 1e-5,      // Dyne
    lbf: 4.448222,  // Pound-force
    pdl: 0.138255,  // Poundal
    kp: 9.80665,    // Kilopond (kilogram-force)
    gf: 0.00980665, // Gram-force
    tf: 9806.65,    // Ton-force (metric)
    ozf: 0.2780139, // Ounce-force
    J_m: 1,         // Joule per meter (N = J/m)
  };

  const unitDisplayNames = {
    N: "N",
    dyn: "dyn",
    lbf: "lbf",
    pdl: "pdl",
    kp: "kp",
    gf: "gf",
    tf: "tf",
    ozf: "ozf",
    J_m: "J/m",
  };

  // Mass conversion factors to kilograms (kg)
  const massConversion = {
    kg: 1,
    g: 1e-3,
    lb: 0.45359237,
    oz: 0.028349523,
    t: 1000,
    slug: 14.5939, // Added slug
  };

  const massDisplayNames = {
    kg: "kg",
    g: "g",
    lb: "lb",
    oz: "oz",
    t: "t",
    slug: "slug",
  };

  // Acceleration conversion factors to meters per second squared (m/s²)
  const accConversion = {
    m_s2: 1,
    cm_s2: 0.01,
    ft_s2: 0.3048,
    g: 9.80665,     // Standard gravity
    km_h2: 0.00007716049, // Kilometers per hour squared
  };

  const accDisplayNames = {
    m_s2: "m/s²",
    cm_s2: "cm/s²",
    ft_s2: "ft/s²",
    g: "g",
    km_h2: "km/h²",
  };

  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInNewtons = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInNewtons / conversionFactors[unit];
        return acc;
      }, {});
    },
    [conversionFactors]
  );

  const calculateForce = useCallback(() => {
    if (!mass || !acceleration || isNaN(mass) || isNaN(acceleration)) return null;

    const massInKg = mass * massConversion[massUnit];
    const accInMs2 = acceleration * accConversion[accUnit];
    return massInKg * accInMs2; // F = m × a
  }, [mass, massUnit, acceleration, accUnit]);

  const formatNumber = (num) => Number(num).toExponential(precision);

  const results = convertValue(value, unit);
  const calculatedForce = calculateForce();

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit("N");
    setMass("");
    setMassUnit("kg");
    setAcceleration("");
    setAccUnit("m_s2");
    setPrecision(4);
  };

  // Download results as text
  const downloadResults = () => {
    const content = [
      "Force Conversion Results:",
      value && results
        ? Object.entries(results)
            .map(([unit, val]) => `${unitDisplayNames[unit]}: ${formatNumber(val)}`)
            .join("\n")
        : "No force conversion data",
      "",
      "Calculated Force (F = m × a):",
      calculatedForce
        ? `N: ${formatNumber(calculatedForce)}\nlbf: ${formatNumber(calculatedForce / conversionFactors.lbf)}`
        : "No calculated force data",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `force-conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Force Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Force", value, setValue, unit, setUnit, units: conversionFactors, display: unitDisplayNames },
              { label: "Mass", value: mass, setValue: setMass, unit: massUnit, setUnit: setMassUnit, units: massConversion, display: massDisplayNames },
              { label: "Acceleration", value: acceleration, setValue: setAcceleration, unit: accUnit, setUnit: setAccUnit, units: accConversion, display: accDisplayNames },
            ].map(({ label, value, setValue, unit, setUnit, units, display }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(units).map((u) => (
                    <option key={u} value={u}>{display[u]}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision ({precision} decimal places)
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
          {(value || calculatedForce) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {value && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Force Conversions</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {formatNumber(val)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {calculatedForce && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Calculated Force</h2>
                  <p>N: {formatNumber(calculatedForce)}</p>
                  <p>lbf: {formatNumber(calculatedForce / conversionFactors.lbf)}</p>
                  <p className="mt-2 text-sm text-gray-600">F = m × a</p>
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
              onClick={downloadResults}
              disabled={!value && !calculatedForce}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Info Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between multiple force units</li>
              <li>Calculate force from mass and acceleration</li>
              <li>Adjustable precision for results</li>
              <li>Download results as text file</li>
            </ul>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-blue-700">
                Conversion References
              </summary>
              <ul className="list-disc list-inside mt-2 text-blue-600 text-sm">
                <li>1 N = 10⁵ dyn</li>
                <li>1 N ≈ 0.224809 lbf</li>
                <li>1 kp = 9.80665 N</li>
                <li>1 tf = 9806.65 N</li>
                <li>1 N ≈ 7.23301 pdl</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForceConverter;