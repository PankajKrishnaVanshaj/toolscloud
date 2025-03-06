// components/ImageTextOverlay.jsx
"use client";
import React, { useState, useRef } from "react";

const ImageTextOverlay = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState("Sample Text");
  const [fontSize, setFontSize] = useState(40);
  const [color, setColor] = useState("#ffffff");
  const [xPos, setXPos] = useState(50);
  const [yPos, setYPos] = useState(50);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textAlign, setTextAlign] = useState("center");
  const [rotation, setRotation] = useState(0);
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

  // Draw preview on canvas
  const drawPreview = () => {
    if (!image || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Apply text
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textAlign = textAlign;
      ctx.translate(xPos, yPos);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation

      setPreviewUrl(canvas.toDataURL());
    };
    
    img.src = URL.createObjectURL(image);
  };

  // Update preview when parameters change
  React.useEffect(() => {
    if (previewUrl) {
      drawPreview();
    }
  }, [text, fontSize, color, xPos, yPos, fontFamily, textAlign, rotation]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = "text-overlay.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Text Overlay
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
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
                      Text
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size ({fontSize}px)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      X Position ({xPos}px)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={xPos}
                      onChange={(e) => setXPos(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Y Position ({yPos}px)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={yPos}
                      onChange={(e) => setYPos(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Alignment
                    </label>
                    <select
                      value={textAlign}
                      onChange={(e) => setTextAlign(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rotation ({rotation}°)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={downloadImage}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    Download
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            {previewUrl ? (
              <div className="relative max-w-full mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            ) : (
              <div className="bg-gray-200 h-[400px] sm:h-[500px] lg:h-[600px] rounded-xl flex items-center justify-center">
                <p className="text-gray-500">Upload an image to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageTextOverlay;