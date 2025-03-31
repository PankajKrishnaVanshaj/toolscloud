"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaSync, FaCopy, FaDownload } from "react-icons/fa";
import { saveAs } from "file-saver";

const BinaryBitwiseInverter = () => {
  const [input, setInput] = useState("");
  const [inputFormat, setInputFormat] = useState("binary");
  const [bitLength, setBitLength] = useState(8);
  const [output, setOutput] = useState({ binary: "", decimal: "", hex: "" });
  const [error, setError] = useState("");
  const [signed, setSigned] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const bitLengths = [8, 16, 32, 64];

  const validateAndConvertInput = useCallback((value, format) => {
    try {
      let num;
      switch (format) {
        case "binary":
          if (!/^[01]+$/.test(value)) throw new Error("Invalid binary input");
          num = BigInt(`0b${value}`);
          break;
        case "decimal":
          if (!/^-?\d+$/.test(value)) throw new Error("Invalid decimal input");
          num = BigInt(value);
          break;
        case "hex":
          if (!/^-?[0-9A-Fa-f]+$/.test(value)) throw new Error("Invalid hex input");
          num = BigInt(`0x${value}`);
          break;
        default:
          throw new Error("Invalid input format");
      }
      return num;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const invertBits = useCallback(
    (num) => {
      if (num === null) return null;
      const mask = (1n << BigInt(bitLength)) - 1n;
      let bigNum = BigInt(num) & mask;
      if (signed && bigNum >= (1n << BigInt(bitLength - 1))) {
        bigNum = bigNum - (1n << BigInt(bitLength)); // Convert to signed
      }
      const inverted = ~bigNum & mask;
      return signed && inverted >= (1n << BigInt(bitLength - 1))
        ? inverted - (1n << BigInt(bitLength))
        : inverted;
    },
    [bitLength, signed]
  );

  const formatOutput = useCallback(
    (inverted) => {
      if (inverted === null) {
        return { binary: "", decimal: "", hex: "" };
      }
      // Workaround: Use bit shifting instead of exponentiation for 2^n
      const bitMask = (1n << BigInt(bitLength)) - 1n;
      const unsignedInverted = inverted < 0 ? (bitMask + 1n + inverted) & bitMask : inverted;
      const binary = unsignedInverted.toString(2).padStart(bitLength, "0").slice(-bitLength);
      const decimal = inverted.toString(10);
      const hex = unsignedInverted
        .toString(16)
        .toUpperCase()
        .padStart(Math.ceil(bitLength / 4), "0")
        .slice(-Math.ceil(bitLength / 4));
      return { binary, decimal, hex };
    },
    [bitLength]
  );

  const updateOutput = useCallback(() => {
    setError("");
    const num = validateAndConvertInput(input, inputFormat);
    const inverted = invertBits(num);
    setOutput(formatOutput(inverted));
  }, [input, inputFormat, bitLength, signed, validateAndConvertInput, invertBits, formatOutput]);

  useEffect(() => {
    updateOutput();
  }, [input, inputFormat, bitLength, signed, updateOutput]);

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    alert("Copied to clipboard!");
  };

  const downloadOutput = () => {
    const text = `Input: ${input} (${inputFormat})\nBit Length: ${bitLength}\nSigned: ${signed}\n\nOutput:\nBinary: ${output.binary}\nDecimal: ${output.decimal}\nHexadecimal: ${output.hex}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveAs(blob, `bitwise-inverter-output-${Date.now()}.txt`);
  };

  const handleClear = () => {
    setInput("");
    setOutput({ binary: "", decimal: "", hex: "" });
    setError("");
    setSigned(false);
    setShowSteps(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary Bitwise Inverter
        </h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Number
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Enter ${inputFormat} number`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bit Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bitLengths.map((len) => (
                  <option key={len} value={len}>{len} bits</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={signed}
                  onChange={(e) => setSigned(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Signed Number</span>
              </label>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSteps}
                  onChange={(e) => setShowSteps(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Show Steps</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleClear}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
            <button
              onClick={downloadOutput}
              disabled={!output.binary}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Inverted Result:</h2>
            <div className="space-y-3 text-sm">
              {["binary", "decimal", "hex"].map((format) => (
                <p key={format} className="flex items-center gap-2">
                  <span className="font-medium capitalize">{format}:</span>
                  <span className="font-mono flex-1">{output[format] || "N/A"}</span>
                  {output[format] && (
                    <button
                      onClick={() => copyToClipboard(output[format])}
                      className="p-1 text-gray-500 hover:text-blue-500"
                    >
                      <FaCopy />
                    </button>
                  )}
                </p>
              ))}
            </div>
            {output.binary && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Bit Visualization:</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {output.binary.split("").map((bit, index) => (
                    <span
                      key={index}
                      className={`w-6 h-6 flex items-center justify-center rounded text-white text-xs ${
                        bit === "1" ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    >
                      {bit}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {showSteps && output.binary && (
              <div className="mt-4 p-2 bg-gray-100 rounded-md text-sm">
                <h3 className="font-medium text-gray-700">Calculation Steps:</h3>
                <p>1. Input ({inputFormat}): {input}</p>
                <p>2. Converted to Decimal: {validateAndConvertInput(input, inputFormat)?.toString() || "N/A"}</p>
                <p>3. Inverted with ~: {invertBits(validateAndConvertInput(input, inputFormat))?.toString() || "N/A"}</p>
                <p>4. Formatted to {bitLength} bits</p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Bitwise NOT (~) operation on binary, decimal, or hex input</li>
            <li>Adjustable bit length (8, 16, 32, 64)</li>
            <li>Signed/unsigned number support</li>
            <li>Real-time conversion with bit visualization</li>
            <li>Copy output to clipboard</li>
            <li>Download results as text file</li>
            <li>Show calculation steps option</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryBitwiseInverter;