"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const RadiationDoseConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("Gy");
  const [time, setTime] = useState("");
  const [timeUnit, setTimeUnit] = useState("s");
  const [precision, setPrecision] = useState(4);

  // Conversion factors to Gray (Gy) for absorbed dose and Sievert (Sv) for equivalent dose
  const conversionFactors = {
    // Absorbed Dose
    Gy: 1, // Gray
    rad: 0.01, // Rad
    mGy: 1e-3, // Milligray
    uGy: 1e-6, // Microgray
    // Equivalent Dose
    Sv: 1, // Sievert
    rem: 0.01, // Rem
    mSv: 1e-3, // Millisievert
    uSv: 1e-6, // Microsievert
  };

  const unitDisplayNames = {
    Gy: "Gy",
    rad: "rad",
    mGy: "mGy",
    uGy: "μGy",
    Sv: "Sv",
    rem: "rem",
    mSv: "mSv",
    uSv: "μSv",
  };

  // Time conversion factors to seconds
  const timeConversion = {
    s: 1,
    min: 60,
    h: 3600,
    d: 86400,
    w: 604800, // weeks
    y: 31536000, // years
  };

  const timeDisplayNames = {
    s: "seconds (s)",
    min: "minutes (min)",
    h: "hours (h)",
    d: "days (d)",
    w: "weeks (w)",
    y: "years (y)",
  };

  // Conversion logic
  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const isEquivalentDose = ["Sv", "rem", "mSv", "uSv"].includes(fromUnit);
      const baseUnit = isEquivalentDose ? "Sv" : "Gy";
      const valueInBase = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        const targetIsEquivalent = ["Sv", "rem", "mSv", "uSv"].includes(unit);
        if (isEquivalentDose === targetIsEquivalent) {
          acc[unit] = valueInBase / conversionFactors[unit];
        }
        return acc;
      }, {});
    },
    []
  );

  // Dose rate calculation
  const calculateDoseRate = useCallback(() => {
    if (!value || !time || isNaN(value) || isNaN(time)) return null;

    const doseInBase = value * conversionFactors[unit];
    const timeInSeconds = time * timeConversion[timeUnit];
    const isEquivalentDose = ["Sv", "rem", "mSv", "uSv"].includes(unit);

    const doseRate = doseInBase / timeInSeconds;
    return { rate: doseRate, isEquivalent: isEquivalentDose };
  }, [value, unit, time, timeUnit]);

  const results = convertValue(value, unit);
  const doseRateResult = calculateDoseRate();

  // Reset function
  const reset = () => {
    setValue("");
    setUnit("Gy");
    setTime("");
    setTimeUnit("s");
    setPrecision(4);
  };

  // Download results as text
  const downloadResults = () => {
    if (!value) return;
    const text = [
      `Radiation Dose Conversion Results:`,
      `Input: ${value} ${unitDisplayNames[unit]}`,
      time ? `Exposure Time: ${time} ${timeDisplayNames[timeUnit]}` : "",
      "",
      "Conversions:",
      ...Object.entries(results).map(
        ([u, val]) => `${unitDisplayNames[u]}: ${val.toExponential(precision)}`
      ),
      "",
      doseRateResult
        ? `Dose Rate:\n${doseRateResult.isEquivalent ? "Sv/s" : "Gy/s"}: ${doseRateResult.rate.toExponential(precision)}\n${doseRateResult.isEquivalent ? "rem/s" : "rad/s"}: ${(doseRateResult.rate / 0.01).toExponential(precision)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `radiation-dose-conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Radiation Dose Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radiation Dose
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter dose"
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
                Exposure Time (for Dose Rate)
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

          {/* Precision Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decimal Precision ({precision})
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={precision}
              onChange={(e) => setPrecision(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Results Section */}
          {value && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">
                  {["Sv", "rem", "mSv", "uSv"].includes(unit)
                    ? "Equivalent Dose"
                    : "Absorbed Dose"}{" "}
                  Conversions
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(results).map(
                    ([unit, val]) =>
                      val && (
                        <p key={unit}>
                          {unitDisplayNames[unit]}:{" "}
                          {val.toExponential(precision)}
                        </p>
                      )
                  )}
                </div>
              </div>

              {doseRateResult && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-2">Dose Rate</h2>
                  <p>
                    {doseRateResult.isEquivalent ? "Sv/s" : "Gy/s"}:{" "}
                    {doseRateResult.rate.toExponential(precision)}
                  </p>
                  <p>
                    {doseRateResult.isEquivalent ? "rem/s" : "rad/s"}:{" "}
                    {(doseRateResult.rate / 0.01).toExponential(precision)}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    Rate = Dose / Time
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {value && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadResults}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Results
              </button>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">
            Conversion References
          </h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>1 Gy = 100 rad</li>
            <li>1 Sv = 100 rem</li>
            <li>1 mGy = 10⁻³ Gy</li>
            <li>1 μSv = 10⁻⁶ Sv</li>
            <li>Absorbed Dose (Gy) ≠ Equivalent Dose (Sv)</li>
            <li>Time: 1 y = 31,536,000 s</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RadiationDoseConverter;