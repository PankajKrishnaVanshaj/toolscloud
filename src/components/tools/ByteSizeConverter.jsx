"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaExchangeAlt } from "react-icons/fa";

const ByteSizeConverter = () => {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("B");
  const [toUnit, setToUnit] = useState("KB");
  const [notation, setNotation] = useState("decimal"); // 'decimal' (1000) or 'binary' (1024)
  const [precision, setPrecision] = useState(2); // Decimal places for result
  const [result, setResult] = useState("");
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const units = [
    { symbol: "B", name: "Bytes" },
    { symbol: "KB", name: notation === "decimal" ? "Kilobytes" : "Kibibytes" },
    { symbol: "MB", name: notation === "decimal" ? "Megabytes" : "Mebibytes" },
    { symbol: "GB", name: notation === "decimal" ? "Gigabytes" : "Gibibytes" },
    { symbol: "TB", name: notation === "decimal" ? "Terabytes" : "Tebibytes" },
    { symbol: "PB", name: notation === "decimal" ? "Petabytes" : "Pebibytes" },
  ];

  const convertSize = useCallback(() => {
    setError(null);
    setResult("");

    if (!value.trim() || isNaN(value) || Number(value) < 0) {
      setError("Please enter a valid positive number");
      return;
    }

    const numValue = Number(value);
    const base = notation === "decimal" ? 1000 : 1024;

    const fromIndex = units.findIndex((u) => u.symbol === fromUnit);
    const bytes = numValue * Math.pow(base, fromIndex);

    const toIndex = units.findIndex((u) => u.symbol === toUnit);
    const convertedValue = bytes / Math.pow(base, toIndex);

    const formattedResult = convertedValue.toFixed(precision);
    setResult(formattedResult);

    // Add to history
    setHistory((prev) => [
      ...prev,
      { value, fromUnit, toUnit, result: formattedResult, notation, timestamp: new Date() },
    ].slice(-5)); // Keep last 5 conversions
  }, [value, fromUnit, toUnit, notation, precision]);

  const handleSubmit = (e) => {
    e.preventDefault();
    convertSize();
  };

  const handleNotationChange = (newNotation) => {
    setNotation(newNotation);
    if (value) convertSize();
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result) {
      setValue(result);
      convertSize();
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(`${value} ${fromUnit} = ${result} ${toUnit}`);
    }
  };

  const resetForm = () => {
    setValue("");
    setFromUnit("B");
    setToUnit("KB");
    setResult("");
    setError(null);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Byte Size Converter</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter value"
                min="0"
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Unit</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {units.map((unit) => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={swapUnits}
                className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                <FaExchangeAlt />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Unit</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {units.map((unit) => (
                  <option key={unit.symbol} value={unit.symbol}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notation</label>
              <select
                value={notation}
                onChange={(e) => handleNotationChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="decimal">Decimal (1000)</option>
                <option value="binary">Binary (1024)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precision</label>
              <select
                value={precision}
                onChange={(e) => setPrecision(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[0, 1, 2, 3, 4, 5].map((p) => (
                  <option key={p} value={p}>{p} decimal places</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Result</h3>
            <div className="flex items-center justify-between">
              <p className="text-lg text-gray-800">
                {value} {fromUnit} = {result} {toUnit}
              </p>
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Copy to clipboard"
              >
                <FaCopy />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              ({notation === "decimal" ? "Base-10" : "Base-2"} notation, {precision} decimal places)
            </p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Conversion History (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index}>
                  {entry.value} {entry.fromUnit} = {entry.result} {entry.toUnit} ({entry.notation}) -{" "}
                  {entry.timestamp.toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conversion Table */}
        <div className="mt-6">
  <h3 className="font-semibold text-gray-700 mb-2">Unit Reference</h3>
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left text-gray-500 border-collapse">
      <thead className="text-xs text-gray-700 uppercase bg-gray-100">
        <tr>
          <th className="p-3">Unit</th>
          <th className="p-3">{notation === "decimal" ? "Decimal" : "Binary"} Name</th>
          <th className="p-3">Value in Bytes</th>
        </tr>
      </thead>
      <tbody>
        {units.map((unit, index) => {
          const base = notation === "decimal" ? 1000 : 1024;
          const valueInBytes = base ** index;
          return (
            <tr
              key={unit.symbol}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="p-3 font-mono">{unit.symbol}</td>
              <td className="p-3">{unit.name}</td>
              <td className="p-3 font-mono">
                {valueInBytes.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })} B
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
  <p className="mt-2 text-sm text-gray-600">
    Decimal uses multiples of 1000 (KB, MB, etc.). Binary uses multiples of 1024 (KiB, MiB, etc.).
  </p>
</div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between byte units in decimal or binary notation</li>
            <li>Customizable precision for results</li>
            <li>Swap units easily</li>
            <li>Copy results to clipboard</li>
            <li>Track conversion history</li>
            <li>Reference table for unit values</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ByteSizeConverter;