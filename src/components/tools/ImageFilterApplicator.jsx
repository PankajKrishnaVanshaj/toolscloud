// components/ImageFilterApplicator.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageFilterApplicator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [filter, setFilter] = useState("none");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      resetFilters();
    }
  };

  // Reset filter settings
  const resetFilters = () => {
    setFilter("none");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
  };

  // Apply filter to canvas
  const applyFilter = () => {
    if (!image || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Apply CSS-like filters
      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        blur(${blur}px)
      `;
      
      ctx.drawImage(img, 0, 0);

      // Apply special filters
      if (filter !== "none") {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        switch (filter) {
          case "grayscale":
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;
              data[i + 1] = avg;
              data[i + 2] = avg;
            }
            break;
          case "sepia":
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              data[i] = Math.min(255, (r * .393) + (g * .769) + (b * .189));
              data[i + 1] = Math.min(255, (r * .349) + (g * .686) + (b * .168));
              data[i + 2] = Math.min(255, (r * .272) + (g * .534) + (b * .131));
            }
            break;
          case "invert":
            for (let i = 0; i < data.length; i += 4) {
              data[i] = 255 - data[i];
              data[i + 1] = 255 - data[i + 1];
              data[i + 2] = 255 - data[i + 2];
            }
            break;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      setPreviewUrl(canvas.toDataURL());
      setIsProcessing(false);
    };

    img.src = previewUrl;
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "filtered-image.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Filter Applicator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
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

              {image && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter Type
                    </label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="grayscale">Grayscale</option>
                      <option value="sepia">Sepia</option>
                      <option value="invert">Invert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brightness ({brightness}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contrast ({contrast}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blur ({blur}px)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={blur}
                      onChange={(e) => setBlur(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={applyFilter}
                      disabled={isProcessing}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                    >
                      {isProcessing ? "Processing..." : "Apply Filters"}
                    </button>
                    <button
                      onClick={resetFilters}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={downloadImage}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {previewUrl && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md mx-auto"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageFilterApplicator;