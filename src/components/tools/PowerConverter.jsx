"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const PowerConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("W");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("s");
  const [precision, setPrecision] = useState(4);
  const [displayMode, setDisplayMode] = useState("exponential");

  // Conversion factors to Watts (W)
  const conversionFactors = {
    W: 1, // Watt
    kW: 1e3, // Kilowatt
    MW: 1e6, // Megawatt
    GW: 1e9, // Gigawatt
    mW: 1e-3, // Milliwatt
    hp: 745.7, // Horsepower (mechanical)
    hp_e: 746, // Horsepower (electric)
    erg_s: 1e-7, // Erg per second
    ft_lb_s: 1.3558179483314004, // Foot-pound per second
    kcal_h: 1.162222222222222, // Kilocalorie per hour
    Btu_h: 0.29307107, // British Thermal Unit per hour
  };

  const unitDisplayNames = {
    W: "W",
    kW: "kW",
    MW: "MW",
    GW: "GW",
    mW: "mW",
    hp: "hp (mech)",
    hp_e: "hp (elec)",
    erg_s: "erg/s",
    ft_lb_s: "ft·lb/s",
    kcal_h: "kcal/h",
    Btu_h: "Btu/h",
  };

  // Time conversion factors to seconds (s)
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    wk: 604800, // Week
    y: 31536000, // Year (non-leap)
  };

  const timeDisplayNames = {
    s: "seconds (s)",
    min: "minutes (min)",
    h: "hours (h)",
    d: "days (d)",
    wk: "weeks (wk)",
    y: "years (y)",
  };

  // Energy conversion factors from Joules (J)
  const energyConversions = {
    J: 1,
    kJ: 1e-3,
    MJ: 1e-6,
    kWh: 1 / 3.6e6,
    cal: 1 / 4.184,
    kcal: 1 / 4184,
    Btu: 1 / 1055.06,
  };

  const energyDisplayNames = {
    J: "Joules (J)",
    kJ: "Kilojoules (kJ)",
    MJ: "Megajoules (MJ)",
    kWh: "Kilowatt-hours (kWh)",
    cal: "Calories (cal)",
    kcal: "Kilocalories (kcal)",
    Btu: "British Thermal Units (Btu)",
  };

  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInWatts = inputValue * conversionFactors[fromUnit];
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      const val = valueInWatts / conversionFactors[unit];
      acc[unit] =
        displayMode === "exponential"
          ? val.toExponential(precision)
          : val.toFixed(precision);
      return acc;
    }, {});
  }, [precision, displayMode]);

  const calculateEnergy = useCallback(() => {
    if (!value || !time || isNaN(value) || isNaN(time)) return null;
    const powerInWatts = value * conversionFactors[unit];
    const timeInSeconds = time * timeConversion[timeUnit];
    const energyInJoules = powerInWatts * timeInSeconds;
    return Object.keys(energyConversions).reduce((acc, unit) => {
      const val = energyInJoules * energyConversions[unit];
      acc[unit] =
        displayMode === "exponential"
          ? val.toExponential(precision)
          : val.toFixed(precision);
      return acc;
    }, {});
  }, [value, unit, time, timeUnit, precision, displayMode]);

  const results = convertValue(value, unit);
  const energyResults = calculateEnergy();

  const reset = () => {
    setValue("");
    setUnit("W");
    setTime("");
    setTimeUnit("s");
    setPrecision(4);
    setDisplayMode("exponential");
  };

  const downloadResults = () => {
    const text = [
      `Power Conversion Results:`,
      ...Object.entries(results).map(
        ([unit, val]) => `${unitDisplayNames[unit]}: ${val}`
      ),
      energyResults && `\nEnergy Results:`,
      ...(energyResults
        ? Object.entries(energyResults).map(
            ([unit, val]) => `${energyDisplayNames[unit]}: ${val}`
          )
        : []),
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `power_conversion_${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Power & Energy Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Power Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Power
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter power value"
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

            {/* Time Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time (for Energy)
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

            {/* Display Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Options
              </label>
              <select
                value={displayMode}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="exponential">Exponential</option>
                <option value="decimal">Decimal</option>
              </select>
              <div className="mt-2">
                <label className="text-sm text-gray-600">
                  Precision: {precision}
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
              disabled={!value}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h2 className="text-lg font-semibold mb-2">Power Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm max-h-64 overflow-y-auto">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {val}
                    </p>
                  ))}
                </div>
              </div>

              {energyResults && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold mb-2">Energy Output</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm max-h-64 overflow-y-auto">
                    {Object.entries(energyResults).map(([unit, val]) => (
                      <p key={unit}>
                        {energyDisplayNames[unit]}: {val}
                      </p>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">E = P × t</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <details open className="text-sm text-blue-600">
            <summary className="cursor-pointer font-semibold text-blue-700 mb-2">
              Conversion References
            </summary>
            <ul className="list-disc list-inside space-y-1">
              <li>1 hp (mech) = 745.7 W</li>
              <li>1 hp (elec) = 746 W</li>
              <li>1 kW = 10³ W</li>
              <li>1 MW = 10⁶ W</li>
              <li>1 GW = 10⁹ W</li>
              <li>1 Btu/h = 0.29307107 W</li>
              <li>1 kWh = 3.6 × 10⁶ J</li>
              <li>1 cal = 4.184 J</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PowerConverter;