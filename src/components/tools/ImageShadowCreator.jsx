// components/ImageShadowCreator.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageShadowCreator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [shadowX, setShadowX] = useState(10);
  const [shadowY, setShadowY] = useState(10);
  const [shadowBlur, setShadowBlur] = useState(20);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowOpacity, setShadowOpacity] = useState(0.5);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  };

  // Get shadow style
  const getShadowStyle = () => {
    return {
      boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(${parseInt(shadowColor.slice(1,3), 16)}, ${parseInt(shadowColor.slice(3,5), 16)}, ${parseInt(shadowColor.slice(5,7), 16)}, ${shadowOpacity})`
    };
  };

  // Export image with shadow
  const exportImage = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate canvas size including shadow
      const padding = Math.max(shadowBlur, Math.abs(shadowX), Math.abs(shadowY)) * 2;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;

      // Apply shadow
      ctx.shadowOffsetX = shadowX;
      ctx.shadowOffsetY = shadowY;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowColor = `${shadowColor}${Math.floor(shadowOpacity * 255).toString(16).padStart(2, '0')}`;

      // Draw image with shadow
      ctx.drawImage(img, padding, padding);

      // Export
      const link = document.createElement("a");
      link.download = "image-with-shadow.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = previewUrl;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Shadow Creator
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Preview */}
              <div className="lg:col-span-2 flex justify-center items-center bg-gray-200 rounded-xl p-4">
                <div style={getShadowStyle()}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-[500px] rounded-md"
                  />
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horizontal Offset ({shadowX}px)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={shadowX}
                    onChange={(e) => setShadowX(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vertical Offset ({shadowY}px)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={shadowY}
                    onChange={(e) => setShadowY(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blur Radius ({shadowBlur}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shadowBlur}
                    onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shadow Color
                  </label>
                  <input
                    type="color"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className="w-full h-10 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opacity ({shadowOpacity})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={shadowOpacity}
                    onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={exportImage}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Export Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageShadowCreator;