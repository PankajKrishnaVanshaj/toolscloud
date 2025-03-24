"use client";
import React, { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { FaDownload, FaSync, FaQrcode } from "react-icons/fa";

const TextToQRCode = () => {
  const [text, setText] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    size: 200,
    color: "#000000",
    bgColor: "#ffffff",
    errorCorrection: "M",
    margin: 4,
    format: "png",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);

  // Generate QR Code
  const generateQRCode = useCallback(async () => {
    setError("");
    setQrCodeUrl("");
    setIsGenerating(true);

    if (!text.trim()) {
      setError("Please enter some text to generate a QR code");
      setIsGenerating(false);
      return;
    }

    try {
      const qrOptions = {
        width: options.size,
        color: {
          dark: options.color,
          light: options.bgColor,
        },
        errorCorrectionLevel: options.errorCorrection,
        margin: options.margin,
      };

      const url =
        options.format === "svg"
          ? await QRCode.toString(text, { ...qrOptions, type: "svg" })
          : await QRCode.toDataURL(text, qrOptions);

      setQrCodeUrl(url);
      setHistory((prev) => [
        { text, url, timestamp: new Date().toISOString(), options },
        ...prev,
      ].slice(0, 10));
    } catch (err) {
      setError(`Failed to generate QR code: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [text, options]);

  // Auto-generate on text/options change
  useEffect(() => {
    if (text) {
      generateQRCode();
    }
  }, [text, options, generateQRCode]);

  // Handle option changes
  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `qrcode-${options.size}x${options.size}.${options.format}`;
    link.click();
  };

  // Reset everything
  const reset = () => {
    setText("");
    setQrCodeUrl("");
    setError("");
    setOptions({
      size: 200,
      color: "#000000",
      bgColor: "#ffffff",
      errorCorrection: "M",
      margin: 4,
      format: "png",
    });
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Text to QR Code Generator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text Input</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert to QR code (e.g., URL, message)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-y"
              disabled={isGenerating}
            />
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size ({options.size}px)
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="10"
                value={options.size}
                onChange={(e) => handleOptionChange("size", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Error Correction
              </label>
              <select
                value={options.errorCorrection}
                onChange={(e) => handleOptionChange("errorCorrection", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foreground Color
              </label>
              <input
                type="color"
                value={options.color}
                onChange={(e) => handleOptionChange("color", e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={options.bgColor}
                onChange={(e) => handleOptionChange("bgColor", e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margin ({options.margin}px)
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={options.margin}
                onChange={(e) => handleOptionChange("margin", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={options.format}
                onChange={(e) => handleOptionChange("format", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
            </div>
          </div>

          {/* QR Code Display */}
          {qrCodeUrl && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated QR Code</h2>
              {options.format === "svg" ? (
                <div
                  dangerouslySetInnerHTML={{ __html: qrCodeUrl }}
                  className="mx-auto inline-block"
                  style={{ width: options.size, height: options.size }}
                />
              ) : (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="mx-auto max-w-full h-auto"
                  style={{ maxWidth: `${options.size}px` }}
                />
              )}
              <button
                onClick={downloadQRCode}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                disabled={isGenerating}
              >
                <FaDownload className="mr-2" /> Download QR Code
              </button>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">History (Last 10)</h2>
              <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 bg-gray-100 rounded flex justify-between items-center"
                  >
                    <div>
                      <p className="text-gray-600">
                        {new Date(item.timestamp).toLocaleString()}:{" "}
                        {item.text.slice(0, 50)}
                        {item.text.length > 50 ? "..." : ""}
                      </p>
                      <p className="text-xs text-gray-500">
                        Size: {item.options.size}px, Format: {item.options.format}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setText(item.text);
                        setOptions(item.options);
                      }}
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                      title="Load this QR Code"
                    >
                      <FaQrcode />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateQRCode}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={isGenerating || !text}
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"></div>
                  Generating...
                </span>
              ) : (
                <>
                  <FaQrcode className="mr-2" /> Generate QR Code
                </>
              )}
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate QR codes from text with real-time preview</li>
            <li>Customize size (100-1000px), colors, margin (0-20px), and format (PNG/SVG)</li>
            <li>Error correction levels: L (7%), M (15%), Q (25%), H (30%)</li>
            <li>Download QR code in selected format</li>
            <li>History tracking with reload option (last 10)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextToQRCode;