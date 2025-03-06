// components/ImageQRCodeGenerator.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";

const ImageQRCodeGenerator = () => {
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [size, setSize] = useState(200);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [margin, setMargin] = useState(4);
  const [errorCorrection, setErrorCorrection] = useState("M");
  const canvasRef = useRef(null);

  // Generate QR code when parameters change
  useEffect(() => {
    if (text) {
      generateQRCode();
    }
  }, [text, size, fgColor, bgColor, margin, errorCorrection]);

  const generateQRCode = async () => {
    try {
      const options = {
        errorCorrectionLevel: errorCorrection,
        type: "image/png",
        quality: 0.92,
        margin: margin,
        width: size,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      };

      const url = await QRCode.toDataURL(text, options);
      setQrUrl(url);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = qrUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          QR Code Generator
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text or URL
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text or URL"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size ({size}px)
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foreground Color
                </label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full h-10 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Margin ({margin})
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Error Correction
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>

              <button
                onClick={downloadQRCode}
                disabled={!qrUrl}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md disabled:opacity-50 transition-colors"
              >
                Download QR Code
              </button>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="Generated QR Code"
                  className="max-w-full h-auto rounded-md shadow-md"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  Enter text to generate QR code
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Enter text or a URL, customize the QR code, and download the result.
            Higher error correction allows more data recovery if damaged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageQRCodeGenerator;