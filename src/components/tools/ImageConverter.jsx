"use client";
import { useState, useRef, useEffect } from "react";

const ImageConverter = () => {
  const [image, setImage] = useState(null); // Original uploaded image
  const [convertedImage, setConvertedImage] = useState(null); // Converted image preview
  const [format, setFormat] = useState("png"); // Conversion format
  const [quality, setQuality] = useState(0.8); // Default image quality
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [convertedSize, setConvertedSize] = useState(0);
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());
  const fileInputRef = useRef(null);

  // Supported formats with MIME types
  const supportedFormats = {
    png: "image/png",
    jpg: "image/jpeg",
    webp: "image/webp",
    bmp: "image/bmp",
    gif: "image/gif",
    tiff: "image/tiff",
    ico: "image/x-icon",
  };

  // Handle image upload
  const handleImageUpload = (file) => {
    if (!file) return;

    setIsLoading(true);
    setError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setOriginalSize(file.size);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Error reading image file");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    handleImageUpload(e.target.files[0]);
    e.target.value = ""; // Reset input
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    } else {
      setError("Please drop a valid image file");
    }
  };

  // Convert image
  useEffect(() => {
    if (!image) return;

    const img = imgRef.current;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const mimeType = supportedFormats[format] || "image/png";
      try {
        const convertedDataUrl = canvas.toDataURL(mimeType, quality);
        setConvertedImage(convertedDataUrl);
        
        // Calculate converted size
        fetch(convertedDataUrl)
          .then(res => res.blob())
          .then(blob => setConvertedSize(blob.size));
      } catch (err) {
        setError(`Conversion to ${format.toUpperCase()} failed: ${err.message}`);
        setConvertedImage(null);
      }
    };
    img.onerror = () => {
      setError("Error loading image for conversion");
      setConvertedImage(null);
    };
    img.src = image;
  }, [image, format, quality]);

  // Handle image download
  const handleDownload = () => {
    if (!convertedImage) return;

    const link = document.createElement("a");
    link.href = convertedImage;
    link.download = `converted-image.${format}`;
    link.click();
  };

  // Clear all
  const clearAll = () => {
    setImage(null);
    setConvertedImage(null);
    setError("");
    setOriginalSize(0);
    setConvertedSize(0);
  };

  return (
    <div className="mx-auto p-5 bg-white shadow-lg rounded-2xl">
      {/* Error Display */}
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* File Upload */}
      <div
        className={`mb-3 border-2 rounded-lg p-2 ${
          isDragging ? "border-dashed border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="w-full p-2 border rounded-lg disabled:opacity-50"
          onChange={handleFileInputChange}
          disabled={isLoading}
        />
        <p className="text-sm text-gray-600 mt-1">
          Drag and drop an image here or click to upload
        </p>
      </div>

      {/* Converted Image Preview */}
      {convertedImage && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold mb-2">
            Converted Image Preview:
          </h3>
          <img
            src={convertedImage}
            alt="Converted"
            className="w-full max-h-60 object-contain rounded-lg border"
          />
          <p className="text-sm text-gray-600 mt-1">
            Original Size: {(originalSize / 1024).toFixed(2)} KB | 
            Converted Size: {(convertedSize / 1024).toFixed(2)} KB
            {convertedSize < originalSize && (
              <> (Reduced by {((1 - convertedSize / originalSize) * 100).toFixed(2)}%)</>
            )}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* Format Selection */}
        <select
          className="flex-1 sm:w-1/3 p-2 border rounded-lg disabled:opacity-50"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          disabled={isLoading || !image}
        >
          <option value="png">Convert to PNG</option>
          <option value="jpg">Convert to JPG</option>
          <option value="webp">Convert to WebP</option>
          <option value="bmp">Convert to BMP</option>
          <option value="gif">Convert to GIF</option>
          <option value="tiff">Convert to TIFF</option>
          <option value="ico">Convert to ICO</option>
        </select>

        {/* Quality Adjustment */}
        {(format === "jpg" || format === "webp") && (
          <div className="w-full sm:w-1/3">
            <label className="block mb-1 text-sm text-gray-700">
              Quality ({Math.round(quality * 100)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full disabled:opacity-50"
              disabled={isLoading || !image}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex-1 sm:w-1/3 flex gap-2">
          {convertedImage && (
            <button
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg disabled:opacity-50"
              onClick={handleDownload}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Download"}
            </button>
          )}
          <button
            className="flex-1 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text border hover:border-secondary p-2 rounded-lg disabled:opacity-50"
            onClick={clearAll}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden"></canvas>

      {/* Notes */}
      {!image && (
        <div className="mt-3 text-sm text-gray-600">
          <p>Supported formats: PNG, JPG, WebP, BMP, GIF, TIFF*, ICO*</p>
          <p className="text-xs">*Note: TIFF and ICO support may vary by browser</p>
        </div>
      )}
    </div>
  );
};

export default ImageConverter;