"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryToHex = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [hexOutput, setHexOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space"); // space, comma, none
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [format, setFormat] = useState("uppercase"); // uppercase, lowercase
  const [prefix, setPrefix] = useState("none"); // none, 0x, #
  const [byteSize, setByteSize] = useState(8); // 4, 8, 16
  const [groupSize, setGroupSize] = useState(1); // Number of hex values per group
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const binaryToHex = useCallback(
    (binary) => {
      try {
        if (!binary) {
          setHexOutput("");
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
            binaryArray = binary.match(new RegExp(`.{1,${byteSize}}`, "g")) || [];
            break;
          default:
            binaryArray = binary.trim().split(/\s+/);
        }

        const hex = binaryArray
          .map((bin, index) => {
            if (!/^[01]+$/.test(bin))
              throw new Error(`Invalid binary format at position ${index + 1}`);
            if (bin.length !== byteSize)
              throw new Error(`Binary length must be ${byteSize} bits`);
            const decimal = parseInt(bin, 2);
            let hexStr = decimal.toString(16);
            hexStr = format === "uppercase" ? hexStr.toUpperCase() : hexStr.toLowerCase();
            hexStr = hexStr.padStart(byteSize / 4, "0");
            switch (prefix) {
              case "0x":
                return "0x" + hexStr;
              case "#":
                return "#" + hexStr;
              default:
                return hexStr;
            }
          })
          .reduce((acc, val, idx) => {
            const groupIndex = Math.floor(idx / groupSize);
            acc[groupIndex] = (acc[groupIndex] || "") + (idx % groupSize === 0 ? "" : " ") + val;
            return acc;
          }, [])
          .join("   "); // Triple space for group separation

        setHexOutput(hex);
        setError("");
        setHistory((prev) => [...prev, { input: binary, output: hex }].slice(-10)); // Keep last 10
      } catch (err) {
        setError("Error converting binary to hex: " + err.message);
        setHexOutput("");
      }
    },
    [delimiter, format, prefix, byteSize, groupSize]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToHex(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToHex(text);
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
      await navigator.clipboard.writeText(hexOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([hexOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hex_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput("");
    setHexOutput("");
    setError("");
    setHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Binary to Hex Converter
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
                binaryToHex(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None (Continuous)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                binaryToHex(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="uppercase">Uppercase</option>
              <option value="lowercase">Lowercase</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
            <select
              value={prefix}
              onChange={(e) => {
                setPrefix(e.target.value);
                binaryToHex(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="0x">0x</option>
              <option value="#">#</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Byte Size</label>
            <select
              value={byteSize}
              onChange={(e) => {
                setByteSize(parseInt(e.target.value));
                binaryToHex(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={4}>4 bits</option>
              <option value={8}>8 bits</option>
              <option value={16}>16 bits</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group Size ({groupSize})
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={groupSize}
              onChange={(e) => {
                setGroupSize(parseInt(e.target.value));
                binaryToHex(binaryInput);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
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
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            rows="6"
            placeholder={`Enter ${byteSize}-bit binary numbers (e.g., ${
              byteSize === 8 ? "01001000 01100101" : byteSize === 4 ? "1010 1100" : "1010101010101010 1100110011001100"
            })`}
          />
          <div className="flex gap-2 mt-2">
            <input
              type="file"
              accept="text/plain"
              ref={fileInputRef}
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <FaUpload className="mr-2" /> Upload File
            </button>
            <button
              onClick={clearAll}
              className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hex Output</label>
          <div className="relative">
            <textarea
              value={hexOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder="Hexadecimal output will appear here..."
            />
            {hexOutput && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Conversion History</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
              {history
                .slice()
                .reverse()
                .map((item, index) => (
                  <li key={index}>
                    <span className="font-mono">Input:</span> {item.input.slice(0, 20)}...{" "}
                    <span className="font-mono">Output:</span> {item.output.slice(0, 20)}...
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable delimiter, format, prefix, byte size, and group size</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download options</li>
            <li>Conversion history tracking</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time conversion with error handling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToHex;