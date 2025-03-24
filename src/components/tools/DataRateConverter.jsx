"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const DataRateConverter = () => {
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("bps");
  const [fileSize, setFileSize] = useState("");
  const [fileSizeUnit, setFileSizeUnit] = useState("B");
  const [precision, setPrecision] = useState(4);
  const [base, setBase] = useState("decimal"); // Decimal (10) or Binary (2)

  // Conversion factors to bits per second (bps)
  const conversionFactors = {
    bps: 1, // bits per second
    Bps: 8, // Bytes per second
    kbps: base === "decimal" ? 1e3 : 1024, // kilobits per second
    kBps: base === "decimal" ? 8e3 : 8192, // kiloBytes per second
    Mbps: base === "decimal" ? 1e6 : 1048576, // Megabits per second
    MBps: base === "decimal" ? 8e6 : 8388608, // MegaBytes per second
    Gbps: base === "decimal" ? 1e9 : 1073741824, // Gigabits per second
    GBps: base === "decimal" ? 8e9 : 8589934592, // GigaBytes per second
    Tbps: base === "decimal" ? 1e12 : 1099511627776, // Terabits per second
    TBps: base === "decimal" ? 8e12 : 8796093022208, // TeraBytes per second
  };

  // File size conversion factors to Bytes (B)
  const sizeConversion = {
    B: 1, // Bytes
    kB: base === "decimal" ? 1e3 : 1024, // kilobytes
    MB: base === "decimal" ? 1e6 : 1048576, // Megabytes
    GB: base === "decimal" ? 1e9 : 1073741824, // Gigabytes
    TB: base === "decimal" ? 1e12 : 1099511627776, // Terabytes
  };

  const unitDisplayNames = {
    bps: "b/s",
    Bps: "B/s",
    kbps: "kb/s",
    kBps: "kB/s",
    Mbps: "Mb/s",
    MBps: "MB/s",
    Gbps: "Gb/s",
    GBps: "GB/s",
    Tbps: "Tb/s",
    TBps: "TB/s",
  };

  const convertValue = useCallback(
    (inputValue, fromUnit) => {
      if (!inputValue || isNaN(inputValue)) return {};
      const valueInBps = inputValue * conversionFactors[fromUnit];

      return Object.keys(conversionFactors).reduce((acc, unit) => {
        acc[unit] = valueInBps / conversionFactors[unit];
        return acc;
      }, {});
    },
    [base]
  );

  const calculateTransferTime = useCallback(() => {
    if (!value || !fileSize || isNaN(value) || isNaN(fileSize)) return null;

    const dataRateInBps = value * conversionFactors[unit];
    const fileSizeInBytes = fileSize * sizeConversion[fileSizeUnit];
    const fileSizeInBits = fileSizeInBytes * 8;

    return fileSizeInBits / dataRateInBps; // Time in seconds
  }, [value, unit, fileSize, fileSizeUnit, base]);

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    if (seconds < 1) return `${(seconds * 1000).toFixed(2)} ms`;
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
    if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
    return `${(seconds / 86400).toFixed(2)} days`;
  };

  const formatNumber = (num) => {
    return num >= 1e6
      ? num.toExponential(precision)
      : num.toFixed(precision).replace(/\.?0+$/, "");
  };

  const reset = () => {
    setValue("");
    setUnit("bps");
    setFileSize("");
    setFileSizeUnit("B");
    setPrecision(4);
    setBase("decimal");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const results = convertValue(value, unit);
  const transferTime = calculateTransferTime();

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Data Rate Converter
        </h1>

        {/* Input and Settings */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Data Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Rate
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Enter value"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(conversionFactors).map((u) => (
                    <option key={u} value={u}>
                      {unitDisplayNames[u]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Size (for Transfer Time)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  placeholder="Enter file size"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={fileSizeUnit}
                  onChange={(e) => setFileSizeUnit(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(sizeConversion).map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision (digits)
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
                Base
              </label>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal (10³)</option>
                <option value="binary">Binary (2¹⁰)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={reset}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Results */}
          {value && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-700 mb-2 flex items-center justify-between">
                  Conversions
                  <button
                    onClick={() =>
                      copyToClipboard(
                        Object.entries(results)
                          .map(([u, v]) => `${unitDisplayNames[u]}: ${formatNumber(v)}`)
                          .join("\n")
                      )
                    }
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaCopy />
                  </button>
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  {Object.entries(results).map(([unit, val]) => (
                    <p key={unit}>
                      {unitDisplayNames[unit]}: {formatNumber(val)}
                    </p>
                  ))}
                </div>
              </div>

              {transferTime && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h2 className="text-lg font-semibold text-blue-700 mb-2 flex items-center justify-between">
                    Transfer Time
                    <button
                      onClick={() => copyToClipboard(formatTime(transferTime))}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FaCopy />
                    </button>
                  </h2>
                  <p className="text-blue-600">{formatTime(transferTime)}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Time = File Size ({(fileSize * sizeConversion[fileSizeUnit]).toLocaleString()} B) / Data Rate (
                    {formatNumber(value * conversionFactors[unit])} b/s)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports decimal (10³) and binary (2¹⁰) units</li>
            <li>Adjustable precision for results</li>
            <li>Copy results to clipboard</li>
            <li>Transfer time calculation with file size</li>
            <li>
              Base Reference: {base === "decimal" ? "1 kB = 1000 B" : "1 KiB = 1024 B"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataRateConverter;