// components/AdvancedImageRedEyeRemover.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";

const AdvancedImageRedEyeRemover = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [eyeAreas, setEyeAreas] = useState([]);
  const [sensitivity, setSensitivity] = useState(150);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setEyeAreas([]);
    }
  };

  // Handle mouse events for selection
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setIsSelecting(true);
    setEyeAreas([...eyeAreas, {
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    }]);
  };

  const handleMouseMove = (e) => {
    if (!isSelecting || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newAreas = [...eyeAreas];
    newAreas[newAreas.length - 1] = {
      ...newAreas[newAreas.length - 1],
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    };
    setEyeAreas(newAreas);
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Remove red-eye effect
  const removeRedEye = () => {
    if (!image || !canvasRef.current || eyeAreas.length === 0) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      eyeAreas.forEach(area => {
        const minX = Math.min(area.startX, area.endX) * (canvas.width / containerRef.current.offsetWidth);
        const maxX = Math.max(area.startX, area.endX) * (canvas.width / containerRef.current.offsetWidth);
        const minY = Math.min(area.startY, area.endY) * (canvas.height / containerRef.current.offsetHeight);
        const maxY = Math.max(area.startY, area.endY) * (canvas.height / containerRef.current.offsetHeight);

        for (let y = Math.floor(minY); y < Math.ceil(maxY); y++) {
          for (let x = Math.floor(minX); x < Math.ceil(maxX); x++) {
            const i = (y * canvas.width + x) * 4;
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];

            // Enhanced red-eye detection
            if (red > sensitivity && green < red * 0.7 && blue < red * 0.7) {
              // Replace with more natural pupil color
              const avg = (red + green + blue) / 3;
              data[i] = avg * 0.2;     // Darken red
              data[i + 1] = avg * 0.2; // Darken green
              data[i + 2] = avg * 0.3; // Slightly bluer tone
            }
          }
        }
      });

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "redeye-removed.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Clear selections
  const clearSelections = () => {
    setEyeAreas([]);
    setPreviewUrl(image ? URL.createObjectURL(image) : null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Advanced Red Eye Remover
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview and Controls */}
          {previewUrl && (
            <div className="space-y-6">
              <div
                ref={containerRef}
                className="relative max-w-full mx-auto"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md select-none"
                />
                {eyeAreas.map((area, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-red-500 border-dashed"
                    style={{
                      left: Math.min(area.startX, area.endX),
                      top: Math.min(area.startY, area.endY),
                      width: Math.abs(area.endX - area.startX),
                      height: Math.abs(area.endY - area.startY),
                    }}
                  />
                ))}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Red Sensitivity ({sensitivity})
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="255"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={removeRedEye}
                    disabled={isProcessing || eyeAreas.length === 0}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Remove Red Eye"}
                  </button>
                  <button
                    onClick={clearSelections}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Clear Selections
                  </button>
                  <button
                    onClick={downloadImage}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Click and drag to select eye areas, then click "Remove Red Eye"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedImageRedEyeRemover;