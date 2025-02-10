"use client";

import { useState, useRef } from "react";

const ImageEnhancer = () => {
  const [image, setImage] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpen: 0,
  });

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyEnhancements = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;

    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;

    // Apply filters
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Apply sharpening if needed
    if (filters.sharpen > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + filters.sharpen); // Red
        data[i + 1] = Math.min(255, data[i + 1] + filters.sharpen); // Green
        data[i + 2] = Math.min(255, data[i + 2] + filters.sharpen); // Blue
      }

      ctx.putImageData(imageData, 0, 0);
    }
  };

  const handleDownload = () => {
    if (!image) return;

    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "enhanced-image.png";
    link.click();
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">

      {/* File input */}
      <input
        type="file"
        accept="image/*"
        className="mb-3 w-full p-2 border rounded-lg"
        onChange={handleImageUpload}
      />

      {/* Image Preview */}
      {image && (
        <div className="mb-3">
          <img
            ref={imgRef}
            src={image}
            alt="Uploaded"
            className="w-full max-h-60 object-contain rounded-lg border mb-3"
          />
        </div>
      )}

      {/* Enhancement Controls */}
      <div className="mb-3">
        <label className="block font-medium">Brightness:</label>
        <input
          type="range"
          min="50"
          max="200"
          value={filters.brightness}
          onChange={(e) => setFilters({ ...filters, brightness: e.target.value })}
          className="w-full"
        />

        <label className="block font-medium">Contrast:</label>
        <input
          type="range"
          min="50"
          max="200"
          value={filters.contrast}
          onChange={(e) => setFilters({ ...filters, contrast: e.target.value })}
          className="w-full"
        />

        <label className="block font-medium">Saturation:</label>
        <input
          type="range"
          min="50"
          max="200"
          value={filters.saturation}
          onChange={(e) => setFilters({ ...filters, saturation: e.target.value })}
          className="w-full"
        />

        <label className="block font-medium">Sharpen:</label>
        <input
          type="range"
          min="0"
          max="50"
          value={filters.sharpen}
          onChange={(e) => setFilters({ ...filters, sharpen: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Apply & Download Buttons */}
      <button
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mb-2"
        onClick={applyEnhancements}
      >
        Apply Enhancements
      </button>

      <button
        className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        onClick={handleDownload}
      >
        Download Enhanced Image
      </button>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageEnhancer;
