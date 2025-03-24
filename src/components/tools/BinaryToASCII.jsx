"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryToASCII = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [asciiOutput, setAsciiOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space"); // space, comma, none, custom
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [bitLength, setBitLength] = useState("8"); // 7, 8, custom
  const [customBitLength, setCustomBitLength] = useState(8);
  const [extendedASCII, setExtendedASCII] = useState(false);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const fileInputRef = useRef(null);

  const binaryToASCII = useCallback(
    (binary) => {
      try {
        if (!binary) {
          setAsciiOutput("");
          setError("");
          return;
        }

        const effectiveBitLength =
          bitLength === "custom" ? customBitLength : parseInt(bitLength);
        const effectiveDelimiter =
          delimiter === "custom"
            ? customDelimiter
            : delimiter === "space"
            ? " "
            : delimiter === "comma"
            ? ", "
            : "";

        let binaryArray;
        if (delimiter === "none") {
          binaryArray = binary.match(new RegExp(`.{1,${effectiveBitLength}}`, "g")) || [];
        } else {
          binaryArray = binary.split(effectiveDelimiter).map((str) => str.trim());
        }

        const ascii = binaryArray
          .map((bin) => {
            if (!/^[01]+$/.test(bin)) throw new Error("Invalid binary format");
            if (delimiter !== "none" && bin.length !== effectiveBitLength) {
              throw new Error(`Binary segments must be ${effectiveBitLength} bits`);
            }

            const decimal = parseInt(bin, 2);
            const maxValue = extendedASCII ? 255 : 127;
            if (decimal > maxValue) {
              throw new Error(
                `Value exceeds ${extendedASCII ? "extended" : "standard"} ASCII range (0-${maxValue})`
              );
            }

            return String.fromCharCode(decimal);
          })
          .join("");

        setAsciiOutput(ascii);
        setError("");
      } catch (err) {
        setError("Error converting binary to ASCII: " + err.message);
        setAsciiOutput("");
      }
    },
    [delimiter, customDelimiter, bitLength, customBitLength, extendedASCII]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToASCII(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result.slice(0, 10000); // Limit to 10k chars for performance
      setBinaryInput(text);
      binaryToASCII(text);
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
      await navigator.clipboard.writeText(asciiOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([asciiOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ascii_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput("");
    setAsciiOutput("");
    setDelimiter("space");
    setCustomDelimiter("");
    setBitLength("8");
    setCustomBitLength(8);
    setExtendedASCII(false);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Binary to ASCII Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                binaryToASCII(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None (Continuous)</option>
              <option value="custom">Custom</option>
            </select>
            {delimiter === "custom" && (
              <input
                type="text"
                value={customDelimiter}
                onChange={(e) => {
                  setCustomDelimiter(e.target.value);
                  binaryToASCII(binaryInput);
                }}
                className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter custom delimiter"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
            <select
              value={bitLength}
              onChange={(e) => {
                setBitLength(e.target.value);
                binaryToASCII(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="7">7-bit</option>
              <option value="8">8-bit</option>
              <option value="custom">Custom</option>
            </select>
            {bitLength === "custom" && (
              <input
                type="number"
                min="1"
                max="32"
                value={customBitLength}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(32, e.target.value));
                  setCustomBitLength(value);
                  binaryToASCII(binaryInput);
                }}
                className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ASCII Type</label>
            <select
              value={extendedASCII ? "extended" : "standard"}
              onChange={(e) => {
                setExtendedASCII(e.target.value === "extended");
                binaryToASCII(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="standard">Standard (0-127)</option>
              <option value="extended">Extended (0-255)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearAll}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear All
            </button>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Binary Input</label>
          <textarea
            value={binaryInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            rows="6"
            placeholder={`Enter ${bitLength === "custom" ? customBitLength : bitLength}-bit binary (e.g., 01001000 01100101)`}
          />
          <input
            type="file"
            accept="text/plain"
            ref={fileInputRef}
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Or drag and drop a text file</p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">ASCII Output</label>
          <div className="relative">
            <textarea
              value={asciiOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y"
              placeholder="ASCII output will appear here..."
            />
            {asciiOutput && (
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

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable delimiter and bit length (up to 32 bits)</li>
            <li>Standard (0-127) and Extended (0-255) ASCII support</li>
            <li>File upload and drag-and-drop functionality</li>
            <li>Copy to clipboard and download options</li>
            <li>Real-time conversion with error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToASCII;