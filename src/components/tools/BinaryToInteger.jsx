"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaCopy, FaDownload, FaSync, FaFileUpload } from "react-icons/fa";

const BinaryToInteger = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [integerOutput, setIntegerOutput] = useState("");
  const [delimiter, setDelimiter] = useState("space");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [bitLength, setBitLength] = useState("auto");
  const [signedMode, setSignedMode] = useState("unsigned");
  const [inputBase, setInputBase] = useState("binary"); // New: binary, hex, octal
  const [outputFormat, setOutputFormat] = useState("decimal"); // New: decimal, hex, octal
  const fileInputRef = useRef(null);

  const binaryToInteger = useCallback(
    (input) => {
      try {
        if (!input) {
          setIntegerOutput("");
          setError("");
          return;
        }

        let inputArray;
        switch (delimiter) {
          case "space":
            inputArray = input.trim().split(/\s+/);
            break;
          case "comma":
            inputArray = input.split(",").map((str) => str.trim());
            break;
          case "none":
            inputArray = [input.trim()];
            break;
          default:
            inputArray = input.trim().split(/\s+/);
        }

        const integers = inputArray.map((value) => {
          let num;
          if (inputBase === "binary" && !/^[01]+$/.test(value)) {
            throw new Error("Invalid binary format");
          } else if (inputBase === "hex" && !/^[0-9A-Fa-f]+$/.test(value.replace(/^0x/i, ""))) {
            throw new Error("Invalid hexadecimal format");
          } else if (inputBase === "octal" && !/^[0-7]+$/.test(value)) {
            throw new Error("Invalid octal format");
          }

          const parseBase = inputBase === "binary" ? 2 : inputBase === "hex" ? 16 : 8;
          num = parseInt(inputBase === "hex" ? value.replace(/^0x/i, "") : value, parseBase);
          if (isNaN(num)) throw new Error(`Invalid ${inputBase} input`);

          const actualBitLength =
            bitLength === "auto" ? Math.max(4, Math.ceil(Math.log2(Math.abs(num) + 1))) : parseInt(bitLength);

          if (bitLength !== "auto" && value.length > actualBitLength / (inputBase === "hex" ? 4 : inputBase === "octal" ? 3 : 1)) {
            throw new Error(`${inputBase.charAt(0).toUpperCase() + inputBase.slice(1)} input exceeds ${bitLength}-bit length`);
          }

          if (signedMode === "signed" && value[0] === "1" && inputBase === "binary") {
            const maxValue = 2 ** actualBitLength;
            num = num - maxValue;
          }

          if (bitLength !== "auto") {
            const maxUnsigned = 2 ** actualBitLength - 1;
            const minSigned = -(2 ** (actualBitLength - 1));
            const maxSigned = 2 ** (actualBitLength - 1) - 1;

            if (signedMode === "unsigned" && num > maxUnsigned) {
              throw new Error(`Value exceeds ${actualBitLength}-bit unsigned limit (${maxUnsigned})`);
            } else if (signedMode === "signed" && (num < minSigned || num > maxSigned)) {
              throw new Error(`Value out of ${actualBitLength}-bit signed range (${minSigned} to ${maxSigned})`);
            }
          }

          return outputFormat === "decimal"
            ? num.toString()
            : outputFormat === "hex"
            ? "0x" + num.toString(16).toUpperCase()
            : num.toString(8);
        });

        setIntegerOutput(integers.join(delimiter === "none" ? "" : delimiter === "space" ? " " : ", "));
        setError("");
      } catch (err) {
        setError("Error converting to integer: " + err.message);
        setIntegerOutput("");
      }
    },
    [delimiter, bitLength, signedMode, inputBase, outputFormat]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBinaryInput(value);
    binaryToInteger(value);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setBinaryInput(text);
      binaryToInteger(text);
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
      await navigator.clipboard.writeText(integerOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([integerOutput], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${outputFormat}_output_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setBinaryInput("");
    setIntegerOutput("");
    setError("");
    setDelimiter("space");
    setBitLength("auto");
    setSignedMode("unsigned");
    setInputBase("binary");
    setOutputFormat("decimal");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8 relative">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Number to Integer Converter
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
                binaryToInteger(binaryInput);
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
                binaryToInteger(binaryInput);
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
                binaryToInteger(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="unsigned">Unsigned</option>
              <option value="signed">Signed (2's Complement)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Input Base</label>
            <select
              value={inputBase}
              onChange={(e) => {
                setInputBase(e.target.value);
                binaryToInteger(binaryInput);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="binary">Binary (Base 2)</option>
              <option value="octal">Octal (Base 8)</option>
              <option value="hex">Hexadecimal (Base 16)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
            <select
              value={outputFormat}
              onChange={(e) => {
                setOutputFormat(e.target.value);
                binaryToInteger(binaryInput);
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
            Enter {inputBase.charAt(0).toUpperCase() + inputBase.slice(1)} Numbers
          </label>
          <textarea
            value={binaryInput}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            rows="6"
            placeholder={`Enter ${inputBase} numbers (e.g., ${
              inputBase === "binary" ? "0100 1010" : inputBase === "hex" ? "0xA 0xF" : "12 17"
            })`}
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
            {outputFormat.charAt(0).toUpperCase() + outputFormat.slice(1)} Output
          </label>
          <div className="relative">
            <textarea
              value={integerOutput}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y font-mono"
              placeholder={`${outputFormat} output will appear here...`}
            />
            {integerOutput && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-500 text-white px-3 Summit.py-1 rounded-md hover:bg-blue-600 transition-colors flex items-center"
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
            <li>Convert Binary, Octal, or Hex to Decimal, Hex, or Octal</li>
            <li>Supports signed (2's complement) and unsigned numbers</li>
            <li>Custom bit length (auto, 4, 8, 16, 32)</li>
            <li>Flexible delimiters</li>
            <li>File upload and drag-and-drop support</li>
            <li>Copy to clipboard and download output</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToInteger;