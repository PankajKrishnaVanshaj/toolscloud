"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const ElectromagneticSpectrumConverter = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState("wavelength");
  const [unit, setUnit] = useState("m");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState(4); // Adjustable decimal places

  // Constants
  const c = 299792458; // Speed of light (m/s)
  const h = 6.62607015e-34; // Planck constant (J·s)
  const eV = 1.60217662e-19; // Joules per eV

  // Unit conversion factors
  const wavelengthUnits = {
    m: 1,
    nm: 1e-9,
    μm: 1e-6,
    mm: 1e-3,
    cm: 1e-2,
    km: 1e3,
    Å: 1e-10, // Angstrom
  };

  const frequencyUnits = {
    Hz: 1,
    kHz: 1e3,
    MHz: 1e6,
    GHz: 1e9,
    THz: 1e12,
    PHz: 1e15, // Petahertz
  };

  const energyUnits = {
    J: 1,
    eV: eV,
    keV: eV * 1e3,
    MeV: eV * 1e6,
    GeV: eV * 1e9, // Gigaelectronvolt
  };

  // EM Spectrum ranges (wavelength in meters)
  const spectrumRanges = [
    { name: "Radio", min: 1e-3, max: Infinity, color: "#FF9999" },
    { name: "Microwave", min: 1e-6, max: 1e-3, color: "#FFCC99" },
    { name: "Infrared", min: 7e-7, max: 1e-6, color: "#FFFF99" },
    { name: "Visible", min: 4e-7, max: 7e-7, color: "#CCFF99" },
    { name: "Ultraviolet", min: 1e-8, max: 4e-7, color: "#99CCFF" },
    { name: "X-ray", min: 1e-11, max: 1e-8, color: "#CC99FF" },
    { name: "Gamma Ray", min: 0, max: 1e-11, color: "#FF99FF" },
  ];

  // Conversion logic
  const convertEMProperties = useCallback(() => {
    setError("");
    setResult(null);

    if (!inputValue || isNaN(inputValue) || inputValue <= 0) {
      setError("Please enter a valid positive value");
      return;
    }

    const value = parseFloat(inputValue);
    let wavelength, frequency, energy;

    try {
      if (inputType === "wavelength") {
        wavelength = value * wavelengthUnits[unit];
        frequency = c / wavelength;
        energy = h * frequency;
      } else if (inputType === "frequency") {
        frequency = value * frequencyUnits[unit];
        wavelength = c / frequency;
        energy = h * frequency;
      } else {
        energy = value * energyUnits[unit];
        frequency = energy / h;
        wavelength = c / frequency;
      }

      const spectrumRegion = spectrumRanges.find(
        (range) => wavelength > range.min && wavelength <= range.max
      );

      setResult({
        wavelength,
        frequency,
        energy,
        region: spectrumRegion || { name: "Beyond Known Spectrum", color: "#CCCCCC" },
      });
    } catch (err) {
      setError("Calculation error: " + err.message);
    }
  }, [inputValue, inputType, unit]);

  // Format number with adjustable precision
  const formatNumber = (num, unitFactor = 1) => {
    const adjustedNum = num / unitFactor;
    if (adjustedNum < 1e-6 || adjustedNum > 1e6) {
      return adjustedNum.toExponential(precision);
    }
    return adjustedNum.toLocaleString("en-US", { maximumFractionDigits: precision });
  };

  // Reset inputs
  const reset = () => {
    setInputValue("");
    setInputType("wavelength");
    setUnit("m");
    setResult(null);
    setError("");
    setPrecision(4);
  };

  // Download results as text
  const downloadResults = () => {
    if (!result) return;
    const text = `
Electromagnetic Spectrum Conversion Results:
Wavelength: ${formatNumber(result.wavelength)} m (${formatNumber(result.wavelength, wavelengthUnits.nm)} nm)
Frequency: ${formatNumber(result.frequency)} Hz (${formatNumber(result.frequency, frequencyUnits.GHz)} GHz)
Energy: ${formatNumber(result.energy)} J (${formatNumber(result.energy, energyUnits.eV)} eV)
Spectrum Region: ${result.region.name}
Generated: ${new Date().toLocaleString()}
    `.trim();
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `em-spectrum-result-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Electromagnetic Spectrum Converter
        </h1>

        <div className="space-y-6">
          {/* Input Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Type
            </label>
            <select
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value);
                setInputValue("");
                setUnit(
                  Object.keys(
                    e.target.value === "wavelength"
                      ? wavelengthUnits
                      : e.target.value === "frequency"
                      ? frequencyUnits
                      : energyUnits
                  )[0]
                );
                setResult(null);
              }}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="wavelength">Wavelength</option>
              <option value="frequency">Frequency</option>
              <option value="energy">Energy</option>
            </select>
          </div>

          {/* Input Value and Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(
                  inputType === "wavelength"
                    ? wavelengthUnits
                    : inputType === "frequency"
                    ? frequencyUnits
                    : energyUnits
                ).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precision ({precision} digits)
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={convertEMProperties}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
            </button>
            <button
              onClick={downloadResults}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div
              className="p-4 rounded-lg shadow-md"
              style={{ backgroundColor: result.region.color }}
            >
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <ul className="space-y-1 text-sm">
                <li>
                  Wavelength: {formatNumber(result.wavelength)} m (
                  {formatNumber(result.wavelength, wavelengthUnits.nm)} nm)
                </li>
                <li>
                  Frequency: {formatNumber(result.frequency)} Hz (
                  {formatNumber(result.frequency, frequencyUnits.GHz)} GHz)
                </li>
                <li>
                  Energy: {formatNumber(result.energy)} J (
                  {formatNumber(result.energy, energyUnits.eV)} eV)
                </li>
                <li>Spectrum Region: {result.region.name}</li>
              </ul>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Spectrum Visualizer */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Electromagnetic Spectrum
            </h3>
            <div className="flex h-8 rounded-lg overflow-hidden shadow-inner">
              {spectrumRanges.map((range) => (
                <div
                  key={range.name}
                  style={{ backgroundColor: range.color, flex: 1 }}
                  title={`${range.name} (${formatNumber(range.min)} - ${formatNumber(range.max)} m)`}
                  className="transition-all duration-300 hover:flex-[1.5] cursor-pointer"
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1 px-2">
              <span>Gamma</span>
              <span>Visible</span>
              <span>Radio</span>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between wavelength, frequency, and energy</li>
              <li>Multiple unit options for each property</li>
              <li>Adjustable precision for results</li>
              <li>Download results as text file</li>
              <li>Interactive EM spectrum visualizer</li>
            </ul>
          </div>

          {/* About */}
          <div className="text-sm text-gray-600">
            <details>
              <summary className="cursor-pointer font-medium">About</summary>
              <div className="mt-2 space-y-2">
                <p>Converts electromagnetic wave properties using:</p>
                <ul className="list-disc list-inside">
                  <li>c = λf (speed of light = wavelength × frequency)</li>
                  <li>E = hf (energy = Planck constant × frequency)</li>
                </ul>
                <p>Identifies position in the EM spectrum.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectromagneticSpectrumConverter;