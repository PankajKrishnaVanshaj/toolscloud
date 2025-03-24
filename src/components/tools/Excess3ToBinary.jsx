"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaCopy } from "react-icons/fa";

const Excess3ToBinary = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [bitLength, setBitLength] = useState(4); // Default to 4-bit
  const [showSteps, setShowSteps] = useState(false);
  const [inputMode, setInputMode] = useState("excess3"); // "excess3", "binary", "decimal"
  const [history, setHistory] = useState([]);

  // Validation functions
  const validateExcess3 = (input) => {
    const groups = input.match(new RegExp(`.{1,${bitLength}}`, "g")) || [];
    return groups.every((group) => {
      if (group.length !== bitLength) return false;
      const decimal = parseInt(group, 2);
      return /^[01]+$/.test(group) && decimal >= 3 && decimal <= (bitLength === 4 ? 12 : 252);
    });
  };

  const validateBinary = (input) => /^[01]+$/.test(input);
  const validateDecimal = (input) => /^\d+$/.test(input);

  // Conversion functions
  const excess3ToBinary = (excess3) => {
    const groups = excess3.match(new RegExp(`.{1,${bitLength}}`, "g")) || [];
    const binaryGroups = groups.map((group) => {
      const decimal = parseInt(group, 2) - 3;
      return decimal.toString(2).padStart(bitLength, "0");
    });
    return binaryGroups.join("");
  };

  const binaryToExcess3 = (binary) => {
    const groups = binary.match(new RegExp(`.{1,${bitLength}}`, "g")) || [
      binary.padStart(bitLength, "0"),
    ];
    return groups.map((group) => {
      const decimal = parseInt(group, 2) + 3;
      return decimal.toString(2).padStart(bitLength, "0");
    }).join("");
  };

  const binaryToDecimal = (binary) => parseInt(binary, 2);
  const decimalToBinary = (decimal) => Number(decimal).toString(2);

  // Main conversion handler
  const handleConvert = useCallback(() => {
    setError("");
    setResult(null);

    if (!input.trim()) {
      setError("Please enter a value");
      return;
    }

    const cleanedInput = input.replace(/\s/g, "");
    let binaryResult, excess3Result, decimalResult, steps = [];

    if (inputMode === "excess3") {
      if (!validateExcess3(cleanedInput)) {
        setError(
          `Invalid Excess-3 code. Each ${bitLength}-bit group must represent 0-${
            bitLength === 4 ? 9 : 249
          }`
        );
        return;
      }
      binaryResult = excess3ToBinary(cleanedInput);
      decimalResult = binaryToDecimal(binaryResult);
      excess3Result = cleanedInput;

      const groups = cleanedInput.match(new RegExp(`.{1,${bitLength}}`, "g"));
      steps = groups.map((group) => {
        const excess3Decimal = parseInt(group, 2);
        const actualDecimal = excess3Decimal - 3;
        const binary = actualDecimal.toString(2).padStart(bitLength, "0");
        return `${group} (Excess-3: ${excess3Decimal}) - 3 = ${actualDecimal} (Binary: ${binary})`;
      });
    } else if (inputMode === "binary") {
      if (!validateBinary(cleanedInput)) {
        setError("Invalid binary input. Use only 0s and 1s");
        return;
      }
      binaryResult = cleanedInput;
      decimalResult = binaryToDecimal(binaryResult);
      excess3Result = binaryToExcess3(binaryResult);

      const groups = binaryResult.match(new RegExp(`.{1,${bitLength}}`, "g")) || [
        binaryResult.padStart(bitLength, "0"),
      ];
      steps = groups.map((group) => {
        const decimal = parseInt(group, 2);
        const excess3Decimal = decimal + 3;
        const excess3 = excess3Decimal.toString(2).padStart(bitLength, "0");
        return `${group} (Decimal: ${decimal}) + 3 = ${excess3Decimal} (Excess-3: ${excess3})`;
      });
    } else {
      // Decimal input
      if (!validateDecimal(cleanedInput)) {
        setError("Invalid decimal input. Use only numbers");
        return;
      }
      decimalResult = parseInt(cleanedInput);
      binaryResult = decimalToBinary(decimalResult);
      excess3Result = binaryToExcess3(binaryResult);

      const binaryGroups =
        binaryResult.match(new RegExp(`.{1,${bitLength}}`, "g")) || [
          binaryResult.padStart(bitLength, "0"),
        ];
      steps = binaryGroups.map((group) => {
        const decimal = parseInt(group, 2);
        const excess3Decimal = decimal + 3;
        const excess3 = excess3Decimal.toString(2).padStart(bitLength, "0");
        return `${group} (Decimal: ${decimal}) + 3 = ${excess3Decimal} (Excess-3: ${excess3})`;
      });
    }

    const newResult = {
      binary: binaryResult,
      excess3: excess3Result,
      decimal: decimalResult,
      steps,
    };
    setResult(newResult);
    setHistory((prev) => [newResult, ...prev.slice(0, 9)]); // Keep last 10 conversions
  }, [input, inputMode, bitLength]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Reset
  const reset = () => {
    setInput("");
    setResult(null);
    setError("");
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Excess-3 ↔ Binary Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Mode
              </label>
              <select
                value={inputMode}
                onChange={(e) => setInputMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="excess3">Excess-3</option>
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length per Digit
              </label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={4}>4-bit (0-9)</option>
                <option value={8}>8-bit (0-249)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {inputMode === "excess3"
                ? "Excess-3 Code"
                : inputMode === "binary"
                ? "Binary Number"
                : "Decimal Number"}
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                inputMode === "excess3"
                  ? "e.g., 01100110"
                  : inputMode === "binary"
                  ? "e.g., 00110011"
                  : "e.g., 35"
              }
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
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
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Excess-3", value: result.excess3 },
                { label: "Binary", value: result.binary },
                { label: "Decimal", value: result.decimal },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1">
                  <p className="font-medium text-gray-700">{label}:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm break-all">
                      {label === "Decimal"
                        ? value
                        : (value.match(new RegExp(`.{1,${bitLength}}`, "g")) || [value]).join(" ")}
                    </p>
                    <button
                      onClick={() => copyToClipboard(value)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  {label !== "Decimal" && (
                    <p className="text-xs text-gray-500">
                      Hex: {parseInt(value, 2).toString(16).toUpperCase()}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {showSteps && (
              <div className="mt-4">
                <p className="font-medium text-gray-700">Conversion Steps:</p>
                <ul className="list-disc list-inside font-mono text-sm mt-2 space-y-1">
                  {result.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
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
                    Excess-3: {item.excess3} → Binary: {item.binary} → Decimal: {item.decimal}
                  </span>
                  <button
                    onClick={() => setInput(item[inputMode])}
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
              <li>Convert between Excess-3, Binary, and Decimal</li>
              <li>Supports 4-bit (0-9) and 8-bit (0-249) lengths</li>
              <li>Step-by-step conversion breakdown</li>
              <li>Conversion history (last 10 entries)</li>
              <li>Copy results to clipboard</li>
              <li>Example (4-bit): 0110 (Excess-3) = 0011 (Binary) = 3 (Decimal)</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default Excess3ToBinary;