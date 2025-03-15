"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const BinaryToHexadecimalDump = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [chunkSize, setChunkSize] = useState(8); // Default to 8-bit chunks
  const [error, setError] = useState("");
  const [hexDump, setHexDump] = useState(null);
  const [caseFormat, setCaseFormat] = useState("upper"); // Hex case: upper/lower
  const [offsetBase, setOffsetBase] = useState("hex"); // Offset: hex/decimal
  const [showBinary, setShowBinary] = useState(false); // Show binary alongside hex

  // Validation and conversion functions
  const validateBinary = (binary) => /^[01\s]*$/.test(binary);

  const binaryToBytes = useCallback((binary) => {
    const cleanedBinary = binary.replace(/\s+/g, "");
    if (cleanedBinary.length % 8 !== 0) {
      setError("Binary input length must be a multiple of 8 bits (1 byte)");
      return null;
    }
    const bytes = [];
    for (let i = 0; i < cleanedBinary.length; i += 8) {
      bytes.push(parseInt(cleanedBinary.slice(i, i + 8), 2));
    }
    return bytes;
  }, []);

  const generateHexDump = useCallback(() => {
    setError("");
    setHexDump(null);

    if (!binaryInput.trim()) {
      setError("Please enter a binary string");
      return;
    }

    if (!validateBinary(binaryInput)) {
      setError("Invalid binary input: only 0s, 1s, and spaces are allowed");
      return;
    }

    const bytes = binaryToBytes(binaryInput);
    if (!bytes) return;

    const lines = [];
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      const offset =
        offsetBase === "hex"
          ? i.toString(16).padStart(8, "0")
          : i.toString(10).padStart(8, "0");
      const hexValues = chunk
        .map((byte) =>
          byte
            .toString(16)
            .padStart(2, "0")
            [caseFormat === "upper" ? "toUpperCase" : "toLowerCase"]()
        )
        .join(" ");
      const asciiValues = chunk
        .map((byte) => {
          const char = String.fromCharCode(byte);
          return char.match(/[ -~]/) ? char : ".";
        })
        .join("");
      const binaryValues = chunk
        .map((byte) => byte.toString(2).padStart(8, "0"))
        .join(" ");

      lines.push({ offset, hex: hexValues, ascii: asciiValues, binary: binaryValues });
    }

    setHexDump(lines);
  }, [binaryInput, chunkSize, caseFormat, offsetBase]);

  // Download as text file
  const downloadDump = () => {
    if (!hexDump) return;
    const text = hexDump
      .map((line) =>
        showBinary
          ? `${line.offset}  ${line.hex}  ${line.binary}  |${line.ascii}|`
          : `${line.offset}  ${line.hex}  |${line.ascii}|`
      )
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `hex-dump-${Date.now()}.txt`;
    link.click();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!hexDump) return;
    const text = hexDump
      .map((line) =>
        showBinary
          ? `${line.offset}  ${line.hex}  ${line.binary}  |${line.ascii}|`
          : `${line.offset}  ${line.hex}  |${line.ascii}|`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    alert("Hex dump copied to clipboard!");
  };

  // Reset form
  const reset = () => {
    setBinaryInput("");
    setChunkSize(8);
    setCaseFormat("upper");
    setOffsetBase("hex");
    setShowBinary(false);
    setError("");
    setHexDump(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    generateHexDump();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Hexadecimal Dump
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input (space-separated bytes optional)
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder="e.g., 01001000 01100101 01101100 01101100 01101111"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 font-mono text-sm"
              />
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bytes per Line
                </label>
                <select
                  value={chunkSize}
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={4}>4 bytes</option>
                  <option value={8}>8 bytes</option>
                  <option value={16}>16 bytes</option>
                  <option value={32}>32 bytes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hex Case
                </label>
                <select
                  value={caseFormat}
                  onChange={(e) => setCaseFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upper">Uppercase (e.g., A-F)</option>
                  <option value="lower">Lowercase (e.g., a-f)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Offset Format
                </label>
                <select
                  value={offsetBase}
                  onChange={(e) => setOffsetBase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hex">Hexadecimal</option>
                  <option value="dec">Decimal</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showBinary}
                    onChange={(e) => setShowBinary(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Show Binary</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Generate Hex Dump
              </button>
              <button
                type="button"
                onClick={downloadDump}
                disabled={!hexDump}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                disabled={!hexDump}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Copy
              </button>
              <button
                type="button"
                onClick={reset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {hexDump && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">Hexadecimal Dump:</h2>
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left p-2">Offset</th>
                  <th className="text-left p-2">Hexadecimal</th>
                  {showBinary && <th className="text-left p-2">Binary</th>}
                  <th className="text-left p-2">ASCII</th>
                </tr>
              </thead>
              <tbody>
                {hexDump.map((line, index) => (
                  <tr key={index} className="border-t border-gray-200 hover:bg-gray-100">
                    <td className="p-2">{line.offset}</td>
                    <td className="p-2">{line.hex}</td>
                    {showBinary && <td className="p-2">{line.binary}</td>}
                    <td className="p-2">{line.ascii}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Features & Usage */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert binary to hex dump with ASCII representation</li>
            <li>Customizable: bytes per line, hex case, offset format</li>
            <li>Option to show binary values alongside hex</li>
            <li>Download as text file or copy to clipboard</li>
            <li>Example: "01001000 01100101" → "48 65" (ASCII: "He")</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToHexadecimalDump;