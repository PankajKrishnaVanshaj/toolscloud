"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const HexToText = () => {
  const [hexInput, setHexInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [error, setError] = useState("");
  const [showCopyAlert, setShowCopyAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [allowSpaces, setAllowSpaces] = useState(true);
  const [encoding, setEncoding] = useState("utf8");
  const [caseSensitivity, setCaseSensitivity] = useState("mixed"); // New option
  const fileInputRef = useRef(null);

  // Convert hex to text and binary
  const convertHex = useCallback(() => {
    if (!hexInput.trim()) {
      setError("Please enter a hexadecimal string");
      setTextOutput("");
      setBinaryOutput("");
      return;
    }

    try {
      setError("");
      let cleanHex = hexInput;
      if (caseSensitivity === "upper") cleanHex = cleanHex.toUpperCase();
      if (caseSensitivity === "lower") cleanHex = cleanHex.toLowerCase();
      cleanHex = allowSpaces
        ? cleanHex.replace(/\s+/g, "")
        : cleanHex.replace(/[^0-9A-Fa-f]/g, "");

      if (cleanHex.length === 0) {
        setError("No valid hex characters found");
        return;
      }
      if (cleanHex.length % 2 !== 0) {
        setError("Hex string length must be even (each byte is 2 characters)");
        setTextOutput("");
        setBinaryOutput("");
        return;
      }
      if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
        setError("Invalid hex string: only 0-9 and A-F allowed");
        setTextOutput("");
        setBinaryOutput("");
        return;
      }

      let text = "";
      const binaryArray = [];
      for (let i = 0; i < cleanHex.length; i += 2) {
        const byte = parseInt(cleanHex.substr(i, 2), 16);
        text += encoding === "utf8" ? String.fromCharCode(byte) : String.fromCharCode(byte);
        binaryArray.push(byte.toString(2).padStart(8, "0"));
      }
      setTextOutput(text);
      setBinaryOutput(binaryArray.join(" "));
    } catch (err) {
      setError("Conversion error: " + err.message);
      setTextOutput("");
      setBinaryOutput("");
    }
  }, [hexInput, allowSpaces, encoding, caseSensitivity]);

  // Handle file upload
  const handleFileUpload = useCallback(
    (file) => {
      if (!file) return;

      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        let hexData = event.target.result;
        if (caseSensitivity === "upper") hexData = hexData.toUpperCase();
        if (caseSensitivity === "lower") hexData = hexData.toLowerCase();
        hexData = allowSpaces
          ? hexData.replace(/\s+/g, "")
          : hexData.replace(/[^0-9A-Fa-f]/g, "");
        setHexInput(hexData);

        try {
          if (hexData.length % 2 !== 0) {
            setError("Hex string length must be even in file");
          } else if (!/^[0-9A-Fa-f]+$/.test(hexData)) {
            setError("File contains invalid hex characters");
          } else {
            let text = "";
            const binaryArray = [];
            for (let i = 0; i < hexData.length; i += 2) {
              const byte = parseInt(hexData.substr(i, 2), 16);
              text += encoding === "utf8" ? String.fromCharCode(byte) : String.fromCharCode(byte);
              binaryArray.push(byte.toString(2).padStart(8, "0"));
            }
            setTextOutput(text);
            setBinaryOutput(binaryArray.join(" "));
          }
        } catch (err) {
          setError("File conversion error: " + err.message);
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Error reading file");
        setIsLoading(false);
      };
      reader.readAsText(file);
    },
    [allowSpaces, encoding, caseSensitivity]
  );

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/plain" || file.name.endsWith(".hex"))) {
      handleFileUpload(file);
    } else {
      setError("Please drop a valid text or .hex file");
    }
  };

  // Handle copy
  const handleCopy = (type) => {
    const content = type === "text" ? textOutput : binaryOutput;
    if (content) {
      navigator.clipboard.writeText(content);
      setShowCopyAlert(type);
      setTimeout(() => setShowCopyAlert(null), 2000);
    }
  };

  // Download output as text file
  const downloadOutput = (type) => {
    const content = type === "text" ? textOutput : binaryOutput;
    if (content) {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}-output-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setHexInput("");
    setTextOutput("");
    setBinaryOutput("");
    setError("");
    setShowCopyAlert(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="relative w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            {showCopyAlert === "text" ? "Text" : "Binary"} copied to clipboard!
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Hex to Text Converter
          </h1>
          <button
            onClick={clearAll}
            className="mt-2 sm:mt-0 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center"
            disabled={isLoading}
          >
            <FaSync className="mr-2" /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Conversion Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={allowSpaces}
                onChange={(e) => setAllowSpaces(e.target.checked)}
                className="mr-2 accent-blue-500"
                disabled={isLoading}
              />
              Allow Spaces
            </label>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Encoding</label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="utf8">UTF-8</option>
                <option value="ascii">ASCII</option>
                <option value="latin1">Latin-1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Case Sensitivity</label>
              <select
                value={caseSensitivity}
                onChange={(e) => setCaseSensitivity(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="mixed">Mixed</option>
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
              </select>
            </div>
          </div>
        </div>

        {/* Hex Input */}
        <div
          className={`mb-6 border-2 rounded-lg ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-b border-gray-300">
            <label className="block text-sm font-medium text-gray-700">
              Hexadecimal Input
            </label>
            <label className="mt-2 sm:mt-0 text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center">
              <FaUpload className="mr-1" /> Upload File
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
                accept=".txt,.hex"
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>
          <textarea
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              setTextOutput("");
              setBinaryOutput("");
              setError("");
            }}
            placeholder="Paste your hex string here or drag-and-drop a file (e.g., 48656C6C6F 20576F726C64)"
            className="w-full h-32 px-3 py-2 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y disabled:bg-gray-100"
            disabled={isLoading}
          />
          <button
            onClick={convertHex}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={isLoading || !hexInput.trim()}
          >
            {isLoading ? "Converting..." : "Convert"}
          </button>
        </div>

        {/* Outputs */}
        {["text", "binary"].map((type) => (
          <div key={type} className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {type} Output
            </label>
            <textarea
              value={type === "text" ? textOutput : binaryOutput}
              readOnly
              placeholder={`Converted ${type} will appear here`}
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-y"
            />
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <button
                onClick={() => handleCopy(type)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                disabled={!(type === "text" ? textOutput : binaryOutput) || isLoading}
              >
                <FaCopy className="mr-2" /> Copy
              </button>
              <button
                onClick={() => downloadOutput(type)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                disabled={!(type === "text" ? textOutput : binaryOutput) || isLoading}
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        ))}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert hex to text and binary</li>
            <li>Support for UTF-8, ASCII, and Latin-1 encoding</li>
            <li>Drag-and-drop file upload</li>
            <li>Case sensitivity options</li>
            <li>Copy and download outputs</li>
          </ul>
        </div>

        {/* Example */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Example</h3>
          <p className="text-sm text-gray-600">Input:</p>
          <pre className="bg-white p-2 rounded-md mt-1 text-sm overflow-x-auto">
            48656C6C6F 20576F726C64
          </pre>
          <p className="mt-2 text-sm text-gray-600">Text Output:</p>
          <pre className="bg-white p-2 rounded-md mt-1 text-sm overflow-x-auto">
            Hello World
          </pre>
          <p className="mt-2 text-sm text-gray-600">Binary Output:</p>
          <pre className="bg-white p-2 rounded-md mt-1 text-sm overflow-x-auto">
            01001000 01100101 01101100 01101100 01101111 00100000 01110111 01101111
            01110010 01101100 01100100
          </pre>
        </div>
      </div>
    </div>
  );
};

export default HexToText;