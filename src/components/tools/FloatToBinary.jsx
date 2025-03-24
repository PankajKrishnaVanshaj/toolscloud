"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaInfoCircle } from "react-icons/fa";

const FloatToBinary = () => {
  const [floatInput, setFloatInput] = useState("");
  const [precision, setPrecision] = useState("32");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [binaryFormat, setBinaryFormat] = useState("grouped"); // grouped or raw

  const floatToIEEE754 = (number, bits) => {
    if (isNaN(number) || !isFinite(number)) {
      setError("Input must be a finite number");
      return null;
    }

    const isNegative = number < 0;
    const absNumber = Math.abs(number);

    // Special cases
    const exponentBits = bits === 32 ? 8 : 11;
    const mantissaBits = bits === 32 ? 23 : 52;
    const bias = bits === 32 ? 127 : 1023;

    if (absNumber === 0) {
      return {
        sign: "0",
        exponent: "0".repeat(exponentBits),
        mantissa: "0".repeat(mantissaBits),
      };
    }
    if (!isFinite(absNumber)) {
      return {
        sign: isNegative ? "1" : "0",
        exponent: "1".repeat(exponentBits),
        mantissa: "0".repeat(mantissaBits),
      };
    }
    if (isNaN(absNumber)) {
      return {
        sign: "0",
        exponent: "1".repeat(exponentBits),
        mantissa: "1" + "0".repeat(mantissaBits - 1),
      };
    }

    // Normal conversion
    let exponent = Math.floor(Math.log2(absNumber));
    let mantissa = absNumber / Math.pow(2, exponent) - 1;
    exponent += bias;

    // Handle subnormal numbers
    if (exponent <= 0) {
      mantissa = absNumber / Math.pow(2, 1 - bias);
      exponent = 0;
    } else if (exponent >= Math.pow(2, exponentBits)) {
      return {
        sign: isNegative ? "1" : "0",
        exponent: "1".repeat(exponentBits),
        mantissa: "0".repeat(mantissaBits),
      };
    }

    const exponentBinary = exponent.toString(2).padStart(exponentBits, "0");
    let mantissaBinary = "";
    for (let i = 0; i < mantissaBits; i++) {
      mantissa *= 2;
      mantissaBinary += Math.floor(mantissa);
      mantissa = mantissa % 1;
    }

    return {
      sign: isNegative ? "1" : "0",
      exponent: exponentBinary,
      mantissa: mantissaBinary,
    };
  };

  const handleConvert = useCallback(() => {
    setError("");
    setResult(null);

    const number = parseFloat(floatInput);
    if (isNaN(number)) {
      setError("Please enter a valid floating-point number");
      return;
    }

    const bits = parseInt(precision);
    const ieee = floatToIEEE754(number, bits);
    if (!ieee) return;

    const binary = `${ieee.sign}${ieee.exponent}${ieee.mantissa}`;
    const hex = parseInt(binary, 2).toString(16).toUpperCase().padStart(bits / 4, "0");
    const groupedBinary =
      binaryFormat === "grouped"
        ? `${ieee.sign} ${ieee.exponent} ${ieee.mantissa.match(/.{1,4}/g).join(" ")}`
        : binary;

    setResult({
      binary,
      groupedBinary,
      hex,
      sign: ieee.sign,
      exponent: ieee.exponent,
      mantissa: ieee.mantissa,
      decimal: number,
      unbiasedExponent: parseInt(ieee.exponent, 2) - (bits === 32 ? 127 : 1023),
    });
  }, [floatInput, precision, binaryFormat]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const reset = () => {
    setFloatInput("");
    setPrecision("32");
    setResult(null);
    setError("");
    setShowDetails(true);
    setBinaryFormat("grouped");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Float to IEEE 754 Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floating-Point Number
              </label>
              <input
                type="number"
                value={floatInput}
                onChange={(e) => setFloatInput(e.target.value)}
                placeholder="e.g., 3.14"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="any"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precision
              </label>
              <select
                value={precision}
                onChange={(e) => setPrecision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="32">32-bit (Single Precision)</option>
                <option value="64">64-bit (Double Precision)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Format
              </label>
              <select
                value={binaryFormat}
                onChange={(e) => setBinaryFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="grouped">Grouped (Readable)</option>
                <option value="raw">Raw (Continuous)</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleConvert}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Convert
              </button>
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                IEEE 754 Representation
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-mono">
                <div>
                  <p className="font-medium">Full Binary:</p>
                  <div className="flex items-center gap-2">
                    <span className="break-all">
                      {binaryFormat === "grouped" ? result.groupedBinary : result.binary}
                    </span>
                    <button
                      onClick={() => copyToClipboard(result.binary)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Hexadecimal:</p>
                  <div className="flex items-center gap-2">
                    <span>{result.hex}</span>
                    <button
                      onClick={() => copyToClipboard(result.hex)}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Sign Bit:</p>
                  <p>
                    {result.sign} ({result.decimal < 0 ? "Negative" : "Positive"})
                  </p>
                </div>
                <div>
                  <p className="font-medium">Exponent:</p>
                  <p>
                    {result.exponent} (biased: {parseInt(result.exponent, 2)}, unbiased:{" "}
                    {result.unbiasedExponent})
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-medium">Mantissa:</p>
                  <p>
                    {result.mantissa.slice(0, 20)}
                    {result.mantissa.length > 20 ? "..." : ""}
                  </p>
                </div>
                {showDetails && (
                  <div className="sm:col-span-2">
                    <p className="font-medium">Details:</p>
                    <p>Decimal Input: {result.decimal}</p>
                    <p>Precision: {precision}-bit</p>
                    <p>
                      Bit Breakdown: 1 sign, {precision === "32" ? 8 : 11} exponent,{" "}
                      {precision === "32" ? 23 : 52} mantissa
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 text-blue-600 hover:underline flex items-center gap-1"
              >
                <FaInfoCircle /> {showDetails ? "Hide" : "Show"} Details
              </button>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & IEEE 754 Info</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Converts floats to IEEE 754 binary (32-bit or 64-bit)</li>
              <li>Option for grouped or raw binary output</li>
              <li>Shows hexadecimal representation</li>
              <li>Copy results to clipboard</li>
              <li>Handles special cases: 0, Infinity, NaN, subnormals</li>
              <li>32-bit: 1 sign, 8 exponent, 23 mantissa (bias 127)</li>
              <li>64-bit: 1 sign, 11 exponent, 52 mantissa (bias 1023)</li>
              <li>Example: 3.14 (32-bit) ≈ 0 10000010 10010001111010111000010</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatToBinary;