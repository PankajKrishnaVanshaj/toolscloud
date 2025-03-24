"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaRedo, FaUndo } from "react-icons/fa";
import EXIF from "exif-js";

const ImageOrientationFixer = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload and auto-detect orientation
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      const url = URL.createObjectURL(file);
      setImage(file);

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
        setFlipHorizontal(false);
        setFlipVertical(false);
        setHistory([]);
        setHistoryIndex(-1);
        processImage(file, initialRotation, false, false, url);
      });
    }
  }, []);

  // Process image with rotation and flip
  const processImage = useCallback((file, rot, flipH, flipV, initialUrl) => {
    if (!canvasRef.current) {
      setIsProcessing(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set canvas size based on rotation
      const width = rot === 90 || rot === -90 ? img.height : img.width;
      const height = rot === 90 || rot === -90 ? img.width : img.height;
      canvas.width = width;
      canvas.height = height;

      // Apply transformations
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rot * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const newUrl = canvas.toDataURL("image/jpeg");
      setPreviewUrl(newUrl);
      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };

    img.src = initialUrl || URL.createObjectURL(file);
  }, []);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = { rotation, flipHorizontal, flipVertical };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [rotation, flipHorizontal, flipVertical, historyIndex]);

  // Manual rotation handlers
  const rotateClockwise = () => {
    if (!image || isProcessing) return;
    saveToHistory();
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    setIsProcessing(true);
    processImage(image, newRotation, flipHorizontal, flipVertical);
  };

  const rotateCounterClockwise = () => {
    if (!image || isProcessing) return;
    saveToHistory();
    const newRotation = (rotation - 90 + 360) % 360;
    setRotation(newRotation);
    setIsProcessing(true);
    processImage(image, newRotation, flipHorizontal, flipVertical);
  };

  // Flip handlers
  const flipImageHorizontal = () => {
    if (!image || isProcessing) return;
    saveToHistory();
    setFlipHorizontal((prev) => !prev);
    setIsProcessing(true);
    processImage(image, rotation, !flipHorizontal, flipVertical);
  };

  const flipImageVertical = () => {
    if (!image || isProcessing) return;
    saveToHistory();
    setFlipVertical((prev) => !prev);
    setIsProcessing(true);
    processImage(image, rotation, flipHorizontal, !flipVertical);
  };

  // Undo and Redo
  const handleUndo = () => {
    if (historyIndex <= 0 || isProcessing) return;
    const prevState = history[historyIndex - 1];
    setRotation(prevState.rotation);
    setFlipHorizontal(prevState.flipHorizontal);
    setFlipVertical(prevState.flipVertical);
    setHistoryIndex((prev) => prev - 1);
    setIsProcessing(true);
    processImage(image, prevState.rotation, prevState.flipHorizontal, prevState.flipVertical);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1 || isProcessing) return;
    const nextState = history[historyIndex + 1];
    setRotation(nextState.rotation);
    setFlipHorizontal(nextState.flipHorizontal);
    setFlipVertical(nextState.flipVertical);
    setHistoryIndex((prev) => prev + 1);
    setIsProcessing(true);
    processImage(image, nextState.rotation, nextState.flipHorizontal, nextState.flipVertical);
  };

  // Download corrected image
  const downloadImage = () => {
    if (!canvasRef.current || isProcessing) return;
    const link = document.createElement("a");
    link.download = `orientation-fixed-${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL("image/jpeg");
    link.click();
  };

  // Reset all settings
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setHistory([]);
    setHistoryIndex(-1);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Orientation Fixer
        </h1>

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
                className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain select-none"
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={rotateCounterClockwise}
                disabled={isProcessing}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaUndo /> Rotate Left
              </button>
              <button
                onClick={rotateClockwise}
                disabled={isProcessing}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Rotate Right <FaRedo />
              </button>
              <button
                onClick={flipImageHorizontal}
                disabled={isProcessing}
                className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Flip Horizontal
              </button>
              <button
                onClick={flipImageVertical}
                disabled={isProcessing}
                className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Flip Vertical
              </button>
            </div>

            {/* Undo/Redo and Download */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0 || isProcessing}
                className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaUndo /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1 || isProcessing}
                className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                Redo <FaRedo />
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing}
                className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaDownload /> Download
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <FaSync /> Reset
              </button>
            </div>

            {/* Status */}
            <div className="text-center text-sm text-gray-600">
              <p>Rotation: {rotation}°</p>
              <p>Flip: {flipHorizontal ? "Horizontal" : "None"}{flipVertical ? " Vertical" : ""}</p>
              {history.length > 0 && (
                <p>History: {historyIndex + 1} / {history.length}</p>
              )}
            </div>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to fix its orientation</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Auto-detect orientation using EXIF data</li>
            <li>Manual rotation (90° steps)</li>
            <li>Horizontal and vertical flipping</li>
            <li>Undo/redo functionality with history</li>
            <li>Download corrected image as JPEG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageOrientationFixer;