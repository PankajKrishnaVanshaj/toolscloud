"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaFileUpload } from "react-icons/fa";

const DecimalToBinary = () => {
  const [decimalInput, setDecimalInput] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space"); // space, comma, none, semicolon
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [signedMode, setSignedMode] = useState("unsigned"); // unsigned, signed
  const [bitLength, setBitLength] = useState("8"); // 4, 8, 16, 32, custom
  const [customBitLength, setCustomBitLength] = useState("");
  const [grouping, setGrouping] = useState("none"); // none, 4, 8, custom
  const [customGrouping, setCustomGrouping] = useState("");
  const [outputFormat, setOutputFormat] = useState("binary"); // binary, hex, octal

  const decimalToBinary = useCallback(
    (decimal) => {
      try {
        if (!decimal) {
          setBinaryOutput("");
          setError("");
          return;
        }

        let decimalArray;
        switch (delimiter) {
          case "space":
            decimalArray = decimal.trim().split(/\s+/);
            break;
          case "comma":
            decimalArray = decimal.split(",").map((str) => str.trim());
            break;
          case "semicolon":
            decimalArray = decimal.split(";").map((str) => str.trim());
            break;
          case "none":
            decimalArray = decimal.match(/-?\d+/g) || [];
            break;
          default:
            decimalArray = decimal.trim().split(/\s+/);
        }

        const effectiveBitLength =
          bitLength === "custom" ? parseInt(customBitLength) || 8 : parseInt(bitLength);
        const maxUnsigned = 2 ** effectiveBitLength - 1;
        const minSigned = -(2 ** (effectiveBitLength - 1));
        const maxSigned = 2 ** (effectiveBitLength - 1) - 1;

        const binaries = decimalArray.map((dec) => {
          const num = parseInt(dec, 10);
          if (isNaN(num)) throw new Error("Invalid decimal number");

          let result;
          if (signedMode === "unsigned") {
            if (num < 0) throw new Error("Unsigned mode does not support negative numbers");
            if (num > maxUnsigned)
              throw new Error(`Number exceeds ${effectiveBitLength}-bit unsigned limit (${maxUnsigned})`);
            result =
              outputFormat === "binary"
                ? num.toString(2)
                : outputFormat === "hex"
                ? num.toString(16).toUpperCase()
                : num.toString(8);
            result = result.padStart(
              Math.ceil(
                (outputFormat === "binary"
                  ? effectiveBitLength
                  : outputFormat === "hex"
                  ? effectiveBitLength / 4
                  : effectiveBitLength / 3) || 1
              ),
              "0"
            );
          } else {
            // Signed mode
            if (num < minSigned || num > maxSigned) {
              throw new Error(
                `Number out of ${effectiveBitLength}-bit signed range (${minSigned} to ${maxSigned})`
              );
            }
            result =
              num < 0
                ? (maxUnsigned + 1 + num).toString(
                    outputFormat === "binary" ? 2 : outputFormat === "hex" ? 16 : 8
                  )
                : num.toString(outputFormat === "binary" ? 2 : outputFormat === "hex" ? 16 : 8);
            result = result.padStart(
              Math.ceil(
                (outputFormat === "binary"
                  ? effectiveBitLength
                  : outputFormat === "hex"
                  ? effectiveBitLength / 4
                  : effectiveBitLength / 3) || 1
              ),
              "0"
            );
            if (outputFormat === "hex") result = result.toUpperCase();
          }

          if (grouping !== "none") {
            const groupSize =
              grouping === "custom" ? parseInt(customGrouping) || 4 : parseInt(grouping);
            return result.match(new RegExp(`.{1,${groupSize}}`, "g")).join(" ");
          }
          return result;
        });

        setBinaryOutput(binaries.join(delimiter === "comma" ? ", " : " "));
        setError("");
      } catch (err) {
        setError("Error converting decimal: " + err.message);
        setBinaryOutput("");
      }
    },
    [delimiter, signedMode, bitLength, customBitLength, grouping, customGrouping, outputFormat]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setDecimalInput(value);
    decimalToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setDecimalInput(text);
      decimalToBinary(text);
    };
    reader.onerror = () => setError("Error reading file");
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      handleFileUpload(file);
    } else {
      setError("Please drop a valid text file");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(binaryOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([binaryOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${outputFormat}_output.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setDecimalInput("");
    setBinaryOutput("");
    setError("");
    setDelimiter("space");
    setSignedMode("unsigned");
    setBitLength("8");
    setCustomBitLength("");
    setGrouping("none");
    setCustomGrouping("");
    setOutputFormat("binary");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Decimal Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                decimalToBinary(decimalInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="semicolon">Semicolon</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={signedMode}
              onChange={(e) => {
                setSignedMode(e.target.value);
                decimalToBinary(decimalInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="unsigned">Unsigned</option>
              <option value="signed">Signed (2's Complement)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
            <select
              value={bitLength}
              onChange={(e) => {
                setBitLength(e.target.value);
                decimalToBinary(decimalInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
              <option value="32">32-bit</option>
              <option value="custom">Custom</option>
            </select>
            {bitLength === "custom" && (
              <input
                type="number"
                value={customBitLength}
                onChange={(e) => {
                  setCustomBitLength(e.target.value);
                  decimalToBinary(decimalInput);
                }}
                min="1"
                max="64"
                className="w-full mt-2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter bits (1-64)"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grouping</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                decimalToBinary(decimalInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="custom">Custom</option>
            </select>
            {grouping === "custom" && (
              <input
                type="number"
                value={customGrouping}
                onChange={(e) => {
                  setCustomGrouping(e.target.value);
                  decimalToBinary(decimalInput);
                }}
                min="1"
                className="w-full mt-2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Group size"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
            <select
              value={outputFormat}
              onChange={(e) => {
                setOutputFormat(e.target.value);
                decimalToBinary(decimalInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="binary">Binary</option>
              <option value="hex">Hexadecimal</option>
              <option value="octal">Octal</option>
            </select>
          </div>
        </div>

        {/* Input Section */}
        <div
          className={`mb-6 p-4 border-2 rounded-lg transition-all ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Decimal Input</label>
          <textarea
            value={decimalInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm"
            rows="6"
            placeholder={`Enter decimals (e.g., 72 101 or -1)\nSupports ${delimiter} separation`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Drag and drop a text file or type directly
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {outputFormat.charAt(0).toUpperCase() + outputFormat.slice(1)} Output
          </label>
          <div className="relative">
            <textarea
              value={binaryOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono text-sm"
              placeholder={`${outputFormat} output will appear here...`}
            />
            {binaryOutput && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={downloadOutput}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  title="Download as text file"
                >
                  <FaDownload />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-6">
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert to Binary, Hexadecimal, or Octal</li>
            <li>Supports signed (2's complement) and unsigned numbers</li>
            <li>Customizable bit length and grouping</li>
            <li>Multiple delimiter options</li>
            <li>File drag-and-drop support</li>
            <li>Copy to clipboard and download options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DecimalToBinary;