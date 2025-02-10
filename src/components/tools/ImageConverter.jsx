"use client";

import { useState, useRef } from "react";

const ImageConverter = () => {
  const [image, setImage] = useState(null);
  const [convertedImage, setConvertedImage] = useState(null);
  const [format, setFormat] = useState("png");
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

  const handleConvert = () => {
    if (!image) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setConvertedImage(canvas.toDataURL(`image/${format}`));
    };
  };

  const handleDownload = () => {
    if (!convertedImage) return;

    const link = document.createElement("a");
    link.href = convertedImage;
    link.download = `converted-image.${format}`;
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

      {/* Format selection */}
      <select
        className="w-full p-2 border rounded-lg mb-3"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      >
        <option value="png">Convert to PNG</option>
        <option value="jpg">Convert to JPG</option>
        <option value="webp">Convert to WebP</option>
      </select>

      {/* Convert & Download Buttons */}
      <button
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mb-2"
        onClick={handleConvert}
      >
        Convert Image
      </button>

      {convertedImage && (
        <button
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          onClick={handleDownload}
        >
          Download Image
        </button>
      )}

      {/* Hidden Canvas for conversion */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageConverter;
