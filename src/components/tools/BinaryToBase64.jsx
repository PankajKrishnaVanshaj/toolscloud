"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryToBase64 = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [base64Output, setBase64Output] = useState("");
  const [delimiter, setDelimiter] = useState("space"); // space, comma, none, custom
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [padding, setPadding] = useState(true); // Base64 padding (=)
  const [bitLength, setBitLength] = useState(8); // Customizable bit length
  const [validateInput, setValidateInput] = useState(true); // Toggle strict validation
  const fileInputRef = useRef(null);

  // Binary to Base64 conversion
  const binaryToBase64 = useCallback(
    (binary) => {
      try {
        if (!binary) {
          setBase64Output("");
          setError("");
          return;
        }

        // Normalize binary input based on delimiter
        let binaryString;
        switch (delimiter) {
          case "space":
            binaryString = binary.trim().split(/\s+/).join("");
            break;
          case "comma":
            binaryString = binary.split(",").map((str) => str.trim()).join("");
            break;
          case "none":
            binaryString = binary.trim();
            break;
          case "custom":
            binaryString = customDelimiter
              ? binary.split(customDelimiter).map((str) => str.trim()).join("")
              : binary.trim().split(/\s+/).join("");
            break;
          default:
            binaryString = binary.trim().split(/\s+/).join("");
        }

        // Validate binary format
        if (validateInput && !/^[01]+$/.test(binaryString)) {
          throw new Error("Input contains invalid characters (only 0s and 1s allowed)");
        }

        // Check bit length compatibility
        if (binaryString.length % bitLength !== 0) {
          throw new Error(`Binary length must be a multiple of ${bitLength} bits`);
        }

        // Convert binary to byte array
        const byteArray = [];
        for (let i = 0; i < binaryString.length; i += bitLength) {
          const chunk = binaryString.slice(i, i + bitLength).padStart(8, "0");
          byteArray.push(parseInt(chunk, 2));
        }

        // Convert to Base64
        const base64 = btoa(String.fromCharCode(...byteArray));
        setBase64Output(padding ? base64 : base64.replace(/=+$/, ""));
        setError("");
      } catch (err) {
        setError("Error converting binary to Base64: " + err.message);
        setBase64Output("");
      }
    },
    [delimiter, customDelimiter, padding, bitLength, validateInput]
  );

  // Input handlers
  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToBase64(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToBase64(text);
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
      await navigator.clipboard.writeText(base64Output);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  // Download output
  const downloadOutput = () => {
    const blob = new Blob([base64Output], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `base64_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Reset everything
  const reset = () => {
    setBinaryInput("");
    setBase64Output("");
    setDelimiter("space");
    setCustomDelimiter("");
    setPadding(true);
    setBitLength(8);
    setValidateInput(true);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to Base64 Converter
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
                binaryToBase64(binaryInput);
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
                  binaryToBase64(binaryInput);
                }}
                placeholder="Enter custom delimiter"
                className="mt-2 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
            <input
              type="number"
              min="1"
              max="32"
              value={bitLength}
              onChange={(e) => {
                const value = Math.max(1, Math.min(32, e.target.value));
                setBitLength(value);
                binaryToBase64(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={padding}
                onChange={(e) => {
                  setPadding(e.target.checked);
                  binaryToBase64(binaryInput);
                }}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Padding (=)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={validateInput}
                onChange={(e) => {
                  setValidateInput(e.target.checked);
                  binaryToBase64(binaryInput);
                }}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Strict Validation</span>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Binary Input</label>
          <textarea
            value={binaryInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            rows="6"
            placeholder={`Enter ${bitLength}-bit binary (e.g., 01001000 01100101 01101100 01101100 01101111)`}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Base64 Output</label>
          <div className="relative">
            <textarea
              value={base64Output}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 font-mono text-sm min-h-[150px] resize-y"
              placeholder="Base64 output will appear here..."
            />
            {base64Output && (
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
            <li>Adjustable bit length (1-32 bits)</li>
            <li>Padding toggle for Base64 output</li>
            <li>Strict validation option</li>
            <li>Drag-and-drop and file upload support</li>
            <li>Copy to clipboard and download as text</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToBase64;