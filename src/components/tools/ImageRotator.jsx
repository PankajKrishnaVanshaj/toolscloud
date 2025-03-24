// components/ImageRotator.jsx
"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaRedo, FaUndo } from "react-icons/fa";

const ImageRotator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setRotation(0);
      setFlipHorizontal(false);
      setFlipVertical(false);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = { rotation, flipHorizontal, flipVertical, previewUrl };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [rotation, flipHorizontal, flipVertical, previewUrl, historyIndex]);

  // Apply transformations
  const applyTransformations = useCallback(() => {
    if (!image || !canvasRef.current || (rotation === 0 && !flipHorizontal && !flipVertical)) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = previewUrl;

    img.onload = () => {
      // Calculate new dimensions for rotation
      const angleInRad = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(angleInRad));
      const sin = Math.abs(Math.sin(angleInRad));
      const newWidth = img.width * cos + img.height * sin;
      const newHeight = img.width * sin + img.height * cos;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Center and apply transformations
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(angleInRad);
      ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const newUrl = canvas.toDataURL("image/png");
      setPreviewUrl(newUrl);
      saveToHistory();
      setIsProcessing(false);
    };
  }, [image, previewUrl, rotation, flipHorizontal, flipVertical, saveToHistory]);

  // Reset to original image
  const resetImage = () => {
    if (image) {
      setPreviewUrl(URL.createObjectURL(image));
      setRotation(0);
      setFlipHorizontal(false);
      setFlipVertical(false);
      setHistory([]);
      setHistoryIndex(-1);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Undo last transformation
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setRotation(prevState.rotation);
      setFlipHorizontal(prevState.flipHorizontal);
      setFlipVertical(prevState.flipVertical);
      setPreviewUrl(prevState.previewUrl);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  // Redo transformation
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setRotation(nextState.rotation);
      setFlipHorizontal(nextState.flipHorizontal);
      setFlipVertical(nextState.flipVertical);
      setPreviewUrl(nextState.previewUrl);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  // Download rotated image
  const downloadImage = () => {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.download = `transformed-image-${Date.now()}.png`;
    link.href = previewUrl;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Image Rotator</h1>

        {/* Upload Section */}
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {previewUrl && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="relative flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rotation Angle ({rotation}°)
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between mt-1 text-sm text-gray-500">
                  <span>-180°</span>
                  <span>0°</span>
                  <span>180°</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flipHorizontal}
                    onChange={(e) => setFlipHorizontal(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Flip Horizontal</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={flipVertical}
                    onChange={(e) => setFlipVertical(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Flip Vertical</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={applyTransformations}
                disabled={isProcessing || (rotation === 0 && !flipHorizontal && !flipVertical)}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? "Processing..." : "Apply Transformations"}
              </button>
              <button
                onClick={undo}
                disabled={historyIndex <= 0 || isProcessing}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUndo className="mr-2" /> Undo
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1 || isProcessing}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaRedo className="mr-2" /> Redo
              </button>
              <button
                onClick={resetImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Transformation History</h3>
                <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {history.slice().reverse().map((state, index) => (
                    <li
                      key={index}
                      className={index === history.length - 1 - historyIndex ? "font-bold" : ""}
                    >
                      {`Rotation: ${state.rotation}°, Flip H: ${state.flipHorizontal}, Flip V: ${state.flipVertical}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start rotating</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Rotate images from -180° to 180°</li>
            <li>Flip horizontally and vertically</li>
            <li>Undo/redo functionality with history</li>
            <li>Real-time preview</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageRotator;