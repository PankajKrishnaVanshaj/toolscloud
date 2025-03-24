"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaExchangeAlt } from "react-icons/fa";

const ROT13Encoder = () => {
  const [inputText, setInputText] = useState("");
  const [encodedText, setEncodedText] = useState("");
  const [format, setFormat] = useState("plain"); // plain, url, html, base64
  const [shift, setShift] = useState(13); // Custom shift for ROT-n
  const [error, setError] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true); // Preserve case or not
  const [direction, setDirection] = useState("encode"); // encode or decode

  // Generalized ROT-n transformation
  const rotN = useCallback(
    (text, shiftAmount, isDecoding = false) => {
      const effectiveShift = isDecoding ? -shiftAmount : shiftAmount;
      return text.replace(/[A-Za-z]/g, (char) => {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        if (!caseSensitive && code >= 97) char = char.toUpperCase();
        return String.fromCharCode(
          ((code - base + effectiveShift + 26) % 26) + base
        );
      });
    },
    [caseSensitive]
  );

  // Encode/Decode text with selected format
  const processText = useCallback(() => {
    setError("");
    setEncodedText("");

    if (!inputText.trim()) {
      setError("Please enter text to process");
      return;
    }

    try {
      const baseProcessed = rotN(inputText, parseInt(shift), direction === "decode");
      let formattedOutput = baseProcessed;

      switch (format) {
        case "url":
          formattedOutput = encodeURIComponent(baseProcessed);
          break;
        case "html":
          formattedOutput = `"${baseProcessed}"`;
          break;
        case "base64":
          formattedOutput = btoa(baseProcessed);
          break;
        case "plain":
        default:
          formattedOutput = baseProcessed;
          break;
      }

      setEncodedText(formattedOutput);
    } catch (err) {
      setError("Processing failed: " + err.message);
    }
  }, [inputText, shift, format, direction, rotN]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    processText();
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (encodedText) navigator.clipboard.writeText(encodedText);
  };

  // Download as file
  const downloadAsFile = () => {
    if (encodedText) {
      const blob = new Blob([encodedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rot${shift}_${direction}d.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear all
  const clearAll = () => {
    setInputText("");
    setEncodedText("");
    setFormat("plain");
    setShift(13);
    setError("");
    setCaseSensitive(true);
    setDirection("encode");
  };

  // Swap input and output
  const swapText = () => {
    setInputText(encodedText);
    setEncodedText("");
    setDirection(direction === "encode" ? "decode" : "encode");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          ROT13 Encoder/Decoder
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              placeholder={`Enter text to ${direction}`}
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mode
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="encode">Encode</option>
                <option value="decode">Decode</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shift ({shift})
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={shift}
                onChange={(e) => setShift(Math.max(1, Math.min(25, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="plain">Plain Text</option>
                <option value="url">URL-Encoded</option>
                <option value="html">HTML-Encoded</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Case Sensitive</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {direction === "encode" ? "Encode" : "Decode"}
            </button>
            <button
              type="button"
              onClick={swapText}
              disabled={!encodedText}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaExchangeAlt className="mr-2" /> Swap
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Encoded/Decoded Output */}
        {encodedText && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">
                {direction === "encode" ? "Encoded" : "Decoded"} Text
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadAsFile}
                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            <textarea
              value={encodedText}
              readOnly
              className="w-full p-3 border rounded-lg bg-gray-50 h-32 font-mono text-sm resize-y"
            />
            <p className="text-sm text-gray-600 mt-2">
              Format: {format.toUpperCase()} | Shift: ROT-{shift}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Encode and decode with custom ROT-n shifts (1-25)</li>
            <li>Multiple output formats: Plain, URL, HTML, Base64</li>
            <li>Case sensitivity toggle</li>
            <li>Swap input and output</li>
            <li>Copy to clipboard and download as file</li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default ROT13Encoder;