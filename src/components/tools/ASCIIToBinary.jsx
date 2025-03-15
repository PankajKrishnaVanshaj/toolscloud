"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const ASCIIToBinary = () => {
  const [asciiInput, setAsciiInput] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space"); // space, comma, none, custom
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [bitLength, setBitLength] = useState("8"); // 7, 8, custom
  const [customBitLength, setCustomBitLength] = useState(8);
  const [grouping, setGrouping] = useState("none"); // none, 4, 8, custom
  const [customGrouping, setCustomGrouping] = useState(4);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const fileInputRef = useRef(null);

  const asciiToBinary = useCallback(
    (ascii) => {
      try {
        if (!ascii) {
          setBinaryOutput("");
          setError("");
          return;
        }

        const effectiveBitLength =
          bitLength === "custom" ? customBitLength : parseInt(bitLength);
        const effectiveGrouping =
          grouping === "custom" ? customGrouping : grouping === "none" ? 0 : parseInt(grouping);
        const effectiveDelimiter =
          delimiter === "custom" ? customDelimiter : delimiter === "space" ? " " : delimiter === "comma" ? ", " : "";

        const binary = ascii
          .split("")
          .map((char) => {
            const decimal = char.charCodeAt(0);
            const maxValue = Math.pow(2, effectiveBitLength) - 1;
            if (decimal > maxValue) {
              throw new Error(`Character exceeds ${effectiveBitLength}-bit range (0-${maxValue})`);
            }

            let binaryStr = decimal.toString(2).padStart(effectiveBitLength, "0");
            if (effectiveGrouping > 0) {
              return binaryStr.match(new RegExp(`.{1,${effectiveGrouping}}`, "g")).join(" ");
            }
            return binaryStr;
          })
          .join(effectiveDelimiter);

        setBinaryOutput(binary);
        setError("");
      } catch (err) {
        setError("Error converting ASCII to binary: " + err.message);
        setBinaryOutput("");
      }
    },
    [delimiter, customDelimiter, bitLength, customBitLength, grouping, customGrouping]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAsciiInput(value);
    asciiToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result.slice(0, 10000); // Limit to 10k chars for performance
      setAsciiInput(text);
      asciiToBinary(text);
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
    setAsciiInput("");
    setBinaryOutput("");
    setDelimiter("space");
    setBitLength("8");
    setGrouping("none");
    setCustomDelimiter("");
    setCustomBitLength(8);
    setCustomGrouping(4);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced ASCII to Binary Converter
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
                asciiToBinary(asciiInput);
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
                  asciiToBinary(asciiInput);
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
                asciiToBinary(asciiInput);
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
                  asciiToBinary(asciiInput);
                }}
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
                asciiToBinary(asciiInput);
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
                value={customGrouping}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(32, e.target.value));
                  setCustomGrouping(value);
                  asciiToBinary(asciiInput);
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
          <label className="block text-sm font-medium text-gray-700 mb-2">ASCII Input</label>
          <textarea
            value={asciiInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-y"
            rows="6"
            placeholder="Enter ASCII text (e.g., Hello) or drop a text file"
          />
          <input
            type="file"
            accept="text/plain"
            ref={fileInputRef}
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
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
        <div className="flex justify-center">
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync /> Clear All
          </button>
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
            <li>Customizable delimiter, bit length, and grouping</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download options</li>
            <li>Real-time conversion with error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ASCIIToBinary;