"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryEncoder = () => {
  const [inputText, setInputText] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [encodingScheme, setEncodingScheme] = useState("utf8");
  const [delimiter, setDelimiter] = useState("space");
  const [grouping, setGrouping] = useState("none");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [history, setHistory] = useState([]); // New: History of encodings
  const [bitSize, setBitSize] = useState(8); // New: 7-bit or 8-bit encoding
  const fileInputRef = useRef(null);

  const encodeToBinary = useCallback(
    (text) => {
      try {
        if (!text) {
          setBinaryOutput("");
          setError("");
          return;
        }

        let byteArray;
        switch (encodingScheme) {
          case "ascii":
            byteArray = Array.from(text).map((char) => {
              const code = char.charCodeAt(0);
              const maxValue = bitSize === 8 ? 127 : 127; // ASCII limit
              if (code > maxValue)
                throw new Error(`Character exceeds ASCII range (0-${maxValue})`);
              return code;
            });
            break;
          case "utf8":
            byteArray = new TextEncoder().encode(text);
            break;
          case "base64":
            const base64 = btoa(text);
            byteArray = Array.from(base64).map((char) => char.charCodeAt(0));
            break;
          case "hex": // New: Hex input to binary
            const hexCleaned = text.replace(/\s/g, "").match(/[0-9A-Fa-f]{2}/g);
            if (!hexCleaned) throw new Error("Invalid hex input");
            byteArray = hexCleaned.map((hex) => parseInt(hex, 16));
            break;
          default:
            throw new Error("Unsupported encoding scheme");
        }

        const binaryArray = byteArray.map((byte) => {
          let binary = byte.toString(2).padStart(bitSize, "0");
          if (grouping !== "none") {
            const groupSize = parseInt(grouping);
            return binary.match(new RegExp(`.{1,${groupSize}}`, "g")).join(" ");
          }
          return binary;
        });

        const output = binaryArray.join(
          delimiter === "none" ? "" : delimiter === "space" ? " " : ", "
        );
        setBinaryOutput(output);
        setError("");
        setHistory((prev) => [
          { input: text, output, scheme: encodingScheme, timestamp: Date.now() },
          ...prev.slice(0, 9), // Keep last 10
        ]);
      } catch (err) {
        setError("Error encoding to binary: " + err.message);
        setBinaryOutput("");
      }
    },
    [encodingScheme, delimiter, grouping, bitSize]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);
    encodeToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setInputText(text);
      encodeToBinary(text);
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
    const blob = new Blob([binaryOutput], { type: "text/plain;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `binary_output_${encodingScheme}_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInputText("");
    setBinaryOutput("");
    setError("");
    setHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadFromHistory = (entry) => {
    setInputText(entry.input);
    setBinaryOutput(entry.output);
    setEncodingScheme(entry.scheme);
    encodeToBinary(entry.input);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Binary Encoder
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Encoding Scheme</label>
            <select
              value={encodingScheme}
              onChange={(e) => {
                setEncodingScheme(e.target.value);
                encodeToBinary(inputText);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="ascii">ASCII</option>
              <option value="utf8">UTF-8</option>
              <option value="base64">Base64</option>
              <option value="hex">Hex to Binary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                encodeToBinary(inputText);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grouping</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                encodeToBinary(inputText);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Size</label>
            <select
              value={bitSize}
              onChange={(e) => {
                setBitSize(parseInt(e.target.value));
                encodeToBinary(inputText);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>7-bit</option>
              <option value={8}>8-bit</option>
            </select>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Input</label>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 text-sm resize-y"
            rows="6"
            placeholder={
              encodingScheme === "hex"
                ? "Enter hex (e.g., 48 65 6C 6C 6F)"
                : "Enter text (e.g., Hello)"
            }
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              Drag and drop a text file or upload below
            </p>
            <input
              type="file"
              accept="text/plain"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Binary Output</label>
          <div className="relative">
            <textarea
              value={binaryOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono text-sm"
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
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Encoding History</h3>
            <ul className="max-h-40 overflow-y-auto text-sm text-gray-600 space-y-2">
              {history.map((entry, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-white rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={() => loadFromHistory(entry)}
                >
                  <span>
                    {entry.input.slice(0, 20)}... → {entry.output.slice(0, 20)}... (
                    {entry.scheme})
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports ASCII, UTF-8, Base64, and Hex to Binary encoding</li>
            <li>Configurable 7-bit or 8-bit encoding</li>
            <li>Custom delimiters: space, comma, or none</li>
            <li>Bit grouping options: none, 4-bit, 8-bit</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download output</li>
            <li>Encoding history with clickable entries</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryEncoder;