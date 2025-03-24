// components/ImageTextOverlay.jsx
"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { FaDownload, FaSync, FaUpload, FaFont } from "react-icons/fa";

const ImageTextOverlay = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState("Sample Text");
  const [fontSize, setFontSize] = useState(40);
  const [color, setColor] = useState("#ffffff");
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(50);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textAlign, setTextAlign] = useState("center");
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [shadow, setShadow] = useState({ x: 2, y: 2, blur: 4, color: "#000000" });
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

  // Draw preview on canvas
  const drawPreview = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Apply text with shadow and transformations
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.textAlign = textAlign;
      ctx.shadowOffsetX = shadow.x;
      ctx.shadowOffsetY = shadow.y;
      ctx.shadowBlur = shadow.blur;
      ctx.shadowColor = shadow.color;

      ctx.translate(xPos, yPos);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text || "Enter text", 0, 0);

      // Reset transformations and shadow
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      setPreviewUrl(canvas.toDataURL("image/png"));
    };

    img.src = URL.createObjectURL(image);
  }, [image, text, fontSize, color, xPos, yPos, fontFamily, textAlign, rotation, opacity, shadow]);

  // Update preview when parameters change
  useEffect(() => {
    if (previewUrl) {
      drawPreview();
    }
  }, [drawPreview, previewUrl]);

  // Download processed image
  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `text-overlay-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, []);

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setText("Sample Text");
    setFontSize(40);
    setColor("#ffffff");
    setXPos(50);
    setYPos(50);
    setFontFamily("Arial");
    setTextAlign("center");
    setRotation(0);
    setOpacity(1);
    setShadow({ x: 2, y: 2, blur: 4, color: "#000000" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Image Text Overlay
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {previewUrl && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Size ({fontSize}px)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    X Position ({xPos}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={xPos}
                    onChange={(e) => setXPos(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Y Position ({yPos}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={yPos}
                    onChange={(e) => setYPos(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Verdana">Verdana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
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
                    Rotation ({rotation}°)
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opacity ({opacity})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text Shadow</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={shadow.x}
                      onChange={(e) => setShadow({ ...shadow, x: parseInt(e.target.value) })}
                      placeholder="X"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={shadow.y}
                      onChange={(e) => setShadow({ ...shadow, y: parseInt(e.target.value) })}
                      placeholder="Y"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      min="0"
                      value={shadow.blur}
                      onChange={(e) => setShadow({ ...shadow, blur: parseInt(e.target.value) })}
                      placeholder="Blur"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="color"
                      value={shadow.color}
                      onChange={(e) => setShadow({ ...shadow, color: e.target.value })}
                      className="w-full h-10 rounded-md cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={downloadImage}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
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
              </>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2 flex justify-center">
            {previewUrl ? (
              <div className="relative max-w-full">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-[70vh] object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center w-full h-[50vh] sm:h-[60vh] lg:h-[70vh]">
                <div className="text-center">
                  <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-500 italic">Upload an image to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable text with position, size, and rotation</li>
            <li>Adjustable opacity and text shadow</li>
            <li>Multiple font families and alignment options</li>
            <li>Real-time preview</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageTextOverlay;