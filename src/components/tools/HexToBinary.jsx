"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const HexToBinary = () => {
  const [hexInput, setHexInput] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space"); // space, comma, none
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitLength, setBitLength] = useState("8"); // 4, 8, 16
  const [prefixHandling, setPrefixHandling] = useState("auto"); // auto, ignore, strict
  const [groupSize, setGroupSize] = useState(1); // Number of binary values per group
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const hexToBinary = useCallback(
    (hex) => {
      try {
        if (!hex) {
          setBinaryOutput("");
          setError("");
          return;
        }

        let hexArray;
        switch (delimiter) {
          case "space":
            hexArray = hex.trim().split(/\s+/);
            break;
          case "comma":
            hexArray = hex.split(",").map((str) => str.trim());
            break;
          case "none":
            hexArray = hex.match(/.{1,4}/g) || []; // Up to 4 chars for 16-bit
            break;
          default:
            hexArray = hex.trim().split(/\s+/);
        }

        const binary = hexArray
          .map((hexStr, index) => {
            let cleanHex = hexStr;
            if (prefixHandling === "auto" || prefixHandling === "ignore") {
              cleanHex = hexStr.replace(/^(0x|#)/i, "");
            } else if (
              prefixHandling === "strict" &&
              !/^(0x|#)?[0-9A-Fa-f]+$/.test(hexStr)
            ) {
              throw new Error(`Invalid hex format at position ${index + 1}`);
            }

            if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
              throw new Error(`Invalid hexadecimal value at position ${index + 1}`);
            }

            const decimal = parseInt(cleanHex, 16);
            const maxValue = Math.pow(2, parseInt(bitLength)) - 1;
            if (decimal > maxValue) {
              throw new Error(
                `Value ${cleanHex} exceeds ${bitLength}-bit limit (${maxValue})`
              );
            }

            return decimal.toString(2).padStart(parseInt(bitLength), "0");
          })
          .reduce((acc, val, idx) => {
            const groupIndex = Math.floor(idx / groupSize);
            acc[groupIndex] =
              (acc[groupIndex] || "") + (idx % groupSize === 0 ? "" : " ") + val;
            return acc;
          }, [])
          .join("   "); // Triple space for group separation

        setBinaryOutput(binary);
        setError("");
        setHistory((prev) => [...prev, { input: hex, output: binary }].slice(-10)); // Keep last 10
      } catch (err) {
        setError("Error converting hex to binary: " + err.message);
        setBinaryOutput("");
      }
    },
    [delimiter, bitLength, prefixHandling, groupSize]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setHexInput(value);
    hexToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setHexInput(text);
      hexToBinary(text);
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
    a.download = `binary_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setHexInput("");
    setBinaryOutput("");
    setError("");
    setHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Hex to Binary Converter
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
                hexToBinary(hexInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None (Continuous)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
            <select
              value={bitLength}
              onChange={(e) => {
                setBitLength(e.target.value);
                hexToBinary(hexInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefix Handling</label>
            <select
              value={prefixHandling}
              onChange={(e) => {
                setPrefixHandling(e.target.value);
                hexToBinary(hexInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto (Remove 0x/#)</option>
              <option value="ignore">Ignore (Allow Any)</option>
              <option value="strict">Strict (Must Match)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Size ({groupSize})
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={groupSize}
              onChange={(e) => {
                setGroupSize(parseInt(e.target.value));
                hexToBinary(hexInput);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Input Section */}
        <div
          className={`mb-6 p-4 border-2 rounded-lg ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">Hex Input</label>
          <textarea
            value={hexInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            rows="6"
            placeholder={`Enter hexadecimal (e.g., ${
              bitLength === "8" ? "48 65" : bitLength === "4" ? "A B" : "ABCD EFGH"
            } or 0x${bitLength === "8" ? "48 0x65" : bitLength === "4" ? "A 0xB" : "ABCD 0xEFGH"})`}
          />
          <div className="flex gap-2 mt-2">
            <input
              type="file"
              accept="text/plain"
              ref={fileInputRef}
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <FaUpload className="mr-2" /> Upload File
            </button>
            <button
              onClick={clearAll}
              className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Binary Output</label>
          <div className="relative">
            <textarea
              value={binaryOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder="Binary output will appear here..."
            />
            {binaryOutput && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Conversion History</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
              {history
                .slice()
                .reverse()
                .map((item, index) => (
                  <li key={index}>
                    <span className="font-mono">Input:</span> {item.input.slice(0, 20)}...{" "}
                    <span className="font-mono">Output:</span> {item.output.slice(0, 20)}...
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable delimiter, bit length, prefix handling, and group size</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download options</li>
            <li>Conversion history tracking</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time conversion with error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HexToBinary;