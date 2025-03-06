// components/ImageWatercolorConverter.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageWatercolorConverter = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
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

  // Apply watercolor effect
  const applyWatercolorEffect = () => {
    if (!image || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Apply watercolor-like effect
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;

          // Simulate watercolor by averaging nearby pixels
          let r = 0, g = 0, b = 0, count = 0;
          for (let dy = -intensity; dy <= intensity; dy++) {
            for (let dx = -intensity; dx <= intensity; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                const ni = (ny * canvas.width + nx) * 4;
                r += data[ni];
                g += data[ni + 1];
                b += data[ni + 2];
                count++;
              }
            }
          }

          // Apply softened colors with slight randomization
          data[i] = (r / count) * (0.9 + Math.random() * 0.2);
          data[i + 1] = (g / count) * (0.9 + Math.random() * 0.2);
          data[i + 2] = (b / count) * (0.9 + Math.random() * 0.2);
          
          // Add subtle edge darkening
          if (Math.abs(data[i] - data[i + 4]) > 30 || Math.abs(data[i + 1] - data[i + 5]) > 30) {
            data[i] *= 0.95;
            data[i + 1] *= 0.95;
            data[i + 2] *= 0.95;
          }
        }
      }

      // Apply final softening
      ctx.putImageData(imageData, 0, 0);
      ctx.filter = `blur(${intensity / 2}px)`;
      ctx.drawImage(canvas, 0, 0);

      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "watercolor-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Watercolor Image Converter
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
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effect Intensity ({intensity})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={applyWatercolorEffect}
                    disabled={isProcessing}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? "Processing..." : "Apply Watercolor"}
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
                Adjust intensity and click "Apply Watercolor" to see the effect
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageWatercolorConverter;