"use client";
import React, { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { FaDownload, FaSync, FaQrcode, FaCopy } from "react-icons/fa";

const BinaryToQRCode = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [textOutput, setTextOutput] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    errorCorrectionLevel: "M",
    scale: 4,
    margin: 1,
    width: 200,
    color: { dark: "#000000", light: "#FFFFFF" },
    type: "png",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validate binary input
  const validateBinary = (binary) => /^[01\s]+$/.test(binary);

  // Convert binary to text
  const binaryToText = (binary) => {
    const binaryArray = binary.trim().split(/\s+/);
    return binaryArray.map((bin) => {
      if (!validateBinary(bin) || bin.length !== 8) throw new Error("Invalid binary: Each byte must be 8 bits");
      return String.fromCharCode(parseInt(bin, 2));
    }).join("");
  };

  // Generate QR code
  const generateQRCode = useCallback(
    async (text) => {
      setIsLoading(true);
      try {
        const url = await QRCode.toDataURL(text, {
          errorCorrectionLevel: options.errorCorrectionLevel,
          scale: options.scale,
          margin: options.margin,
          width: options.width,
          color: options.color,
          type: options.type === "svg" ? "svg" : "png",
        });
        setQrCodeUrl(url);
        setError("");
      } catch (err) {
        setError(`QR Code generation failed: ${err.message}`);
        setQrCodeUrl("");
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  // Handle binary input change
  const handleBinaryInput = (value) => {
    setBinaryInput(value);
    setError("");
    setTextOutput("");
    setQrCodeUrl("");

    if (!value.trim()) return;

    try {
      if (!validateBinary(value)) {
        throw new Error("Input must contain only 0s, 1s, and spaces");
      }
      const text = binaryToText(value);
      setTextOutput(text);
      generateQRCode(text);
    } catch (err) {
      setError(err.message);
      setTextOutput("");
      setQrCodeUrl("");
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qrcode-${Date.now()}.${options.type}`;
    link.click();
  };

  // Copy text output to clipboard
  const copyTextOutput = () => {
    if (textOutput) {
      navigator.clipboard.writeText(textOutput);
      alert("Text copied to clipboard!");
    }
  };

  // Reset all fields
  const reset = () => {
    setBinaryInput("");
    setTextOutput("");
    setQrCodeUrl("");
    setError("");
    setOptions({
      errorCorrectionLevel: "M",
      scale: 4,
      margin: 1,
      width: 200,
      color: { dark: "#000000", light: "#FFFFFF" },
      type: "png",
    });
  };

  // Handle option changes
  const handleOptionChange = (key, value) => {
    setOptions((prev) => {
      const newOptions = { ...prev };
      if (key.includes("color")) {
        newOptions.color[key.split(".")[1]] = value;
      } else {
        newOptions[key] = value;
      }
      return newOptions;
    });
    if (textOutput) generateQRCode(textOutput);
  };

  useEffect(() => {
    if (textOutput && !isLoading) generateQRCode(textOutput);
  }, [textOutput, options, generateQRCode, isLoading]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to QR Code Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input (8-bit bytes, space-separated)
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => handleBinaryInput(e.target.value)}
                placeholder="e.g., 01001000 01100101 01101100 01101100 01101111"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-y"
                disabled={isLoading}
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Output
              </label>
              <input
                type="text"
                value={textOutput}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 pr-10"
              />
              {textOutput && (
                <button
                  onClick={copyTextOutput}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-500"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
              )}
            </div>
          </div>

          {/* QR Code Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">QR Code Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error Correction
                </label>
                <select
                  value={options.errorCorrectionLevel}
                  onChange={(e) => handleOptionChange("errorCorrectionLevel", e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="L">Low</option>
                  <option value="M">Medium</option>
                  <option value="Q">Quartile</option>
                  <option value="H">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="1000"
                  value={options.width}
                  onChange={(e) => handleOptionChange("width", parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Margin (px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={options.margin}
                  onChange={(e) => handleOptionChange("margin", parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-600">{options.margin}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dark Color
                </label>
                <input
                  type="color"
                  value={options.color.dark}
                  onChange={(e) => handleOptionChange("color.dark", e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded-md"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Light Color
                </label>
                <input
                  type="color"
                  value={options.color.light}
                  onChange={(e) => handleOptionChange("color.light", e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded-md"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={options.type}
                  onChange={(e) => handleOptionChange("type", e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="png">PNG</option>
                  <option value="svg">SVG</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {qrCodeUrl && (
            <div className="p-4 bg-gray-50 rounded-lg text-center relative">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Generated QR Code</h2>
              <img
                src={qrCodeUrl}
                alt="Generated QR Code"
                className="mx-auto max-w-full h-auto max-h-96"
              />
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={downloadQRCode}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleBinaryInput(binaryInput)}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              disabled={isLoading || !binaryInput}
            >
              <FaQrcode className="mr-2" /> Generate
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features & Usage */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert 8-bit binary to text and generate QR code</li>
              <li>Customizable QR: error correction, width, margin, colors, format (PNG/SVG)</li>
              <li>Copy text output to clipboard</li>
              <li>Download QR code in selected format</li>
              <li>Example: "01001000 01100101 01101100 01101100 01101111" → "Hello"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryToQRCode;