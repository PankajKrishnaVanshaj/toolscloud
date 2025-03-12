// components/ImageMemeGenerator.jsx
"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaDownload, FaSync, FaUpload, FaFont } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageMemeGenerator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [topText, setTopText] = useState("TOP TEXT");
  const [bottomText, setBottomText] = useState("BOTTOM TEXT");
  const [textColor, setTextColor] = useState("#ffffff");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState("Impact");
  const [textAlignment, setTextAlignment] = useState("center");
  const [outlineWidth, setOutlineWidth] = useState(4);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  }, []);

  // Draw meme on canvas
  const drawMeme = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Text styling
      ctx.font = `${fontSize}px ${fontFamily}, sans-serif`;
      ctx.textAlign = textAlignment;
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineWidth;

      // Text positions
      const maxWidth = canvas.width * 0.9;
      const lineHeight = fontSize * 1.2;
      const x = textAlignment === "center" ? canvas.width / 2 : (textAlignment === "left" ? fontSize : canvas.width - fontSize);

      // Wrap text function
      const wrapText = (text, x, y, maxWidth, lineHeight) => {
        const words = text.split(" ");
        let line = "";
        let lines = [];
        let currentY = y;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push({ text: line.trim(), y: currentY });
            line = words[n] + " ";
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        lines.push({ text: line.trim(), y: currentY });

        lines.forEach(({ text, y }) => {
          ctx.strokeText(text.toUpperCase(), x, y);
          ctx.fillText(text.toUpperCase(), x, y);
        });
      };

      // Draw top and bottom text
      wrapText(topText, x, fontSize * 1.5, maxWidth, lineHeight);
      wrapText(bottomText, x, canvas.height - fontSize * 1.5, maxWidth, lineHeight);

      setPreviewUrl(canvas.toDataURL("image/png"));
    };

    img.src = previewUrl;
  }, [image, topText, bottomText, textColor, outlineColor, fontSize, fontFamily, textAlignment, outlineWidth, previewUrl]);

  // Update preview when parameters change
  useEffect(() => {
    if (previewUrl) {
      drawMeme();
    }
  }, [drawMeme, previewUrl]);

  // Download meme
  const downloadMeme = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `meme-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setTopText("TOP TEXT");
    setBottomText("BOTTOM TEXT");
    setTextColor("#ffffff");
    setOutlineColor("#000000");
    setFontSize(40);
    setFontFamily("Impact");
    setTextAlignment("center");
    setOutlineWidth(4);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6">Meme Generator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Top Text</label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bottom Text</label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="Impact">Impact</option>
                <option value="Arial">Arial</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Font Size ({fontSize}px)</label>
              <input
                type="range"
                min="20"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 rounded-md cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outline Color</label>
              <input
                type="color"
                value={outlineColor}
                onChange={(e) => setOutlineColor(e.target.value)}
                className="w-full h-10 rounded-md cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outline Width ({outlineWidth}px)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={outlineWidth}
                onChange={(e) => setOutlineWidth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
              <select
                value={textAlignment}
                onChange={(e) => setTextAlignment(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadMeme}
                disabled={!previewUrl}
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
          <div className="lg:col-span-2">
            {previewUrl ? (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <img
                  src={previewUrl}
                  alt="Meme preview"
                  className="max-w-full h-auto rounded-md max-h-[70vh] object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl h-96 flex items-center justify-center text-gray-500 italic">
                <FaUpload className="mr-2 text-3xl" /> Upload an image to create a meme
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Custom top and bottom text with wrapping</li>
            <li>Adjustable font size, color, and outline</li>
            <li>Multiple font families (Impact, Comic Sans, etc.)</li>
            <li>Text alignment options (left, center, right)</li>
            <li>Download as PNG</li>
            <li>Real-time preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageMemeGenerator;