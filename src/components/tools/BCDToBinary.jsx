"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BCDToBinary = () => {
  const [bcdInput, setBcdInput] = useState("");
  const [binaryInput, setBinaryInput] = useState("");
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bcdFormat, setBcdFormat] = useState("8421");
  const [outputBitLength, setOutputBitLength] = useState("auto");
  const [showSteps, setShowSteps] = useState(false);
  const [steps, setSteps] = useState([]);
  const [reverseMode, setReverseMode] = useState(false);
  const [inputBase, setInputBase] = useState("decimal"); // New: decimal/hex input option
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const bcdToBinary = useCallback(
    (bcd) => {
      try {
        if (!bcd) {
          setOutput("");
          setSteps([]);
          setError("");
          return;
        }

        let bcdArray = parseInput(bcd, delimiter);
        const conversionSteps = [];
        const binaries = bcdArray.map((bcdSegment, index) => {
          if (!/^[01]+$/.test(bcdSegment) || bcdSegment.length % 4 !== 0) {
            throw new Error(`Invalid BCD segment at position ${index + 1}: ${bcdSegment}`);
          }

          let decimal = 0;
          const segmentSteps = [];

          for (let i = 0; i < bcdSegment.length; i += 4) {
            const bcdDigit = bcdSegment.slice(i, i + 4);
            let digit = parseInt(bcdDigit, 2);
            if (bcdFormat === "excess3") digit -= 3;
            if (digit < 0 || digit > 9)
              throw new Error(`BCD digit ${bcdDigit} out of range (0-9)`);
            segmentSteps.push(`${bcdDigit} = ${digit}`);
            decimal = decimal * 10 + digit;
          }

          let binary = decimal.toString(2);
          if (outputBitLength !== "auto") {
            const maxValue = 2 ** parseInt(outputBitLength) - 1;
            if (decimal > maxValue) {
              throw new Error(`Decimal ${decimal} exceeds ${outputBitLength}-bit limit`);
            }
            binary = binary.padStart(parseInt(outputBitLength), "0");
          }

          conversionSteps.push({ bcd: bcdSegment, decimal, binary, steps: segmentSteps });
          return binary;
        });

        setOutput(binaries.join(getDelimiterOutput(delimiter)));
        setSteps(conversionSteps);
        setError("");
        addToHistory(bcd, binaries.join(getDelimiterOutput(delimiter)), "BCD to Binary");
      } catch (err) {
        setError("Error converting BCD to binary: " + err.message);
        setOutput("");
        setSteps([]);
      }
    },
    [delimiter, bcdFormat, outputBitLength]
  );

  const binaryToBCD = useCallback(
    (binary) => {
      try {
        if (!binary) {
          setOutput("");
          setSteps([]);
          setError("");
          return;
        }

        let binaryArray = parseInput(binary, delimiter);
        const conversionSteps = [];
        const bcds = binaryArray.map((bin, index) => {
          if (!/^[01]+$/.test(bin)) {
            throw new Error(`Invalid binary segment at position ${index + 1}: ${bin}`);
          }

          const decimal = parseInt(bin, 2);
          let decimalStr = decimal.toString();
          const segmentSteps = [];

          let bcd = "";
          for (let digit of decimalStr) {
            let bcdDigit = parseInt(digit).toString(2).padStart(4, "0");
            if (bcdFormat === "excess3") {
              const excessDigit = parseInt(digit) + 3;
              bcdDigit = excessDigit.toString(2).padStart(4, "0");
            }
            segmentSteps.push(`${digit} = ${bcdDigit}`);
            bcd += bcdDigit;
          }

          conversionSteps.push({ binary: bin, decimal, bcd, steps: segmentSteps });
          return bcd;
        });

        setOutput(bcds.join(getDelimiterOutput(delimiter)));
        setSteps(conversionSteps);
        setError("");
        addToHistory(binary, bcds.join(getDelimiterOutput(delimiter)), "Binary to BCD");
      } catch (err) {
        setError("Error converting binary to BCD: " + err.message);
        setOutput("");
        setSteps([]);
      }
    },
    [delimiter, bcdFormat]
  );

  const parseInput = (input, delimiter) => {
    switch (delimiter) {
      case "space":
        return input.trim().split(/\s+/);
      case "comma":
        return input.split(",").map((str) => str.trim());
      case "none":
        return input.trim().match(/.{4}/g) || [input.trim()];
      default:
        return input.trim().split(/\s+/);
    }
  };

  const getDelimiterOutput = (delimiter) =>
    delimiter === "none" ? "" : delimiter === "space" ? " " : ", ";

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (reverseMode) {
      setBinaryInput(value);
      if (inputBase === "decimal") {
        const binary = parseInt(value, 10).toString(2);
        binaryToBCD(binary);
      } else if (inputBase === "hex") {
        const binary = parseInt(value, 16).toString(2);
        binaryToBCD(binary);
      } else {
        binaryToBCD(value);
      }
    } else {
      setBcdInput(value);
      bcdToBinary(value);
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (reverseMode) {
        setBinaryInput(text);
        binaryToBCD(text);
      } else {
        setBcdInput(text);
        bcdToBinary(text);
      }
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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBcdInput("");
    setBinaryInput("");
    setOutput("");
    setError("");
    setSteps([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addToHistory = (input, output, type) => {
    setHistory((prev) => [
      { input, output, type, timestamp: new Date().toLocaleString() },
      ...prev.slice(0, 9), // Keep last 10 entries
    ]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-2xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced BCD ↔ Binary Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <button
              onClick={() => setReverseMode(!reverseMode)}
              className={`w-full py-2 px-4 rounded-md transition-colors ${
                reverseMode ? "bg-purple-600 text-white" : "bg-blue-600 text-white"
              } hover:bg-opacity-90`}
            >
              {reverseMode ? "Binary to BCD" : "BCD to Binary"}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BCD Format</label>
            <select
              value={bcdFormat}
              onChange={(e) => setBcdFormat(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="8421">8-4-2-1</option>
              <option value="excess3">Excess-3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
            <select
              value={outputBitLength}
              onChange={(e) => setOutputBitLength(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="auto">Auto</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
            </select>
          </div>
          {reverseMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input Base</label>
              <select
                value={inputBase}
                onChange={(e) => setInputBase(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary</option>
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>
          )}
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
            {reverseMode ? "Enter Binary/Decimal/Hex:" : "Enter BCD:"}
          </label>
          <textarea
            value={reverseMode ? binaryInput : bcdInput}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono resize-y"
            rows="6"
            placeholder={
              reverseMode
                ? inputBase === "decimal"
                  ? "Enter decimal (e.g., 123)"
                  : inputBase === "hex"
                  ? "Enter hex (e.g., 7B)"
                  : "Enter binary (e.g., 1010 1100)"
                : "Enter BCD (e.g., 0001 0010 0011)"
            }
          />
          <input
            type="file"
            accept=".txt"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {reverseMode ? "BCD Output:" : "Binary Output:"}
          </label>
          <div className="relative">
            <textarea
              value={output}
              readOnly
              className="w-full p-3 border rounded-md bg-gray-50 text-gray-600 font-mono resize-y min-h-[150px]"
              placeholder="Output will appear here..."
            />
            {output && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={() => copyToClipboard(output)}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={() =>
                    downloadOutput(output, reverseMode ? "bcd_output.txt" : "binary_output.txt")
                  }
                  className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
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
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showSteps ? "Hide Steps" : "Show Steps"}
          </button>
          <button
            onClick={clearAll}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear All
          </button>
        </div>

        {/* Steps */}
        {showSteps && steps.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Conversion Steps</h2>
            {steps.map((step, index) => (
              <div key={index} className="mb-4">
                <p className="font-medium">
                  {reverseMode ? "Binary" : "BCD"} Segment {index + 1}:{" "}
                  {reverseMode ? step.binary : step.bcd}
                </p>
                <p>Decimal: {step.decimal}</p>
                <p>{reverseMode ? "BCD" : "Binary"}: {reverseMode ? step.bcd : step.binary}</p>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {step.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Conversion History</h2>
            <ul className="space-y-2 text-sm text-yellow-700 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index}>
                  [{entry.timestamp}] {entry.type}: {entry.input} → {entry.output}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Bidirectional conversion (BCD ↔ Binary)</li>
            <li>Supports 8-4-2-1 and Excess-3 BCD formats</li>
            <li>Customizable delimiter and output bit length</li>
            <li>Decimal/Hex input for Binary to BCD mode</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download options</li>
            <li>Detailed conversion steps and history</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BCDToBinary;