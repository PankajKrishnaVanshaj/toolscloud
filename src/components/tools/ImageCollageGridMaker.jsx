'use client';

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const ImageCollageGridMaker = () => {
  const [images, setImages] = useState([]);
  const [gridCols, setGridCols] = useState(2);
  const [gap, setGap] = useState(10);
  const [borderRadius, setBorderRadius] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const collageRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const downloadCollage = async () => {
    if (!collageRef.current) return;
    const canvas = await html2canvas(collageRef.current, { backgroundColor });
    const link = document.createElement('a');
    link.download = 'collage.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gap: `${gap}px`,
    backgroundColor,
    padding: '20px',
    borderRadius: `${borderRadius}px`,
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Image Collage Grid Maker
        </h1>

        <div className="grid gap-6">
          {/* Controls Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={gridCols}
                  onChange={(e) => setGridCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gap (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={gap}
                  onChange={(e) => setGap(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Border Radius (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Math.max(0, Math.min(50, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              onClick={downloadCollage}
              disabled={images.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
            >
              Download Collage
            </button>
          </div>

          {/* Collage Preview */}
          {images.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-2">Collage Preview:</h2>
              <div ref={collageRef} style={gridStyle}>
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt="Collage item"
                      className="w-full h-auto rounded-md"
                      style={{ borderRadius: `${borderRadius}px` }}
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && (
            <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
              Upload images to create your collage
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 text-sm text-gray-600">
          <details>
            <summary className="cursor-pointer font-medium">Features & Tips</summary>
            <ul className="list-disc list-inside mt-2">
              <li>Upload multiple images at once</li>
              <li>Customize grid columns (1-10)</li>
              <li>Adjust gap and border radius (0-50px)</li>
              <li>Set background color</li>
              <li>Remove individual images by clicking '×'</li>
              <li>Download as PNG</li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  );
};

export default ImageCollageGridMaker;