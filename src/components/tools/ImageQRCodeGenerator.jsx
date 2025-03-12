"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { FaDownload, FaSync, FaQrcode } from "react-icons/fa";

const ImageQRCodeGenerator = () => {
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [size, setSize] = useState(200);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [margin, setMargin] = useState(4);
  const [errorCorrection, setErrorCorrection] = useState("M");
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(50);
  const [shape, setShape] = useState("square"); // Square or circle
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Generate QR code when parameters change
  useEffect(() => {
    if (text) {
      generateQRCode();
    }
  }, [text, size, fgColor, bgColor, margin, errorCorrection, logo, logoSize, shape]);

  const generateQRCode = useCallback(async () => {
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
      if (!logo) {
        setQrUrl(url);
      } else {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const qrImg = new Image();
        qrImg.src = url;
        qrImg.onload = () => {
          canvas.width = size;
          canvas.height = size;
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, size, size);

          // Apply shape (square or circle)
          if (shape === "circle") {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - margin, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
          }

          ctx.drawImage(qrImg, 0, 0, size, size);

          // Add logo
          const logoImg = new Image();
          logoImg.src = logo;
          logoImg.onload = () => {
            const logoX = (size - logoSize) / 2;
            const logoY = (size - logoSize) / 2;
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            setQrUrl(canvas.toDataURL("image/png"));
          };
        };
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  }, [text, size, fgColor, bgColor, margin, errorCorrection, logo, logoSize, shape]);

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(URL.createObjectURL(file));
    }
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrUrl;
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setText("");
    setQrUrl("");
    setSize(200);
    setFgColor("#000000");
    setBgColor("#ffffff");
    setMargin(4);
    setErrorCorrection("M");
    setLogo(null);
    setLogoSize(50);
    setShape("square");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          QR Code Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text or URL</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or URL"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size ({size}px)</label>
              <input
                type="range"
                min="100"
                max="500"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foreground Color</label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Margin ({margin})</label>
              <input
                type="range"
                min="0"
                max="10"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Error Correction</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {logo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Size ({logoSize}px)</label>
                <input
                  type="range"
                  min="20"
                  max={Math.min(size * 0.3, 150)} // Limit to 30% of QR size or 150px
                  value={logoSize}
                  onChange={(e) => setLogoSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="square">Square</option>
                <option value="circle">Circle</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadQRCode}
                disabled={!qrUrl}
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
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="Generated QR Code"
                className="max-w-full h-auto rounded-md shadow-md"
              />
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <FaQrcode className="mx-auto text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500 italic">Enter text to generate a QR code</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable size, colors, and margin</li>
            <li>Adjustable error correction level</li>
            <li>Optional logo overlay with size control</li>
            <li>Square or circular shape</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Higher error correction allows more data recovery if the QR code is damaged. Adding a logo may reduce scannability.
        </p>
      </div>
    </div>
  );
};

export default ImageQRCodeGenerator;