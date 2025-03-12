"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaRedo } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageDistortionTool = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [distortionType, setDistortionType] = useState("wave");
  const [strength, setStrength] = useState(20);
  const [frequency, setFrequency] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [direction, setDirection] = useState("both"); // New: direction for wave
  const [history, setHistory] = useState([]); // New: history for undo/redo
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
      setHistory([url]);
      setHistoryIndex(0);
    }
  }, []);

  // Save to history
  const saveToHistory = (url) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(url);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  };

  // Apply distortion effect
  const applyDistortion = useCallback(() => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      const outputData = new Uint8ClampedArray(data.length);

      for (let i = 0; i < data.length; i++) {
        outputData[i] = data[i];
      }

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let newX = x;
          let newY = y;

          switch (distortionType) {
            case "wave":
              if (direction === "horizontal" || direction === "both") {
                newX = x + Math.sin(y / frequency) * strength;
              }
              if (direction === "vertical" || direction === "both") {
                newY = y + Math.cos(x / frequency) * strength;
              }
              break;
            case "pinch":
              const pinchCenterX = width / 2;
              const pinchCenterY = height / 2;
              const dx = x - pinchCenterX;
              const dy = y - pinchCenterY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);
              const pinchAmount = Math.exp(-distance / (strength * 10)) * frequency;
              newX = pinchCenterX + Math.cos(angle) * (distance - pinchAmount);
              newY = pinchCenterY + Math.sin(angle) * (distance - pinchAmount);
              break;
            case "bulge":
              const bulgeCenterX = width / 2;
              const bulgeCenterY = height / 2;
              const bdx = x - bulgeCenterX;
              const bdy = y - bulgeCenterY;
              const bulgeDistance = Math.sqrt(bdx * bdx + bdy * bdy);
              const bulgeAngle = Math.atan2(bdy, bdx);
              const bulgeAmount = (bulgeDistance / (strength * 10)) * frequency;
              newX = bulgeCenterX + Math.cos(bulgeAngle) * (bulgeDistance + bulgeAmount);
              newY = bulgeCenterY + Math.sin(bulgeAngle) * (bulgeDistance + bulgeAmount);
              break;
            case "twirl":
              const twirlCenterX = width / 2;
              const twirlCenterY = height / 2;
              const tdx = x - twirlCenterX;
              const tdy = y - twirlCenterY;
              const twirlDistance = Math.sqrt(tdx * tdx + tdy * tdy);
              const twirlAngle = Math.atan2(tdy, tdx) + (strength / 100) * Math.exp(-twirlDistance / (frequency * 10));
              newX = twirlCenterX + Math.cos(twirlAngle) * twirlDistance;
              newY = twirlCenterY + Math.sin(twirlAngle) * twirlDistance;
              break;
            case "ripple":
              const rippleCenterX = width / 2;
              const rippleCenterY = height / 2;
              const rdx = x - rippleCenterX;
              const rdy = y - rippleCenterY;
              const rippleDistance = Math.sqrt(rdx * rdx + rdy * rdy);
              const rippleOffset = Math.sin(rippleDistance / frequency) * strength;
              const rippleAngle = Math.atan2(rdy, rdx);
              newX = rippleCenterX + Math.cos(rippleAngle) * (rippleDistance + rippleOffset);
              newY = rippleCenterY + Math.sin(rippleAngle) * (rippleDistance + rippleOffset);
              break;
          }

          newX = Math.max(0, Math.min(width - 1, Math.floor(newX)));
          newY = Math.max(0, Math.min(height - 1, Math.floor(newY)));

          const srcIndex = (y * width + x) * 4;
          const dstIndex = (newY * width + newX) * 4;
          outputData[srcIndex] = data[dstIndex];
          outputData[srcIndex + 1] = data[dstIndex + 1];
          outputData[srcIndex + 2] = data[dstIndex + 2];
          outputData[srcIndex + 3] = data[dstIndex + 3];
        }
      }

      ctx.putImageData(new ImageData(outputData, width, height), 0, 0);
      const newUrl = canvas.toDataURL("image/png");
      setPreviewUrl(newUrl);
      saveToHistory(newUrl);
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, distortionType, strength, frequency, direction, historyIndex]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `distorted-${distortionType}-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setPreviewUrl(history[historyIndex - 1]);
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setPreviewUrl(history[historyIndex + 1]);
    }
  };

  // Reset to original
  const reset = () => {
    if (image) {
      const url = URL.createObjectURL(image);
      setPreviewUrl(url);
      setHistory([url]);
      setHistoryIndex(0);
      setDistortionType("wave");
      setStrength(20);
      setFrequency(10);
      setDirection("both");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Distortion Tool
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
            {/* Preview */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Distortion Type</label>
                <select
                  value={distortionType}
                  onChange={(e) => setDistortionType(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="wave">Wave</option>
                  <option value="pinch">Pinch</option>
                  <option value="bulge">Bulge</option>
                  <option value="twirl">Twirl</option>
                  <option value="ripple">Ripple</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strength ({strength})</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={strength}
                  onChange={(e) => setStrength(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency ({frequency})</label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={frequency}
                  onChange={(e) => setFrequency(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={distortionType !== "wave"}
                >
                  <option value="both">Both</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={applyDistortion}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? "Processing..." : "Apply"}
              </button>
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0 || isProcessing}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUndo className="mr-2" /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1 || isProcessing}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaRedo className="mr-2" /> Redo
              </button>
              <button
                onClick={reset}
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
            {history.length > 1 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">History</h3>
                <p className="text-sm text-gray-600">Steps: {historyIndex + 1} / {history.length}</p>
              </div>
            )}
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start distorting</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Multiple distortion effects: Wave, Pinch, Bulge, Twirl, Ripple</li>
            <li>Adjustable strength and frequency</li>
            <li>Wave direction control (horizontal, vertical, both)</li>
            <li>Undo/redo functionality with history</li>
            <li>Download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageDistortionTool;