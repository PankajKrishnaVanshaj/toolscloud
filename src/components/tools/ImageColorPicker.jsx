"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaUpload, FaSync, FaEyeDropper, FaCopy } from "react-icons/fa";

const ImageColorPicker = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pickedColors, setPickedColors] = useState([]); // Store multiple picked colors
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1); // Zoom level for precision
  const [isPicking, setIsPicking] = useState(true); // Toggle color picking
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setPickedColors([]);
      setZoom(1);
    }
  }, []);

  // Initialize canvas when image loads
  useEffect(() => {
    if (previewUrl && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;

      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [previewUrl]);

  // Pick color on click or move
  const pickColor = useCallback((e) => {
    if (!isPicking || !canvasRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgba = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;

    const newColor = { rgb, hex, rgba, x, y };
    setPickedColors((prev) => {
      if (e.type === "click") {
        return [...prev.slice(-9), newColor]; // Keep last 10 colors on click
      }
      return prev;
    });
    setPosition({ x, y });
  }, [isPicking]);

  // Convert RGB to Hex
  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  // Copy color to clipboard
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    alert(`Copied ${value} to clipboard!`);
  };

  // Reset everything
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setPickedColors([]);
    setZoom(1);
    setIsPicking(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Color Picker
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload and Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsPicking(!isPicking)}
                className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  isPicking ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaEyeDropper className="mr-2" /> {isPicking ? "Picking On" : "Picking Off"}
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Image and Color Display */}
          {previewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 relative" ref={containerRef}>
                <div className="overflow-auto max-h-[70vh]">
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto rounded-md cursor-crosshair select-none"
                    style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                    onClick={pickColor}
                    onMouseMove={pickColor}
                  />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                {pickedColors.map((color, index) => (
                  <div
                    key={index}
                    className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      left: color.x,
                      top: color.y,
                      backgroundColor: color.rgb,
                    }}
                  />
                ))}
                {/* Zoom Control */}
                <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-md">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom ({zoom}x)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>

              {/* Color Palette Panel */}
              <div className="space-y-4">
                {pickedColors.length > 0 ? (
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {pickedColors.slice().reverse().map((color, index) => (
                      <div key={index} className="space-y-2">
                        <div
                          className="w-full h-16 rounded-md shadow-inner"
                          style={{ backgroundColor: color.rgb }}
                        />
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">HEX</span>
                            <div
                              className="p-1 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 flex items-center"
                              onClick={() => copyToClipboard(color.hex)}
                            >
                              <FaCopy className="mr-1 text-xs" /> {color.hex}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">RGB</span>
                            <div
                              className="p-1 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 flex items-center"
                              onClick={() => copyToClipboard(color.rgb)}
                            >
                              <FaCopy className="mr-1 text-xs" /> {color.rgb}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">RGBA</span>
                            <div
                              className="p-1 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 flex items-center"
                              onClick={() => copyToClipboard(color.rgba)}
                            >
                              <FaCopy className="mr-1 text-xs" /> {color.rgba}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">Click on the image to pick colors</p>
                )}
              </div>
            </div>
          )}

          {!previewUrl && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">Upload an image to start picking colors</p>
            </div>
          )}

          {/* Features */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Pick multiple colors with click (up to 10)</li>
              <li>Real-time color preview on hover</li>
              <li>Zoom functionality for precision (1x-5x)</li>
              <li>Toggleable color picking</li>
              <li>Copy HEX, RGB, RGBA to clipboard</li>
              <li>Responsive design with Tailwind CSS</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageColorPicker;