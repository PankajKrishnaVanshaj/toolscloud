"use client";

import { useState, useRef } from "react";

const ImageCropper = () => {
  const [image, setImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 });

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

  const handleCrop = () => {
    if (!image) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set crop area
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Draw the cropped area
    ctx.drawImage(
      img,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height, // Source (original image)
      0, 0, cropArea.width, cropArea.height // Destination (canvas)
    );

    setCroppedImage(canvas.toDataURL("image/png"));
  };

  const handleDownload = () => {
    if (!croppedImage) return;

    const link = document.createElement("a");
    link.href = croppedImage;
    link.download = "cropped-image.png";
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
        <div className="relative">
          <img
            ref={imgRef}
            src={image}
            alt="Uploaded"
            className="w-full max-h-60 object-contain rounded-lg border mb-3"
          />

          {/* Crop area selection */}
          <div
            className="absolute border-2 border-red-500"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height,
            }}
          ></div>
        </div>
      )}

      {/* Crop Area Controls */}
      <div className="mb-3">
        <label className="block font-medium">Crop X:</label>
        <input
          type="range"
          min="0"
          max="300"
          value={cropArea.x}
          onChange={(e) => setCropArea({ ...cropArea, x: parseInt(e.target.value) })}
          className="w-full"
        />
        <label className="block font-medium">Crop Y:</label>
        <input
          type="range"
          min="0"
          max="300"
          value={cropArea.y}
          onChange={(e) => setCropArea({ ...cropArea, y: parseInt(e.target.value) })}
          className="w-full"
        />
        <label className="block font-medium">Width:</label>
        <input
          type="range"
          min="50"
          max="300"
          value={cropArea.width}
          onChange={(e) => setCropArea({ ...cropArea, width: parseInt(e.target.value) })}
          className="w-full"
        />
        <label className="block font-medium">Height:</label>
        <input
          type="range"
          min="50"
          max="300"
          value={cropArea.height}
          onChange={(e) => setCropArea({ ...cropArea, height: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Crop & Download Buttons */}
      <button
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mb-2"
        onClick={handleCrop}
      >
        Crop Image
      </button>

      {croppedImage && (
        <button
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          onClick={handleDownload}
        >
          Download Cropped Image
        </button>
      )}

      {/* Hidden Canvas for cropping */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageCropper;
