"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryToDecimal = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [decimalOutput, setDecimalOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [signedMode, setSignedMode] = useState("unsigned");
  const [bitLength, setBitLength] = useState("8");
  const [outputFormat, setOutputFormat] = useState("decimal"); // decimal, hex, octal
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const binaryToDecimal = useCallback(
    (binary) => {
      try {
        if (!binary) {
          setDecimalOutput("");
          setError("");
          return;
        }

        let binaryArray;
        switch (delimiter) {
          case "space":
            binaryArray = binary.trim().split(/\s+/);
            break;
          case "comma":
            binaryArray = binary.split(",").map((str) => str.trim());
            break;
          case "none":
            binaryArray = binary.match(new RegExp(`.{1,${bitLength}}`, "g")) || [];
            break;
          default:
            binaryArray = binary.trim().split(/\s+/);
        }

        const decimals = binaryArray.map((bin) => {
          if (!/^[01]+$/.test(bin)) throw new Error("Invalid binary format");
          if (delimiter !== "none" && bin.length > parseInt(bitLength)) {
            throw new Error(`Binary length exceeds selected ${bitLength}-bit limit`);
          }

          let decimal = parseInt(bin, 2);
          if (signedMode === "signed" && bin.length === parseInt(bitLength)) {
            if (bin[0] === "1") {
              const maxValue = 2 ** bitLength;
              decimal = decimal - maxValue;
            }
          }

          switch (outputFormat) {
            case "hex":
              return "0x" + decimal.toString(16).toUpperCase();
            case "octal":
              return "0" + decimal.toString(8);
            default:
              return decimal.toString();
          }
        });

        setDecimalOutput(decimals.join(" "));
        setError("");
        setHistory((prev) => [...prev, { input: binary, output: decimals.join(" ") }].slice(-5));
      } catch (err) {
        setError("Error converting binary: " + err.message);
        setDecimalOutput("");
      }
    },
    [delimiter, signedMode, bitLength, outputFormat]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToDecimal(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToDecimal(text);
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
      await navigator.clipboard.writeText(decimalOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([decimalOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_output_${outputFormat}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput("");
    setDecimalOutput("");
    setError("");
    setHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Binary Converter
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
                binaryToDecimal(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None (Continuous)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={signedMode}
              onChange={(e) => {
                setSignedMode(e.target.value);
                binaryToDecimal(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="unsigned">Unsigned</option>
              <option value="signed">Signed (2's Complement)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
            <select
              value={bitLength}
              onChange={(e) => {
                setBitLength(e.target.value);
                binaryToDecimal(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
              <option value="32">32-bit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
            <select
              value={outputFormat}
              onChange={(e) => {
                setOutputFormat(e.target.value);
                binaryToDecimal(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="decimal">Decimal</option>
              <option value="hex">Hexadecimal</option>
              <option value="octal">Octal</option>
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
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm"
            rows="6"
            placeholder="Enter binary (e.g., 01001000 01100101 or 01001000,01100101)"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Drag and drop a text file or use the upload button
            </p>
            <input
              type="file"
              accept="text/plain"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer transition-colors"
            >
              <FaUpload /> Upload
            </label>
          </div>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {outputFormat.charAt(0).toUpperCase() + outputFormat.slice(1)} Output
          </label>
          <div className="relative">
            <textarea
              value={decimalOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono text-sm"
              placeholder="Output will appear here..."
            />
            {decimalOutput && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={downloadOutput}
                  className="p-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
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
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Conversion History (Last 5)</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
              {history.slice().reverse().map((item, index) => (
                <li key={index}>
                  <span className="font-mono">Input: {item.input}</span> →{" "}
                  <span className="font-mono">Output: {item.output}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert binary to decimal, hexadecimal, or octal</li>
            <li>Support for signed (2's complement) and unsigned numbers</li>
            <li>Custom bit lengths: 4, 8, 16, 32</li>
            <li>Multiple delimiter options: space, comma, none</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download output</li>
            <li>Conversion history (last 5 entries)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToDecimal;