"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const BinaryToSignedInteger = () => {
  const [binary, setBinary] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [representation, setRepresentation] = useState("twos_complement");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [format, setFormat] = useState("none"); // New: Binary input format

  const bitLengths = [4, 8, 16, 32, 64];
  const representations = {
    twos_complement: "Two's Complement",
    ones_complement: "One's Complement",
    sign_magnitude: "Sign-Magnitude",
  };

  // Validate and normalize binary input
  const validateBinary = useCallback(
    (input) => {
      let cleanedBinary = input.replace(/[^01]/g, ""); // Remove non-binary characters
      if (format === "space") cleanedBinary = input.split(" ").join("");
      if (format === "dash") cleanedBinary = input.split("-").join("");

      if (!/^[01]+$/.test(cleanedBinary)) {
        setError("Input must contain only 0s and 1s");
        return null;
      }
      if (cleanedBinary.length > bitLength) {
        setError(`Input exceeds ${bitLength} bits`);
        return null;
      }
      return cleanedBinary;
    },
    [bitLength, format]
  );

  // Pad binary to the specified bit length
  const padBinary = (binary, length) => binary.padStart(length, "0");

  // Convert binary to signed integer
  const binaryToSignedInteger = useCallback(
    (binaryInput, rep) => {
      const cleanedBinary = validateBinary(binaryInput);
      if (!cleanedBinary) return null;

      const paddedBinary = padBinary(cleanedBinary, bitLength);
      const isNegative = paddedBinary[0] === "1";
      let decimal;

      switch (rep) {
        case "twos_complement":
          if (isNegative) {
            const inverted = paddedBinary
              .split("")
              .map((bit) => (bit === "1" ? "0" : "1"))
              .join("");
            decimal = -(parseInt(inverted, 2) + 1);
          } else {
            decimal = parseInt(paddedBinary, 2);
          }
          break;
        case "ones_complement":
          if (isNegative) {
            const inverted = paddedBinary
              .split("")
              .map((bit) => (bit === "1" ? "0" : "1"))
              .join("");
            decimal = -parseInt(inverted, 2);
          } else {
            decimal = parseInt(paddedBinary, 2);
          }
          break;
        case "sign_magnitude":
          if (isNegative) {
            decimal = -parseInt(paddedBinary.slice(1), 2);
          } else {
            decimal = parseInt(paddedBinary.slice(1), 2);
          }
          break;
        default:
          return null;
      }

      return {
        binary: paddedBinary.match(/.{1,4}/g)?.join(" ") || paddedBinary,
        decimal,
        hex:
          decimal >= 0
            ? decimal.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0")
            : `-${Math.abs(decimal)
                .toString(16)
                .toUpperCase()
                .padStart(Math.ceil(bitLength / 4), "0")}`,
        steps: isNegative
          ? getConversionSteps(paddedBinary, rep)
          : ["Positive number: Direct binary to decimal conversion"],
      };
    },
    [bitLength, validateBinary]
  );

  // Detailed conversion steps
  const getConversionSteps = (binary, rep) => {
    const formattedBinary = binary.match(/.{1,4}/g)?.join(" ") || binary;
    switch (rep) {
      case "twos_complement":
        const invertedTwos = binary
          .split("")
          .map((bit) => (bit === "1" ? "0" : "1"))
          .join("");
        const formattedInvertedTwos = invertedTwos.match(/.{1,4}/g)?.join(" ") || invertedTwos;
        const intermediateTwos = parseInt(invertedTwos, 2);
        return [
          `Original: ${formattedBinary}`,
          `Invert bits: ${formattedInvertedTwos}`,
          `Add 1: ${intermediateTwos + 1}`,
          `Negate: -${intermediateTwos + 1}`,
        ];
      case "ones_complement":
        const invertedOnes = binary
          .split("")
          .map((bit) => (bit === "1" ? "0" : "1"))
          .join("");
        const formattedInvertedOnes = invertedOnes.match(/.{1,4}/g)?.join(" ") || invertedOnes;
        return [
          `Original: ${formattedBinary}`,
          `Invert bits: ${formattedInvertedOnes}`,
          `Negate: -${parseInt(invertedOnes, 2)}`,
        ];
      case "sign_magnitude":
        const magnitude = binary.slice(1);
        const formattedMagnitude = magnitude.match(/.{1,4}/g)?.join(" ") || magnitude;
        return [
          `Original: ${formattedBinary}`,
          `Sign bit: 1 (negative)`,
          `Magnitude: ${formattedMagnitude}`,
          `Decimal: -${parseInt(magnitude, 2)}`,
        ];
      default:
        return [];
    }
  };

  // Handle conversion
  const handleConvert = (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!binary.trim()) {
      setError("Please enter a binary number");
      return;
    }

    const conversion = binaryToSignedInteger(binary, representation);
    if (conversion) setResult(conversion);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Reset all fields
  const reset = () => {
    setBinary("");
    setBitLength(8);
    setRepresentation("twos_complement");
    setResult(null);
    setError("");
    setFormat("none");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Binary to Signed Integer Converter
        </h1>

        <form onSubmit={handleConvert} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Number
              </label>
              <input
                type="text"
                value={binary}
                onChange={(e) => setBinary(e.target.value)}
                placeholder={`e.g., 1010 or 1111 0000 (max ${bitLength} bits)`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => {
                  setBitLength(parseInt(e.target.value));
                  setBinary("");
                  setResult(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bitLengths.map((length) => (
                  <option key={length} value={length}>
                    {length}-bit
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Plain (e.g., 11110000)</option>
                <option value="space">Spaces (e.g., 1111 0000)</option>
                <option value="dash">Dashes (e.g., 1111-0000)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Representation
              </label>
              <select
                value={representation}
                onChange={(e) => setRepresentation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(representations).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Result:</h2>
            <div className="space-y-6 text-sm">
              <div className="flex flex-col gap-2">
                <p className="font-medium text-gray-700">Binary (Padded):</p>
                <div className="flex items-center gap-2">
                  <p>{result.binary}</p>
                  <button
                    onClick={() => copyToClipboard(result.binary.replace(/\s/g, ""))}
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium text-gray-700">Converted Values:</p>
                <p>Signed Integer: {result.decimal}</p>
                <div className="flex items-center gap-2">
                  <p>Hex: {result.hex}</p>
                  <button
                    onClick={() => copyToClipboard(result.hex.replace("-", ""))}
                    className="p-1 text-gray-500 hover:text-blue-500"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-medium text-gray-700">Conversion Steps:</p>
                <ul className="list-disc list-inside font-mono text-xs bg-white p-2 rounded border">
                  {result.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Features & Usage */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Converts binary to signed integers</li>
            <li>Supports Two's Complement, One's Complement, Sign-Magnitude</li>
            <li>Bit lengths: 4, 8, 16, 32, 64</li>
            <li>Flexible input formats (plain, spaces, dashes)</li>
            <li>Copy binary or hex to clipboard</li>
            <li>Detailed steps for negative number conversion</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToSignedInteger;