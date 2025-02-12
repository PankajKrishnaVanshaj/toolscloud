"use client";
import { useState, useRef } from "react";
import QRCode from "qrcode";

const QRCodeGenerator = () => {
  const [text, setText] = useState("Hello QR");
  const [size, setSize] = useState(200);
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
          context.drawImage(img, logoPosition, logoPosition, logoSize, logoSize);
        };
      }
    } catch (err) {
      console.error("Error generating QR Code:", err);
    }
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mx-auto p-4 bg-white shadow-lg rounded-2xl">

      {/* Text Input */}
      <label className="block mb-2 font-medium text-gray-700">QR Code Text:</label>
      <input
        type="text"
        className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {/* QR Code Size */}
      <label className="block mb-2 font-medium text-gray-700">QR Code Size (px):</label>
      <input
        type="number"
        min="100"
        max="500"
        className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
        value={size}
        onChange={(e) => setSize(Number(e.target.value))}
      />

      {/* Foreground Color */}
      <label className="block mb-2 font-medium text-gray-700">Foreground Color:</label>
      <input
        type="color"
        className="w-full mb-4"
        value={foregroundColor}
        onChange={(e) => setForegroundColor(e.target.value)}
      />

      {/* Background Color */}
      <label className="block mb-2 font-medium text-gray-700">Background Color:</label>
      <input
        type="color"
        className="w-full mb-4"
        value={backgroundColor}
        onChange={(e) => setBackgroundColor(e.target.value)}
      />

      {/* Error Correction Level */}
      <label className="block mb-2 font-medium text-gray-700">Error Correction Level:</label>
      <select
        value={errorCorrectionLevel}
        onChange={(e) => setErrorCorrectionLevel(e.target.value)}
        className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
      >
        <option value="L">Low (L)</option>
        <option value="M">Medium (M)</option>
        <option value="Q">Quartile (Q)</option>
        <option value="H">High (H)</option>
      </select>

      {/* Logo Upload */}
      <label className="block mb-2 font-medium text-gray-700">Upload Logo:</label>
      <input
        type="file"
        accept="image/*"
        className="mb-4"
        onChange={(e) => setLogo(e.target.files[0])}
      />

      {/* Logo Size */}
      {logo && (
        <>
          <label className="block mb-2 font-medium text-gray-700">Logo Size (px):</label>
          <input
            type="number"
            min="20"
            max={size / 2}
            className="border border-gray-300 p-3 w-full rounded-lg mb-4 focus:ring-2 focus:ring-blue-400"
            value={logoSize}
            onChange={(e) => setLogoSize(Number(e.target.value))}
          />
        </>
      )}

      {/* Generate QR Code Button */}
      <button
        onClick={generateQR}
        className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg mb-4 hover:bg-blue-700"
      >
        Generate QR Code
      </button>

      {/* QR Code Canvas */}
      <canvas ref={canvasRef} className="border rounded-lg shadow-md w-full"></canvas>

      {/* Download Button */}
      <button
        onClick={downloadQRCode}
        className="w-full px-4 py-3 bg-green-500 text-white font-semibold rounded-lg mt-4 hover:bg-green-600"
      >
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeGenerator;
