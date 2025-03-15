"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryToUTF8 = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [utf8Output, setUtf8Output] = useState("");
  const [delimiter, setDelimiter] = useState("space");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [inputFormat, setInputFormat] = useState("binary"); // binary, hex, decimal
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const fileInputRef = useRef(null);

  const binaryToUTF8 = useCallback(
    (input) => {
      try {
        if (!input) {
          setUtf8Output("");
          setError("");
          return;
        }

        let byteArray = [];
        let cleanedInput = input.trim();

        if (ignoreWhitespace) {
          cleanedInput = cleanedInput.replace(/\s+/g, "");
        }

        switch (inputFormat) {
          case "binary": {
            let binaryString;
            switch (delimiter) {
              case "space":
                binaryString = ignoreWhitespace
                  ? cleanedInput
                  : cleanedInput.split(/\s+/).join("");
                break;
              case "comma":
                binaryString = cleanedInput.split(",").map((str) => str.trim()).join("");
                break;
              case "none":
                binaryString = cleanedInput;
                break;
              default:
                binaryString = cleanedInput.split(/\s+/).join("");
            }

            if (!/^[01]+$/.test(binaryString)) {
              throw new Error("Invalid binary format (only 0s and 1s allowed)");
            }
            if (binaryString.length % 8 !== 0) {
              throw new Error("Binary length must be a multiple of 8 bits for UTF-8 decoding");
            }

            for (let i = 0; i < binaryString.length; i += 8) {
              const byte = binaryString.slice(i, i + 8);
              byteArray.push(parseInt(byte, 2));
            }
            break;
          }
          case "hex": {
            const hexString = ignoreWhitespace
              ? cleanedInput
              : cleanedInput.split(delimiter === "comma" ? "," : /\s+/).join("");
            if (!/^[0-9A-Fa-f]+$/.test(hexString)) {
              throw new Error("Invalid hexadecimal format");
            }
            if (hexString.length % 2 !== 0) {
              throw new Error("Hex length must be even for byte conversion");
            }
            for (let i = 0; i < hexString.length; i += 2) {
              const byte = hexString.slice(i, i + 2);
              byteArray.push(parseInt(byte, 16));
            }
            break;
          }
          case "decimal": {
            const decimalArray = cleanedInput
              .split(delimiter === "comma" ? "," : /\s+/)
              .map((num) => num.trim())
              .filter(Boolean);
            if (!decimalArray.every((num) => /^[0-255]$/.test(num) || parseInt(num) <= 255)) {
              throw new Error("Decimal values must be between 0 and 255");
            }
            byteArray = decimalArray.map((num) => parseInt(num, 10));
            break;
          }
          default:
            throw new Error("Unsupported input format");
        }

        const utf8String = new TextDecoder("utf-8").decode(new Uint8Array(byteArray));
        setUtf8Output(utf8String);
        setError("");
      } catch (err) {
        setError("Error converting to UTF-8: " + err.message);
        setUtf8Output("");
      }
    },
    [delimiter, inputFormat, ignoreWhitespace]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToUTF8(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToUTF8(text);
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

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(utf8Output);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([utf8Output], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utf8_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput("");
    setUtf8Output("");
    setError("");
    setDelimiter("space");
    setInputFormat("binary");
    setIgnoreWhitespace(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary/Hex/Decimal to UTF-8 Converter
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Format
            </label>
            <select
              value={inputFormat}
              onChange={(e) => {
                setInputFormat(e.target.value);
                binaryToUTF8(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="binary">Binary</option>
              <option value="hex">Hexadecimal</option>
              <option value="decimal">Decimal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delimiter
            </label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                binaryToUTF8(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => {
                  setIgnoreWhitespace(e.target.checked);
                  binaryToUTF8(binaryInput);
                }}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Ignore Whitespace</span>
            </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {inputFormat.charAt(0).toUpperCase() + inputFormat.slice(1)} Input
          </label>
          <textarea
            value={binaryInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            rows="6"
            placeholder={
              inputFormat === "binary"
                ? "Enter 8-bit binary (e.g., 01001000 01100101 01101100 01101100 01101111)"
                : inputFormat === "hex"
                ? "Enter hex bytes (e.g., 48 65 6C 6C 6F)"
                : "Enter decimal bytes (e.g., 72 101 108 108 111)"
            }
          />
          <input
            type="file"
            accept="text/plain"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Drag and drop a text file or use the file input
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UTF-8 Output
          </label>
          <div className="relative">
            <textarea
              value={utf8Output}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y"
              placeholder="UTF-8 output will appear here..."
            />
            {utf8Output && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Copy to Clipboard"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={downloadOutput}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  title="Download as Text File"
                >
                  <FaDownload />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync /> Clear All
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert Binary, Hex, or Decimal to UTF-8</li>
            <li>Customizable delimiter options</li>
            <li>Ignore whitespace toggle</li>
            <li>Drag-and-drop or file upload support</li>
            <li>Copy to clipboard and download as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToUTF8;