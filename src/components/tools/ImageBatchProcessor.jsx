// components/ImageBatchProcessor.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageBatchProcessor = () => {
  const [images, setImages] = useState([]);
  const [operation, setOperation] = useState("resize");
  const [resizeWidth, setResizeWidth] = useState(800);
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Handle multiple image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      processedUrl: null,
      name: file.name,
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  // Process all images
  const processImages = async () => {
    if (!images.length || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    const processedImages = await Promise.all(
      images.map(async (img) => {
        const image = new Image();
        const promise = new Promise((resolve) => {
          image.onload = () => {
            switch (operation) {
              case "resize":
                canvas.width = resizeWidth;
                canvas.height = (resizeWidth / image.width) * image.height;
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                break;
              case "grayscale":
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                  const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                  data[i] = data[i + 1] = data[i + 2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);
                break;
              case "sepia":
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                const sepiaData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const sData = sepiaData.data;
                for (let i = 0; i < sData.length; i += 4) {
                  const r = sData[i];
                  const g = sData[i + 1];
                  const b = sData[i + 2];
                  sData[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                  sData[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                  sData[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                ctx.putImageData(sepiaData, 0, 0);
                break;
            }
            resolve(canvas.toDataURL("image/jpeg", quality / 100));
          };
          image.src = img.url;
        });
        return { ...img, processedUrl: await promise };
      })
    );

    setImages(processedImages);
    setIsProcessing(false);
  };

  // Download all processed images as ZIP (simplified version)
  const downloadAll = () => {
    if (!images.some(img => img.processedUrl)) return;
    
    images.forEach((img, index) => {
      if (img.processedUrl) {
        const link = document.createElement("a");
        link.href = img.processedUrl;
        link.download = `processed_${index}_${img.name}`;
        link.click();
      }
    });
  };

  // Clear all images
  const clearAll = () => {
    setImages([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Batch Processor
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="resize">Resize</option>
                <option value="grayscale">Grayscale</option>
                <option value="sepia">Sepia</option>
              </select>
            </div>

            <div>
              {operation === "resize" && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width ({resizeWidth}px)
                  </label>
                  <input
                    type="number"
                    value={resizeWidth}
                    onChange={(e) => setResizeWidth(Math.max(100, parseInt(e.target.value)))}
                    min="100"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}
              {operation !== "resize" && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={processImages}
              disabled={isProcessing || !images.length}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
            >
              {isProcessing ? "Processing..." : "Process All"}
            </button>
            <button
              onClick={downloadAll}
              disabled={!images.some(img => img.processedUrl)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
            >
              Download All
            </button>
            <button
              onClick={clearAll}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600 mb-2 truncate">{img.name}</p>
                  <div className="relative aspect-square">
                    <img
                      src={img.processedUrl || img.url}
                      alt={img.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default ImageBatchProcessor;