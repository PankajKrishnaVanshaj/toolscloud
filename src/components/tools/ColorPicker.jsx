"use client";

import { useState, useRef, useCallback } from "react";
import { FaCopy, FaDownload, FaHistory, FaUndo, FaPalette } from "react-icons/fa";

const ColorPicker = () => {
  const [color, setColor] = useState("#3498db");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [format, setFormat] = useState("hex"); // hex, rgb, hsl
  const [history, setHistory] = useState([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const canvasRef = useRef(null);

  // Convert color to different formats
  const convertColor = useCallback((hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hsl = rgbToHsl(r, g, b);
    return { hex, rgb, hsl };
  }, []);

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const getColorInFormat = () => {
    const colors = convertColor(color);
    return colors[format];
  };

  // Handle color change from input
  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    setHistory(prev => [newColor, ...prev.filter(c => c !== newColor)].slice(0, 5));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setUploadedImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Extract color from image
  const handleImageClick = (e) => {
    if (!uploadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = uploadedImage;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const pixelData = ctx.getImageData(x, y, 1, 1).data;

      const selectedColor = `#${((1 << 24) + (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2]).toString(16).slice(1)}`;
      setColor(selectedColor);
      setHistory(prev => [selectedColor, ...prev.filter(c => c !== selectedColor)].slice(0, 5));
    };
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const colorValue = getColorInFormat();
    navigator.clipboard.writeText(colorValue);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Download color palette
  const downloadPalette = () => {
    const palette = history.map(hex => convertColor(hex).hex).join("\n");
    const blob = new Blob([palette], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `color-palette-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Restore from history
  const restoreColor = (histColor) => setColor(histColor);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          <FaPalette className="inline mr-2" /> Color Picker
        </h2>

        {/* Color Input */}
        <div className="flex flex-col items-center mb-6">
          <input
            type="color"
            value={color}
            onChange={handleColorChange}
            className="w-32 h-32 border-none cursor-pointer rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label="Select a color"
          />
        </div>

        {/* Color Display */}
        <div className="mb-6 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">Selected Color</p>
          <div
            className="w-full h-20 rounded-lg shadow-inner mx-auto max-w-xs"
            style={{ backgroundColor: color }}
          />
          <div className="mt-4">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="hex">HEX</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
            </select>
            <p className="text-lg font-mono text-gray-800">{getColorInFormat()}</p>
            <button
              onClick={copyToClipboard}
              className={`mt-3 px-4 py-2 rounded-lg text-white transition-colors flex items-center mx-auto ${copyFeedback ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              <FaCopy className="mr-2" />
              {copyFeedback ? "Copied!" : "Copy Color"}
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-lg font-semibold text-gray-700 mb-2 text-center">
            Pick Color from Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploadedImage && (
            <div className="mt-4 relative">
              <img
                src={uploadedImage}
                alt="Uploaded"
                onClick={handleImageClick}
                className="max-w-full h-auto rounded-lg border border-gray-200 cursor-crosshair mx-auto"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>

        {/* Color History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaHistory className="mr-2" /> Recent Colors
            </h3>
            <div className="flex flex-wrap gap-3">
              {history.map((histColor, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                    style={{ backgroundColor: histColor }}
                    onClick={() => restoreColor(histColor)}
                    title={convertColor(histColor).hex}
                  />
                  <button
                    onClick={() => restoreColor(histColor)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaUndo />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={downloadPalette}
              className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <FaDownload className="mr-2" /> Download Palette
            </button>
          </div>
        )}

        {/* Features */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Select colors via input or image</li>
            <li>Multiple color formats (HEX, RGB, HSL)</li>
            <li>Copy colors to clipboard</li>
            <li>Track and restore color history</li>
            <li>Download color palette</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;