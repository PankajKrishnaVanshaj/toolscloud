"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const BinaryToBitArray = () => {
  const [input, setInput] = useState("");
  const [bitArray, setBitArray] = useState([]);
  const [error, setError] = useState("");
  const [inputFormat, setInputFormat] = useState("binary");
  const [displayFormat, setDisplayFormat] = useState("array");
  const [bitLength, setBitLength] = useState(8);
  const [endianness, setEndianness] = useState("big"); // Big-endian or little-endian
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation
  const validateInput = (value) => {
    switch (inputFormat) {
      case "binary":
        return /^[01\s]+$/.test(value);
      case "hex":
        return /^[0-9A-Fa-f\s]+$/.test(value);
      case "decimal":
        return /^\d+$/.test(value);
      default:
        return false;
    }
  };

  // Conversion to binary
  const convertToBinary = (value) => {
    switch (inputFormat) {
      case "binary":
        return value.replace(/\s/g, "");
      case "hex":
        return parseInt(value.replace(/\s/g, ""), 16).toString(2);
      case "decimal":
        return parseInt(value, 10).toString(2);
      default:
        return "";
    }
  };

  // Padding and endianness adjustment
  const padBinary = (binary) => {
    const padded = binary.padStart(Math.ceil(binary.length / bitLength) * bitLength, "0");
    return endianness === "little" ? padded.split("").reverse().join("") : padded;
  };

  // Process input
  const processInput = useCallback(() => {
    setError("");
    setBitArray([]);
    setIsProcessing(true);

    if (!input.trim()) {
      setError("Please enter a value");
      setIsProcessing(false);
      return;
    }

    if (!validateInput(input)) {
      setError(`Invalid ${inputFormat} input`);
      setIsProcessing(false);
      return;
    }

    const binary = convertToBinary(input);
    const paddedBinary = padBinary(binary);
    const array = paddedBinary.split("").map((bit) => parseInt(bit));
    setBitArray(array);
    setIsProcessing(false);
  }, [input, inputFormat, bitLength, endianness]);

  // Toggle bit and update input
  const toggleBit = (index) => {
    const newArray = [...bitArray];
    newArray[index] = newArray[index] === 0 ? 1 : 0;
    setBitArray(newArray);
    updateInputFromArray(newArray);
  };

  const updateInputFromArray = (array) => {
    const adjustedArray = endianness === "little" ? [...array].reverse() : array;
    const binary = adjustedArray.join("");
    switch (inputFormat) {
      case "binary":
        setInput(binary);
        break;
      case "hex":
        setInput(parseInt(binary, 2).toString(16).toUpperCase());
        break;
      case "decimal":
        setInput(parseInt(binary, 2).toString(10));
        break;
    }
  };

  // Export as JSON
  const exportArray = () => {
    const json = JSON.stringify(bitArray);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bit_array_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Reset form
  const reset = () => {
    setInput("");
    setBitArray([]);
    setError("");
    setInputFormat("binary");
    setDisplayFormat("array");
    setBitLength(8);
    setEndianness("big");
    setIsProcessing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processInput();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to Bit Array Converter
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Input</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter ${inputFormat} (e.g., ${
                  inputFormat === "binary" ? "1010" : inputFormat === "hex" ? "A" : "10"
                })`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Format</label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value="binary">Binary</option>
                <option value="hex">Hexadecimal</option>
                <option value="decimal">Decimal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value={4}>4-bit</option>
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Format
              </label>
              <select
                value={displayFormat}
                onChange={(e) => setDisplayFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value="array">Array List</option>
                <option value="grid">Grid View</option>
                <option value="binary-string">Binary String</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endianness</label>
              <select
                value={endianness}
                onChange={(e) => setEndianness(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value="big">Big-Endian</option>
                <option value="little">Little-Endian</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? "Processing..." : "Convert"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {bitArray.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Bit Array Result</h2>
              <button
                onClick={exportArray}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <FaDownload className="mr-2" /> Export JSON
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {displayFormat === "array" ? (
                <pre className="p-2 bg-gray-100 rounded overflow-auto max-h-64">
                  {JSON.stringify(bitArray, null, 2)}
                </pre>
              ) : displayFormat === "grid" ? (
                <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2">
                  {bitArray.map((bit, index) => (
                    <button
                      key={index}
                      onClick={() => toggleBit(index)}
                      className={`w-10 h-10 rounded-md flex items-center justify-center text-white font-bold transition-colors ${
                        bit === 1 ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    >
                      {bit}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-gray-100 rounded overflow-auto">
                  {bitArray.join("")}
                </div>
              )}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { label: "Binary", value: bitArray.join("") },
                  { label: "Decimal", value: parseInt(bitArray.join(""), 2) },
                  { label: "Hex", value: parseInt(bitArray.join(""), 2).toString(16).toUpperCase() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span>
                      {label}: {value}
                    </span>
                    <button
                      onClick={() => copyToClipboard(value)}
                      className="p-1 text-blue-500 hover:text-blue-700"
                      title={`Copy ${label}`}
                    >
                      <FaCopy />
                    </button>
                  </div>
                ))}
                <div className="col-span-1 sm:col-span-3">
                  Length: {bitArray.length} bits
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports Binary, Hexadecimal, and Decimal input</li>
            <li>Configurable bit length (4, 8, 16, 32)</li>
            <li>Big-endian or Little-endian support</li>
            <li>Display as Array, Grid, or Binary String</li>
            <li>Interactive bit toggling in Grid view</li>
            <li>Export to JSON and copy to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBitArray;