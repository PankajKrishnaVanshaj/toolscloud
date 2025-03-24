"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const Base64ToBinary = () => {
  const [base64Input, setBase64Input] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space"); // space, comma, none, custom
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [grouping, setGrouping] = useState("none"); // none, 4, 8, custom
  const [customGroupSize, setCustomGroupSize] = useState(8);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const fileInputRef = useRef(null);

  // Base64 to Binary conversion
  const base64ToBinary = useCallback(
    (base64) => {
      try {
        if (!base64) {
          setBinaryOutput("");
          setError("");
          return;
        }

        // Normalize Base64 input
        let normalizedBase64 = caseSensitive ? base64 : base64.trim();
        normalizedBase64 = normalizedBase64.replace(/[\s,]+/g, "") + "===".slice(0, (4 - normalizedBase64.length % 4) % 4);

        // Decode Base64 to binary
        const binaryString = atob(normalizedBase64)
          .split("")
          .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
          .join("");

        // Apply grouping
        let output;
        if (grouping === "none") {
          output = binaryString;
        } else {
          const groupSize = grouping === "custom" ? customGroupSize : parseInt(grouping);
          output = binaryString.match(new RegExp(`.{1,${groupSize}}`, "g")).join(" ");
        }

        // Apply delimiter
        output =
          delimiter === "none"
            ? output.replace(/\s+/g, "")
            : delimiter === "comma"
            ? output.replace(/\s+/g, ", ")
            : delimiter === "custom" && customDelimiter
            ? output.replace(/\s+/g, customDelimiter)
            : output;

        setBinaryOutput(output);
        setError("");
      } catch (err) {
        setError("Error converting Base64 to binary: " + err.message);
        setBinaryOutput("");
      }
    },
    [delimiter, grouping, customGroupSize, customDelimiter, caseSensitive]
  );

  // Input handlers
  const handleInputChange = (e) => {
    const value = e.target.value;
    setBase64Input(value);
    base64ToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBase64Input(text);
      base64ToBinary(text);
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

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(binaryOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  // Download output
  const downloadOutput = () => {
    const blob = new Blob([binaryOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `binary_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Reset everything
  const reset = () => {
    setBase64Input("");
    setBinaryOutput("");
    setDelimiter("space");
    setCustomDelimiter("");
    setGrouping("none");
    setCustomGroupSize(8);
    setError("");
    setCaseSensitive(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Base64 to Binary Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md shadow-md animate-fade-in">
            Copied!
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
                base64ToBinary(base64Input);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
              <option value="custom">Custom</option>
            </select>
            {delimiter === "custom" && (
              <input
                type="text"
                value={customDelimiter}
                onChange={(e) => {
                  setCustomDelimiter(e.target.value);
                  base64ToBinary(base64Input);
                }}
                placeholder="Enter custom delimiter"
                className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grouping</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                base64ToBinary(base64Input);
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
                min="1"
                max="32"
                value={customGroupSize}
                onChange={(e) => {
                  setCustomGroupSize(Math.max(1, Math.min(32, e.target.value)));
                  base64ToBinary(base64Input);
                }}
                className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => {
                  setCaseSensitive(e.target.checked);
                  base64ToBinary(base64Input);
                }}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Case Sensitive</span>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Base64 Input</label>
          <textarea
            value={base64Input}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            rows="6"
            placeholder="Enter Base64 (e.g., SGVsbG8=)"
          />
          <input
            type="file"
            accept="text/plain"
            ref={fileInputRef}
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            className="mt-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Drag and drop a text file or upload directly
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Binary Output</label>
          <div className="relative">
            <textarea
              value={binaryOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 font-mono text-sm min-h-[150px] resize-y"
              placeholder="Binary output will appear here..."
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable delimiters (space, comma, none, custom)</li>
            <li>Grouping options (none, 4-bit, 8-bit, custom size)</li>
            <li>Drag-and-drop and file upload support</li>
            <li>Copy to clipboard and download as text</li>
            <li>Case sensitivity toggle</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Base64ToBinary;