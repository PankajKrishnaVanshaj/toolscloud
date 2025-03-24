"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { FaDownload, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const QRCodeGenerator = () => {
  const [text, setText] = useState("Pankri");
  const [size, setSize] = useState(298);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("M");
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(50);
  const [margin, setMargin] = useState(2);
  const [format, setFormat] = useState("png"); // png, jpeg, svg
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  const generateQR = useCallback(async () => {
    try {
      if (!text.trim()) {
        setError("Please enter text to generate a QR code.");
        return;
      }

      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        errorCorrectionLevel,
      });

      if (logo) {
        const context = canvas.getContext("2d");
        const img = new Image();
        img.src = URL.createObjectURL(logo);
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        const logoPosition = (size - logoSize) / 2;
        context.drawImage(img, logoPosition, logoPosition, logoSize, logoSize);
      }

      setHistory((prev) => [
        ...prev,
        {
          text,
          size,
          foregroundColor,
          backgroundColor,
          errorCorrectionLevel,
          logo: logo ? logo.name : null,
          logoSize,
          margin,
          format,
        },
      ].slice(-5));
      setError("");
    } catch (err) {
      setError("Error generating QR Code: " + err.message);
      console.error(err);
    }
  }, [text, size, foregroundColor, backgroundColor, errorCorrectionLevel, logo, logoSize, margin]);

  // Generate QR code on mount and option changes
  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const link = document.createElement("a");
    link.download = `qrcode.${format}`;
    link.href = canvas.toDataURL(mimeType, format === "jpeg" ? 0.9 : 1.0);
    link.click();
  };

  const clearAll = () => {
    setText("");
    setSize(298);
    setForegroundColor("#000000");
    setBackgroundColor("#ffffff");
    setErrorCorrectionLevel("M");
    setLogo(null);
    setLogoSize(50);
    setMargin(2);
    setFormat("png");
    setError("");
  };

  const restoreFromHistory = (entry) => {
    setText(entry.text);
    setSize(entry.size);
    setForegroundColor(entry.foregroundColor);
    setBackgroundColor(entry.backgroundColor);
    setErrorCorrectionLevel(entry.errorCorrectionLevel);
    setLogoSize(entry.logoSize);
    setMargin(entry.margin);
    setFormat(entry.format);
    // Note: Logo file itself isn't restored, only its settings
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced QR Code Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section: Form */}
          <div className="space-y-6">
            {/* QR Code Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text or URL"
              />
            </div>

            {/* Advanced Options */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <p className="text-sm font-medium text-gray-700">Customization Options:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Size (px):</label>
                  <input
                    type="number"
                    min="100"
                    max="500"
                    value={size}
                    onChange={(e) => setSize(Math.max(100, Math.min(500, Number(e.target.value))))}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Margin (px):</label>
                  <input
                   所需type="number"
                    min="0"
                    max="10"
                    value={margin}
                    onChange={(e) => setMargin(Math.max(0, Math.min(10, Number(e.target.value))))}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Foreground Color:</label>
                  <input
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-full h-10 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Background Color:</label>
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-10 p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Error Correction:</label>
                  <select
                    value={errorCorrectionLevel}
                    onChange={(e) => setErrorCorrectionLevel(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Low (L)</option>
                    <option value="M">Medium (M)</option>
                    <option value="Q">Quartile (Q)</option>
                    <option value="H">High (H)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Output Format:</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logo Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Logo (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogo(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {logo && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Logo Size (px):</label>
                  <input
                    type="number"
                    min="20"
                    max={size / 2}
                    value={logoSize}
                    onChange={(e) => setLogoSize(Math.max(20, Math.min(size / 2, Number(e.target.value))))}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={generateQR}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
              >
                Generate QR Code
              </button>
              <button
                onClick={clearAll}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
              >
                <FaTrash className="mr-2" />
                Clear
              </button>
            </div>
          </div>

          {/* Right Section: QR Code Preview */}
          <div className="flex flex-col items-center justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-300 rounded-lg shadow-md mb-4 max-w-full"
            />
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            <button
              onClick={downloadQRCode}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              Download QR Code
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent QR Codes (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.text.slice(0, 15)}... ({entry.size}px, {entry.errorCorrectionLevel})
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
            <li>Customizable size, colors, and error correction</li>
            <li>Add a logo with adjustable size</li>
            <li>Download as PNG or JPEG</li>
            <li>Set margin and track recent QR codes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;