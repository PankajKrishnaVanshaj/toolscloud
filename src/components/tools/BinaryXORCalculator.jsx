"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryXORCalculator = () => {
  const [binary1, setBinary1] = useState("");
  const [binary2, setBinary2] = useState("");
  const [result, setResult] = useState("");
  const [delimiter, setDelimiter] = useState("none");
  const [grouping, setGrouping] = useState("none");
  const [bitLength, setBitLength] = useState("auto");
  const [error, setError] = useState("");
  const [isDragging1, setIsDragging1] = useState(false);
  const [isDragging2, setIsDragging2] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [format, setFormat] = useState("binary"); // binary, hex, decimal
  const [history, setHistory] = useState([]);
  const fileInput1Ref = useRef(null);
  const fileInput2Ref = useRef(null);

  const calculateXOR = useCallback(() => {
    try {
      if (!binary1 || !binary2) {
        setResult("");
        setError("");
        return;
      }

      let bin1 = binary1.trim();
      let bin2 = binary2.trim();

      // Handle different input formats
      if (format === "hex") {
        bin1 = parseInt(bin1, 16).toString(2);
        bin2 = parseInt(bin2, 16).toString(2);
      } else if (format === "decimal") {
        bin1 = parseInt(bin1, 10).toString(2);
        bin2 = parseInt(bin2, 10).toString(2);
      }

      // Process delimiters
      switch (delimiter) {
        case "space":
          bin1 = bin1.split(/\s+/).join("");
          bin2 = bin2.split(/\s+/).join("");
          break;
        case "comma":
          bin1 = bin1.split(",").map((str) => str.trim()).join("");
          bin2 = bin2.split(",").map((str) => str.trim()).join("");
          break;
        case "none":
          break;
      }

      if (!/^[01]+$/.test(bin1) || !/^[01]+$/.test(bin2)) {
        throw new Error(`Invalid ${format} format`);
      }

      const maxLength = Math.max(bin1.length, bin2.length);
      if (
        bitLength !== "auto" &&
        (bin1.length > parseInt(bitLength) || bin2.length > parseInt(bitLength))
      ) {
        throw new Error(`Inputs must not exceed ${bitLength} bits`);
      }

      const targetLength = bitLength === "auto" ? maxLength : parseInt(bitLength);
      bin1 = bin1.padStart(targetLength, "0");
      bin2 = bin2.padStart(targetLength, "0");

      let xorResult = "";
      for (let i = 0; i < targetLength; i++) {
        xorResult += (parseInt(bin1[i]) ^ parseInt(bin2[i])).toString();
      }

      let finalResult = xorResult;
      if (format === "hex") finalResult = parseInt(xorResult, 2).toString(16).toUpperCase();
      else if (format === "decimal") finalResult = parseInt(xorResult, 2).toString(10);

      if (grouping !== "none" && format === "binary") {
        const groupSize = parseInt(grouping);
        finalResult = finalResult.match(new RegExp(`.{1,${groupSize}}`, "g")).join(" ");
      }

      setResult(finalResult);
      setError("");
      setHistory((prev) => [
        { binary1, binary2, result: finalResult, format, timestamp: Date.now() },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError("Error: " + err.message);
      setResult("");
    }
  }, [binary1, binary2, delimiter, grouping, bitLength, format]);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    calculateXOR();
  };

  const handleFileUpload = (setter, ref) => (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setter(e.target.result.trim());
      calculateXOR();
    };
    reader.onerror = () => setError(`Error reading file for ${setter === setBinary1 ? "Binary 1" : "Binary 2"}`);
    reader.readAsText(file);
  };

  const handleDrop = (setter, setDragging, ref) => (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      handleFileUpload(setter, ref)(file);
    } else {
      setError("Please drop a valid text file");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([result], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xor_result_${format}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinary1("");
    setBinary2("");
    setResult("");
    setError("");
    setHistory([]);
    if (fileInput1Ref.current) fileInput1Ref.current.value = "";
    if (fileInput2Ref.current) fileInput2Ref.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary XOR Calculator
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md shadow-md">
            Copied!
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                calculateXOR();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="binary">Binary</option>
              <option value="hex">Hexadecimal</option>
              <option value="decimal">Decimal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                calculateXOR();
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
                calculateXOR();
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
                calculateXOR();
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={format !== "binary"}
            >
              <option value="none">None</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
            </select>
          </div>
        </div>

        {/* Input Sections */}
        {[
          { label: "Input 1", value: binary1, setter: setBinary1, dragging: isDragging1, setDragging: setIsDragging1, ref: fileInput1Ref },
          { label: "Input 2", value: binary2, setter: setBinary2, dragging: isDragging2, setDragging: setIsDragging2, ref: fileInput2Ref },
        ].map(({ label, value, setter, dragging, setDragging, ref }, index) => (
          <div
            key={index}
            className={`mb-6 p-4 border-2 rounded-lg ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop(setter, setDragging, ref)}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <textarea
              value={value}
              onChange={handleInputChange(setter)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono resize-y"
              rows="3"
              placeholder={`Enter ${format} value (e.g., ${format === "binary" ? "1010" : format === "hex" ? "A" : "10"})`}
            />
            <input
              type="file"
              accept="text/plain"
              ref={ref}
              onChange={(e) => handleFileUpload(setter, ref)(e.target.files[0])}
              className="mt-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        ))}

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">XOR Result</label>
          <div className="relative">
            <textarea
              value={result}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-700 font-mono resize-y min-h-[100px]"
              placeholder="Result will appear here..."
            />
            {result && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={downloadOutput}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Calculation History</h3>
            <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <li key={index} className="flex justify-between">
                  <span>{`${entry.binary1} XOR ${entry.binary2} = ${entry.result} (${entry.format})`}</span>
                  <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync /> Clear All
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Supports Binary, Hexadecimal, and Decimal inputs</li>
            <li>Custom delimiters and bit lengths</li>
            <li>Grouping for binary output</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download result</li>
            <li>Calculation history (last 10)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryXORCalculator;