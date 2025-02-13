"use client";
import React, { useState, useRef } from "react";

const ImageWatermarker = () => {
  const [image, setImage] = useState(null);
  const [watermark, setWatermark] = useState("Watermark");
  const [opacity, setOpacity] = useState(0.5);
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(16);
  const [position, setPosition] = useState({ x: 10, y: 10 });
  const [size, setSize] = useState(100); // Initial width for watermark
  const watermarkRef = useRef();
  const imageRef = useRef();
  
  const handleFileChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setDragImage(new Image(), 0, 0); // Prevent default ghost image
  };

  const handleDrag = (e) => {
    if (e.clientX === 0 && e.clientY === 0) return; // Prevent invalid drag events
    const rect = watermarkRef.current.parentElement.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    setPosition({ x: newX, y: newY });
  };

  // Handle resize using the bottom-right corner
  const handleResizeStart = (e) => {
    e.preventDefault();
    window.addEventListener("mousemove", handleResizing);
    window.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizing = (e) => {
    const rect = watermarkRef.current.getBoundingClientRect();
    const newSize = Math.max(50, e.clientX - rect.left); // Minimum size of 50px
    setSize(newSize);
  };

  const handleResizeEnd = () => {
    window.removeEventListener("mousemove", handleResizing);
    window.removeEventListener("mouseup", handleResizeEnd);
  };

  const handleDownload = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    if (img) {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.fillText(watermark, position.x, position.y + fontSize);

      const link = document.createElement("a");
      link.download = "watermarked-image.png";
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="p-4 rounded-lg shadow-lg bg-white max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Image Watermarker</h2>
      <input type="file" onChange={handleFileChange} className="mb-4" />
      <input
        type="text"
        placeholder="Enter watermark text"
        value={watermark}
        onChange={(e) => setWatermark(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Opacity:</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={opacity}
        onChange={(e) => setOpacity(parseFloat(e.target.value))}
        className="w-full mb-4"
      />

      <label className="block mb-2 font-medium">Font Size:</label>
      <input
        type="number"
        min="10"
        max="50"
        value={fontSize}
        onChange={(e) => setFontSize(parseInt(e.target.value))}
        className="w-full p-2 border rounded mb-4"
      />

      <label className="block mb-2 font-medium">Watermark Color:</label>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="mb-4"
      />

      {image && (
        <div className="relative">
          <img
            src={image}
            alt="Selected"
            className="rounded"
            ref={imageRef}
            crossOrigin="anonymous"
          />
          <div
            ref={watermarkRef}
            className="absolute cursor-move"
            draggable
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size}px`,
              height: "auto",
              position: "absolute",
              color,
              fontSize: `${fontSize}px`,
              opacity,
              border: "1px dashed #ccc",
              padding: "4px",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {watermark}
            <div
              className="absolute bottom-0 right-0 bg-white cursor-se-resize"
              style={{
                width: "10px",
                height: "10px",
                border: "1px solid #000",
              }}
              onMouseDown={handleResizeStart}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow"
      >
        Download Watermarked Image
      </button>
    </div>
  );
};

export default ImageWatermarker;
