"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaDownload } from "react-icons/fa";

const BinaryToExcess3 = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [bitLength, setBitLength] = useState(4); // Default to 4-bit (BCD standard)
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSteps, setShowSteps] = useState(true);
  const [history, setHistory] = useState([]);
  const resultRef = React.useRef(null);

  // Validation
  const validateBinary = (binary) => /^[01]+$/.test(binary) && binary.length % bitLength === 0;

  // Conversion utilities
  const padBinary = (binary, length) => binary.padStart(length, "0");
  const binaryToDecimal = (binary) => parseInt(binary, 2);
  const decimalToBinary = (decimal, length) => decimal.toString(2).padStart(length, "0");

  const convertToExcess3 = useCallback(() => {
    setError("");
    setResult(null);

    if (!binaryInput.trim()) {
      setError("Please enter a binary number");
      return;
    }

    const cleanedInput = binaryInput.replace(/\s/g, "");
    if (!validateBinary(cleanedInput)) {
      setError(
        `Invalid binary input: Must be a multiple of ${bitLength} bits and contain only 0s and 1s`
      );
      return;
    }

    const chunks = cleanedInput.match(new RegExp(`.{1,${bitLength}}`, "g"));
    const decimals = chunks.map((chunk) => binaryToDecimal(chunk));
    const maxValue = bitLength === 4 ? 9 : bitLength === 8 ? 255 : 65535;

    if (decimals.some((d) => d > maxValue)) {
      setError(`Binary input exceeds valid range (0-${maxValue} per ${bitLength}-bit group)`);
      return;
    }

    const excess3Decimals = decimals.map((d) => d + 3);
    const excess3Binary = excess3Decimals.map((d) => decimalToBinary(d, bitLength));
    const excess3String = excess3Binary.join("");

    const newResult = {
      binary: cleanedInput,
      paddedBinary: padBinary(cleanedInput, Math.ceil(cleanedInput.length / bitLength) * bitLength),
      decimals,
      excess3Decimals,
      excess3Binary,
      excess3String,
    };

    setResult(newResult);
    setHistory((prev) => [newResult, ...prev.slice(0, 9)]); // Keep last 10 conversions
  }, [binaryInput, bitLength]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Download as text file
  const downloadResult = () => {
    if (!result) return;
    const textContent = `
Binary Input: ${result.paddedBinary}
Decimal: ${result.decimals.join(" ")}
Excess-3 Binary: ${result.excess3String}
Excess-3 Decimal: ${result.excess3Decimals.join(" ")}
    `.trim();
    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `excess3-conversion-${Date.now()}.txt`;
    link.click();
  };

  // Reset
  const reset = () => {
    setBinaryInput("");
    setResult(null);
    setError("");
    setShowSteps(true);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to Excess-3 Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input (BCD)
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder={`e.g., ${bitLength === 4 ? "0101" : "00000101"}`}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length per Digit
              </label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4-bit (0-9)</option>
                <option value={8}>8-bit (0-255)</option>
                <option value={16}>16-bit (0-65535)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={convertToExcess3}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert to Excess-3
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showSteps}
              onChange={(e) => setShowSteps(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Show Conversion Steps</span>
          </label>
        </div>

        {/* Error Section */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div ref={resultRef} className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Conversion Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="font-medium text-gray-700">Input:</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm">
                    Binary: {(result.paddedBinary.match(/.{1,4}/g) || [result.paddedBinary]).join(" ")}
                  </p>
                  <button
                    onClick={() => copyToClipboard(result.paddedBinary)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                    title="Copy Binary"
                  >
                    <FaCopy />
                  </button>
                </div>
                <p className="font-mono text-sm">Decimal: {result.decimals.join(" ")}</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-gray-700">Excess-3 Output:</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm">
                    Binary: {(result.excess3String.match(/.{1,4}/g) || [result.excess3String]).join(" ")}
                  </p>
                  <button
                    onClick={() => copyToClipboard(result.excess3String)}
                    className="p-1 text-gray-500 hover:text-blue-600"
                    title="Copy Excess-3"
                  >
                    <FaCopy />
                  </button>
                </div>
                <p className="font-mono text-sm">Decimal: {result.excess3Decimals.join(" ")}</p>
              </div>
            </div>
            {showSteps && (
              <div className="mt-4">
                <p className="font-medium text-gray-700">Step-by-Step Conversion:</p>
                <div className="font-mono text-xs mt-2 space-y-4">
                  {result.binary.match(new RegExp(`.{1,${bitLength}}`, "g")).map((chunk, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <p>{padBinary(chunk, bitLength)} (BCD: {result.decimals[index]})</p>
                      <p>+ {decimalToBinary(3, bitLength)} (+3)</p>
                      <p className="border-t border-gray-300">{"-".repeat(bitLength)}</p>
                      <p>{result.excess3Binary[index]} (Excess-3: {result.excess3Decimals[index]})</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={downloadResult}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FaDownload /> Download Result
            </button>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-700 mb-2">Conversion History</h3>
            <ul className="space-y-2 text-sm text-blue-600 max-h-48 overflow-y-auto">
              {history.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>
                    Binary: {item.paddedBinary} → Excess-3: {item.excess3String}
                  </span>
                  <button
                    onClick={() => setBinaryInput(item.binary)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features & Usage */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <details>
            <summary className="cursor-pointer font-semibold text-gray-700">
              Features & Usage
            </summary>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-600 space-y-1">
              <li>Converts Binary (BCD) to Excess-3 code</li>
              <li>Supports 4-bit (0-9), 8-bit (0-255), or 16-bit (0-65535) groups</li>
              <li>Step-by-step conversion process (toggleable)</li>
              <li>Copy results to clipboard</li>
              <li>Download results as text file</li>
              <li>Conversion history (last 10 entries)</li>
              <li>Example (4-bit): 0101 (5) → 1000 (8 in Excess-3)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BinaryToExcess3;