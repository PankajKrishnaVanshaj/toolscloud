"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryToText = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space"); // space, comma, none, custom
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitMode, setBitMode] = useState("auto"); // auto, 7bit, 8bit, custom
  const [customBits, setCustomBits] = useState(8);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const binaryToText = useCallback(
    (binary) => {
      try {
        if (!binary) {
          setTextOutput("");
          setError("");
          return;
        }

        let binaryArray;
        const effectiveDelimiter =
          delimiter === "custom" && customDelimiter ? customDelimiter : delimiter;
        switch (effectiveDelimiter) {
          case "space":
            binaryArray = binary.trim().split(/\s+/);
            break;
          case "comma":
            binaryArray = binary.split(",").map((str) => str.trim());
            break;
          case "none":
            binaryArray = binary.match(/.{1,8}/g) || [];
            break;
          default:
            binaryArray = binary.split(effectiveDelimiter).map((str) => str.trim());
        }

        const bits =
          bitMode === "auto" ? 8 : bitMode === "custom" ? customBits : bitMode === "7bit" ? 7 : 8;
        const text = binaryArray
          .map((bin) => {
            if (!/^[01]+$/.test(bin)) throw new Error("Invalid binary format");
            if (bin.length !== bits && bitMode !== "auto") {
              throw new Error(`Each binary segment must be ${bits} bits`);
            }
            return String.fromCharCode(parseInt(bin, 2));
          })
          .join("");

        setTextOutput(text);
        setError("");
        setHistory((prev) => [...prev, { input: binary, output: text }].slice(-5)); // Keep last 5
      } catch (err) {
        setError("Error converting binary to text: " + err.message);
        setTextOutput("");
      }
    },
    [delimiter, customDelimiter, bitMode, customBits]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToText(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToText(text);
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
      await navigator.clipboard.writeText(textOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([textOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_text_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput("");
    setTextOutput("");
    setError("");
    setHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadFromHistory = (entry) => {
    setBinaryInput(entry.input);
    setTextOutput(entry.output);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Binary to Text Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                binaryToText(binaryInput);
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
                  binaryToText(binaryInput);
                }}
                placeholder="Enter custom delimiter"
                className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Mode</label>
            <select
              value={bitMode}
              onChange={(e) => {
                setBitMode(e.target.value);
                binaryToText(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto Detect</option>
              <option value="7bit">7-bit</option>
              <option value="8bit">8-bit</option>
              <option value="custom">Custom</option>
            </select>
            {bitMode === "custom" && (
              <input
                type="number"
                min="1"
                max="16"
                value={customBits}
                onChange={(e) => {
                  setCustomBits(Math.max(1, Math.min(16, e.target.value)));
                  binaryToText(binaryInput);
                }}
                className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            )}
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
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-y"
            rows="6"
            placeholder="Enter binary (e.g., 01001000 01100101 01101100 01101100 01101111)"
          />
          <input
            type="file"
            accept=".txt"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">Or drag and drop a text file</p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Output</label>
          <div className="relative">
            <textarea
              value={textOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y"
              placeholder="Converted text will appear here..."
            />
            {textOutput && (
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
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync className="mr-2" /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* Conversion History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Conversions</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
              {history.slice().reverse().map((entry, index) => (
                <li
                  key={index}
                  onClick={() => loadFromHistory(entry)}
                  className="cursor-pointer hover:bg-gray-200 p-1 rounded"
                >
                  <span className="font-medium">Input:</span> {entry.input.slice(0, 20)}...{" "}
                  <span className="font-medium">Output:</span> {entry.output.slice(0, 20)}...
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable delimiters (space, comma, none, or custom)</li>
            <li>Flexible bit modes (auto, 7-bit, 8-bit, custom 1-16 bits)</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download options</li>
            <li>Conversion history (last 5 entries)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToText;