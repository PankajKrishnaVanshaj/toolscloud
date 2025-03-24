"use client";
import React, { useState, useRef, useCallback } from "react";
import bwipjs from "bwip-js";
import { FaDownload, FaSync, FaQrcode } from "react-icons/fa";

const ImageBarcodeGenerator = () => {
  const [text, setText] = useState("");
  const [barcodeType, setBarcodeType] = useState("qrcode");
  const [scale, setScale] = useState(3);
  const [height, setHeight] = useState(100);
  const [padding, setPadding] = useState(10);
  const [color, setColor] = useState("#000000"); // Foreground color
  const [backgroundColor, setBackgroundColor] = useState("#ffffff"); // Background color
  const [rotation, setRotation] = useState(0); // Rotation in degrees
  const [barcodeUrl, setBarcodeUrl] = useState(null);
  const canvasRef = useRef(null);

  // Available barcode types with descriptions
  const barcodeTypes = [
    { value: "qrcode", label: "QR Code", desc: "For URLs, text (up to 4296 chars)" },
    { value: "code128", label: "Code 128", desc: "Alphanumeric (variable length)" },
    { value: "ean13", label: "EAN-13", desc: "13 digits" },
    { value: "upca", label: "UPC-A", desc: "12 digits" },
    { value: "datamatrix", label: "Data Matrix", desc: "Square, up to 2335 chars" },
    { value: "code39", label: "Code 39", desc: "Alphanumeric, limited chars" },
  ];

  // Generate barcode
  const generateBarcode = useCallback(() => {
    if (!text || !canvasRef.current) return;

    try {
      bwipjs.toCanvas(canvasRef.current, {
        bcid: barcodeType,
        text: text,
        scale: scale,
        height: height / 10,
        includetext: true,
        textxalign: "center",
        padding: padding,
        color: color,
        backgroundcolor: backgroundColor.slice(1), // Remove # for bwip-js
        rotate: rotation === 0 ? "N" : rotation === 90 ? "R" : rotation === 180 ? "I" : "L", // N, R, I, L
      });

      setBarcodeUrl(canvasRef.current.toDataURL("image/png"));
    } catch (error) {
      console.error("Error generating barcode:", error);
      alert("Error generating barcode. Please check your input format.");
    }
  }, [text, barcodeType, scale, height, padding, color, backgroundColor, rotation]);

  // Download barcode
  const downloadBarcode = () => {
    if (!barcodeUrl) return;
    const link = document.createElement("a");
    link.download = `${barcodeType}-barcode-${Date.now()}.png`;
    link.href = barcodeUrl;
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setText("");
    setBarcodeType("qrcode");
    setScale(3);
    setHeight(100);
    setPadding(10);
    setColor("#000000");
    setBackgroundColor("#ffffff");
    setRotation(0);
    setBarcodeUrl(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Barcode Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text to Encode
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text, URL, or number"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barcode Type
              </label>
              <select
                value={barcodeType}
                onChange={(e) => setBarcodeType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {barcodeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.desc})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scale ({scale}x)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={scale}
                  onChange={(e) => setScale(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height ({height}px)
                </label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Padding ({padding}px)
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={padding}
                  onChange={(e) => setPadding(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rotation ({rotation}°)
                </label>
                <input
                  type="range"
                  min="0"
                  max="270"
                  step="90"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={generateBarcode}
                disabled={!text}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaQrcode className="mr-2" /> Generate
              </button>
              <button
                onClick={downloadBarcode}
                disabled={!barcodeUrl}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-50 p-4 rounded-lg shadow-inner max-h-96 overflow-auto">
              <canvas ref={canvasRef} className="max-w-full h-auto" />
              {!barcodeUrl && (
                <p className="text-gray-500 text-center mt-4">
                  Enter text and click "Generate" to see your barcode
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> Some barcode types have specific requirements:
            <ul className="list-disc list-inside mt-1">
              <li>QR Code: Any text or URL</li>
              <li>EAN-13: 13 digits</li>
              <li>UPC-A: 12 digits</li>
              <li>Code 128: Alphanumeric</li>
            </ul>
          </p>
        </div>

        {/* Features */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple barcode types (QR, Code 128, EAN-13, etc.)</li>
            <li>Customizable scale, height, padding, and rotation</li>
            <li>Color and background color options</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageBarcodeGenerator;