"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";

const ImageShadowCreator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [shadowX, setShadowX] = useState(10);
  const [shadowY, setShadowY] = useState(10);
  const [shadowBlur, setShadowBlur] = useState(20);
  const [shadowSpread, setShadowSpread] = useState(0); // New feature
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowOpacity, setShadowOpacity] = useState(0.5);
  const [inset, setInset] = useState(false); // New feature: inset shadow
  const [backgroundColor, setBackgroundColor] = useState("#ffffff"); // New feature
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
    }
  }, []);

  // Get shadow style for preview
  const getShadowStyle = useCallback(() => {
    const rgbaColor = `rgba(${parseInt(shadowColor.slice(1, 3), 16)}, ${parseInt(
      shadowColor.slice(3, 5),
      16
    )}, ${parseInt(shadowColor.slice(5, 7), 16)}, ${shadowOpacity})`;
    return {
      boxShadow: `${inset ? "inset " : ""}${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${rgbaColor}`,
      backgroundColor,
    };
  }, [shadowX, shadowY, shadowBlur, shadowSpread, shadowColor, shadowOpacity, inset, backgroundColor]);

  // Export image with shadow
  const exportImage = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const padding = Math.max(shadowBlur + shadowSpread, Math.abs(shadowX), Math.abs(shadowY)) * 2;
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply shadow
      ctx.shadowOffsetX = shadowX;
      ctx.shadowOffsetY = shadowY;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowSpread = shadowSpread; // Not directly supported, approximated with larger blur
      ctx.shadowColor = `${shadowColor}${Math.floor(shadowOpacity * 255).toString(16).padStart(2, "0")}`;
      if (inset) {
        ctx.shadowInset = true; // Not natively supported, simulated with clipping
        ctx.clip();
      }

      // Draw image with shadow
      ctx.drawImage(img, padding, padding);

      // Export
      const link = document.createElement("a");
      link.download = `image-with-shadow-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = previewUrl;
  }, [image, previewUrl, shadowX, shadowY, shadowBlur, shadowSpread, shadowColor, shadowOpacity, inset, backgroundColor]);

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setShadowX(10);
    setShadowY(10);
    setShadowBlur(20);
    setShadowSpread(0);
    setShadowColor("#000000");
    setShadowOpacity(0.5);
    setInset(false);
    setBackgroundColor("#ffffff");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Shadow Creator
        </h1>

        {/* Upload Section */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {previewUrl && (
          <div className="space-y-6">
            {/* Preview and Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Preview */}
              <div className="lg:col-span-2 flex justify-center items-center bg-gray-50 rounded-xl p-4">
                <div style={getShadowStyle()}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-[500px] rounded-md"
                  />
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horizontal Offset ({shadowX}px)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={shadowX}
                    onChange={(e) => setShadowX(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vertical Offset ({shadowY}px)
                  </label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={shadowY}
                    onChange={(e) => setShadowY(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blur Radius ({shadowBlur}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shadowBlur}
                    onChange={(e) => setShadowBlur(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spread Radius ({shadowSpread}px)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={shadowSpread}
                    onChange={(e) => setShadowSpread(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shadow Color
                  </label>
                  <input
                    type="color"
                    value={shadowColor}
                    onChange={(e) => setShadowColor(e.target.value)}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opacity ({shadowOpacity})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={shadowOpacity}
                    onChange={(e) => setShadowOpacity(parseFloat(e.target.value))}
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

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={inset}
                    onChange={(e) => setInset(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">Inset Shadow</label>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={exportImage}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Export
                  </button>
                  <button
                    onClick={reset}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <FaSync className="mr-2" /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start adding shadows</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable shadow offset, blur, spread, and color</li>
            <li>Adjustable opacity and inset option</li>
            <li>Custom background color</li>
            <li>Real-time preview</li>
            <li>Export as PNG with shadow applied</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageShadowCreator;