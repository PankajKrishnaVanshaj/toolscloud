"use client";
import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";

const QRCodeGenerator = () => {
  const [text, setText] = useState("Pankri");
  const [size, setSize] = useState(298);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("M");
  const [logo, setLogo] = useState(null);
  const [logoSize, setLogoSize] = useState(50);
  const canvasRef = useRef(null);

  const generateQR = async () => {
    try {
      const canvas = canvasRef.current;
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        errorCorrectionLevel,
      });

      // Add logo if uploaded
      if (logo) {
        const context = canvas.getContext("2d");
        const img = new Image();
        img.src = URL.createObjectURL(logo);
        img.onload = () => {
          const logoPosition = (size - logoSize) / 2; // Center the logo
          context.drawImage(
            img,
            logoPosition,
            logoPosition,
            logoSize,
            logoSize
          );
        };
      }
    } catch (err) {
      console.error("Error generating QR Code:", err);
    }
  };

  // Generate default QR code on component mount
  useEffect(() => {
    generateQR();
  }, []);

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Section: Form */}
        <div>
          {/* QR Code Text */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
            <label className="font-medium text-secondary w-full md:w-1/3">
              QR Code Text:
            </label>
            <input
              type="text"
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary/50"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {/* QR Code Size */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
            <label className="font-medium text-secondary w-full md:w-1/3">
              QR Code Size (px):
            </label>
            <input
              type="number"
              min="100"
              max="500"
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary/50"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>

          {/* Foreground Color */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
            <label className="font-medium text-secondary w-full md:w-1/3">
              Foreground Color:
            </label>
            <input
              type="color"
              className="w-full"
              value={foregroundColor}
              onChange={(e) => setForegroundColor(e.target.value)}
            />
          </div>

          {/* Background Color */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
            <label className="font-medium text-secondary w-full md:w-1/3">
              Background Color:
            </label>
            <input
              type="color"
              className="w-full"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </div>

          {/* Error Correction Level */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
            <label className="font-medium text-secondary w-full md:w-1/3">
              Error Correction Level:
            </label>
            <select
              value={errorCorrectionLevel}
              onChange={(e) => setErrorCorrectionLevel(e.target.value)}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary/50"
            >
              <option value="L">Low (L)</option>
              <option value="M">Medium (M)</option>
              <option value="Q">Quartile (Q)</option>
              <option value="H">High (H)</option>
            </select>
          </div>

          {/* Logo Upload */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
            <label className="font-medium text-secondary w-full md:w-1/3">
              Upload Logo:
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e) => setLogo(e.target.files[0])}
            />
          </div>

          {/* Logo Size */}
          {logo && (
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
              <label className="font-medium text-secondary w-full md:w-1/3">
                Logo Size (px):
              </label>
              <input
                type="number"
                min="20"
                max={size / 2}
                className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-primary/50"
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
              />
            </div>
          )}

          {/* Generate QR Code Button */}
          <button
            onClick={generateQR}
            className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-semibold rounded-lg border hover:border-primary"
          >
            Generate QR Code
          </button>
        </div>

        {/* Right Section: QR Code Preview */}
        <div className="flex flex-col items-center justify-center rounded-lg">
          <canvas
            ref={canvasRef}
            className="border rounded-lg shadow-md mb-4 max-w-full"
          ></canvas>
          <button
            onClick={downloadQRCode}
            className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-semibold rounded-lg border hover:border-primary"
          >
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
