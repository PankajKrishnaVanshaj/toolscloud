"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryToGrayCode = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [grayCodeOutput, setGrayCodeOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitLength, setBitLength] = useState("auto");
  const [grouping, setGrouping] = useState("none");
  const [caseFormat, setCaseFormat] = useState("normal"); // normal, upper, lower
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const binaryToGrayCode = useCallback(
    (binary) => {
      try {
        if (!binary) {
          setGrayCodeOutput("");
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
            binaryArray = [binary.trim()];
            break;
          default:
            binaryArray = binary.trim().split(/\s+/);
        }

        const grayCodes = binaryArray.map((bin) => {
          if (!/^[01]+$/.test(bin)) throw new Error("Invalid binary format");
          if (bitLength !== "auto" && bin.length !== parseInt(bitLength)) {
            throw new Error(`Binary must be ${bitLength} bits when not in auto mode`);
          }

          let gray = bin[0];
          for (let i = 1; i < bin.length; i++) {
            gray += (parseInt(bin[i - 1]) ^ parseInt(bin[i])).toString();
          }

          if (grouping === "4" && gray.length >= 4) {
            gray = gray.match(/.{1,4}/g).join(" ");
          } else if (grouping === "8" && gray.length >= 8) {
            gray = gray.match(/.{1,8}/g).join(" ");
          }

          return caseFormat === "upper"
            ? gray.toUpperCase()
            : caseFormat === "lower"
            ? gray.toLowerCase()
            : gray;
        });

        const output = grayCodes.join(
          delimiter === "none" ? "" : delimiter === "space" ? " " : ", "
        );
        setGrayCodeOutput(output);
        setError("");
        setHistory((prev) => [...prev, { input: binary, output }].slice(-10)); // Keep last 10
      } catch (err) {
        setError("Error converting binary to Gray code: " + err.message);
        setGrayCodeOutput("");
      }
    },
    [delimiter, bitLength, grouping, caseFormat]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToGrayCode(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToGrayCode(text);
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

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(grayCodeOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([grayCodeOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `graycode_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput("");
    setGrayCodeOutput("");
    setError("");
    setHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to Gray Code Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md shadow-lg animate-fade-in">
            Copied!
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Delimiter",
              value: delimiter,
              onChange: (e) => {
                setDelimiter(e.target.value);
                binaryToGrayCode(binaryInput);
              },
              options: [
                { value: "space", label: "Space" },
                { value: "comma", label: "Comma" },
                { value: "none", label: "None" },
              ],
            },
            {
              label: "Bit Length",
              value: bitLength,
              onChange: (e) => {
                setBitLength(e.target.value);
                binaryToGrayCode(binaryInput);
              },
              options: [
                { value: "auto", label: "Auto" },
                { value: "4", label: "4-bit" },
                { value: "8", label: "8-bit" },
                { value: "16", label: "16-bit" },
              ],
            },
            {
              label: "Grouping",
              value: grouping,
              onChange: (e) => {
                setGrouping(e.target.value);
                binaryToGrayCode(binaryInput);
              },
              options: [
                { value: "none", label: "None" },
                { value: "4", label: "4-bit" },
                { value: "8", label: "8-bit" },
              ],
            },
            {
              label: "Case",
              value: caseFormat,
              onChange: (e) => {
                setCaseFormat(e.target.value);
                binaryToGrayCode(binaryInput);
              },
              options: [
                { value: "normal", label: "Normal" },
                { value: "upper", label: "Upper" },
                { value: "lower", label: "Lower" },
              ],
            },
          ].map(({ label, value, onChange, options }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <select
                value={value}
                onChange={onChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Binary Input
          </label>
          <textarea
            value={binaryInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono resize-y"
            rows="6"
            placeholder="e.g., 0100 0110 or 0100,0110"
          />
          <input
            type="file"
            accept=".txt"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="mt-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gray Code Output
          </label>
          <div className="relative">
            <textarea
              value={grayCodeOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 font-mono resize-y min-h-[150px]"
              placeholder="Gray code output will appear here..."
            />
            {grayCodeOutput && (
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
        <div className="flex justify-center gap-4 mb-6">
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
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Conversion History</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto font-mono">
              {history.slice().reverse().map((item, index) => (
                <li key={index}>
                  <span className="text-gray-500">Binary:</span> {item.input} →{" "}
                  <span className="text-gray-500">Gray:</span> {item.output}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert binary to Gray code with multiple delimiters</li>
            <li>Support for fixed bit lengths (4, 8, 16) or auto-detection</li>
            <li>Custom grouping (4-bit, 8-bit) and case formatting</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download output</li>
            <li>Conversion history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToGrayCode;