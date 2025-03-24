"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const BinaryCodeGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [mode, setMode] = useState("textToBinary"); // textToBinary or binaryToText
  const [separator, setSeparator] = useState("space"); // space, dash, none
  const [bitLength, setBitLength] = useState(8); // 8, 16, 32
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const textToBinary = (text) => {
    return text
      .split("")
      .map((char) => {
        const binary = char.charCodeAt(0).toString(2).padStart(bitLength, "0");
        return binary;
      })
      .join(separator === "space" ? " " : separator === "dash" ? "-" : "");
  };

  const binaryToText = (binary) => {
    const binaryArray = binary.split(/[\s-]/).filter(Boolean);
    let result = "";
    for (let bin of binaryArray) {
      if (bin.length !== bitLength || !/^[01]+$/.test(bin)) {
        return `Error: Invalid ${bitLength}-bit binary input`;
      }
      const decimal = parseInt(bin, 2);
      result += String.fromCharCode(decimal);
    }
    return result;
  };

  const generateOutput = useCallback(() => {
    if (!inputText.trim()) {
      setError("Please enter some input!");
      setBinaryOutput("");
      return;
    }

    setError("");
    let output;
    if (mode === "textToBinary") {
      output = textToBinary(inputText);
    } else {
      output = binaryToText(inputText);
    }
    setBinaryOutput(output);
    setIsCopied(false);
    setHistory((prev) => [
      ...prev,
      { input: inputText, output, mode, separator, bitLength },
    ].slice(-5));
  }, [inputText, mode, separator, bitLength]);

  const copyToClipboard = () => {
    if (!binaryOutput) return;
    navigator.clipboard
      .writeText(binaryOutput)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    if (!binaryOutput) return;
    const blob = new Blob([binaryOutput], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `binary-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInputText("");
    setBinaryOutput("");
    setError("");
    setIsCopied(false);
  };

  const restoreFromHistory = (entry) => {
    setInputText(entry.input);
    setBinaryOutput(entry.output);
    setMode(entry.mode);
    setSeparator(entry.separator);
    setBitLength(entry.bitLength);
    setError("");
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Binary Code Generator
        </h1>

        <div className="space-y-6">
          {/* Options Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="textToBinary">Text to Binary</option>
                <option value="binaryToText">Binary to Text</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bit Length
              </label>
              <select
                value={bitLength}
                onChange={(e) => setBitLength(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={8}>8-bit</option>
                <option value={16}>16-bit</option>
                <option value={32}>32-bit</option>
              </select>
            </div>
            {mode === "textToBinary" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Separator
                </label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="space">Space</option>
                  <option value="dash">Dash</option>
                  <option value="none">None</option>
                </select>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === "textToBinary" ? "Input Text" : "Binary Input"}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                mode === "textToBinary"
                  ? "Enter text to convert to binary"
                  : `Enter ${bitLength}-bit binary code (e.g., 01001000 01100101)`
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateOutput}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              Generate {mode === "textToBinary" ? "Binary" : "Text"}
            </button>
            {binaryOutput && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearAll}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Output Section */}
          {binaryOutput && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                {mode === "textToBinary" ? "Binary Output:" : "Text Output:"}
              </h2>
              <pre className="text-sm font-mono text-gray-800 break-all max-h-64 overflow-y-auto">
                {binaryOutput}
              </pre>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Conversions (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>
                      {entry.mode === "textToBinary" ? "Text → Binary" : "Binary → Text"}: {entry.output.slice(0, 15)}...
                    </span>
                    <button
                      onClick={() => restoreFromHistory(entry)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaUndo />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Info */}
          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
            <h3 className="font-semibold text-blue-700">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm">
              <li>Convert text to binary or binary to text</li>
              <li>Custom bit length (8, 16, 32 bits)</li>
              <li>Flexible separators for binary output</li>
              <li>Copy, download, and track history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryCodeGenerator;