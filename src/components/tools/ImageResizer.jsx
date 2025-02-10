"use client";

import { useState, useRef } from "react";

const ImageResizer = () => {
  const [image, setImage] = useState(null);
  const [resizedImage, setResizedImage] = useState(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const canvasRef = useRef(null);

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

  const handleResize = () => {
    if (!image || !width || !height) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = parseInt(width);
      canvas.height = parseInt(height);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setResizedImage(canvas.toDataURL("image/png"));
    };
  };

  const handleDownload = () => {
    if (!resizedImage) return;

    const link = document.createElement("a");
    link.href = resizedImage;
    link.download = "resized-image.png";
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

      {/* Image preview */}
      {image && (
        <img
          src={image}
          alt="Original"
          className="w-full max-h-60 object-contain rounded-lg border mb-3"
        />
      )}

      {/* Input for width & height */}
      <div className="flex gap-2 mb-3">
        <input
          type="number"
          className="w-1/2 p-2 border rounded-lg"
          placeholder="Width"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
        <input
          type="number"
          className="w-1/2 p-2 border rounded-lg"
          placeholder="Height"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </div>

      {/* Resize & Download Buttons */}
      <button
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mb-2"
        onClick={handleResize}
      >
        Resize Image
      </button>

      {resizedImage && (
        <button
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          onClick={handleDownload}
        >
          Download Image
        </button>
      )}

      {/* Canvas for resizing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageResizer;
