"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const EnergyConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("J");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("s");
  const [precision, setPrecision] = useState(4);
  const [displayMode, setDisplayMode] = useState("exponential");

  // Conversion factors to Joules (J)
  const conversionFactors = {
    J: 1,              // Joule
    kJ: 1e3,          // Kilojoule
    MJ: 1e6,          // Megajoule
    GJ: 1e9,          // Gigajoule
    Wh: 3600,         // Watt-hour
    kWh: 3.6e6,       // Kilowatt-hour
    MWh: 3.6e9,       // Megawatt-hour
    GWh: 3.6e12,      // Gigawatt-hour (new)
    eV: 1.60218e-19,  // Electronvolt
    keV: 1.60218e-16, // Kiloelectronvolt
    MeV: 1.60218e-13, // Megaelectronvolt
    GeV: 1.60218e-10, // Gigaelectronvolt (new)
    cal: 4.184,       // Calorie
    kcal: 4184,       // Kilocalorie
    Mcal: 4.184e6,    // Megacalorie (new)
    erg: 1e-7,        // Erg
    Btu: 1055.06,     // British Thermal Unit (new)
  };

  const unitDisplayNames = {
    J: "J",
    kJ: "kJ",
    MJ: "MJ",
    GJ: "GJ",
    Wh: "Wh",
    kWh: "kWh",
    MWh: "MWh",
    GWh: "GWh",
    eV: "eV",
    keV: "keV",
    MeV: "MeV",
    GeV: "GeV",
    cal: "cal",
    kcal: "kcal",
    Mcal: "Mcal",
    erg: "erg",
    Btu: "Btu",
  };

  // Time conversion factors to seconds (s)
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    w: 604800,     // Week (new)
    y: 31536000,   // Year
    decade: 3.1536e8, // Decade (new)
  };

  const timeDisplayNames = {
    s: "s",
    min: "min",
    h: "h",
    d: "d",
    w: "w",
    y: "y",
    decade: "decade",
  };

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInJoules = inputValue * conversionFactors[fromUnit];

    return Object.keys(conversionFactors).reduce((acc, unit) => {
      const converted = valueInJoules / conversionFactors[unit];
      acc[unit] =
        displayMode === "exponential"
          ? converted.toExponential(precision)
          : converted.toFixed(precision);
      return acc;
    }, {});
  }, [precision, displayMode]);

  const calculatePower = useCallback(() => {
    if (!value || !time || isNaN(value) || isNaN(time)) return null;

    const energyInJoules = value * conversionFactors[unit];
    const timeInSeconds = time * timeConversion[timeUnit];
    const powerInWatts = energyInJoules / timeInSeconds;

    return {
      W: displayMode === "exponential" ? powerInWatts.toExponential(precision) : powerInWatts.toFixed(precision),
      kW: displayMode === "exponential" ? (powerInWatts / 1e3).toExponential(precision) : (powerInWatts / 1e3).toFixed(precision),
      MW: displayMode === "exponential" ? (powerInWatts / 1e6).toExponential(precision) : (powerInWatts / 1e6).toFixed(precision),
      GW: displayMode === "exponential" ? (powerInWatts / 1e9).toExponential(precision) : (powerInWatts / 1e9).toFixed(precision),
    };
  }, [value, unit, time, timeUnit, precision, displayMode]);

  const results = convertValue(value, unit);
  const power = calculatePower();

  const reset = () => {
    setValue("");
    setUnit("J");
    setTime("");
    setTimeUnit("s");
    setPrecision(4);
    setDisplayMode("exponential");
  };

  const downloadResults = () => {
    const text = [
      `Energy Conversion Results:`,
      `Input: ${value} ${unitDisplayNames[unit]}`,
      ...Object.entries(results).map(([u, val]) => `${unitDisplayNames[u]}: ${val}`),
      power
        ? [
            `\nPower Calculation (Energy / Time):`,
            `Input Time: ${time} ${timeDisplayNames[timeUnit]}`,
            `Watts (W): ${power.W}`,
            `Kilowatts (kW): ${power.kW}`,
            `Megawatts (MW): ${power.MW}`,
            `Gigawatts (GW): ${power.GW}`,
          ]
        : [],
    ]
      .flat()
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `energy-conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Energy Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Energy</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter energy value"
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
                Time (for Power)
              </label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Enter time"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(timeConversion).map((u) => (
                  <option key={u} value={u}>
                    {timeDisplayNames[u]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (decimal places)
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
                Display Mode
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="exponential">Exponential</option>
                <option value="decimal">Decimal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {value && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Energy Conversions</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(results).map(([unit, val]) => (
                  <p key={unit}>
                    {unitDisplayNames[unit]}: {val}
                  </p>
                ))}
              </div>
            </div>

            {power && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Power (E/t)</h2>
                <p>Watts (W): {power.W}</p>
                <p>Kilowatts (kW): {power.kW}</p>
                <p>Megawatts (MW): {power.MW}</p>
                <p>Gigawatts (GW): {power.GW}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadResults}
            disabled={!value}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & References</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports multiple energy units (J, kWh, eV, cal, Btu, etc.)</li>
            <li>Power calculation in W, kW, MW, GW</li>
            <li>Customizable precision and display mode</li>
            <li>Download results as text file</li>
            <li>References: 1 Wh = 3600 J, 1 cal = 4.184 J, 1 Btu = 1055.06 J</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnergyConverter;