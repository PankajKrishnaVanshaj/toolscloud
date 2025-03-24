"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryToOctal = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [octalOutput, setOctalOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [grouping, setGrouping] = useState("none");
  const [padding, setPadding] = useState("none");
  const [caseOutput, setCaseOutput] = useState("normal"); // normal, uppercase
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  const binaryToOctal = useCallback(
    (binary) => {
      try {
        if (!binary) {
          setOctalOutput("");
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
          case "semicolon":
            binaryArray = binary.split(";").map((str) => str.trim());
            break;
          case "none":
            binaryArray = [binary.trim()];
            break;
          default:
            binaryArray = binary.trim().split(/\s+/);
        }

        const octals = binaryArray.map((bin) => {
          if (!/^[01]+$/.test(bin)) throw new Error("Invalid binary digit (must be 0 or 1)");

          let binaryStr = bin;
          const remainder = binaryStr.length % 3;
          if (remainder !== 0) {
            if (padding === "left") {
              binaryStr = "0".repeat(3 - remainder) + binaryStr;
            } else if (padding === "right") {
              binaryStr = binaryStr + "0".repeat(3 - remainder);
            }
          }

          let octal = binaryStr
            .match(/.{1,3}/g)
            .map((chunk) => parseInt(chunk, 2).toString(8))
            .join("");

          if (grouping !== "none") {
            const groupSize = parseInt(grouping);
            octal = octal.match(new RegExp(`.{1,${groupSize}}`, "g")).join(" ");
          }

          return caseOutput === "uppercase" ? octal.toUpperCase() : octal;
        });

        const result = octals.join(delimiter === "none" ? "" : " ");
        setOctalOutput(result);
        setError("");
        setHistory((prev) => [...prev.slice(-9), { input: binary, output: result }].slice(-10));
      } catch (err) {
        setError("Error: " + err.message);
        setOctalOutput("");
      }
    },
    [delimiter, grouping, padding, caseOutput]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToOctal(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToOctal(text);
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
      await navigator.clipboard.writeText(octalOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([octalOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `octal_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput("");
    setOctalOutput("");
    setError("");
    setHistory([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadFromHistory = (entry) => {
    setBinaryInput(entry.input);
    setOctalOutput(entry.output);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Binary to Octal Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md shadow-lg animate-fade-in">
            Copied!
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
                binaryToOctal(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="semicolon">Semicolon</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grouping</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                binaryToOctal(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="3">3-digit</option>
              <option value="4">4-digit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
            <select
              value={padding}
              onChange={(e) => {
                setPadding(e.target.value);
                binaryToOctal(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">None</option>
              <option value="left">Left (0s)</option>
              <option value="right">Right (0s)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Case</label>
            <select
              value={caseOutput}
              onChange={(e) => {
                setCaseOutput(e.target.value);
                binaryToOctal(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="normal">Normal</option>
              <option value="uppercase">Uppercase</option>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Binary Input</label>
          <textarea
            value={binaryInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 font-mono resize-y min-h-[100px]"
            placeholder="e.g., 01001000 01100101"
          />
          <input
            type="file"
            accept="text/plain"
            ref={fileInputRef}
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            className="mt-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Octal Output</label>
          <div className="relative">
            <textarea
              value={octalOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 font-mono min-h-[100px] resize-y"
              placeholder="Octal output will appear here..."
            />
            {octalOutput && (
              <div className="absolute top-2 right-2 flex gap-2">
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
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={clearAll}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Conversion History</h3>
            <ul className="max-h-40 overflow-y-auto space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:bg-gray-100 p-2 rounded-md"
                  onClick={() => loadFromHistory(entry)}
                >
                  <strong>Input:</strong> {entry.input.slice(0, 20)}
                  {entry.input.length > 20 && "..."} |{" "}
                  <strong>Output:</strong> {entry.output.slice(0, 20)}
                  {entry.output.length > 20 && "..."}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Custom delimiters: Space, Comma, Semicolon, None</li>
            <li>Grouping options: None, 3-digit, 4-digit</li>
            <li>Padding: None, Left, Right</li>
            <li>Output case: Normal or Uppercase</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download as text</li>
            <li>Conversion history (last 10 entries)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToOctal;