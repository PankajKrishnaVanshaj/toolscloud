"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const DecimalToTimeConverter = () => {
  const [decimalValue, setDecimalValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [unit, setUnit] = useState("hours");
  const [precision, setPrecision] = useState(2);
  const [includeSeconds, setIncludeSeconds] = useState(true);
  const [timeFormat, setTimeFormat] = useState("24h"); // 24h or 12h
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Convert decimal to time
  const convertDecimalToTime = useCallback(
    (decimal, inputUnit) => {
      if (!decimal || isNaN(decimal)) return "";
      setError("");

      let totalSeconds;
      switch (inputUnit) {
        case "hours":
          totalSeconds = decimal * 3600;
          break;
        case "minutes":
          totalSeconds = decimal * 60;
          break;
        case "seconds":
          totalSeconds = decimal;
          break;
        default:
          return "";
      }

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      if (timeFormat === "12h") {
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return includeSeconds
          ? `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${period}`
          : `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
      } else {
        return includeSeconds
          ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
          : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      }
    },
    [includeSeconds, timeFormat]
  );

  // Convert time to decimal
  const convertTimeToDecimal = useCallback(
    (time, outputUnit) => {
      if (!time) return "";
      setError("");

      const parts = time.split(/[:\s]/);
      const is12h = timeFormat === "12h";
      const hasPeriod = is12h && parts.length > (includeSeconds ? 3 : 2);

      if (
        (is12h && !hasPeriod) ||
        parts.length < 2 ||
        parts.length > (is12h ? 4 : 3)
      ) {
        setError("Invalid time format. Use HH:MM[:SS] [AM/PM] for 12h or HH:MM[:SS] for 24h");
        return "";
      }

      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = includeSeconds && parts[2] ? parseInt(parts[2], 10) : 0;
      const period = is12h ? parts[parts.length - 1].toUpperCase() : null;

      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        (includeSeconds && isNaN(seconds)) ||
        (is12h && !["AM", "PM"].includes(period))
      ) {
        setError("Invalid time format or period");
        return "";
      }

      if (hours < 0 || minutes < 0 || seconds < 0 || minutes >= 60 || seconds >= 60) {
        setError("Time components must be positive and within valid ranges (0-59 for minutes/seconds)");
        return "";
      }

      if (is12h) {
        hours = period === "PM" && hours !== 12 ? hours + 12 : hours;
        hours = period === "AM" && hours === 12 ? 0 : hours;
      }

      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      let decimal;
      switch (outputUnit) {
        case "hours":
          decimal = totalSeconds / 3600;
          break;
        case "minutes":
          decimal = totalSeconds / 60;
          break;
        case "seconds":
          decimal = totalSeconds;
          break;
        default:
          return "";
      }

      return decimal.toFixed(precision);
    },
    [includeSeconds, precision, timeFormat]
  );

  // Handlers
  const handleDecimalChange = (value) => {
    setDecimalValue(value);
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      const result = convertDecimalToTime(parsedValue, unit);
      setTimeValue(result);
      setHistory((prev) => [
        { decimal: value, time: result, unit },
        ...prev.slice(0, 4),
      ]);
    } else {
      setTimeValue("");
      setError("Please enter a valid decimal number");
    }
  };

  const handleTimeChange = (value) => {
    setTimeValue(value);
    const result = convertTimeToDecimal(value, unit);
    setDecimalValue(result);
    if (!error && result) {
      setHistory((prev) => [
        { decimal: result, time: value, unit },
        ...prev.slice(0, 4),
      ]);
    }
  };

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    if (decimalValue) {
      setTimeValue(convertDecimalToTime(parseFloat(decimalValue), newUnit));
    } else if (timeValue) {
      setDecimalValue(convertTimeToDecimal(timeValue, newUnit));
    }
  };

  const handlePrecisionChange = (newPrecision) => {
    setPrecision(newPrecision);
    if (timeValue) {
      setDecimalValue(convertTimeToDecimal(timeValue, unit));
    }
  };

  const reset = () => {
    setDecimalValue("");
    setTimeValue("");
    setUnit("hours");
    setPrecision(2);
    setIncludeSeconds(true);
    setTimeFormat("24h");
    setError("");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Decimal to Time Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Decimal Value
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={decimalValue}
                  onChange={(e) => handleDecimalChange(e.target.value)}
                  placeholder={`Enter decimal ${unit}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="any"
                />
                <select
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                  <option value="seconds">Seconds</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Time Format
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  placeholder={timeFormat === "24h" ? "e.g., 14:30" : "e.g., 02:30 PM"}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={timeFormat}
                  onChange={(e) => {
                    setTimeFormat(e.target.value);
                    if (decimalValue) {
                      setTimeValue(convertDecimalToTime(parseFloat(decimalValue), unit));
                    }
                  }}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="24h">24h</option>
                  <option value="12h">12h</option>
                </select>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Precision ({precision})
              </label>
              <input
                type="range"
                min="0"
                max="6"
                value={precision}
                onChange={(e) => handlePrecisionChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeSeconds}
                onChange={(e) => {
                  setIncludeSeconds(e.target.checked);
                  if (decimalValue) {
                    setTimeValue(convertDecimalToTime(parseFloat(decimalValue), unit));
                  }
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Include Seconds</label>
            </div>
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {(decimalValue || timeValue) && !error && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Conversion Result:</h2>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="space-y-2 flex-1">
                  <p>
                    <span className="font-medium">Decimal ({unit}):</span> {decimalValue}
                    <button
                      onClick={() => copyToClipboard(decimalValue)}
                      className="ml-2 p-1 text-gray-500 hover:text-blue-500"
                    >
                      <FaCopy />
                    </button>
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {timeValue}
                    <button
                      onClick={() => copyToClipboard(timeValue)}
                      className="ml-2 p-1 text-gray-500 hover:text-blue-500"
                    >
                      <FaCopy />
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-blue-800">Conversion History:</h2>
              <ul className="space-y-2 text-sm text-blue-700 max-h-40 overflow-y-auto">
                {history.map((entry, index) => (
                  <li key={index}>
                    {entry.decimal} ({entry.unit}) = {entry.time}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-green-600 text-sm space-y-1">
              <li>Bidirectional conversion: decimal to time and time to decimal</li>
              <li>Supports hours, minutes, seconds as units</li>
              <li>24h or 12h time format</li>
              <li>Adjustable precision (0-6 decimal places)</li>
              <li>Optional seconds in time output</li>
              <li>Copy results to clipboard</li>
              <li>Conversion history (last 5 entries)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecimalToTimeConverter;