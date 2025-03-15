"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

const BinaryBitCounter = () => {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState("binary");
  const [bitLength, setBitLength] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [signedMode, setSignedMode] = useState(false); // Signed vs Unsigned
  const [endianness, setEndianness] = useState("big"); // Big vs Little Endian

  const validateInput = (value, type) => {
    const maxValue = signedMode
      ? (2n ** BigInt(bitLength - 1)) - 1n
      : (2n ** BigInt(bitLength)) - 1n;
    const minValue = signedMode ? -(2n ** BigInt(bitLength - 1)) : 0n;

    switch (type) {
      case "binary":
        return /^[01]+$/.test(value);
      case "decimal":
        const num = BigInt(value);
        return /^\-?\d+$/.test(value) && num >= minValue && num <= maxValue;
      case "hex":
        const hexNum = BigInt(`0x${value}`);
        return /^[0-9A-Fa-f]+$/.test(value) && hexNum >= minValue && hexNum <= maxValue;
      default:
        return false;
    }
  };

  const convertToBinary = (value, type) => {
    switch (type) {
      case "binary":
        return value;
      case "decimal":
        let num = BigInt(value);
        if (signedMode && num < 0) {
          num = (2n ** BigInt(bitLength)) + num; // Two's complement
        }
        return num.toString(2);
      case "hex":
        let hexNum = BigInt(`0x${value}`);
        if (signedMode && hexNum < 0) {
          hexNum = (2n ** BigInt(bitLength)) + hexNum;
        }
        return hexNum.toString(2);
      default:
        return "";
    }
  };

  const padBinary = (binary, length) => {
    return binary.padStart(length, "0");
  };

  const reverseEndianness = (binary) => {
    if (endianness === "little") {
      return binary.match(/.{1,8}/g)?.reverse().join("") || binary;
    }
    return binary;
  };

  const countBits = (binary) => {
    return binary.split("").reduce((count, bit) => count + (bit === "1" ? 1 : 0), 0);
  };

  const analyzeBits = useCallback(() => {
    setError("");
    setResult(null);

    if (!input.trim()) {
      setError("Please enter a value");
      return;
    }

    if (!validateInput(input, inputType)) {
      setError(`Invalid ${inputType} input for ${signedMode ? "signed" : "unsigned"} mode`);
      return;
    }

    let binary = convertToBinary(input, inputType);
    binary = padBinary(binary, bitLength);
    const adjustedBinary = reverseEndianness(binary);
    const bitCount = countBits(adjustedBinary);
    const decimal = BigInt(`0b${adjustedBinary}`).toString();
    const hex = BigInt(`0b${adjustedBinary}`)
      .toString(16)
      .toUpperCase()
      .padStart(Math.ceil(bitLength / 4), "0");
    const signedDecimal = signedMode
      ? BigInt(`0b${adjustedBinary}`) >= 2n ** BigInt(bitLength - 1)
        ? BigInt(`0b${adjustedBinary}`) - (2n ** BigInt(bitLength))
        : BigInt(`0b${adjustedBinary}`)
      : null;

    const bitPositions = adjustedBinary
      .split("")
      .reverse()
      .map((bit, index) => ({ position: index, value: bit }))
      .filter((bit) => bit.value === "1");

    setResult({
      binary: adjustedBinary,
      decimal,
      hex,
      signedDecimal,
      bitCount,
      bitPositions,
    });
  }, [input, inputType, bitLength, signedMode, endianness]);

  const handleSubmit = (e) => {
    e.preventDefault();
    analyzeBits();
  };

  const reset = () => {
    setInput("");
    setInputType("binary");
    setBitLength(8);
    setSignedMode(false);
    setEndianness("big");
    setResult(null);
    setError("");
  };

  const downloadResult = () => {
    if (!result) return;
    const text = [
      `Binary Bit Counter Result:`,
      `Input: ${input} (${inputType})`,
      `Bit Length: ${bitLength}`,
      `Signed Mode: ${signedMode ? "Yes" : "No"}`,
      `Endianness: ${endianness === "big" ? "Big" : "Little"}`,
      `\nRepresentations:`,
      `Binary: ${result.binary}`,
      `Decimal: ${result.decimal}`,
      signedMode ? `Signed Decimal: ${result.signedDecimal}` : "",
      `Hex: ${result.hex}`,
      `\nBit Count: ${result.bitCount}`,
      `\nBit Positions (right-to-left, 0-based):`,
      result.bitPositions.map((bit) => `Position ${bit.position}`).join("\n"),
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bit-counter-result-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary Bit Counter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Value
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter ${inputType} value`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
              <select
                value={inputType}
                onChange={(e) => {
                  setInputType(e.target.value);
                  setInput("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
                <option value={64}>64-bit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number Mode</label>
              <select
                value={signedMode ? "signed" : "unsigned"}
                onChange={(e) => setSignedMode(e.target.value === "signed")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unsigned">Unsigned</option>
                <option value="signed">Signed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endianness</label>
              <select
                value={endianness}
                onChange={(e) => setEndianness(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="big">Big Endian</option>
                <option value="little">Little Endian</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Count Bits
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={downloadResult}
              disabled={!result}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
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
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Representations:</p>
                <p>Binary: <span className="font-mono">{result.binary}</span></p>
                <p>Decimal: <span className="font-mono">{result.decimal}</span></p>
                {signedMode && (
                  <p>Signed Decimal: <span className="font-mono">{result.signedDecimal}</span></p>
                )}
                <p>Hex: <span className="font-mono">{result.hex}</span></p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Bit Analysis:</p>
                <p>Total Set Bits (1s): {result.bitCount}</p>
                <p>Bit Positions (right-to-left, 0-based):</p>
                {result.bitPositions.length > 0 ? (
                  <ul className="list-disc list-inside ml-4 max-h-32 overflow-y-auto">
                    {result.bitPositions.map((bit) => (
                      <li key={bit.position}>Position {bit.position}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">No set bits (all 0s)</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <p className="font-medium text-gray-700">Visualization:</p>
              <div className="font-mono text-xs bg-white p-2 rounded border">
                <p>{result.binary.match(/.{1,8}/g)?.join(" ") || result.binary}</p>
                <p>
                  {result.binary
                    .match(/.{1,8}/g)
                    ?.join(" ")
                    .split("")
                    .map((bit) => (bit === "1" ? "↑" : bit === " " ? " " : " "))
                    .join("") || result.binary.split("").map((bit) => (bit === "1" ? "↑" : " ")).join("")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports binary, decimal, and hexadecimal input</li>
            <li>Configurable bit length (8, 16, 32, 64)</li>
            <li>Signed and unsigned number modes</li>
            <li>Big and Little Endian support</li>
            <li>Bit count and position analysis</li>
            <li>Download results as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryBitCounter;