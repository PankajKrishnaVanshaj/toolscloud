"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaFileUpload } from "react-icons/fa";

const IntegerToBinary = () => {
  const [integerInput, setIntegerInput] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitLength, setBitLength] = useState("auto");
  const [signedMode, setSignedMode] = useState("unsigned");
  const [grouping, setGrouping] = useState("none");
  const [outputBase, setOutputBase] = useState("binary"); // New: binary, hex, octal
  const [padding, setPadding] = useState(true); // New: toggle padding
  const fileInputRef = useRef(null);

  const integerToBinary = useCallback(
    (integer) => {
      try {
        if (!integer) {
          setBinaryOutput("");
          setError("");
          return;
        }

        let integerArray;
        switch (delimiter) {
          case "space":
            integerArray = integer.trim().split(/\s+/);
            break;
          case "comma":
            integerArray = integer.split(",").map((str) => str.trim());
            break;
          case "none":
            integerArray = integer.match(/-?\d+/g) || [];
            break;
          default:
            integerArray = integer.trim().split(/\s+/);
        }

        const outputs = integerArray.map((int) => {
          const num = parseInt(int, 10);
          if (isNaN(num)) throw new Error("Invalid integer input");

          const actualBitLength =
            bitLength === "auto" ? Math.max(4, Math.ceil(Math.log2(Math.abs(num) + 1))) : parseInt(bitLength);
          const maxUnsigned = 2 ** actualBitLength - 1;
          const minSigned = -(2 ** (actualBitLength - 1));
          const maxSigned = 2 ** (actualBitLength - 1) - 1;

          let result;
          if (signedMode === "unsigned") {
            if (num < 0) throw new Error("Unsigned mode does not support negative numbers");
            if (bitLength !== "auto" && num > maxUnsigned) {
              throw new Error(`Number exceeds ${actualBitLength}-bit unsigned limit (${maxUnsigned})`);
            }
            result = num.toString(outputBase === "binary" ? 2 : outputBase === "hex" ? 16 : 8);
            if (bitLength !== "auto" && padding) {
              result = result.padStart(
                outputBase === "binary" ? actualBitLength : Math.ceil(actualBitLength / (outputBase === "hex" ? 4 : 3)),
                "0"
              );
            }
          } else {
            if (bitLength !== "auto" && (num < minSigned || num > maxSigned)) {
              throw new Error(`Number out of ${actualBitLength}-bit signed range (${minSigned} to ${maxSigned})`);
            }
            result =
              num < 0
                ? (maxUnsigned + 1 + num).toString(outputBase === "binary" ? 2 : outputBase === "hex" ? 16 : 8)
                : num.toString(outputBase === "binary" ? 2 : outputBase === "hex" ? 16 : 8);
            if (bitLength !== "auto" && padding) {
              result = result.padStart(
                outputBase === "binary" ? actualBitLength : Math.ceil(actualBitLength / (outputBase === "hex" ? 4 : 3)),
                "0"
              );
            }
            if (bitLength === "auto" && num >= 0 && outputBase === "binary") {
              result = result.replace(/^0+/, "") || "0";
            }
          }

          if (grouping !== "none" && outputBase === "binary") {
            const groupSize = parseInt(grouping);
            return result.match(new RegExp(`.{1,${groupSize}}`, "g")).join(" ");
          }
          return outputBase === "hex" ? "0x" + result.toUpperCase() : result;
        });

        setBinaryOutput(outputs.join(delimiter === "none" ? "" : delimiter === "space" ? " " : ", "));
        setError("");
      } catch (err) {
        setError("Error converting integer: " + err.message);
        setBinaryOutput("");
      }
    },
    [delimiter, bitLength, signedMode, grouping, outputBase, padding]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setIntegerInput(value);
    integerToBinary(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setIntegerInput(text);
      integerToBinary(text);
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
    const blob = new Blob([binaryOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${outputBase}_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setIntegerInput("");
    setBinaryOutput("");
    setError("");
    setDelimiter("space");
    setBitLength("auto");
    setSignedMode("unsigned");
    setGrouping("none");
    setOutputBase("binary");
    setPadding(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Integer to Number Converter
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
                integerToBinary(integerInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bit Length</label>
            <select
              value={bitLength}
              onChange={(e) => {
                setBitLength(e.target.value);
                integerToBinary(integerInput);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <select
              value={signedMode}
              onChange={(e) => {
                setSignedMode(e.target.value);
                integerToBinary(integerInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="unsigned">Unsigned</option>
              <option value="signed">Signed (2's Complement)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Output Base</label>
            <select
              value={outputBase}
              onChange={(e) => {
                setOutputBase(e.target.value);
                integerToBinary(integerInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="binary">Binary (Base 2)</option>
              <option value="octal">Octal (Base 8)</option>
              <option value="hex">Hexadecimal (Base 16)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grouping</label>
            <select
              value={grouping}
              onChange={(e) => {
                setGrouping(e.target.value);
                integerToBinary(integerInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={outputBase !== "binary"}
            >
              <option value="none">None</option>
              <option value="4">4-bit Groups</option>
              <option value="8">8-bit Groups</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={padding}
                onChange={(e) => {
                  setPadding(e.target.checked);
                  integerToBinary(integerInput);
                }}
                className="mr-2 accent-blue-500"
                disabled={bitLength === "auto"}
              />
              <span className="text-sm text-gray-700">Pad Output</span>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Enter Integers</label>
          <textarea
            value={integerInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-y"
            rows="6"
            placeholder="Enter integers (e.g., 4 10 or -1)"
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">Drag and drop a text file or upload below</p>
            <input
              type="file"
              accept="text/plain"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files[0])}
              className="text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {outputBase.charAt(0).toUpperCase() + outputBase.slice(1)} Output
          </label>
          <div className="relative">
            <textarea
              value={binaryOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder={`${outputBase} output will appear here...`}
            />
            {binaryOutput && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors flex items-center"
                >
                  <FaCopy className="mr-1" /> Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors flex items-center"
                >
                  <FaDownload className="mr-1" /> Download
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded-md">{error}</div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={clearAll}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <FaSync className="mr-2" /> Clear All
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert to Binary, Octal, or Hexadecimal</li>
            <li>Supports signed (2's complement) and unsigned integers</li>
            <li>Custom bit length (auto, 4, 8, 16, 32)</li>
            <li>Flexible delimiters and grouping options</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download output</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IntegerToBinary;