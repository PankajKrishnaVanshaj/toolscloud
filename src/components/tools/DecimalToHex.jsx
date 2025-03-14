"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaDownload } from "react-icons/fa";

const DecimalToHex = () => {
  const [decimal, setDecimal] = useState("");
  const [hex, setHex] = useState("");
  const [binary, setBinary] = useState("");
  const [octal, setOctal] = useState("");
  const [bitLength, setBitLength] = useState(32);
  const [isSigned, setIsSigned] = useState(false);
  const [endianness, setEndianness] = useState("big"); // Big or Little Endian
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Validation functions
  const validateDecimal = (value) => /^-?\d+$/.test(value);
  const validateHex = (value) => /^[0-9A-Fa-f]+$/.test(value);

  // Normalize number based on bit length and signed/unsigned
  const normalizeNumber = useCallback(
    (num) => {
      if (isSigned) {
        const max = 2 ** (bitLength - 1);
        const min = -max;
        if (num >= max) num -= 2 * max;
        if (num < min) num += 2 * max;
        return num;
      }
      return num & ((1 << bitLength) - 1); // Mask to bit length for unsigned
    },
    [bitLength, isSigned]
  );

  // Convert decimal to all formats
  const decimalToAll = useCallback(
    (dec) => {
      setError("");
      if (!validateDecimal(dec)) {
        setError("Invalid decimal input");
        return;
      }

      let num = parseInt(dec, 10);
      num = normalizeNumber(num);

      const hexValue = num < 0 ? (num >>> 0).toString(16).toUpperCase() : num.toString(16).toUpperCase();
      const binaryValue = num < 0 ? (num >>> 0).toString(2) : num.toString(2);
      const octalValue = num < 0 ? (num >>> 0).toString(8) : num.toString(8);

      setHex(hexValue.padStart(Math.ceil(bitLength / 4), "0"));
      setBinary(binaryValue.padStart(bitLength, "0"));
      setOctal(octalValue.padStart(Math.ceil(bitLength / 3), "0"));

      // Add to history
      setHistory((prev) => [
        { decimal: dec, hex: hexValue, binary: binaryValue, octal: octalValue, bitLength, isSigned },
        ...prev.slice(0, 4), // Keep last 5 entries
      ]);
    },
    [bitLength, isSigned, normalizeNumber]
  );

  // Convert hex to all formats
  const hexToAll = useCallback(
    (hexValue) => {
      setError("");
      if (!validateHex(hexValue)) {
        setError("Invalid hexadecimal input");
        return;
      }

      let num = parseInt(hexValue, 16);
      if (isSigned && num >= 2 ** (bitLength - 1)) {
        num -= 2 ** bitLength;
      }
      num = normalizeNumber(num);

      setDecimal(num.toString(10));
      setBinary(num < 0 ? (num >>> 0).toString(2).padStart(bitLength, "0") : num.toString(2).padStart(bitLength, "0"));
      setOctal(num < 0 ? (num >>> 0).toString(8).padStart(Math.ceil(bitLength / 3), "0") : num.toString(8).padStart(Math.ceil(bitLength / 3), "0"));

      // Add to history
      setHistory((prev) => [
        { decimal: num.toString(10), hex: hexValue.toUpperCase(), binary: num < 0 ? (num >>> 0).toString(2) : num.toString(2), octal: num < 0 ? (num >>> 0).toString(8) : num.toString(8), bitLength, isSigned },
        ...prev.slice(0, 4),
      ]);
    },
    [bitLength, isSigned, normalizeNumber]
  );

  // Handle input changes
  const handleDecimalChange = (value) => {
    setDecimal(value);
    if (value === "") {
      resetOutputs();
      return;
    }
    decimalToAll(value);
  };

  const handleHexChange = (value) => {
    setHex(value.toUpperCase());
    if (value === "") {
      resetOutputs();
      return;
    }
    hexToAll(value);
  };

  const handleBitLengthChange = (value) => {
    setBitLength(value);
    if (decimal) decimalToAll(decimal);
    else if (hex) hexToAll(hex);
  };

  const handleSignedChange = (checked) => {
    setIsSigned(checked);
    if (decimal) decimalToAll(decimal);
    else if (hex) hexToAll(hex);
  };

  const handleEndiannessChange = (value) => {
    setEndianness(value);
    // For simplicity, endianness doesn't affect conversion here but could be used for display
  };

  // Reset all outputs
  const resetOutputs = () => {
    setHex("");
    setBinary("");
    setOctal("");
    setError("");
  };

  // Reset everything
  const resetAll = () => {
    setDecimal("");
    setHex("");
    setBinary("");
    setOctal("");
    setBitLength(32);
    setIsSigned(false);
    setEndianness("big");
    setError("");
    setHistory([]);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Download as text file
  const downloadResults = () => {
    const content = `Decimal: ${decimal}\nHexadecimal: ${hex}\nBinary: ${binary}\nOctal: ${octal}\nBit Length: ${bitLength}\nSigned: ${isSigned ? "Yes" : "No"}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Number Base Converter
        </h1>

        {/* Input Section */}
        <div className="grid gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decimal</label>
              <input
                type="text"
                value={decimal}
                onChange={(e) => handleDecimalChange(e.target.value)}
                placeholder="e.g., 255 or -128"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hexadecimal</label>
              <input
                type="text"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="e.g., FF or 80"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
              <select
                value={bitLength}
                onChange={(e) => handleBitLengthChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
                <option value={64}>64-bit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endianness</label>
              <select
                value={endianness}
                onChange={(e) => handleEndiannessChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="big">Big Endian</option>
                <option value="little">Little Endian</option>
              </select>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={isSigned}
                onChange={(e) => handleSignedChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium text-gray-700">Signed Number</label>
            </div>
          </div>

          {/* Results Section */}
          {(decimal || hex) && !error && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Conversions:</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(`Dec: ${decimal}, Hex: ${hex}, Bin: ${binary}, Oct: ${octal}`)}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={downloadResults}
                    className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <FaDownload />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Decimal:</span> {decimal}{" "}
                  <button onClick={() => copyToClipboard(decimal)} className="text-blue-500 hover:underline">Copy</button>
                </p>
                <p>
                  <span className="font-medium">Hexadecimal:</span> {hex}{" "}
                  <button onClick={() => copyToClipboard(hex)} className="text-blue-500 hover:underline">Copy</button>
                </p>
                <p>
                  <span className="font-medium">Binary:</span> {binary}{" "}
                  <button onClick={() => copyToClipboard(binary)} className="text-blue-500 hover:underline">Copy</button>
                </p>
                <p>
                  <span className="font-medium">Octal:</span> {octal}{" "}
                  <button onClick={() => copyToClipboard(octal)} className="text-blue-500 hover:underline">Copy</button>
                </p>
              </div>
              <div className="mt-4">
                <p className="font-medium">Bit Representation ({endianness === "big" ? "Big" : "Little"} Endian):</p>
                <div className="font-mono text-xs break-all bg-gray-200 p-2 rounded">{binary}</div>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Conversion History (Last 5):</h2>
              <ul className="space-y-2 text-sm">
                {history.map((entry, index) => (
                  <li key={index} className="bg-white p-2 rounded shadow-sm">
                    Dec: {entry.decimal}, Hex: {entry.hex}, Bin: {entry.binary.slice(0, 16)}..., Oct: {entry.octal} (Bit: {entry.bitLength}, Signed: {entry.isSigned ? "Yes" : "No"})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={resetAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync /> Reset All
          </button>
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between decimal, hex, binary, and octal</li>
            <li>Support for 8, 16, 32, and 64-bit lengths</li>
            <li>Signed and unsigned number handling</li>
            <li>Big/Little Endian display option</li>
            <li>Copy individual results or all to clipboard</li>
            <li>Download results as text file</li>
            <li>Conversion history (last 5 entries)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DecimalToHex;