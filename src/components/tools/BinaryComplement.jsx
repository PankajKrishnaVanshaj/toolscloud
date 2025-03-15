"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryComplement = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [onesComplement, setOnesComplement] = useState("");
  const [twosComplement, setTwosComplement] = useState("");
  const [delimiter, setDelimiter] = useState("none");
  const [grouping, setGrouping] = useState("none");
  const [bitLength, setBitLength] = useState("auto");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState("");
  const [baseConversion, setBaseConversion] = useState("none"); // New: decimal, hex
  const fileInputRef = useRef(null);

  const calculateComplements = useCallback(() => {
    try {
      if (!binaryInput) {
        setOnesComplement("");
        setTwosComplement("");
        setError("");
        return;
      }

      let binary;
      switch (delimiter) {
        case "space":
          binary = binaryInput.trim().split(/\s+/).join("");
          break;
        case "comma":
          binary = binaryInput.split(",").map((str) => str.trim()).join("");
          break;
        case "none":
          binary = binaryInput.trim();
          break;
        default:
          binary = binaryInput.trim();
      }

      if (!/^[01]+$/.test(binary)) {
        throw new Error("Invalid binary format");
      }

      const targetLength = bitLength === "auto" ? binary.length : parseInt(bitLength);
      if (bitLength !== "auto" && binary.length > targetLength) {
        throw new Error(`Binary input must not exceed ${bitLength} bits in fixed mode`);
      }

      // Pad to target length
      binary = binary.padStart(targetLength, "0");

      // Calculate one's complement
      let onesComp = binary.split("").map((bit) => (bit === "0" ? "1" : "0")).join("");

      // Calculate two's complement
      let twosComp = "";
      let carry = 1;
      for (let i = binary.length - 1; i >= 0; i--) {
        const bit = parseInt(onesComp[i]) + carry;
        twosComp = (bit % 2).toString() + twosComp;
        carry = Math.floor(bit / 2);
      }

      // Apply grouping
      let formattedOnes = onesComp;
      let formattedTwos = twosComp;
      if (grouping !== "none") {
        const groupSize = parseInt(grouping);
        formattedOnes = onesComp.match(new RegExp(`.{1,${groupSize}}`, "g")).join(" ");
        formattedTwos = twosComp.match(new RegExp(`.{1,${groupSize}}`, "g")).join(" ");
      }

      // Base conversion
      if (baseConversion === "decimal") {
        formattedOnes = `Decimal: ${parseInt(onesComp, 2)}`;
        formattedTwos = `Decimal: ${parseInt(twosComp, 2)}`;
      } else if (baseConversion === "hex") {
        formattedOnes = `Hex: 0x${parseInt(onesComp, 2).toString(16).toUpperCase()}`;
        formattedTwos = `Hex: 0x${parseInt(twosComp, 2).toString(16).toUpperCase()}`;
      }

      setOnesComplement(formattedOnes);
      setTwosComplement(formattedTwos);
      setError("");
    } catch (err) {
      setError("Error: " + err.message);
      setOnesComplement("");
      setTwosComplement("");
    }
  }, [binaryInput, delimiter, grouping, bitLength, baseConversion]);

  const handleInputChange = (e) => {
    setBinaryInput(e.target.value);
    calculateComplements();
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBinaryInput(e.target.result.trim());
      calculateComplements();
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

  const copyToClipboard = (text) => async () => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyAlert(text === onesComplement ? "ones" : "twos");
      setTimeout(() => setShowCopyAlert(""), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = (text, filename) => () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput("");
    setOnesComplement("");
    setTwosComplement("");
    setError("");
    setDelimiter("none");
    setGrouping("none");
    setBitLength("auto");
    setBaseConversion("none");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary Complement Calculator
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
            {showCopyAlert === "ones" ? "One's Complement Copied!" : "Two's Complement Copied!"}
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
                calculateComplements();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="space">Space</option>
              <option value="comma">Comma</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
            <select
              value={bitLength}
              onChange={(e) => {
                setBitLength(e.target.value);
                calculateComplements();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
              <option value="32">32-bit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grouping</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                calculateComplements();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Conversion</label>
            <select
              value={baseConversion}
              onChange={(e) => {
                setBaseConversion(e.target.value);
                calculateComplements();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Binary</option>
              <option value="decimal">Decimal</option>
              <option value="hex">Hexadecimal</option>
            </select>
          </div>
        </div>

        {/* Input Section */}
        <div
          className={`mb-6 p-4 border-2 rounded-lg transition-colors ${
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
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono resize-y"
            rows="4"
            placeholder="Enter binary (e.g., 1010, 1 0 1 0, or 1,0,1,0)"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">Drag and drop a text file here</p>
            <input
              type="file"
              accept="text/plain"
              ref={fileInputRef}
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:underline flex items-center"
            >
              <FaUpload className="mr-1" /> Upload File
            </button>
          </div>
        </div>

        {/* Outputs */}
        {["One's Complement", "Two's Complement"].map((label, index) => {
          const value = index === 0 ? onesComplement : twosComplement;
          return (
            <div key={label} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="relative">
                <textarea
                  value={value}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 font-mono resize-y min-h-[100px]"
                  placeholder={`${label} will appear here...`}
                />
                {value && (
                  <div className="absolute right-2 top-2 flex gap-2">
                    <button
                      onClick={copyToClipboard(value)}
                      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={downloadOutput(value, `${label.toLowerCase().replace("'", "")}.txt`)}
                      className="p-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      title="Download as text file"
                    >
                      <FaDownload />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={clearAll}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync className="mr-2" /> Clear All
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate one's and two's complements</li>
            <li>Flexible delimiters: space, comma, none</li>
            <li>Custom bit lengths: auto, 4, 8, 16, 32</li>
            <li>Grouping options: none, 4-bit, 8-bit</li>
            <li>Base conversion: binary, decimal, hexadecimal</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryComplement;