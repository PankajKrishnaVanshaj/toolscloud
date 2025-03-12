"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaArrowsAlt, FaUndo } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ImageOverlayTool = () => {
  const [baseImage, setBaseImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
  const [overlaySize, setOverlaySize] = useState(100);
  const [opacity, setOpacity] = useState(1);
  const [blendMode, setBlendMode] = useState("normal");
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputBaseRef = useRef(null);
  const fileInputOverlayRef = useRef(null);

  // Handle image uploads
  const handleImageUpload = useCallback((e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setOverlayPosition({ x: 0, y: 0 }); // Reset position on new upload
      setOverlaySize(100); // Reset size
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, []);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const currentState = { overlayPosition, overlaySize, opacity, rotation };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Limit to 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [overlayPosition, overlaySize, opacity, rotation, historyIndex]);

  // Dragging functionality
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left - overlaySize / 2, rect.width - overlaySize));
      const y = Math.max(0, Math.min(e.clientY - rect.top - overlaySize / 2, rect.height - overlaySize));
      setOverlayPosition({ x, y });
    },
    [isDragging, overlaySize]
  );

  const handleMouseUp = () => {
    if (isDragging) saveToHistory();
    setIsDragging(false);
  };

  // Undo and Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setOverlayPosition(prevState.overlayPosition);
      setOverlaySize(prevState.overlaySize);
      setOpacity(prevState.opacity);
      setRotation(prevState.rotation);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setOverlayPosition(nextState.overlayPosition);
      setOverlaySize(nextState.overlaySize);
      setOpacity(nextState.opacity);
      setRotation(nextState.rotation);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  // Export image
  const exportImage = useCallback(() => {
    if (!baseImage || !overlayImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const baseImg = new Image();
    baseImg.crossOrigin = "anonymous";
    baseImg.onload = () => {
      canvas.width = baseImg.width;
      canvas.height = baseImg.height;
      ctx.drawImage(baseImg, 0, 0);

      const overlayImg = new Image();
      overlayImg.crossOrigin = "anonymous";
      overlayImg.onload = () => {
        ctx.globalAlpha = opacity;
        ctx.globalCompositeOperation = blendMode;

        const scale = overlaySize / 100;
        const overlayWidth = overlayImg.width * scale;
        const overlayHeight = overlayImg.height * scale;

        ctx.translate(overlayPosition.x + overlayWidth / 2, overlayPosition.y + overlayHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
          overlayImg,
          -overlayWidth / 2,
          -overlayHeight / 2,
          overlayWidth,
          overlayHeight
        );

        const link = document.createElement("a");
        link.download = `overlay-result-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      overlayImg.src = overlayImage;
    };
    baseImg.src = baseImage;
  }, [baseImage, overlayImage, overlayPosition, overlaySize, opacity, blendMode, rotation]);

  // Reset all settings
  const reset = () => {
    setBaseImage(null);
    setOverlayImage(null);
    setOverlayPosition({ x: 0, y: 0 });
    setOverlaySize(100);
    setOpacity(1);
    setBlendMode("normal");
    setRotation(0);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputBaseRef.current) fileInputBaseRef.current.value = "";
    if (fileInputOverlayRef.current) fileInputOverlayRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Image Overlay Tool
        </h1>

        {/* Upload Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Image</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputBaseRef}
              onChange={(e) => handleImageUpload(e, setBaseImage)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Overlay Image</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputOverlayRef}
              onChange={(e) => handleImageUpload(e, setOverlayImage)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {baseImage && (
          <div className="space-y-6">
            {/* Preview */}
            <div
              ref={containerRef}
              className="relative max-w-full mx-auto max-h-[70vh] overflow-hidden rounded-lg shadow-md"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={baseImage}
                alt="Base"
                className="max-w-full h-auto"
              />
              {overlayImage && (
                <img
                  src={overlayImage}
                  alt="Overlay"
                  className="absolute top-0 left-0 cursor-move transition-transform"
                  style={{
                    transform: `translate(${overlayPosition.x}px, ${overlayPosition.y}px) rotate(${rotation}deg)`,
                    width: `${overlaySize}%`,
                    opacity,
                    mixBlendMode: blendMode,
                  }}
                  onMouseDown={handleMouseDown}
                />
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size ({overlaySize}%)
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={overlaySize}
                  onChange={(e) => {
                    saveToHistory();
                    setOverlaySize(parseInt(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opacity ({opacity})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={(e) => {
                    saveToHistory();
                    setOpacity(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rotation ({rotation}°)
                </label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => {
                    saveToHistory();
                    setRotation(parseInt(e.target.value));
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blend Mode</label>
                <select
                  value={blendMode}
                  onChange={(e) => {
                    saveToHistory();
                    setBlendMode(e.target.value);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="soft-light">Soft Light</option>
                  <option value="hard-light">Hard Light</option>
                  <option value="difference">Difference</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUndo className="mr-2" /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaArrowsAlt className="mr-2" /> Redo
              </button>
              <button
                onClick={exportImage}
                disabled={!baseImage || !overlayImage}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Export
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              Drag the overlay to position it, adjust size, opacity, rotation, and blend mode
            </p>
          </div>
        )}

        {!baseImage && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload a base image to start</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Drag and position overlay image</li>
            <li>Adjust size, opacity, rotation, and blend mode</li>
            <li>Undo/redo functionality with history</li>
            <li>Export as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Real-time preview</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImageOverlayTool;