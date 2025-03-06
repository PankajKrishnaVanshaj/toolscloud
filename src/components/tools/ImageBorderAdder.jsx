// components/ImageBorderAdder.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageBorderAdder = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [borderWidth, setBorderWidth] = useState(20);
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [cornerRadius, setCornerRadius] = useState(0);
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

  // Apply border and generate preview
  const applyBorder = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions with border
      const newWidth = img.width + borderWidth * 2;
      const newHeight = img.height + borderWidth * 2;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw border
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, newWidth, newHeight);

      // Draw image with border offset
      if (cornerRadius > 0) {
        ctx.beginPath();
        ctx.moveTo(borderWidth + cornerRadius, borderWidth);
        ctx.lineTo(newWidth - borderWidth - cornerRadius, borderWidth);
        ctx.quadraticCurveTo(newWidth - borderWidth, borderWidth, newWidth - borderWidth, borderWidth + cornerRadius);
        ctx.lineTo(newWidth - borderWidth, newHeight - borderWidth - cornerRadius);
        ctx.quadraticCurveTo(newWidth - borderWidth, newHeight - borderWidth, newWidth - borderWidth - cornerRadius, newHeight - borderWidth);
        ctx.lineTo(borderWidth + cornerRadius, newHeight - borderWidth);
        ctx.quadraticCurveTo(borderWidth, newHeight - borderWidth, borderWidth, newHeight - borderWidth - cornerRadius);
        ctx.lineTo(borderWidth, borderWidth + cornerRadius);
        ctx.quadraticCurveTo(borderWidth, borderWidth, borderWidth + cornerRadius, borderWidth);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, borderWidth, borderWidth, img.width, img.height);
      setPreviewUrl(canvas.toDataURL());
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "image-with-border.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Border Adder
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
              <div className="relative max-w-full mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                  style={{
                    border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                    borderRadius: `${cornerRadius}px`,
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Width ({borderWidth}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Color
                  </label>
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-full h-10 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Style
                  </label>
                  <select
                    value={borderStyle}
                    onChange={(e) => setBorderStyle(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Corner Radius ({cornerRadius}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={cornerRadius}
                    onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={applyBorder}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Apply Border
                </button>
                <button
                  onClick={downloadImage}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Download
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Adjust settings and click "Apply Border" to generate the final image
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageBorderAdder;