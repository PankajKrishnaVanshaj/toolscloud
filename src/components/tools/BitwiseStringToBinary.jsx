"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const BitwiseStringToBinary = () => {
  const [inputString, setInputString] = useState("");
  const [encoding, setEncoding] = useState("utf-8");
  const [operation, setOperation] = useState("none");
  const [mask, setMask] = useState("11111111");
  const [bitLength, setBitLength] = useState(8);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [outputFormat, setOutputFormat] = useState("all"); // New: binary, decimal, hex, or all
  const [isLittleEndian, setIsLittleEndian] = useState(false); // New: endianness option

  const encodings = ["utf-8", "ascii", "utf-16le", "utf-16be"];

  const stringToBinary = useCallback((str, enc) => {
    try {
      const encoder =
        enc === "utf-16le" || enc === "utf-16be"
          ? new TextEncoder(enc === "utf-16le" ? "utf-16le" : "utf-16be")
          : new TextEncoder();
      const bytes =
        enc === "ascii"
          ? new Uint8Array([...str].map((c) => c.charCodeAt(0)))
          : encoder.encode(str);
      const binary = Array.from(bytes).map((byte) =>
        byte.toString(2).padStart(bitLength, "0")
      );
      return isLittleEndian ? binary.reverse() : binary;
    } catch (err) {
      setError(`Encoding error: ${err.message}`);
      return [];
    }
  }, [bitLength, isLittleEndian]);

  const applyBitwiseOperation = (binaryArray, maskBinary) => {
    const maskNum = parseInt(maskBinary, 2);
    return binaryArray.map((binary) => {
      const num = parseInt(binary, 2);
      switch (operation) {
        case "and":
          return (num & maskNum).toString(2).padStart(bitLength, "0");
        case "or":
          return (num | maskNum).toString(2).padStart(bitLength, "0");
        case "xor":
          return (num ^ maskNum).toString(2).padStart(bitLength, "0");
        case "not":
          return (~num & ((1 << bitLength) - 1)).toString(2).padStart(bitLength, "0");
        default:
          return binary;
      }
    });
  };

  const binaryToDecimal = (binary) => parseInt(binary, 2);
  const binaryToHex = (binary) =>
    parseInt(binary, 2).toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0");

  const convertString = useCallback(() => {
    setError("");
    setResult(null);

    if (!inputString) {
      setError("Please enter a string");
      return;
    }

    if (!/^[01]+$/.test(mask) || mask.length !== bitLength) {
      setError(`Mask must be a ${bitLength}-bit binary number`);
      return;
    }

    const binaryArray = stringToBinary(inputString, encoding);
    if (binaryArray.length === 0) return;

    const processedBinary = applyBitwiseOperation(binaryArray, mask);
    const decimalArray = processedBinary.map(binaryToDecimal);
    const hexArray = processedBinary.map(binaryToHex);

    setResult({
      originalBinary: binaryArray,
      processedBinary,
      decimal: decimalArray,
      hex: hexArray,
      mask,
      fullString: processedBinary.join(""),
    });
  }, [inputString, encoding, operation, mask, bitLength, isLittleEndian]);

  const handleSubmit = (e) => {
    e.preventDefault();
    convertString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadResult = () => {
    if (!result) return;
    const content = JSON.stringify(result, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bitwise-result-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setInputString("");
    setEncoding("utf-8");
    setOperation("none");
    setMask("11111111");
    setBitLength(8);
    setResult(null);
    setError("");
    setOutputFormat("all");
    setIsLittleEndian(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Bitwise String to Binary Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input String
              </label>
              <input
                type="text"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Enter text (e.g., Hello)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encoding
              </label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {encodings.map((enc) => (
                  <option key={enc} value={enc}>
                    {enc.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => {
                  const newLength = parseInt(e.target.value);
                  setBitLength(newLength);
                  setMask("1".repeat(newLength));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitwise Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="and">AND</option>
                <option value="or">OR</option>
                <option value="xor">XOR</option>
                <option value="not">NOT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bitwise Mask ({bitLength}-bit)
              </label>
              <input
                type="text"
                value={mask}
                onChange={(e) => setMask(e.target.value)}
                placeholder={`e.g., ${"1".repeat(bitLength)}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                <option value="all">All (Binary, Dec, Hex)</option>
                <option value="binary">Binary Only</option>
                <option value="decimal">Decimal Only</option>
                <option value="hex">Hex Only</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isLittleEndian}
                  onChange={(e) => setIsLittleEndian(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Little Endian</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert & Apply Bitwise
            </button>
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
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
            <h2 className="text-lg font-semibold mb-4">Results:</h2>
            <div className="space-y-4 text-sm">
              {(outputFormat === "all" || outputFormat === "binary") && (
                <>
                  <div>
                    <p className="font-medium">Original Binary (per {bitLength}-bit):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 font-mono">
                      {result.originalBinary.map((bin, i) => (
                        <span key={i}>{bin}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">
                      After Bitwise Operation ({operation.toUpperCase()} with {mask}):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 font-mono">
                      {result.processedBinary.map((bin, i) => (
                        <span key={i}>{bin}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {(outputFormat === "all" || outputFormat === "decimal") && (
                <div>
                  <p className="font-medium">Decimal:</p>
                  <p className="font-mono">{result.decimal.join(", ")}</p>
                </div>
              )}
              {(outputFormat === "all" || outputFormat === "hex") && (
                <div>
                  <p className="font-medium">Hex:</p>
                  <p className="font-mono">{result.hex.join(" ")}</p>
                </div>
              )}
              {(outputFormat === "all" || outputFormat === "binary") && (
                <div>
                  <p className="font-medium">Full Binary String:</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono break-all">{result.fullString}</p>
                    <button
                      onClick={() => copyToClipboard(result.fullString)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={downloadResult}
              className="mt-4 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FaDownload className="mr-2" /> Download Result (JSON)
            </button>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Encodings: UTF-8, ASCII, UTF-16LE, UTF-16BE</li>
            <li>Bit lengths: 8, 16, 32 bits</li>
            <li>Bitwise operations: AND, OR, XOR, NOT</li>
            <li>Customizable mask and endianness (little/big)</li>
            <li>Output formats: Binary, Decimal, Hex, or All</li>
            <li>Copy full binary string to clipboard</li>
            <li>Download results as JSON</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BitwiseStringToBinary;