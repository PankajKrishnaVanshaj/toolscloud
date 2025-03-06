// components/ImageOverlayTool.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageOverlayTool = () => {
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [overlaySize, setOverlaySize] = useState(100);
  const [opacity, setOpacity] = useState(1);
  const [blendMode, setBlendMode] = useState("normal");
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Handle image uploads
  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  // Handle overlay dragging
  const [isDragging, setIsDragging] = useState(false);
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - (overlaySize / 2);
    const y = e.clientY - rect.top - (overlaySize / 2);
    setOverlayPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Draw and export combined image
  const exportImage = () => {
    if (!baseImage || !overlayImage || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    const baseImg = new Image();
    baseImg.onload = () => {
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;
      ctx.drawImage(baseImg, 0, 0);

      const overlayImg = new Image();
      overlayImg.onload = () => {
        ctx.globalAlpha = opacity;
        ctx.globalCompositeOperation = blendMode;
        
        const scale = overlaySize / 100;
        const overlayWidth = overlayImg.width * scale;
        const overlayHeight = overlayImg.height * scale;
        
        ctx.drawImage(
          overlayImg,
          overlayPosition.x,
          overlayPosition.y,
          overlayWidth,
          overlayHeight
        );

        const link = document.createElement("a");
        link.download = "overlay-result.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      overlayImg.src = overlayImage;
    };
    baseImg.src = baseImage;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Overlay Tool
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setBaseImage)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overlay Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setOverlayImage)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preview and Controls */}
          {baseImage && (
            <div className="space-y-6">
              <div
                ref={containerRef}
                className="relative max-w-full mx-auto"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={baseImage}
                  alt="Base"
                  className="max-w-full h-auto rounded-md"
                />
                {overlayImage && (
                  <img
                    src={overlayImage}
                    alt="Overlay"
                    className="absolute top-0 left-0 cursor-move"
                    style={{
                      transform: `translate(${overlayPosition.x}px, ${overlayPosition.y}px)`,
                      width: `${overlaySize}%`,
                      opacity: opacity,
                      mixBlendMode: blendMode,
                    }}
                    onMouseDown={handleMouseDown}
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Size ({overlaySize}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={overlaySize}
                    onChange={(e) => setOverlaySize(parseInt(e.target.value))}
                    className="w-full"
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
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blend Mode
                  </label>
                  <select
                    value={blendMode}
                    onChange={(e) => setBlendMode(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="soft-light">Soft Light</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={exportImage}
                    disabled={!baseImage || !overlayImage}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    Export
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Drag the overlay to position it, adjust size, opacity, and blend mode
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageOverlayTool;