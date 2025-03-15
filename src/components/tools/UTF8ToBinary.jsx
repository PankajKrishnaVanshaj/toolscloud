"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const UTF8ToBinary = () => {
  const [utf8Input, setUtf8Input] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space");
  const [grouping, setGrouping] = useState("none");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [outputFormat, setOutputFormat] = useState("binary"); // binary, hex, decimal
  const [caseSensitive, setCaseSensitive] = useState(false);
  const fileInputRef = useRef(null);

  const utf8ToBinary = useCallback(
    (utf8) => {
      try {
        if (!utf8) {
          setBinaryOutput("");
          setError("");
          return;
        }

        const text = caseSensitive ? utf8 : utf8.toLowerCase();
        const byteArray = new TextEncoder().encode(text);
        const outputArray = Array.from(byteArray).map((byte) => {
          let result;
          switch (outputFormat) {
            case "hex":
              result = byte.toString(16).padStart(2, "0");
              break;
            case "decimal":
              result = byte.toString(10);
              break;
            case "binary":
            default:
              result = byte.toString(2).padStart(8, "0");
              if (grouping !== "none") {
                const groupSize = parseInt(grouping);
                return result
                  .match(new RegExp(`.{1,${groupSize}}`, "g"))
                  .join(" ");
              }
          }
          return result;
        });

        const separator =
          delimiter === "none" ? "" : delimiter === "space" ? " " : ", ";
        setBinaryOutput(outputArray.join(separator));
        setError("");
      } catch (err) {
        setError("Error converting UTF-8: " + err.message);
        setBinaryOutput("");
      }
    },
    [delimiter, grouping, outputFormat, caseSensitive]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUtf8Input(value);
    utf8ToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setUtf8Input(text);
      utf8ToBinary(text);
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

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
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
    const blob = new Blob([binaryOutput], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'binary_output.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setUtf8Input("");
    setBinaryOutput("");
    set束束setError("");
    setDelimiter("space");
    setGrouping("none");
    setOutputFormat("binary");
    setCaseSensitive(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          UTF-8 Converter
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delimiter
            </label>
            <select
              value={delimiter}
              onChange={(e) => {
                setDelimiter(e.target.value);
                utf8ToBinary(utf8Input);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grouping
            </label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                utf8ToBinary(utf8Input);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={outputFormat !== "binary"}
            >
              <option value="none">None</option>
              <option value="4">4-bit</option>
              <option value="8">8-bit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => {
                setOutputFormat(e.target.value);
                utf8ToBinary(utf8Input);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="binary">Binary</option>
              <option value="hex">Hexadecimal</option>
              <option value="decimal">Decimal</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => {
                  setCaseSensitive(e.target.checked);
                  utf8ToBinary(utf8Input);
                }}
                className="mr-2 accent-blue-500"
              />
              <span className="text-sm text-gray-700">Case Sensitive</span>
            </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UTF-8 Input
          </label>
          <textarea
            value={utf8Input}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            rows="6"
            placeholder="Enter UTF-8 text (e.g., Hello or 😀)"
          />
          <input
            type="file"
            accept="text/plain"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Drag and drop a text file here or use the file input
          </p>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output ({outputFormat})
          </label>
          <div className="relative">
            <textarea
              value={binaryOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder="Output will appear here..."
            />
            {binaryOutput && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Copy to Clipboard"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={downloadOutput}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  title="Download as Text File"
                >
                  <FaDownload />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
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
            <li>Convert UTF-8 to Binary, Hex, or Decimal</li>
            <li>Customizable delimiter and grouping options</li>
            <li>Case sensitivity toggle</li>
            <li>Drag-and-drop or file upload support</li>
            <li>Copy to clipboard and download as text file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UTF8ToBinary;