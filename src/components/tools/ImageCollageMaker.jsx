"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaTrash } from "react-icons/fa";
import html2canvas from "html2canvas"; // Add this dependency for downloading

const ImageCollageMaker = () => {
  const [images, setImages] = useState([]);
  const [layout, setLayout] = useState("grid");
  const [columns, setColumns] = useState(2);
  const [gap, setGap] = useState(4);
  const [borderRadius, setBorderRadius] = useState(8);
  const collageRef = React.useRef(null);

  // Optimized file handling with useCallback
  const handleFileChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  }, []);

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageUrls = droppedFiles.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...imageUrls]);
  }, []);

  const removeImage = (indexToRemove) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  const clearAll = () => {
    setImages([]);
    setLayout("grid");
    setColumns(2);
    setGap(4);
    setBorderRadius(8);
  };

  const downloadCollage = () => {
    if (collageRef.current) {
      html2canvas(collageRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `collage-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Dynamic layout styles
  const getLayoutStyles = () => {
    switch (layout) {
      case "grid":
        return `grid grid-cols-${columns} gap-${gap}`;
      case "masonry":
        return `columns-${columns} gap-${gap}`;
      case "single":
        return "flex flex-wrap gap-4";
      case "stack":
        return "flex flex-col gap-4";
      case "carousel":
        return "flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory";
      default:
        return "grid grid-cols-2 gap-4";
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div
        className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Collage Maker</h2>

        {/* Controls */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2">
              <button
                onClick={downloadCollage}
                disabled={!images.length}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={clearAll}
                disabled={!images.length}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Layout Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
              <select
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="single">Single Row</option>
                <option value="stack">Stack</option>
                <option value="carousel">Carousel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
              <input
                type="number"
                min="1"
                max="6"
                value={columns}
                onChange={(e) => setColumns(Math.max(1, Math.min(6, e.target.value)))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={layout === "single" || layout === "stack"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gap (px)</label>
              <input
                type="range"
                min="0"
                max="16"
                value={gap}
                onChange={(e) => setGap(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-gray-600">{gap}px</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius (px)</label>
              <input
                type="range"
                min="0"
                max="24"
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-sm text-gray-600">{borderRadius}px</span>
            </div>
          </div>

          {/* Collage Display */}
          {images.length > 0 ? (
            <div
              ref={collageRef}
              className={`${getLayoutStyles()} max-h-[70vh] overflow-y-auto`}
            >
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative break-inside-avoid snap-start"
                  style={{ borderRadius: `${borderRadius}px` }}
                >
                  <img
                    src={img}
                    alt={`Collage ${index}`}
                    className="w-full h-auto object-cover transition-transform hover:scale-105"
                    style={{ borderRadius: `${borderRadius}px` }}
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500 italic">
                Drag and drop images here or click to upload
              </p>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple layout options: Grid, Masonry, Single Row, Stack, Carousel</li>
            <li>Drag and drop support</li>
            <li>Customizable columns, gap, and border radius</li>
            <li>Download collage as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Hover effects and smooth transitions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageCollageMaker;