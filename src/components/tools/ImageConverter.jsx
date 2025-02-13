"use client";

import { useState, useRef, useEffect } from "react";

const ImageConverter = () => {
  const [image, setImage] = useState(null); // Original uploaded image
  const [convertedImage, setConvertedImage] = useState(null); // Converted image preview
  const [format, setFormat] = useState("png"); // Conversion format
  const [quality, setQuality] = useState(0.8); // Default image quality
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image()); // To manage the uploaded image

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result); // Set uploaded image
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert the image to the selected format and quality
  useEffect(() => {
    if (!image) return;

    const img = imgRef.current;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the uploaded image onto the canvas
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Set the MIME type for conversion
      const mimeType =
        format === "jpg"
          ? "image/jpeg"
          : format === "webp"
          ? "image/webp"
          : format === "bmp"
          ? "image/bmp"
          : format === "gif"
          ? "image/gif"
          : "image/png";

      // Convert the image and update the preview
      setConvertedImage(canvas.toDataURL(mimeType, quality));
    };

    // Trigger the image load to ensure the conversion takes place
    img.src = image;
  }, [image, format, quality]); // Trigger conversion whenever any of these change

  // Handle image download
  const handleDownload = () => {
    if (!convertedImage) return;

    const link = document.createElement("a");
    link.href = convertedImage;
    link.download = `converted-image.${format}`;
    link.click();
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">
      {/* File Upload */}
      <input
        type="file"
        accept="image/*"
        className="mb-3 w-full p-2 border rounded-lg"
        onChange={handleImageUpload}
      />

      {/* Converted Image Preview */}
      {convertedImage && (
        <div>
          <h3 className="text-sm font-semibold mb-2">
            Converted Image Preview:
          </h3>
          <img
            src={convertedImage}
            alt="Converted"
            className="w-full max-h-60 object-contain rounded-lg border mb-3"
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Format Selection Dropdown */}
        <select
          className="flex-1 sm:w-1/3 p-2 border rounded-lg"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="png">Convert to PNG</option>
          <option value="jpg">Convert to JPG</option>
          <option value="webp">Convert to WebP</option>
          <option value="bmp">Convert to BMP</option>
          <option value="gif">Convert to GIF</option>
        </select>

        {/* Quality Adjustment Slider */}
        {(format === "jpg" || format === "webp") && (
          <div className="w-full sm:w-1/3">
            <label className="block mb-1 text-sm text-gray-700">
              Adjust Quality ({Math.round(quality * 100)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* Download Button */}
        {convertedImage && (
          <button
            className="flex-1 sm:w-1/3 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg"
            onClick={handleDownload}
          >
            Download Image
          </button>
        )}
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageConverter;
