"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const BinaryStringToBinary = () => {
  const [inputString, setInputString] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [reverseInput, setReverseInput] = useState("");
  const [reverseOutput, setReverseOutput] = useState("");
  const [encoding, setEncoding] = useState("utf8");
  const [bitLength, setBitLength] = useState(8);
  const [separator, setSeparator] = useState(" ");
  const [error, setError] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [endianness, setEndianness] = useState("big"); // Big or Little Endian

  // Convert string to binary
  const stringToBinary = useCallback(
    (str) => {
      try {
        const encoder = new TextEncoder();
        const bytes =
          encoding === "ascii"
            ? new Uint8Array([...str].map((char) => char.charCodeAt(0) & 0x7F))
            : encoder.encode(str);

        const binaryArray = Array.from(bytes).map((byte) => {
          let binary = byte.toString(2).padStart(bitLength, "0");
          if (endianness === "little") {
            binary = binary.split("").reverse().join("");
          }
          return binary;
        });

        return {
          binary: binaryArray.join(separator),
          breakdown: Array.from(bytes).map((byte, index) => ({
            char: str[index] || "",
            byte: byte,
            binary: byte.toString(2).padStart(bitLength, "0"),
            hex: byte.toString(16).toUpperCase().padStart(Math.ceil(bitLength / 4), "0"),
          })),
        };
      } catch (err) {
        setError(`Conversion error: ${err.message}`);
        return { binary: "", breakdown: [] };
      }
    },
    [encoding, bitLength, separator, endianness]
  );

  // Convert binary to string
  const binaryToString = useCallback(
    (binary) => {
      try {
        const cleanedBinary = binary.replace(new RegExp(separator, "g"), "");
        if (!/^[01]+$/.test(cleanedBinary)) {
          throw new Error("Invalid binary input");
        }

        const byteLength = bitLength;
        const bytes = [];
        for (let i = 0; i < cleanedBinary.length; i += byteLength) {
          let byteStr = cleanedBinary.slice(i, i + byteLength);
          if (endianness === "little") {
            byteStr = byteStr.split("").reverse().join("");
          }
          bytes.push(parseInt(byteStr, 2));
        }

        const decoder = new TextDecoder(encoding);
        const uint8Array = new Uint8Array(bytes);
        return decoder.decode(uint8Array);
      } catch (err) {
        setError(`Reverse conversion error: ${err.message}`);
        return "";
      }
    },
    [encoding, bitLength, separator, endianness]
  );

  const handleStringInput = (value) => {
    const processedValue = caseSensitive ? value : value.toLowerCase();
    setInputString(processedValue);
    setError("");
    const result = stringToBinary(processedValue);
    setBinaryOutput(result.binary);
  };

  const handleBinaryInput = (value) => {
    setReverseInput(value);
    setError("");
    const result = binaryToString(value);
    setReverseOutput(result);
  };

  const handleConvert = () => {
    handleStringInput(inputString);
    handleBinaryInput(reverseInput);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadOutput = (content, filename) => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const reset = () => {
    setInputString("");
    setBinaryOutput("");
    setReverseInput("");
    setReverseOutput("");
    setEncoding("utf8");
    setBitLength(8);
    setSeparator(" ");
    setCaseSensitive(false);
    setEndianness("big");
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary String Converter
        </h1>

        <div className="space-y-6">
          {/* String to Binary */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Input
              </label>
              <input
                type="text"
                value={inputString}
                onChange={(e) => handleStringInput(e.target.value)}
                placeholder="Enter text (e.g., Hello)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Output
              </label>
              <div className="relative">
                <textarea
                  value={binaryOutput}
                  readOnly
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none font-mono"
                />
                {binaryOutput && (
                  <button
                    onClick={() => copyToClipboard(binaryOutput)}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
                    title="Copy to Clipboard"
                  >
                    <FaCopy />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Binary to String */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <input
                type="text"
                value={reverseInput}
                onChange={(e) => handleBinaryInput(e.target.value)}
                placeholder="Enter binary (e.g., 01001000 01100101)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Output
              </label>
              <div className="relative">
                <textarea
                  value={reverseOutput}
                  readOnly
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none"
                />
                {reverseOutput && (
                  <button
                    onClick={() => copyToClipboard(reverseOutput)}
                    className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-700"
                    title="Copy to Clipboard"
                  >
                    <FaCopy />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Encoding
                </label>
                <select
                  value={encoding}
                  onChange={(e) => setEncoding(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ascii">ASCII (7-bit)</option>
                  <option value="utf8">UTF-8</option>
                  <option value="utf16le">UTF-16LE</option>
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
                >
                  <option value={7}>7-bit</option>
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Separator
                </label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=" ">Space</option>
                  <option value="">None</option>
                  <option value=",">Comma</option>
                  <option value="-">Dash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endianness
                </label>
                <select
                  value={endianness}
                  onChange={(e) => setEndianness(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="big">Big Endian</option>
                  <option value="little">Little Endian</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Case Sensitive</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert
            </button>
            <button
              onClick={() =>
                downloadOutput(
                  `Text: ${inputString}\nBinary: ${binaryOutput}\nBinary Input: ${reverseInput}\nText Output: ${reverseOutput}`,
                  "binary-conversion.txt"
                )
              }
              disabled={!binaryOutput && !reverseOutput}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Breakdown */}
          {inputString && binaryOutput && !error && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Character Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Char</th>
                      <th className="px-4 py-2">Decimal</th>
                      <th className="px-4 py-2">Binary</th>
                      <th className="px-4 py-2">Hex</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stringToBinary(inputString).breakdown.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{item.char || "(non-printable)"}</td>
                        <td className="px-4 py-2">{item.byte}</td>
                        <td className="px-4 py-2 font-mono">{item.binary}</td>
                        <td className="px-4 py-2 font-mono">{item.hex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Bidirectional conversion: Text ↔ Binary</li>
              <li>Supports ASCII, UTF-8, and UTF-16LE encoding</li>
              <li>Customizable bit length (7, 8, 16)</li>
              <li>Multiple separator options</li>
              <li>Big/Little Endian support</li>
              <li>Case sensitivity toggle</li>
              <li>Copy to clipboard and download results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryStringToBinary;