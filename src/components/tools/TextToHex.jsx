"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaSync, FaDownload, FaUpload } from "react-icons/fa";

const TextToHex = () => {
  const [textInput, setTextInput] = useState("");
  const [hexOutput, setHexOutput] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [error, setError] = useState("");
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [encoding, setEncoding] = useState("utf8");
  const [includeSpaces, setIncludeSpaces] = useState(true);
  const [caseFormat, setCaseFormat] = useState("upper"); // Upper or lower case for hex
  const [outputFormat, setOutputFormat] = useState("text"); // Text or JSON
  const fileInputRef = useRef(null);

  // Convert text to hex and binary
  const convertToHex = useCallback(() => {
    if (!textInput.trim()) {
      setError("Please enter text to convert");
      setHexOutput("");
      setBinaryOutput("");
      return;
    }

    try {
      setError("");
      let hex = "";
      const binaryArray = [];

      const encoder = encoding === "utf8" ? new TextEncoder() : null;
      const bytes = encoder ? encoder.encode(textInput) : new Uint8Array([...textInput].map((c) => c.charCodeAt(0)));

      bytes.forEach((byte, i) => {
        const hexValue = byte.toString(16).padStart(2, "0");
        const formattedHex = caseFormat === "upper" ? hexValue.toUpperCase() : hexValue.toLowerCase();
        hex += includeSpaces && i > 0 ? " " + formattedHex : formattedHex;
        binaryArray.push(byte.toString(2).padStart(8, "0"));
      });

      if (outputFormat === "json") {
        setHexOutput(JSON.stringify({ hex, binary: binaryArray.join(" ") }, null, 2));
      } else {
        setHexOutput(hex);
        setBinaryOutput(binaryArray.join(" "));
      }
    } catch (err) {
      setError("Conversion error: " + err.message);
      setHexOutput("");
      setBinaryOutput("");
    }
  }, [textInput, encoding, includeSpaces, caseFormat, outputFormat]);

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const textData = event.target.result;
      setTextInput(textData);
      convertToHex();
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Error reading file");
      setIsLoading(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [convertToHex]);

  // Handle copy
  const handleCopy = (type) => {
    const content = type === "hex" ? hexOutput : binaryOutput;
    if (content) {
      navigator.clipboard.writeText(content);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Download output as file
  const downloadOutput = () => {
    if (!hexOutput) return;
    const blob = new Blob(
      [outputFormat === "json" ? hexOutput : `Hex: ${hexOutput}\nBinary: ${binaryOutput}`],
      { type: outputFormat === "json" ? "application/json" : "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted-output-${Date.now()}.${outputFormat === "json" ? "json" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear all
  const clearAll = () => {
    setTextInput("");
    setHexOutput("");
    setBinaryOutput("");
    setError("");
    setShowCopyAlert(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="relative w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Text to Hex Converter</h1>
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
            disabled={isLoading}
          >
            <FaSync className="inline mr-1" /> Clear All
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={includeSpaces}
                onChange={(e) => setIncludeSpaces(e.target.checked)}
                className="mr-2 accent-blue-500"
                disabled={isLoading}
              />
              Include Spaces
            </label>
            <div>
              <label className="block text-sm text-gray-700">Encoding</label>
              <select
                value={encoding}
                onChange={(e) => setEncoding(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="utf8">UTF-8</option>
                <option value="ascii">ASCII</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700">Hex Case</label>
              <select
                value={caseFormat}
                onChange={(e) => setCaseFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="text">Text</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Enter Text</label>
            <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              <FaUpload className="inline mr-1" /> Upload File
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt"
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>
          <textarea
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              setHexOutput("");
              setBinaryOutput("");
              setError("");
            }}
            placeholder="Enter your text here (e.g., Hello World)"
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y disabled:bg-gray-100"
            aria-label="Text input"
            disabled={isLoading}
          />
          <button
            onClick={convertToHex}
            className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            disabled={isLoading || !textInput.trim()}
          >
            {isLoading ? "Converting..." : "Convert"}
          </button>
        </div>

        {/* Outputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Hex Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hex Output</label>
            <textarea
              value={hexOutput}
              readOnly
              placeholder="Hexadecimal output will appear here"
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
              aria-label="Hex output"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleCopy("hex")}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                disabled={!hexOutput || isLoading}
              >
                <FaCopy className="mr-2" /> Copy
              </button>
              <button
                onClick={downloadOutput}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                disabled={!hexOutput || isLoading}
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>

          {/* Binary Output */}
          {outputFormat === "text" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Binary Output
              </label>
              <textarea
                value={binaryOutput}
                readOnly
                placeholder="Binary output will appear here"
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
                aria-label="Binary output"
              />
              <button
                onClick={() => handleCopy("binary")}
                className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                disabled={!binaryOutput || isLoading}
              >
                <FaCopy className="mr-2" /> Copy
              </button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert text to hex and binary</li>
            <li>Support for UTF-8 and ASCII encoding</li>
            <li>Customizable output: spaces, case, format (text/JSON)</li>
            <li>File upload support (.txt)</li>
            <li>Copy to clipboard and download options</li>
          </ul>
        </div>

        {/* Example */}
        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-medium mb-2">Example</h3>
          <p>Input:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">Hello World</pre>
          <p className="mt-2">Hex Output (Uppercase, with spaces):</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            48 65 6C 6C 6F 20 57 6F 72 6C 64
          </pre>
          <p className="mt-2">Binary Output:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            01001000 01100101 01101100 01101100 01101111 00100000 01110111 01101111
            01110010 01101100 01100100
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TextToHex;