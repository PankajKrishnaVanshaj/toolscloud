"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaFont } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageWatermarker = () => {
  const [image, setImage] = useState(null);
  const [watermarkText, setWatermarkText] = useState("Watermark");
  const [opacity, setOpacity] = useState(0.5);
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(32);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [rotation, setRotation] = useState(0);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [size, setSize] = useState(200); // Initial width for watermark
  const watermarkRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle file upload
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  }, []);

  // Dragging functionality
  const handleDragStart = (e) => {
    e.dataTransfer.setDragImage(new Image(), 0, 0);
  };

  const handleDrag = (e) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    const rect = imageRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left, rect.width - size));
    const newY = Math.max(0, Math.min(e.clientY - rect.top, rect.height - fontSize));
    setPosition({ x: newX, y: newY });
  };

  // Resizing functionality
  const handleResizeStart = (e) => {
    e.preventDefault();
    window.addEventListener("mousemove", handleResizing);
    window.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizing = (e) => {
    const rect = watermarkRef.current.getBoundingClientRect();
    const newSize = Math.max(50, e.clientX - rect.left);
    setSize(newSize);
  };

  const handleResizeEnd = () => {
    window.removeEventListener("mousemove", handleResizing);
    window.removeEventListener("mouseup", handleResizeEnd);
  };

  // Download watermarked image
  const handleDownload = useCallback(() => {
    if (!imageRef.current) return;

    html2canvas(imageRef.current.parentElement, {
      useCORS: true,
      backgroundColor: null,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `watermarked-image-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }, []);

  // Reset all settings
  const reset = () => {
    setImage(null);
    setWatermarkText("Watermark");
    setOpacity(0.5);
    setColor("#ffffff");
    setFontSize(32);
    setPosition({ x: 50, y: 50 });
    setRotation(0);
    setFontFamily("Arial");
    setSize(200);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Watermarker</h2>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {image && (
          <div className="space-y-6">
            {/* Image Preview with Watermark */}
            <div className="relative flex justify-center">
              <img
                src={image}
                alt="Selected"
                ref={imageRef}
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                crossOrigin="anonymous"
              />
              <div
                ref={watermarkRef}
                className="absolute cursor-move select-none"
                draggable
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: `${size}px`,
                  color,
                  fontSize: `${fontSize}px`,
                  opacity,
                  fontFamily,
                  transform: `rotate(${rotation}deg)`,
                  border: "1px dashed #ccc",
                  padding: "8px",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  wordWrap: "break-word",
                }}
              >
                {watermarkText || "Enter text"}
                <div
                  className="absolute bottom-0 right-0 bg-white cursor-se-resize border border-gray-500"
                  style={{ width: "12px", height: "12px" }}
                  onMouseDown={handleResizeStart}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter watermark text"
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
                  <option value="Helvetica">Helvetica</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Size ({fontSize}px)</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Opacity ({opacity})</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-10 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rotation ({rotation}°)</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
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
        )}

        {!image && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start watermarking</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Draggable and resizable watermark</li>
            <li>Customizable text, font, size, color, and opacity</li>
            <li>Rotation support</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageWatermarker;