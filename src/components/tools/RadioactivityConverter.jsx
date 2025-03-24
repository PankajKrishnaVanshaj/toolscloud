"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaInfoCircle } from "react-icons/fa";

const RadioactivityConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("Bq");
  const [halfLife, setHalfLife] = useState("");
  const [halfLifeUnit, setHalfLifeUnit] = useState("s");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("s");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Conversion factors to Becquerel (Bq)
  const conversionFactors = {
    Bq: 1,
    Ci: 3.7e10, // Curie
    dps: 1, // Disintegrations per second
    dpm: 1 / 60, // Disintegrations per minute
    mCi: 3.7e7, // Millicurie
    μCi: 3.7e4, // Microcurie
    nCi: 3.7e1, // Nanocurie
    pCi: 3.7e-2, // Picocurie
    GBq: 1e9, // Gigabecquerel
    MBq: 1e6, // Megabecquerel
    kBq: 1e3, // Kilobecquerel
    TBq: 1e12, // Terabecquerel
  };

  // Time conversion factors to seconds
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    w: 604800, // Weeks
    m: 2592000, // Months (30 days)
    y: 31536000, // Years
  };

  // Convert activity to all units
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInBq = inputValue * conversionFactors[fromUnit];
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInBq / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  // Calculate decay
  const calculateDecay = useCallback(() => {
    if (!value || !halfLife || !time || isNaN(value) || isNaN(halfLife) || isNaN(time)) {
      return null;
    }

    const halfLifeInSeconds = halfLife * timeConversion[halfLifeUnit];
    const timeInSeconds = time * timeConversion[timeUnit];
    const initialActivity = value * conversionFactors[unit];
    const decayConstant = Math.LN2 / halfLifeInSeconds;
    const finalActivity = initialActivity * Math.exp(-decayConstant * timeInSeconds);

    return {
      finalActivity,
      percentageRemaining: (finalActivity / initialActivity) * 100,
      timeToDecay: halfLifeInSeconds * Math.log(initialActivity / finalActivity) / Math.LN2,
    };
  }, [value, unit, halfLife, halfLifeUnit, time, timeUnit]);

  // Reset all inputs
  const reset = () => {
    setValue("");
    setUnit("Bq");
    setHalfLife("");
    setHalfLifeUnit("s");
    setTime("");
    setTimeUnit("s");
  };

  // Download results as text
  const downloadResults = () => {
    const results = convertValue(value, unit);
    const decayData = calculateDecay();
    let text = `Radioactivity Conversion Results\n\nInitial Activity: ${value} ${unit}\n\nConversions:\n`;
    for (const [u, v] of Object.entries(results)) {
      text += `${u}: ${v.toExponential(4)}\n`;
    }
    if (decayData) {
      text += `\nDecay Results (After ${time} ${timeUnit}):\n`;
      text += `Final Activity: ${decayData.finalActivity.toExponential(4)} Bq\n`;
      text += `Remaining: ${decayData.percentageRemaining.toFixed(2)}%\n`;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `radioactivity-results-${Date.now()}.txt`;
    link.click();
  };

  const results = convertValue(value, unit);
  const decayData = calculateDecay();

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Radioactivity Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
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
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Half-life</label>
              <input
                type="number"
                value={halfLife}
                onChange={(e) => setHalfLife(e.target.value)}
                placeholder="Enter half-life"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={halfLifeUnit}
                onChange={(e) => setHalfLifeUnit(e.target.value)}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(timeConversion).map(([u, v]) => (
                  <option key={u} value={u}>
                    {u} ({u === "s" ? "seconds" : u === "min" ? "minutes" : u === "h" ? "hours" : u === "d" ? "days" : u === "w" ? "weeks" : u === "m" ? "months" : "years"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time and Advanced Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Elapsed
              </label>
              <div className="flex gap-2">
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
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(timeConversion).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                {showAdvanced ? "Hide" : "Show"} Advanced
              </button>
            </div>
          </div>

          {/* Results */}
          {value && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Conversions</h2>
                <div className="grid grid-cols-2 gap-2 text-sm max-h-48 overflow-y-auto">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unit}: {val.toExponential(4)}
                    </p>
                  ))}
                </div>
              </div>

              {decayData && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Decay Results</h2>
                  <p>Bq: {decayData.finalActivity.toExponential(4)}</p>
                  <p>Ci: {(decayData.finalActivity / conversionFactors.Ci).toExponential(4)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Remaining: {decayData.percentageRemaining.toFixed(2)}%
                  </p>
                  {showAdvanced && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        Time to reach current activity: {(decayData.timeToDecay / timeConversion[timeUnit]).toFixed(2)} {timeUnit}
                      </p>
                    </div>
                  )}
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
              disabled={!value}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2 flex items-center">
              <FaInfoCircle className="mr-2" /> Features & Info
            </h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between 12 radioactivity units</li>
              <li>Calculate decay with customizable half-life and time</li>
              <li>Advanced mode for additional decay insights</li>
              <li>Download results as a text file</li>
            </ul>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-blue-600">Conversion References</summary>
              <ul className="list-disc list-inside text-sm text-blue-600 mt-2">
                <li>1 Ci = 3.7 × 10¹⁰ Bq</li>
                <li>1 Bq = 1 dps = 60 dpm</li>
                <li>1 TBq = 10¹² Bq</li>
                <li>1 GBq = 10⁹ Bq</li>
                <li>1 MBq = 10⁶ Bq</li>
                <li>1 kBq = 10³ Bq</li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioactivityConverter;