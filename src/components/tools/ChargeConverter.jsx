"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const ChargeConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("C");
  const [current, setCurrent] = useState("");
  const [currentUnit, setCurrentUnit] = useState("A");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("s");
  const [precision, setPrecision] = useState(4);

  // Conversion factors to Coulomb (C)
  const conversionFactors = {
    C: 1, // Coulomb
    mC: 1e-3, // Millicoulomb
    uC: 1e-6, // Microcoulomb
    nC: 1e-9, // Nanocoulomb
    pC: 1e-12, // Picocoulomb
    Ah: 3600, // Ampere-hour
    mAh: 3.6, // Milliampere-hour
    e: 1.60217662e-19, // Elementary charge
    kC: 1e3, // Kilocoulomb
    MC: 1e6, // Megacoulomb
  };

  const unitDisplayNames = {
    C: "C",
    mC: "mC",
    uC: "μC",
    nC: "nC",
    pC: "pC",
    Ah: "Ah",
    mAh: "mAh",
    e: "e",
    kC: "kC",
    MC: "MC",
  };

  // Current conversion factors to Ampere (A)
  const currentConversion = {
    A: 1,
    mA: 1e-3,
    uA: 1e-6,
    nA: 1e-9,
    kA: 1e3, // Kiloampere
  };

  const currentDisplayNames = {
    A: "A",
    mA: "mA",
    uA: "μA",
    nA: "nA",
    kA: "kA",
  };

  // Time conversion factors to seconds (s)
  const timeConversion = {
    s: 1,
    ms: 1e-3, // Milliseconds
    min: 60,
    h: 3600,
    d: 86400,
    w: 604800, // Weeks
  };

  const timeDisplayNames = {
    s: "s",
    ms: "ms",
    min: "min",
    h: "h",
    d: "d",
    w: "w",
  };

  // Convert charge between units
  const convertValue = useCallback((inputValue, fromUnit) => {
    if (!inputValue || isNaN(inputValue)) return {};
    const valueInCoulomb = inputValue * conversionFactors[fromUnit];
    return Object.keys(conversionFactors).reduce((acc, unit) => {
      acc[unit] = valueInCoulomb / conversionFactors[unit];
      return acc;
    }, {});
  }, []);

  // Calculate charge from current and time
  const calculateChargeFromCurrent = useCallback(() => {
    if (!current || !time || isNaN(current) || isNaN(time)) return null;
    const currentInAmpere = current * currentConversion[currentUnit];
    const timeInSeconds = time * timeConversion[timeUnit];
    return currentInAmpere * timeInSeconds; // Q = I × t
  }, [current, currentUnit, time, timeUnit]);

  // Reset all fields
  const reset = () => {
    setValue("");
    setUnit("C");
    setCurrent("");
    setCurrentUnit("A");
    setTime("");
    setTimeUnit("s");
    setPrecision(4);
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const results = convertValue(value, unit);
  const calculatedCharge = calculateChargeFromCurrent();

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Charge Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charge
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter charge"
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
                  Precision
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={precision}
                  onChange={(e) => setPrecision(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-sm text-gray-600">{precision} decimal places</span>
              </div>
            </div>

            {/* Current and Time Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current (Q = I × t)
                </label>
                <input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="Enter current"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={currentUnit}
                  onChange={(e) => setCurrentUnit(e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(currentConversion).map((u) => (
                    <option key={u} value={u}>
                      {currentDisplayNames[u]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
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
          </div>

          {/* Results Section */}
          {(value || calculatedCharge) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {value && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Conversions
                  </h2>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    {Object.entries(results).map(([unit, val]) => (
                      <div key={unit} className="flex items-center justify-between">
                        <span>
                          {unitDisplayNames[unit]}: {val.toExponential(precision)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(val.toExponential(precision))}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {calculatedCharge && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Calculated Charge
                  </h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <p>Coulomb (C): {calculatedCharge.toExponential(precision)}</p>
                      <button
                        onClick={() =>
                          copyToClipboard(calculatedCharge.toExponential(precision))
                        }
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaCopy />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p>
                        Elementary charges (e):{" "}
                        {(calculatedCharge / conversionFactors.e).toExponential(precision)}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            (calculatedCharge / conversionFactors.e).toExponential(precision)
                          )
                        }
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaCopy />
                      </button>
                    </div>
                    <p className="text-xs italic text-gray-500">Q = I × t</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-6 text-sm text-gray-600">
            <details className="p-4 bg-gray-50 rounded-md">
              <summary className="cursor-pointer font-medium">Conversion References</summary>
              <ul className="list-disc list-inside mt-2">
                <li>1 C = 1 A × s</li>
                <li>1 Ah = 3600 C</li>
                <li>1 mAh = 3.6 C</li>
                <li>1 e = 1.60217662 × 10⁻¹⁹ C</li>
                <li>1 kC = 1000 C</li>
                <li>1 MC = 1,000,000 C</li>
              </ul>
            </details>
          </div>

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between multiple charge units</li>
              <li>Calculate charge from current and time</li>
              <li>Adjustable precision (0-10 decimal places)</li>
              <li>Copy results to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargeConverter;