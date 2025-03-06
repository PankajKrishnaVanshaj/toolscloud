// components/AdvancedImageComparisonTool.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";

const AdvancedImageComparisonTool = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [mode, setMode] = useState("slider"); // slider, side-by-side, difference
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle image uploads
  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  // Handle slider movement
  const handleSliderChange = (e) => {
    setSliderPosition(e.target.value);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || mode !== "slider") return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  // Calculate difference image
  const getDifferenceImage = () => {
    if (!image1 || !image2 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img1 = new Image();
    const img2 = new Image();

    img1.onload = () => {
      img2.onload = () => {
        canvas.width = img1.width;
        canvas.height = img1.height;
        ctx.drawImage(img1, 0, 0);
        const imageData1 = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img2, 0, 0);
        const imageData2 = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const diffData = ctx.createImageData(canvas.width, canvas.height);
        const data1 = imageData1.data;
        const data2 = imageData2.data;
        const diff = diffData.data;

        for (let i = 0; i < data1.length; i += 4) {
          const rDiff = Math.abs(data1[i] - data2[i]);
          const gDiff = Math.abs(data1[i + 1] - data2[i + 1]);
          const bDiff = Math.abs(data1[i + 2] - data2[i + 2]);
          diff[i] = rDiff;      // Red channel shows differences
          diff[i + 1] = gDiff;  // Green channel
          diff[i + 2] = bDiff;  // Blue channel
          diff[i + 3] = 255;    // Full opacity
        }

        ctx.putImageData(diffData, 0, 0);
      };
      img2.src = image2;
    };
    img1.src = image1;

    return canvas.toDataURL();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Advanced Image Comparison Tool
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setImage1)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Second Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setImage2)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Controls */}
          {image1 && image2 && (
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("slider")}
                  className={`px-4 py-2 rounded-md ${mode === "slider" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  Slider
                </button>
                <button
                  onClick={() => setMode("side-by-side")}
                  className={`px-4 py-2 rounded-md ${mode === "side-by-side" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  Side by Side
                </button>
                <button
                  onClick={() => setMode("difference")}
                  className={`px-4 py-2 rounded-md ${mode === "difference" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                >
                  Difference
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Zoom:</label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-32"
                />
                <span>{zoom.toFixed(1)}x</span>
              </div>
            </div>
          )}

          {/* Comparison Viewer */}
          {image1 && image2 && (
            <div
              ref={containerRef}
              className="relative w-full aspect-video bg-gray-200 rounded-md overflow-hidden"
              onMouseMove={handleMouseMove}
            >
              {mode === "slider" && (
                <>
                  <img
                    src={image1}
                    alt="First image"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={{ transform: `scale(${zoom})` }}
                  />
                  <div
                    className="absolute top-0 left-0 h-full overflow-hidden"
                    style={{ width: `${sliderPosition}%`, transform: `scale(${zoom})`, transformOrigin: "top left" }}
                  >
                    <img
                      src={image2}
                      alt="Second image"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute top-0 h-full w-1 bg-white shadow-md"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center cursor-ew-resize">
                      <span className="text-gray-600">↔</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={handleSliderChange}
                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/2 opacity-70"
                  />
                </>
              )}

              {mode === "side-by-side" && (
                <div className="flex">
                  <img
                    src={image1}
                    alt="First image"
                    className="w-1/2 h-full object-cover"
                    style={{ transform: `scale(${zoom})` }}
                  />
                  <img
                    src={image2}
                    alt="Second image"
                    className="w-1/2 h-full object-cover"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>
              )}

              {mode === "difference" && (
                <img
                  src={getDifferenceImage()}
                  alt="Difference"
                  className="w-full h-full object-cover"
                  style={{ transform: `scale(${zoom})` }}
                />
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {!image1 && !image2 && (
            <p className="text-center text-gray-500">
              Upload two images to compare them
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedImageComparisonTool;