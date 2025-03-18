"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaUpload, FaSync, FaCopy, FaEyeDropper } from "react-icons/fa";

const ColorPickerFromImage = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [pickedColors, setPickedColors] = useState([]);
  const [position, setPosition] = useState(null);
  const [zoom, setZoom] = useState(1.0);
  const [isPicking, setIsPicking] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setPickedColors([]);
        setPosition(null);
        setZoom(1.0);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) =>
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("");

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Pick color from image
  const pickColor = useCallback(
    (e) => {
      if (!isPicking || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const [r, g, b] = pixel;
      const hex = rgbToHex(r, g, b);
      const hsl = rgbToHsl(r, g, b);
      const newColor = { r, g, b, hex, hsl, id: Date.now() };
      setPickedColors((prev) => [newColor, ...prev].slice(0, 10)); // Limit to 10 colors
      setPosition({ x: x * zoom, y: y * zoom });
    },
    [isPicking, zoom]
  );

  // Draw image on canvas
  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [imageSrc]);

  // Reset state
  const reset = () => {
    setImageSrc(null);
    setPickedColors([]);
    setPosition(null);
    setZoom(1.0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Copy color to clipboard
  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Picker From Image
        </h1>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
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
                  isPicking
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaEyeDropper className="mr-2" />
                {isPicking ? "Stop Picking" : "Start Picking"}
              </button>
              <button
                onClick={reset}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Zoom ({zoom.toFixed(1)}x)
            </label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full max-w-xs h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Canvas */}
          <div className="lg:col-span-2 relative">
            {imageSrc ? (
              <>
                <canvas
                  ref={canvasRef}
                  onClick={pickColor}
                  className={`max-w-full h-auto rounded-lg border border-gray-300 ${
                    isPicking ? "cursor-crosshair" : "cursor-default"
                  }`}
                  style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                />
                <img ref={imageRef} src={imageSrc} alt="Uploaded" className="hidden" />
                {position && (
                  <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-md"
                    style={{
                      left: position.x,
                      top: position.y,
                      backgroundColor: pickedColors[0]?.hex,
                    }}
                  />
                )}
              </>
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500 italic">Upload an image to start</p>
              </div>
            )}
          </div>

          {/* Color Palette */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Picked Colors</h2>
            {pickedColors.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pickedColors.map((color) => (
                  <div key={color.id} className="bg-gray-50 p-3 rounded-lg shadow-sm">
                    <div
                      className="w-full h-16 rounded-md shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="mt-2 text-sm">
                      <p>
                        HEX: {color.hex.toUpperCase()}
                        <button
                          onClick={() => copyToClipboard(color.hex)}
                          className="ml-2 text-blue-500 hover:underline"
                        >
                          <FaCopy size={12} />
                        </button>
                      </p>
                      <p>RGB: {color.r}, {color.g}, {color.b}</p>
                      <p>HSL: {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 italic">
                {imageSrc
                  ? "Click on the image to pick colors"
                  : "Upload an image to pick colors"}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Pick multiple colors (up to 10) from an image</li>
            <li>Zoom in/out for precise selection</li>
            <li>Toggle color picking mode</li>
            <li>Display HEX, RGB, and HSL values</li>
            <li>Copy HEX values to clipboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorPickerFromImage;