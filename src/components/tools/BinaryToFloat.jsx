"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy } from "react-icons/fa";

const BinaryToFloat = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [precision, setPrecision] = useState("32");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [inputFormat, setInputFormat] = useState("raw"); // raw or formatted
  const [showSteps, setShowSteps] = useState(false);

  const validateBinary = (binary) => /^[01]+$/.test(binary);

  const binaryToFloat = useCallback((binary, isDouble = false) => {
    const bitLength = isDouble ? 64 : 32;
    let cleanBinary = binary.replace(/\s|\|/g, ""); // Remove spaces or separators if formatted

    if (cleanBinary.length !== bitLength) {
      setError(`Input must be exactly ${bitLength} bits for ${isDouble ? "double" : "single"} precision`);
      return null;
    }

    if (!validateBinary(cleanBinary)) {
      setError("Invalid binary input: must contain only 0s and 1s");
      return null;
    }

    const signBit = cleanBinary[0];
    const exponentBits = isDouble ? cleanBinary.slice(1, 12) : cleanBinary.slice(1, 9);
    const mantissaBits = isDouble ? cleanBinary.slice(12) : cleanBinary.slice(9);

    const sign = signBit === "0" ? 1 : -1;
    const exponentLength = isDouble ? 11 : 8;
    const bias = isDouble ? 1023 : 127;
    const exponent = parseInt(exponentBits, 2) - bias;
    const mantissaLength = isDouble ? 52 : 23;
    let mantissa = 0;

    for (let i = 0; i < mantissaBits.length; i++) {
      if (mantissaBits[i] === "1") {
        mantissa += Math.pow(2, -(i + 1));
      }
    }

    const implicitOne = exponentBits === "0".repeat(exponentLength) ? 0 : 1;
    const mantissaValue = implicitOne + mantissa;

    if (exponentBits === "1".repeat(exponentLength)) {
      return {
        special: mantissaBits === "0".repeat(mantissaLength) ? (sign === 1 ? "Infinity" : "-Infinity") : "NaN",
      };
    }
    if (exponentBits === "0".repeat(exponentLength) && mantissaBits === "0".repeat(mantissaLength)) {
      return { decimal: 0, sign, exponent: 0, mantissa: 0 };
    }

    const decimal = sign * mantissaValue * Math.pow(2, exponent);
    return { decimal, sign, exponent, mantissa: mantissaValue };
  }, []);

  const handleConvert = () => {
    setError("");
    setResult(null);

    if (!binaryInput) {
      setError("Please enter a binary number");
      return;
    }

    const isDouble = precision === "64";
    const parsedResult = binaryToFloat(binaryInput, isDouble);
    if (parsedResult) {
      setResult({
        binary: binaryInput.replace(/\s|\|/g, ""),
        formattedBinary: formatBinaryDisplay(binaryInput.replace(/\s|\|/g, ""), isDouble),
        ...parsedResult,
      });
    }
  };

  const formatBinaryDisplay = (binary, isDouble) => {
    const sign = binary[0];
    const exponentBits = isDouble ? binary.slice(1, 12) : binary.slice(1, 9);
    const mantissaBits = isDouble ? binary.slice(12) : binary.slice(9);
    return `${sign} | ${exponentBits} | ${mantissaBits}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const reset = () => {
    setBinaryInput("");
    setPrecision("32");
    setResult(null);
    setError("");
    setInputFormat("raw");
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Float Converter (IEEE 754)
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <input
                type="text"
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder={
                  inputFormat === "raw"
                    ? `Enter ${precision}-bit binary (e.g., ${precision === "32" ? "01000000110000000000000000000000" : "0100000000111000000000000000000000000000000000000000000000000000"})`
                    : `e.g., 0 | ${precision === "32" ? "10000001" : "10000000011"} | ...`
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precision
                </label>
                <select
                  value={precision}
                  onChange={(e) => setPrecision(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="32">32-bit (Single)</option>
                  <option value="64">64-bit (Double)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Format
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="raw">Raw Binary</option>
                  <option value="formatted">Formatted (Sign | Exp | Mantissa)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
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

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Result:</h2>
              <div className="space-y-4 text-sm">
                {result.special ? (
                  <p className="font-medium text-lg">Value: {result.special}</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        Decimal Value: {result.decimal.toPrecision(10)}
                      </p>
                      <button
                        onClick={() => copyToClipboard(result.decimal.toPrecision(10))}
                        className="p-1 text-gray-500 hover:text-blue-600"
                      >
                        <FaCopy />
                      </button>
                    </div>
                    <div>
                      <p className="font-medium">Components:</p>
                      <p>Sign: {result.sign === 1 ? "+" : "-"}</p>
                      <p>
                        Exponent: {result.exponent} (biased:{" "}
                        {result.exponent + (precision === "64" ? 1023 : 127)})
                      </p>
                      <p>Mantissa: {result.mantissa.toFixed(10)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Binary Breakdown:</p>
                      <p className="font-mono">{result.formattedBinary}</p>
                      <p className="text-gray-500 text-xs">
                        (Sign | Exponent | Mantissa)
                      </p>
                    </div>
                    <p>
                      Formula: {result.sign} × {result.mantissa.toFixed(3)} × 2
                      <sup>{result.exponent}</sup>
                    </p>
                  </>
                )}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showSteps}
                      onChange={(e) => setShowSteps(e.target.checked)}
                      className="accent-blue-500"
                    />
                    <span className="text-sm">Show Calculation Steps</span>
                  </label>
                  {showSteps && !result.special && (
                    <div className="mt-2 p-2 bg-white rounded-md border text-xs">
                      <p>1. Sign Bit: {result.binary[0]} → {result.sign === 1 ? "Positive" : "Negative"}</p>
                      <p>
                        2. Exponent: {result.binary.slice(1, precision === "64" ? 12 : 9)} →{" "}
                        {parseInt(result.binary.slice(1, precision === "64" ? 12 : 9), 2)} -{" "}
                        {precision === "64" ? 1023 : 127} = {result.exponent}
                      </p>
                      <p>
                        3. Mantissa: 1.{result.binary.slice(precision === "64" ? 12 : 9)} →{" "}
                        {result.mantissa.toFixed(10)}
                      </p>
                      <p>
                        4. Final: {result.sign} × {result.mantissa.toFixed(3)} × 2
                        <sup>{result.exponent}</sup> = {result.decimal.toPrecision(10)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Features & Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Supports 32-bit (single) and 64-bit (double) IEEE 754 formats</li>
              <li>Accepts raw or formatted binary input</li>
              <li>Shows detailed breakdown and calculation steps</li>
              <li>Handles special cases (Infinity, NaN, Zero)</li>
              <li>Copy decimal result to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryToFloat;