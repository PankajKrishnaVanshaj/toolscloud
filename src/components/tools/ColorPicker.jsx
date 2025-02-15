"use client";

import { useState, useRef } from "react";

const ColorPicker = () => {
  const [color, setColor] = useState("#3498db");
  const [uploadedImage, setUploadedImage] = useState(null);
  const canvasRef = useRef(null);

  // Handle color change from color input
  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

  // Handle file upload and preview
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract color from clicked image using canvas
  const handleImageClick = (e) => {
    if (!uploadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = uploadedImage;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const pixelData = ctx.getImageData(x, y, 1, 1).data;

      const selectedColor = `#${(
        (1 << 24) +
        (pixelData[0] << 16) +
        (pixelData[1] << 8) +
        pixelData[2]
      )
        .toString(16)
        .slice(1)}`;
      setColor(selectedColor);
    };
  };

  // Copy the selected color to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(color);
    alert(`Copied ${color} to clipboard!`);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">Color Picker</h2>

      {/* Color Picker Input */}
      <input
        type="color"
        value={color}
        onChange={handleColorChange}
        className="w-24 h-24 border-none cursor-pointer"
      />

      {/* Display Selected Color */}
      <div className="mt-4">
        <p className="text-lg font-medium">Selected Color:</p>
        <div
          className="w-full h-14 rounded-lg mt-2"
          style={{ backgroundColor: color }}
        ></div>
        <p className="mt-2 text-gray-700 font-semibold">{color}</p>
        <button
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          onClick={copyToClipboard}
        >
          Copy Color
        </button>
      </div>

      {/* Upload Image Option */}
      <div className="mt-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="block mx-auto mb-4"
        />
        {uploadedImage && (
          <div className="relative">
            <p className="text-lg font-medium">Click to Pick a Color from Image:</p>
            <img
              src={uploadedImage}
              alt="Uploaded"
              onClick={handleImageClick}
              className="max-w-full h-auto mt-4 border rounded-lg cursor-crosshair"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
