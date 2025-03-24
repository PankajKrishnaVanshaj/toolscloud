"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaTrash } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const AdvancedImageRedEyeRemover = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [eyeAreas, setEyeAreas] = useState([]);
  const [sensitivity, setSensitivity] = useState(150);
  const [replacementMode, setReplacementMode] = useState("natural"); // "natural" or "black"
  const [brushSize, setBrushSize] = useState(20); // For manual brush tool
  const [isSelecting, setIsSelecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tool, setTool] = useState("rectangle"); // "rectangle" or "brush"
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      setEyeAreas([]);
    }
  }, []);

  // Handle mouse events for rectangle selection
  const handleMouseDown = (e) => {
    if (!containerRef.current || tool !== "rectangle") return;
    const rect = containerRef.current.getBoundingClientRect();
    setIsSelecting(true);
    setEyeAreas([...eyeAreas, {
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
    }]);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === "rectangle" && isSelecting) {
      const newAreas = [...eyeAreas];
      newAreas[newAreas.length - 1] = {
        ...newAreas[newAreas.length - 1],
        endX: x,
        endY: y,
      };
      setEyeAreas(newAreas);
    } else if (tool === "brush" && isSelecting) {
      setEyeAreas([...eyeAreas, {
        startX: x - brushSize / 2,
        startY: y - brushSize / 2,
        endX: x + brushSize / 2,
        endY: y + brushSize / 2,
      }]);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Remove red-eye effect
  const removeRedEye = useCallback(() => {
    if (!image || !canvasRef.current || eyeAreas.length === 0) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      eyeAreas.forEach(area => {
        const minX = Math.min(area.startX, area.endX) * (canvas.width / containerRef.current.offsetWidth);
        const maxX = Math.max(area.startX, area.endX) * (canvas.width / containerRef.current.offsetWidth);
        const minY = Math.min(area.startY, area.endY) * (canvas.height / containerRef.current.offsetHeight);
        const maxY = Math.max(area.startY, area.endY) * (canvas.height / containerRef.current.offsetHeight);

        for (let y = Math.floor(minY); y < Math.ceil(maxY); y++) {
          for (let x = Math.floor(minX); x < Math.ceil(maxX); x++) {
            const i = (y * canvas.width + x) * 4;
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];

            if (red > sensitivity && green < red * 0.7 && blue < red * 0.7) {
              if (replacementMode === "natural") {
                const avg = (red + green + blue) / 3;
                data[i] = avg * 0.2;     // Darken red
                data[i + 1] = avg * 0.2; // Darken green
                data[i + 2] = avg * 0.3; // Slightly bluer tone
              } else {
                data[i] = 0;     // Black red
                data[i + 1] = 0; // Black green
                data[i + 2] = 0; // Black blue
              }
            }
          }
        }
      });

      ctx.putImageData(imageData, 0, 0);
      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, eyeAreas, sensitivity, replacementMode]);

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `redeye-removed-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Reset everything
  const reset = () => {
    setImage(null);
    setPreviewUrl(null);
    setEyeAreas([]);
    setSensitivity(150);
    setReplacementMode("natural");
    setBrushSize(20);
    setTool("rectangle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Red Eye Remover
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
            <div
              ref={containerRef}
              className="relative max-w-full mx-auto max-h-[70vh] overflow-auto"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-auto rounded-lg shadow-md select-none"
              />
              {eyeAreas.map((area, index) => (
                <div
                  key={index}
                  className={`absolute border-2 ${tool === "brush" ? "rounded-full" : "border-dashed"} border-red-500`}
                  style={{
                    left: Math.min(area.startX, area.endX),
                    top: Math.min(area.startY, area.endY),
                    width: Math.abs(area.endX - area.startX),
                    height: Math.abs(area.endY - area.startY),
                  }}
                />
              ))}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tool
                </label>
                <select
                  value={tool}
                  onChange={(e) => setTool(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rectangle">Rectangle Selection</option>
                  <option value="brush">Brush Tool</option>
                </select>
              </div>
              {tool === "brush" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brush Size ({brushSize}px)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Red Sensitivity ({sensitivity})
                </label>
                <input
                  type="range"
                  min="100"
                  max="255"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replacement Mode
                </label>
                <select
                  value={replacementMode}
                  onChange={(e) => setReplacementMode(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  <option value="natural">Natural Pupil</option>
                  <option value="black">Black Pupil</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={removeRedEye}
                disabled={isProcessing || eyeAreas.length === 0}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                ) : (
                  <FaUpload className="mr-2" />
                )}
                {isProcessing ? "Processing..." : "Remove Red Eye"}
              </button>
              <button
                onClick={() => setEyeAreas([])}
                disabled={isProcessing || eyeAreas.length === 0}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaTrash className="mr-2" /> Clear Selections
              </button>
              <button
                onClick={downloadImage}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
              <button
                onClick={reset}
                disabled={isProcessing}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              {tool === "rectangle" 
                ? "Click and drag to select eye areas" 
                : "Click and drag to brush over red-eye areas"}
            </p>
          </div>
        )}

        {!previewUrl && (
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
            <p className="text-gray-500 italic">Upload an image to start removing red-eye</p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Rectangle and brush selection tools</li>
            <li>Adjustable red sensitivity</li>
            <li>Two replacement modes: Natural or Black pupil</li>
            <li>Real-time preview and download as PNG</li>
            <li>Responsive design with Tailwind CSS</li>
            <li>Processing indicator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdvancedImageRedEyeRemover;