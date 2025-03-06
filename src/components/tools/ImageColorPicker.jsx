// components/ImageColorPicker.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";

const ImageColorPicker = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pickedColor, setPickedColor] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setPickedColor(null);
    }
  };

  // Initialize canvas when image loads
  useEffect(() => {
    if (previewUrl && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = imageRef.current;
      
      img.onload = () => {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [previewUrl]);

  // Pick color on click or move
  const pickColor = (e) => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    
    setPickedColor({
      rgb,
      hex,
      rgba: `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`,
    });
    setPosition({ x, y });
  };

  // Convert RGB to Hex
  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  // Copy color to clipboard
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    alert(`Copied ${value} to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Color Picker
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

          {/* Image and Color Display */}
          {previewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 relative" ref={containerRef}>
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md cursor-crosshair select-none"
                  onClick={pickColor}
                  onMouseMove={pickColor}
                />
                <canvas ref={canvasRef} className="hidden" />
                {pickedColor && (
                  <div
                    className="absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      left: position.x,
                      top: position.y,
                      backgroundColor: pickedColor.rgb,
                    }}
                  />
                )}
              </div>

              {/* Color Info Panel */}
              {pickedColor && (
                <div className="space-y-4">
                  <div
                    className="w-full h-24 rounded-md shadow-inner"
                    style={{ backgroundColor: pickedColor.rgb }}
                  />
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        HEX
                      </label>
                      <div
                        className="p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
                        onClick={() => copyToClipboard(pickedColor.hex)}
                      >
                        {pickedColor.hex}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        RGB
                      </label>
                      <div
                        className="p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
                        onClick={() => copyToClipboard(pickedColor.rgb)}
                      >
                        {pickedColor.rgb}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        RGBA
                      </label>
                      <div
                        className="p-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
                        onClick={() => copyToClipboard(pickedColor.rgba)}
                      >
                        {pickedColor.rgba}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!previewUrl && (
            <p className="text-center text-gray-500">
              Upload an image to start picking colors
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageColorPicker;