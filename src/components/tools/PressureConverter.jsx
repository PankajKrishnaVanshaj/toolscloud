"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const PressureConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("Pa");
  const [altitude, setAltitude] = useState("");
  const [temperature, setTemperature] = useState("");
  const [precision, setPrecision] = useState(4);
  const [includeAltitude, setIncludeAltitude] = useState(true);

  // Conversion factors to Pascal (Pa)
  const conversionFactors = {
    Pa: 1, // Pascal
    kPa: 1e3, // Kilopascal
    MPa: 1e6, // Megapascal
    bar: 1e5, // Bar
    mbar: 1e2, // Millibar
    atm: 101325, // Atmosphere
    mmHg: 133.322, // Millimeter of mercury
    inHg: 3386.39, // Inch of mercury
    psi: 6894.76, // Pounds per square inch
    torr: 133.322, // Torr
  };

  const unitDisplayNames = {
    Pa: "Pa",
    kPa: "kPa",
    MPa: "MPa",
    bar: "bar",
    mbar: "mbar",
    atm: "atm",
    mmHg: "mmHg",
    inHg: "inHg",
    psi: "psi",
    torr: "torr",
  };

  // Convert pressure value
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInPa = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInPa / conversionFactors[unit];
        return acc;
      }, {});
    },
    [conversionFactors]
  );

  // Calculate pressure at altitude using barometric formula
  const calculateAltitudePressure = useCallback(() => {
    if (!altitude || !temperature || isNaN(altitude) || isNaN(temperature)) return null;

    const P0 = 101325; // Sea level pressure in Pa
    const M = 0.0289644; // Molar mass of air (kg/mol)
    const g = 9.80665; // Gravity (m/s²)
    const R = 8.31447; // Gas constant (J/(mol·K))
    const T = parseFloat(temperature) + 273.15; // Convert to Kelvin
    const h = parseFloat(altitude);

    return P0 * Math.exp((-M * g * h) / (R * T));
  }, [altitude, temperature]);

  // Reset all fields
  const reset = () => {
    setValue("");
    setUnit("Pa");
    setAltitude("");
    setTemperature("");
    setPrecision(4);
    setIncludeAltitude(true);
  };

  // Download results as text
  const downloadResults = () => {
    const results = convertValue(value, unit);
    const altitudePressure = calculateAltitudePressure();
    let text = `Pressure Conversion Results\n\nInput: ${value} ${unitDisplayNames[unit]}\n\nConversions:\n`;
    for (const [u, val] of Object.entries(results)) {
      text += `${unitDisplayNames[u]}: ${val.toExponential(precision)}\n`;
    }
    if (altitudePressure && includeAltitude) {
      text += `\nPressure at Altitude (${altitude}m, ${temperature}°C):\nPa: ${altitudePressure.toExponential(precision)}\natm: ${(altitudePressure / conversionFactors.atm).toExponential(precision)}\n`;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pressure-conversion-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const altitudePressure = includeAltitude ? calculateAltitudePressure() : null;

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Pressure Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pressure Value
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter pressure"
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
                Altitude (m)
              </label>
              <input
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                placeholder="Enter altitude"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!includeAltitude}
              />
              <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">
                Temperature (°C)
              </label>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="Enter temperature"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!includeAltitude}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimal Precision
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
                  checked={includeAltitude}
                  onChange={(e) => setIncludeAltitude(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Include Altitude Calculation</span>
              </label>
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
              disabled={!value && !altitudePressure}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Results Section */}
          {(value || altitudePressure) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {value && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Pressure Conversions</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results).map(([unit, val]) => (
                      <p key={unit}>
                        {unitDisplayNames[unit]}: {val.toExponential(precision)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {altitudePressure && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Pressure at Altitude</h2>
                  <p>Pa: {altitudePressure.toExponential(precision)}</p>
                  <p>
                    atm: {(altitudePressure / conversionFactors.atm).toExponential(precision)}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">Using barometric formula</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & References</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between 10 pressure units</li>
            <li>Calculate pressure at altitude with temperature adjustment</li>
            <li>Customizable decimal precision</li>
            <li>Download results as text file</li>
            <li>
              References: 1 atm = 101325 Pa, 1 bar = 10⁵ Pa, 1 psi = 6894.76 Pa, 1 mmHg = 1 torr =
              133.322 Pa, 1 inHg = 3386.39 Pa
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PressureConverter;