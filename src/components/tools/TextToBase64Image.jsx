"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaCopy, FaSync, FaFont } from "react-icons/fa";

const TextToBase64Image = () => {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(20);
  const [fontColor, setFontColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [padding, setPadding] = useState(10);
  const [textAlign, setTextAlign] = useState("center"); // New: text alignment
  const [imageFormat, setImageFormat] = useState("png"); // New: output format
  const [compression, setCompression] = useState(0.8); // New: compression level
  const [base64Image, setBase64Image] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  const fontOptions = [
    "Arial",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Comic Sans MS",
    "Impact",
    "Helvetica",
    "Roboto",
  ];

  // Generate image from text
  const generateImage = useCallback(() => {
    setError("");
    setBase64Image("");

    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Measure text size
    ctx.font = `${fontSize}px ${fontFamily}`;
    const lines = text.split("\n");
    const textMetrics = lines.map((line) => ctx.measureText(line));
    const textWidth = Math.max(...textMetrics.map((m) => m.width));
    const lineHeight = fontSize * 1.2;
    const textHeight = lineHeight * lines.length;

    // Set canvas size with padding
    canvas.width = textWidth + padding * 2;
    canvas.height = textHeight + padding * 2;

    // Clear and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = fontColor;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "middle";
    ctx.textAlign = textAlign;

    const x =
      textAlign === "center"
        ? canvas.width / 2
        : textAlign === "left"
        ? padding
        : canvas.width - padding;

    lines.forEach((line, index) => {
      ctx.fillText(line, x, padding + lineHeight / 2 + index * lineHeight);
    });

    // Generate Base64 with selected format and compression
    const mimeType = `image/${imageFormat}`;
    const base64 = canvas.toDataURL(mimeType, compression);
    setBase64Image(base64);
  }, [
    text,
    fontSize,
    fontColor,
    backgroundColor,
    fontFamily,
    padding,
    textAlign,
    imageFormat,
    compression,
  ]);

  // Copy Base64 to clipboard
  const copyToClipboard = () => {
    if (base64Image) {
      navigator.clipboard
        .writeText(base64Image)
        .then(() => alert("Base64 string copied to clipboard"))
        .catch(() => setError("Failed to copy to clipboard"));
    }
  };

  // Download image
  const downloadImage = () => {
    if (base64Image) {
      const link = document.createElement("a");
      link.href = base64Image;
      link.download = `text-image-${Date.now()}.${imageFormat}`;
      link.click();
    }
  };

  // Clear all fields
  const clearAll = () => {
    setText("");
    setFontSize(20);
    setFontColor("#000000");
    setBackgroundColor("#FFFFFF");
    setFontFamily("Arial");
    setPadding(10);
    setTextAlign("center");
    setImageFormat("png");
    setCompression(0.8);
    setBase64Image("");
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Text to Base64 Image Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text (use \n for new lines)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size ({fontSize}px)
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {fontOptions.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Alignment
                </label>
                <select
                  value={textAlign}
                  onChange={(e) => setTextAlign(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Color
                </label>
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
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
                  className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
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
                  value={padding}
                  onChange={(e) => setPadding(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Format
                </label>
                <select
                  value={imageFormat}
                  onChange={(e) => setImageFormat(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compression ({compression.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={compression}
                  onChange={(e) => setCompression(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <button
              onClick={generateImage}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaFont className="mr-2" /> Generate Base64 Image
            </button>
          </div>

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {base64Image && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Generated Image</h2>
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={base64Image}
                    alt="Generated Text"
                    className="max-w-full max-h-96 object-contain rounded-md shadow-md transition-transform hover:scale-105"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base64 String
                  </label>
                  <textarea
                    value={base64Image}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 h-24 resize-y"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    Size: {(base64Image.length / 1024).toFixed(2)} KB
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <FaCopy className="mr-2" /> Copy Base64
                    </button>
                    <button
                      onClick={downloadImage}
                      className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <FaDownload className="mr-2" /> Download Image
                    </button>
                    <button
                      onClick={clearAll}
                      className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <FaSync className="mr-2" /> Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert text to Base64-encoded image</li>
            <li>Customize font size, family, color, and alignment</li>
            <li>Adjust padding and background color</li>
            <li>Support for multiple lines (\n)</li>
            <li>Choose output format: PNG, JPEG, WebP</li>
            <li>Adjust compression level</li>
            <li>Preview with hover zoom effect</li>
            <li>Copy Base64 or download image</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextToBase64Image;