"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";
import html2canvas from "html2canvas";

const ImageCollageGridMaker = () => {
  const [images, setImages] = useState([]);
  const [gridCols, setGridCols] = useState(2);
  const [gridRows, setGridRows] = useState("auto"); // Added rows control
  const [gap, setGap] = useState(10);
  const [borderRadius, setBorderRadius] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [padding, setPadding] = useState(20);
  const [imageFit, setImageFit] = useState("cover"); // Added image fit option
  const collageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Optimized image upload handler
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  // Remove image
  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  // Reset all settings
  const resetCollage = () => {
    setImages([]);
    setGridCols(2);
    setGridRows("auto");
    setGap(10);
    setBorderRadius(0);
    setBackgroundColor("#ffffff");
    setPadding(20);
    setImageFit("cover");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download collage
  const downloadCollage = useCallback(async () => {
    if (!collageRef.current) return;
    const canvas = await html2canvas(collageRef.current, { backgroundColor });
    const link = document.createElement("a");
    link.download = `collage-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [backgroundColor]);

  // Dynamic grid style
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
    gridTemplateRows: gridRows === "auto" ? "auto" : `repeat(${gridRows}, 1fr)`,
    gap: `${gap}px`,
    backgroundColor,
    padding: `${padding}px`,
    borderRadius: `${borderRadius}px`,
    maxHeight: "70vh",
    overflow: "auto",
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Image Collage Grid Maker
        </h1>

        <div className="space-y-6">
          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-2">
              <button
                onClick={downloadCollage}
                disabled={images.length === 0}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={resetCollage}
                disabled={images.length === 0}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Customization Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Columns ({gridCols})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={gridCols}
                onChange={(e) => setGridCols(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rows ({gridRows === "auto" ? "Auto" : gridRows})
              </label>
              <select
                value={gridRows}
                onChange={(e) => setGridRows(e.target.value === "auto" ? "auto" : parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Auto</option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gap ({gap}px)
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={gap}
                onChange={(e) => setGap(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Border Radius ({borderRadius}px)
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Padding ({padding}px)
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={padding}
                onChange={(e) => setPadding(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
                className="w-full h-10 rounded-md cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Fit
              </label>
              <select
                value={imageFit}
                onChange={(e) => setImageFit(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
              </select>
            </div>
          </div>

          {/* Collage Preview */}
          {images.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Collage Preview</h2>
              <div ref={collageRef} style={gridStyle}>
                {images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt="Collage item"
                      className={`w-full h-full rounded-md transition-transform hover:scale-105`}
                      style={{
                        borderRadius: `${borderRadius}px`,
                        objectFit: imageFit,
                      }}
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">Upload images to create your collage</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable grid columns (1-10) and rows (auto or 1-5)</li>
            <li>Adjustable gap, padding, and border radius (0-50px)</li>
            <li>Background color picker</li>
            <li>Image fit options: Cover, Contain, Fill</li>
            <li>Remove individual images with hover effect</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageCollageGridMaker;