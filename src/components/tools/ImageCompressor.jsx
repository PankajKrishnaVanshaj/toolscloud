"use client";

import { useState, useRef } from "react";

const ImageCompressor = () => {
  const [image, setImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [quality, setQuality] = useState(0.7); // Default compression quality
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

  const handleCompress = () => {
    if (!image) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Maintain the original image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to compressed data URL
      setCompressedImage(canvas.toDataURL("image/jpeg", quality));
    };
  };

  const handleDownload = () => {
    if (!compressedImage) return;

    const link = document.createElement("a");
    link.href = compressedImage;
    link.download = "compressed-image.jpg";
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
          alt="Uploaded"
          className="w-full max-h-60 object-contain rounded-lg border mb-3"
        />
      )}

      {/* Quality selection */}
      <label className="block mb-2 font-medium">Compression Quality</label>
      <input
        type="range"
        min="0.1"
        max="1.0"
        step="0.1"
        value={quality}
        onChange={(e) => setQuality(parseFloat(e.target.value))}
        className="w-full mb-3"
      />
      <p className="text-center text-sm mb-3">Quality: {quality}</p>

      {/* Compress & Download Buttons */}
      <button
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mb-2"
        onClick={handleCompress}
      >
        Compress Image
      </button>

      {compressedImage && (
        <button
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          onClick={handleDownload}
        >
          Download Compressed Image
        </button>
      )}

      {/* Hidden Canvas for compression */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageCompressor;
