// components/ImageThumbnailGenerator.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageThumbnailGenerator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [thumbnails, setThumbnails] = useState([]);
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(200);
  const [keepAspect, setKeepAspect] = useState(true);
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setThumbnails([]);
    }
  };

  // Generate thumbnail
  const generateThumbnail = () => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate dimensions
      let targetWidth = parseInt(width);
      let targetHeight = parseInt(height);
      
      if (keepAspect) {
        const aspectRatio = img.width / img.height;
        targetHeight = targetWidth / aspectRatio;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw and resize image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Generate thumbnail URL
      const thumbnailUrl = canvas.toDataURL("image/jpeg", quality / 100);
      setThumbnails([...thumbnails, {
        url: thumbnailUrl,
        width: targetWidth,
        height: targetHeight,
        size: Math.round((thumbnailUrl.length * 3) / 4 / 1024) // Approximate size in KB
      }]);
      
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download all thumbnails as ZIP (simplified version)
  const downloadAll = () => {
    thumbnails.forEach((thumb, index) => {
      const link = document.createElement("a");
      link.download = `thumbnail-${index + 1}-${thumb.width}x${thumb.height}.jpg`;
      link.href = thumb.url;
      link.click();
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Thumbnail Generator
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div>
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

              {previewUrl && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, e.target.value))}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={height}
                      onChange={(e) => setHeight(Math.max(1, e.target.value))}
                      disabled={keepAspect}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={keepAspect}
                        onChange={(e) => setKeepAspect(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Maintain Aspect Ratio
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quality ({quality}%)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={generateThumbnail}
                      disabled={isProcessing}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50 transition-colors"
                    >
                      {isProcessing ? "Generating..." : "Generate Thumbnail"}
                    </button>
                    {thumbnails.length > 0 && (
                      <button
                        onClick={downloadAll}
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
                      >
                        Download All
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Preview and Results */}
            <div className="lg:col-span-2 space-y-6">
              {previewUrl && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Original</h2>
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}

              {thumbnails.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Thumbnails</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {thumbnails.map((thumb, index) => (
                      <div key={index} className="space-y-2">
                        <img
                          src={thumb.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-auto rounded-md border"
                        />
                        <p className="text-sm text-gray-600">
                          {thumb.width}x{thumb.height} - ~{thumb.size}KB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageThumbnailGenerator;