// components/ImageOrientationFixer.jsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import EXIF from "exif-js";

const ImageOrientationFixer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Handle image upload and auto-detect orientation
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      const url = URL.createObjectURL(file);
      setImage(file);

      // Check EXIF orientation
      EXIF.getData(file, function () {
        const orientation = EXIF.getTag(this, "Orientation");
        let initialRotation = 0;

        switch (orientation) {
          case 3: // 180°
            initialRotation = 180;
            break;
          case 6: // 90° clockwise
            initialRotation = 90;
            break;
          case 8: // 90° counterclockwise
            initialRotation = -90;
            break;
          default:
            initialRotation = 0;
        }

        setRotation(initialRotation);
        processImage(file, initialRotation, url);
      });
    }
  };

  // Process image with given rotation
  const processImage = (file, rot, initialUrl) => {
    if (!canvasRef.current) {
      setIsProcessing(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    const img = new Image();

    img.onload = () => {
      // Set canvas size based on rotation
      if (rot === 90 || rot === -90) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Apply rotation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      setPreviewUrl(canvas.toDataURL("image/jpeg"));
      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };

    img.src = initialUrl || URL.createObjectURL(file);
  };

  // Manual rotation handlers
  const rotateClockwise = () => {
    if (!image) return;
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    setIsProcessing(true);
    processImage(image, newRotation);
  };

  const rotateCounterClockwise = () => {
    if (!image) return;
    const newRotation = (rotation - 90 + 360) % 360;
    setRotation(newRotation);
    setIsProcessing(true);
    processImage(image, newRotation);
  };

  // Download corrected image
  const downloadImage = () => {
    if (!canvasRef.current || isProcessing) return;
    const link = document.createElement("a");
    link.download = "orientation-fixed.jpg";
    link.href = canvasRef.current.toDataURL("image/jpeg");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Image Orientation Fixer
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preview and Controls */}
          {previewUrl && (
            <div className="space-y-6">
              <div className="relative max-w-full mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md select-none"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={rotateCounterClockwise}
                  disabled={isProcessing}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  <span>↺</span> Rotate Left
                </button>
                <button
                  onClick={rotateClockwise}
                  disabled={isProcessing}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  Rotate Right <span>↻</span>
                </button>
                <button
                  onClick={downloadImage}
                  disabled={isProcessing}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                  Download Corrected Image
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Current Rotation: {rotation}°
                {isProcessing && " (Processing...)"}
              </p>
            </div>
          )}

          {!previewUrl && (
            <p className="text-center text-gray-500">
              Upload an image to fix its orientation
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageOrientationFixer;