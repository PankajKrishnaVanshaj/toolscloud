"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaUndo, FaRedo } from "react-icons/fa";

const ImageFilterApplicator = () => {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [filter, setFilter] = useState("none");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = { filter, brightness, contrast, saturation, blur, hue };
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [filter, brightness, contrast, saturation, blur, hue, historyIndex]);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setPreviewUrl(url);
      resetFilters();
    }
  }, []);

  // Reset filter settings
  const resetFilters = () => {
    setFilter("none");
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setHue(0);
    setHistory([]);
    setHistoryIndex(-1);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (image) setPreviewUrl(URL.createObjectURL(image));
  };

  // Apply filter to canvas
  const applyFilter = useCallback(() => {
    if (!image || !canvasRef.current) return;

    saveToHistory();
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply CSS-like filters
      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        blur(${blur}px)
        hue-rotate(${hue}deg)
      `;
      ctx.drawImage(img, 0, 0);

      // Apply special filters
      if (filter !== "none") {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        switch (filter) {
          case "grayscale":
            for (let i = 0; i < data.length; i += 4) {
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              data[i] = avg;
              data[i + 1] = avg;
              data[i + 2] = avg;
            }
            break;
          case "sepia":
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
              data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
              data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            }
            break;
          case "invert":
            for (let i = 0; i < data.length; i += 4) {
              data[i] = 255 - data[i];
              data[i + 1] = 255 - data[i + 1];
              data[i + 2] = 255 - data[i + 2];
            }
            break;
          case "posterize":
            const levels = 4;
            for (let i = 0; i < data.length; i += 4) {
              data[i] = Math.floor(data[i] / (255 / levels)) * (255 / levels);
              data[i + 1] = Math.floor(data[i + 1] / (255 / levels)) * (255 / levels);
              data[i + 2] = Math.floor(data[i + 2] / (255 / levels)) * (255 / levels);
            }
            break;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      setPreviewUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };

    img.src = previewUrl;
  }, [image, previewUrl, filter, brightness, contrast, saturation, blur, hue, saveToHistory]);

  // Undo action
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const prevState = history[historyIndex - 1];
    setFilter(prevState.filter);
    setBrightness(prevState.brightness);
    setContrast(prevState.contrast);
    setSaturation(prevState.saturation);
    setBlur(prevState.blur);
    setHue(prevState.hue);
    setHistoryIndex((prev) => prev - 1);
    applyFilter(); // Reapply with previous state
  };

  // Redo action
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextState = history[historyIndex + 1];
    setFilter(nextState.filter);
    setBrightness(nextState.brightness);
    setContrast(nextState.contrast);
    setSaturation(nextState.saturation);
    setBlur(nextState.blur);
    setHue(nextState.hue);
    setHistoryIndex((prev) => prev + 1);
    applyFilter(); // Reapply with next state
  };

  // Download processed image
  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `filtered-image-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-800">
          Image Filter Applicator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-1">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {image && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter Type
                    </label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="grayscale">Grayscale</option>
                      <option value="sepia">Sepia</option>
                      <option value="invert">Invert</option>
                      <option value="posterize">Posterize</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brightness ({brightness}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contrast ({contrast}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Saturation ({saturation}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blur ({blur}px)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={blur}
                      onChange={(e) => setBlur(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hue Rotate ({hue}°)
                    </label>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={hue}
                      onChange={(e) => setHue(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <button
                      onClick={applyFilter}
                      disabled={isProcessing}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Apply Filters"
                      )}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0 || isProcessing}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaUndo className="mr-2" /> Undo
                      </button>
                      <button
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1 || isProcessing}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <FaRedo className="mr-2" /> Redo
                      </button>
                    </div>
                    <button
                      onClick={resetFilters}
                      disabled={isProcessing}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaSync className="mr-2" /> Reset
                    </button>
                    <button
                      onClick={downloadImage}
                      disabled={isProcessing}
                      className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaDownload className="mr-2" /> Download
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          {previewUrl ? (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6 relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-auto rounded-md mx-auto max-h-[70vh] object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          ) : (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
                <p className="text-gray-500 italic">Upload an image to start applying filters</p>
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        {image && (
          <div className="mt-6 max-w-6xl mx-auto p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Multiple filter options: Grayscale, Sepia, Invert, Posterize</li>
              <li>Adjustable brightness, contrast, saturation, blur, and hue</li>
              <li>Undo/redo functionality with history</li>
              <li>Real-time processing with canvas</li>
              <li>Download as PNG</li>
              <li>Responsive design with Tailwind CSS</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageFilterApplicator;