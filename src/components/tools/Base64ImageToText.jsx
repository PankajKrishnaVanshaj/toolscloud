"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaCopy, FaSync, FaUpload, FaTrash } from "react-icons/fa";

const Base64ImageToText = () => {
  const [base64String, setBase64String] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [imageFormat, setImageFormat] = useState("png"); // New: choose output format
  const [compression, setCompression] = useState(0.8); // New: compression level
  const fileInputRef = useRef(null);

  // Validate Base64 string
  const validateBase64 = (str) => {
    const base64Regex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+$/;
    return base64Regex.test(str);
  };

  // Handle Base64 input
  const handleBase64Input = useCallback((value) => {
    setBase64String(value);
    setError("");
    setImageSrc("");
    setFileName("");

    if (value.trim() === "") return;

    if (validateBase64(value)) {
      setImageSrc(value);
      const typeMatch = value.match(/^data:image\/([a-zA-Z]+);base64,/);
      const type = typeMatch ? typeMatch[1] : "png";
      setImageFormat(type);
      setFileName(`decoded_image_${Date.now()}.${type}`);
    } else {
      setError('Invalid Base64 image string. Must start with "data:image/[type];base64,"');
    }
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setError("");
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setBase64String(base64);
      setImageSrc(base64);
      setImageFormat(file.type.split("/")[1]);
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsDataURL(file);
  }, []);

  // Download image with compression
  const downloadImage = useCallback(() => {
    if (!imageSrc) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const mimeType = `image/${imageFormat}`;
      const dataUrl = canvas.toDataURL(mimeType, compression);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName || `image_${Date.now()}.${imageFormat}`;
      link.click();
    };
  }, [imageSrc, fileName, imageFormat, compression]);

  // Copy Base64 to clipboard
  const copyToClipboard = () => {
    if (!base64String) return;
    navigator.clipboard
      .writeText(base64String)
      .then(() => alert("Base64 string copied to clipboard"))
      .catch(() => setError("Failed to copy to clipboard"));
  };

  // Clear all fields
  const clearAll = () => {
    setBase64String("");
    setImageSrc("");
    setError("");
    setFileName("");
    setImageFormat("png");
    setCompression(0.8);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Base64 Image Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base64 String
              </label>
              <textarea
                value={base64String}
                onChange={(e) => handleBase64Input(e.target.value)}
                placeholder="Paste Base64 string (e.g., data:image/png;base64,...)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compression ({compression.toFixed(1)})
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={compression}
                onChange={(e) => setCompression(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={copyToClipboard}
              disabled={!base64String}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy Base64
            </button>
            <button
              onClick={downloadImage}
              disabled={!imageSrc}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Image
            </button>
            <button
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear
            </button>
          </div>

          {/* Preview Section */}
          {imageSrc && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Image Preview</h2>
              <div className="flex justify-center">
                <img
                  src={imageSrc}
                  alt="Decoded Image"
                  className="max-w-full max-h-96 object-contain rounded-md shadow-md transition-transform hover:scale-105"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Filename: {fileName} | Size: {(base64String.length / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert Base64 to images and vice versa</li>
            <li>Upload images to generate Base64 strings</li>
            <li>Choose output format: PNG, JPEG, WebP</li>
            <li>Adjust compression level for downloads</li>
            <li>Preview images with hover zoom effect</li>
            <li>Copy Base64 to clipboard</li>
            <li>Download with custom filename</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Base64ImageToText;