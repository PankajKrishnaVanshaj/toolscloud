"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaCropAlt } from "react-icons/fa";

const ImageCropper = () => {
  const [image, setImage] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 150, height: 150 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null); // null, "se", "nw", "ne", "sw"
  const [aspectRatio, setAspectRatio] = useState(null); // null for freeform, or ratio like 1 for square
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  // Mouse/Touch Down handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeMouseDown = (corner) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(corner);
    startPosRef.current = { x: e.clientX, y: e.clientY };
  };

  // Mouse/Touch Move handler
  const handleMouseMove = useCallback(
    (e) => {
      if (!imgRef.current) return;

      const imgRect = imgRef.current.getBoundingClientRect();

      if (dragging) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;

        setCropArea((prev) => {
          const newX = Math.max(0, Math.min(prev.x + dx, imgRect.width - prev.width));
          const newY = Math.max(0, Math.min(prev.y + dy, imgRect.height - prev.height));
          return { ...prev, x: newX, y: newY };
        });

        startPosRef.current = { x: e.clientX, y: e.clientY };
      } else if (resizing) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;

        setCropArea((prev) => {
          let newX = prev.x;
          let newY = prev.y;
          let newWidth = prev.width;
          let newHeight = prev.height;

          if (resizing === "se") {
            newWidth = Math.max(50, Math.min(prev.width + dx, imgRect.width - prev.x));
            newHeight = aspectRatio ? newWidth / aspectRatio : Math.max(50, Math.min(prev.height + dy, imgRect.height - prev.y));
          } else if (resizing === "nw") {
            newWidth = Math.max(50, Math.min(prev.width - dx, prev.x + prev.width));
            newX = prev.x + (prev.width - newWidth);
            newHeight = aspectRatio ? newWidth / aspectRatio : Math.max(50, Math.min(prev.height - dy, prev.y + prev.height));
            newY = prev.y + (prev.height - newHeight);
          } else if (resizing === "ne") {
            newWidth = Math.max(50, Math.min(prev.width + dx, imgRect.width - prev.x));
            newHeight = aspectRatio ? newWidth / aspectRatio : Math.max(50, Math.min(prev.height - dy, prev.y + prev.height));
            newY = prev.y + (prev.height - newHeight);
          } else if (resizing === "sw") {
            newWidth = Math.max(50, Math.min(prev.width - dx, prev.x + prev.width));
            newX = prev.x + (prev.width - newWidth);
            newHeight = aspectRatio ? newWidth / aspectRatio : Math.max(50, Math.min(prev.height + dy, imgRect.height - prev.y));
          }

          return { x: Math.max(0, newX), y: Math.max(0, newY), width: newWidth, height: newHeight };
        });

        startPosRef.current = { x: e.clientX, y: e.clientY };
      }
    },
    [dragging, resizing, aspectRatio]
  );

  // Mouse/Touch Up handler
  const handleMouseUp = () => {
    setDragging(false);
    setResizing(null);
  };

  // Touch event handlers
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (dragging || resizing) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
      }
    };

    const handleTouchEnd = () => {
      setDragging(false);
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [dragging, resizing, handleMouseMove]);

  // Download cropped image
  const downloadCroppedImage = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;

    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayedWidth = img.getBoundingClientRect().width;
    const displayedHeight = img.getBoundingClientRect().height;

    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;

    const scaledX = cropArea.x * scaleX;
    const scaledY = cropArea.y * scaleY;
    const scaledWidth = cropArea.width * scaleX;
    const scaledHeight = cropArea.height * scaleY;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, scaledX, scaledY, scaledWidth, scaledHeight, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = `cropped-image-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [cropArea]);

  // Reset function
  const reset = () => {
    setImage(null);
    setCropArea({ x: 50, y: 50, width: 150, height: 150 });
    setAspectRatio(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Image Cropper</h2>

        {/* File Upload */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {image && (
          <div className="space-y-6">
            {/* Image with Crop Area */}
            <div ref={containerRef} className="relative flex justify-center">
              <img
                ref={imgRef}
                src={image}
                alt="Uploaded"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              />
              <div
                className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-20"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  cursor: "move",
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  startPosRef.current = { x: touch.clientX, y: touch.clientY };
                  setDragging(true);
                }}
              >
                {/* Resize Handles */}
                <div
                  className="absolute top-0 left-0 w-4 h-4 bg-blue-500 cursor-nw-resize"
                  onMouseDown={handleResizeMouseDown("nw")}
                  onTouchStart={handleResizeMouseDown("nw")}
                />
                <div
                  className="absolute top-0 right-0 w-4 h-4 bg-blue-500 cursor-ne-resize"
                  onMouseDown={handleResizeMouseDown("ne")}
                  onTouchStart={handleResizeMouseDown("ne")}
                />
                <div
                  className="absolute bottom-0 left-0 w-4 h-4 bg-blue-500 cursor-sw-resize"
                  onMouseDown={handleResizeMouseDown("sw")}
                  onTouchStart={handleResizeMouseDown("sw")}
                />
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
                  onMouseDown={handleResizeMouseDown("se")}
                  onTouchStart={handleResizeMouseDown("se")}
                />
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                <select
                  value={aspectRatio || "free"}
                  onChange={(e) => setAspectRatio(e.target.value === "free" ? null : parseFloat(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Freeform</option>
                  <option value="1">1:1 (Square)</option>
                  <option value="1.33">4:3</option>
                  <option value="0.75">3:4</option>
                  <option value="1.78">16:9</option>
                  <option value="0.56">9:16</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadCroppedImage}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>
        )}

        {!image && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start cropping</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Draggable and resizable crop area</li>
            <li>Multiple resize handles (all corners)</li>
            <li>Aspect ratio presets</li>
            <li>Touch support for mobile devices</li>
            <li>Download cropped image as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;