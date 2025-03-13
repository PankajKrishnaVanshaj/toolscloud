"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const FrequencyConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("Hz");
  const [speed, setSpeed] = useState("299792458"); // Default: speed of light in m/s
  const [speedUnit, setSpeedUnit] = useState("m_s");
  const [displayPrecision, setDisplayPrecision] = useState(4); // Decimal places for results

  // Conversion factors to Hertz (Hz)
  const conversionFactors = {
    Hz: 1, // Hertz
    kHz: 1e3, // Kilohertz
    MHz: 1e6, // Megahertz
    GHz: 1e9, // Gigahertz
    THz: 1e12, // Terahertz
    rpm: 1 / 60, // Revolutions per minute
    rps: 1, // Revolutions per second
    rad_s: 1 / (2 * Math.PI), // Radians per second
    deg_s: 1 / 360, // Degrees per second
    bpm: 1 / 60, // Beats per minute (new)
  };

  const unitDisplayNames = {
    Hz: "Hz",
    kHz: "kHz",
    MHz: "MHz",
    GHz: "GHz",
    THz: "THz",
    rpm: "rpm",
    rps: "rps",
    rad_s: "rad/s",
    deg_s: "deg/s",
    bpm: "bpm",
  };

  // Speed conversion factors to meters per second (m/s)
  const speedConversion = {
    m_s: 1, // Meters per second
    km_h: 1000 / 3600, // Kilometers per hour
    ft_s: 0.3048, // Feet per second
    mi_h: 0.44704, // Miles per hour
    c: 299792458, // Speed of light
    km_s: 1000, // Kilometers per second (new)
    in_s: 0.0254, // Inches per second (new)
  };

  const speedDisplayNames = {
    m_s: "m/s",
    km_h: "km/h",
    ft_s: "ft/s",
    mi_h: "mi/h",
    c: "c (speed of light)",
    km_s: "km/s",
    in_s: "in/s",
  };

  // Convert frequency
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInHz = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInHz / conversionFactors[unit];
        return acc;
      }, {});
    },
    [conversionFactors]
  );

  // Calculate wavelength
  const calculateWavelength = useCallback(() => {
    if (!value || !speed || isNaN(value) || isNaN(speed)) return null;

    const frequencyInHz = value * conversionFactors[unit];
    const speedInMetersPerSecond = speed * speedConversion[speedUnit];

    return speedInMetersPerSecond / frequencyInHz;
  }, [value, unit, speed, speedUnit, conversionFactors, speedConversion]);

  // Reset form
  const reset = () => {
    setValue("");
    setUnit("Hz");
    setSpeed("299792458");
    setSpeedUnit("m_s");
    setDisplayPrecision(4);
  };

  // Download results as text
  const downloadResults = () => {
    const results = convertValue(value, unit);
    const wavelength = calculateWavelength();
    let content = `Frequency Conversion Results\n\nInput: ${value} ${unitDisplayNames[unit]}\n\nConversions:\n`;
    for (const [unit, val] of Object.entries(results)) {
      content += `${unitDisplayNames[unit]}: ${val.toExponential(displayPrecision)}\n`;
    }
    if (wavelength) {
      content += `\nWavelength:\n`;
      content += `Meters (m): ${wavelength.toExponential(displayPrecision)}\n`;
      content += `Centimeters (cm): ${(wavelength * 100).toExponential(displayPrecision)}\n`;
      content += `Millimeters (mm): ${(wavelength * 1000).toExponential(displayPrecision)}\n`;
    }
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `frequency-conversion-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const results = convertValue(value, unit);
  const wavelength = calculateWavelength();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Frequency Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter frequency"
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
                Propagation Speed
              </label>
              <input
                type="number"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                placeholder="Enter speed"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={speedUnit}
                onChange={(e) => setSpeedUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(speedConversion).map((u) => (
                  <option key={u} value={u}>
                    {speedDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Display Precision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Precision (decimal places)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={displayPrecision}
              onChange={(e) => setDisplayPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-sm text-gray-600">{displayPrecision}</span>
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

          {/* Results Section */}
          {value && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Frequency Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}:{" "}
                      {val.toExponential(displayPrecision)}
                    </p>
                  ))}
                </div>
              </div>

              {wavelength && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Wavelength</h2>
                  <p>Meters (m): {wavelength.toExponential(displayPrecision)}</p>
                  <p>
                    Centimeters (cm):{" "}
                    {(wavelength * 100).toExponential(displayPrecision)}
                  </p>
                  <p>
                    Millimeters (mm):{" "}
                    {(wavelength * 1000).toExponential(displayPrecision)}
                  </p>
                  <p>
                    Nanometers (nm):{" "}
                    {(wavelength * 1e9).toExponential(displayPrecision)}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    λ = speed / frequency
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Info</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between Hz, kHz, MHz, GHz, THz, rpm, rps, rad/s, deg/s, bpm</li>
            <li>Calculate wavelength with customizable propagation speed</li>
            <li>Adjustable display precision (0-10 decimal places)</li>
            <li>Download results as a text file</li>
            <li>
              Conversion References:
              <ul className="list-circle list-inside ml-4">
                <li>1 Hz = 2π rad/s</li>
                <li>1 rpm = 1/60 Hz</li>
                <li>1 bpm = 1/60 Hz</li>
                <li>1 kHz = 10³ Hz</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FrequencyConverter;