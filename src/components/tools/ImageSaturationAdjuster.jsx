// components/ImageSaturationAdjuster.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";

const ImageSaturationAdjuster = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saturation, setSaturation] = useState(100); // 100% = original
  const canvasRef = useRef(null);
  const originalImageData = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setSaturation(100); // Reset saturation when new image is uploaded
    }
  };

  // Apply saturation adjustment
  const adjustSaturation = (data, saturationLevel) => {
    const newData = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to HSL
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      const l = (max + min) / 2;
      let s = 0;
      
      if (max !== min) {
        s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
      }
      
      // Adjust saturation
      s *= saturationLevel / 100;
      s = Math.min(1, Math.max(0, s)); // Clamp between 0 and 1

      // Convert back to RGB
      let rNew, gNew, bNew;
      if (s === 0) {
        rNew = gNew = bNew = l * 255;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        rNew = hueToRGB(p, q, (r / 255 + 1/3)) * 255;
        gNew = hueToRGB(p, q, (g / 255)) * 255;
        bNew = hueToRGB(p, q, (b / 255 - 1/3)) * 255;
      }

      newData[i] = rNew;
      newData[i + 1] = gNew;
      newData[i + 2] = bNew;
      newData[i + 3] = data[i + 3]; // Preserve alpha
    }
    
    return newData;
  };

  // Helper function for HSL to RGB conversion
  const hueToRGB = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  // Update canvas when saturation changes
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (!originalImageData.current) {
        originalImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const adjustedData = adjustSaturation(originalImageData.current, saturation);
      ctx.putImageData(new ImageData(adjustedData, canvas.width, canvas.height), 0, 0);
      setPreviewUrl(canvas.toDataURL());
    };

    img.src = previewUrl;
  }, [image, saturation, previewUrl]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `saturation-adjusted-${saturation}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Saturation Adjuster
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
                    Saturation ({saturation}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={downloadImage}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Slide to adjust saturation (0% = grayscale, 100% = original, 200% = oversaturated)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSaturationAdjuster;