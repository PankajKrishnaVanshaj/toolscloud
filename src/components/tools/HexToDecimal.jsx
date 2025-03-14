"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const HexToDecimal = () => {
  const [hexInput, setHexInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [prefix, setPrefix] = useState("none"); // 'none', '0x', '#'
  const [outputFormat, setOutputFormat] = useState("all"); // 'all', 'decimal', 'binary', 'octal', 'hex'
  const [history, setHistory] = useState([]);

  // Validation and conversion functions
  const validateHex = useCallback(
    (hex) => {
      const cleanHex =
        prefix === "0x" ? hex.replace(/^0x/i, "") : prefix === "#" ? hex.replace(/^#/, "") : hex;
      const regex = caseSensitive ? /^[0-9A-F]+$/ : /^[0-9A-Fa-f]+$/;
      return regex.test(cleanHex);
    },
    [caseSensitive, prefix]
  );

  const hexToDecimal = (hex) => {
    const cleanHex =
      prefix === "0x" ? hex.replace(/^0x/i, "") : prefix === "#" ? hex.replace(/^#/, "") : hex;
    return parseInt(cleanHex, 16);
  };

  const decimalToHex = (decimal) => {
    const hex = decimal.toString(16).toUpperCase();
    return prefix === "0x" ? `0x${hex}` : prefix === "#" ? `#${hex}` : hex;
  };

  const decimalToBinary = (decimal) => decimal.toString(2);
  const decimalToOctal = (decimal) => decimal.toString(8);

  // Handle conversion
  const handleConvert = useCallback(
    (e) => {
      e.preventDefault();
      setError("");
      setResult(null);

      if (!hexInput.trim()) {
        setError("Please enter a hexadecimal number");
        return;
      }

      const hexValues = hexInput.split(/[\s,]+/).filter((val) => val);
      const results = [];

      for (const hex of hexValues) {
        if (!validateHex(hex)) {
          setError(`Invalid hexadecimal input: ${hex}`);
          return;
        }

        const decimal = hexToDecimal(hex);
        results.push({
          hex: hex,
          decimal: decimal,
          binary: decimalToBinary(decimal),
          octal: decimalToOctal(decimal),
        });
      }

      setResult(results);
      setHistory((prev) => [...prev, { input: hexInput, results }].slice(-10)); // Keep last 10
    },
    [hexInput, prefix, validateHex]
  );

  // Handle input change
  const handleInputChange = (value) => {
    setHexInput(value);
    setError("");
    setResult(null);
  };

  // Reset form
  const reset = () => {
    setHexInput("");
    setResult(null);
    setError("");
    setCaseSensitive(false);
    setPrefix("none");
    setOutputFormat("all");
  };

  // Copy result to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Hex to Decimal Converter
        </h1>

        <form onSubmit={handleConvert} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hexadecimal Input
              </label>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={
                  prefix === "0x"
                    ? "e.g., 0x1A, 0xFF"
                    : prefix === "#"
                    ? "e.g., #1A, #FF"
                    : "e.g., 1A, FF"
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple values with spaces or commas
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefix Style
                </label>
                <select
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">None (e.g., 1A)</option>
                  <option value="0x">0x (e.g., 0x1A)</option>
                  <option value="#"># (e.g., #1A)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Formats</option>
                  <option value="decimal">Decimal Only</option>
                  <option value="binary">Binary Only</option>
                  <option value="octal">Octal Only</option>
                  <option value="hex">Hex Only</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Case Sensitive
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Results:</h2>
            <div className="space-y-4 text-sm">
              {result.map((res, index) => (
                <div
                  key={index}
                  className="border-b pb-2 last:border-b-0 flex flex-col gap-1"
                >
                  {(outputFormat === "all" || outputFormat === "hex") && (
                    <p>
                      <span className="font-medium">Hex:</span> {res.hex}{" "}
                      <FaCopy
                        className="inline ml-2 cursor-pointer text-gray-500 hover:text-blue-500"
                        onClick={() => copyToClipboard(res.hex)}
                      />
                    </p>
                  )}
                  {(outputFormat === "all" || outputFormat === "decimal") && (
                    <p>
                      <span className="font-medium">Decimal:</span>{" "}
                      {res.decimal.toLocaleString()}{" "}
                      <FaCopy
                        className="inline ml-2 cursor-pointer text-gray-500 hover:text-blue-500"
                        onClick={() => copyToClipboard(res.decimal.toString())}
                      />
                    </p>
                  )}
                  {(outputFormat === "all" || outputFormat === "binary") && (
                    <p>
                      <span className="font-medium">Binary:</span> {res.binary}{" "}
                      <FaCopy
                        className="inline ml-2 cursor-pointer text-gray-500 hover:text-blue-500"
                        onClick={() => copyToClipboard(res.binary)}
                      />
                    </p>
                  )}
                  {(outputFormat === "all" || outputFormat === "octal") && (
                    <p>
                      <span className="font-medium">Octal:</span> {res.octal}{" "}
                      <FaCopy
                        className="inline ml-2 cursor-pointer text-gray-500 hover:text-blue-500"
                        onClick={() => copyToClipboard(res.octal)}
                      />
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-blue-800">Conversion History:</h2>
            <ul className="space-y-2 text-sm text-blue-700 max-h-40 overflow-y-auto">
              {history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:text-blue-900"
                    onClick={() => {
                      setHexInput(entry.input);
                      setResult(entry.results);
                      setError("");
                    }}
                  >
                    {entry.input} → {entry.results.map((r) => r.decimal).join(", ")}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-lg font-semibold mb-2 text-green-800">Features:</h2>
          <ul className="list-disc list-inside text-green-700 text-sm space-y-1">
            <li>Convert hex to decimal, binary, octal</li>
            <li>Multiple input support (space/comma-separated)</li>
            <li>Customizable prefix (none, 0x, #)</li>
            <li>Case sensitivity option</li>
            <li>Selective output format</li>
            <li>Copy results to clipboard</li>
            <li>Conversion history (last 10)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HexToDecimal;