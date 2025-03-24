"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the result

const ColorVisionTestSimulator = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [visionType, setVisionType] = useState("normal");
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [contrast, setContrast] = useState(1.0); // Additional adjustment
  const [brightness, setBrightness] = useState(1.0); // Additional adjustment
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setProcessedImage(null);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Color vision deficiency simulation functions
  const simulateColorVision = (r, g, b, type) => {
    let simulated;
    switch (type) {
      case "protanopia": // Red deficiency
        simulated = {
          r: 0.567 * r + 0.433 * g,
          g: 0.558 * r + 0.442 * g,
          b: b,
        };
        break;
      case "deuteranopia": // Green deficiency
        simulated = {
          r: 0.625 * r + 0.375 * g,
          g: 0.7 * r + 0.3 * g,
          b: b,
        };
        break;
      case "tritanopia": // Blue deficiency
        simulated = {
          r: r,
          g: 0.95 * g + 0.05 * b,
          b: 0.433 * g + 0.567 * b,
        };
        break;
      case "monochromacy": // Complete color blindness
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        simulated = { r: gray, g: gray, b: gray };
        break;
      default: // Normal vision
        simulated = { r, g, b };
    }

    // Apply brightness and contrast adjustments
    const adjusted = {
      r: Math.min(255, Math.max(0, (simulated.r - 128) * contrast + 128 * brightness)),
      g: Math.min(255, Math.max(0, (simulated.g - 128) * contrast + 128 * brightness)),
      b: Math.min(255, Math.max(0, (simulated.b - 128) * contrast + 128 * brightness)),
    };

    return adjusted;
  };

  // Process image for color vision simulation
  const processImage = useCallback(() => {
    if (!imageSrc) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const simulated = simulateColorVision(r, g, b, visionType);

      data[i] = simulated.r;
      data[i + 1] = simulated.g;
      data[i + 2] = simulated.b;
    }

    ctx.putImageData(imageData, 0, 0);
    setProcessedImage(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }, [imageSrc, visionType, contrast, brightness]);

  // Download processed image
  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement("a");
      link.download = `color-vision-${visionType}-${Date.now()}.png`;
      link.href = processedImage;
      link.click();
    }
  };

  // Reset to initial state
  const reset = () => {
    setImageSrc(null);
    setProcessedImage(null);
    setVisionType("normal");
    setContrast(1.0);
    setBrightness(1.0);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (imageSrc) {
      const img = imageRef.current;
      img.onload = processImage;
    }
  }, [imageSrc, visionType, contrast, brightness, processImage]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Vision Test Simulator
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vision Type
              </label>
              <select
                value={visionType}
                onChange={(e) => setVisionType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              >
                <option value="normal">Normal Vision</option>
                <option value="protanopia">Protanopia (Red-Blind)</option>
                <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                <option value="monochromacy">Monochromacy (Color-Blind)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contrast ({contrast.toFixed(1)}x)
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={contrast}
                onChange={(e) => setContrast(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brightness ({brightness.toFixed(1)}x)
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={brightness}
                onChange={(e) => setBrightness(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Image Display */}
          {imageSrc ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="relative">
                <h2 className="text-lg font-semibold mb-2">Original Image</h2>
                <img
                  src={imageSrc}
                  alt="Original"
                  className="max-w-full h-auto rounded-lg shadow-md border border-gray-300"
                />
              </div>

              {/* Simulated Image */}
              <div className="relative">
                <h2 className="text-lg font-semibold mb-2">
                  Simulated Vision ({visionType})
                </h2>
                {processedImage ? (
                  <img
                    src={processedImage}
                    alt="Simulated"
                    className="max-w-full h-auto rounded-lg shadow-md border border-gray-300"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center bg-gray-200 rounded-lg">
                    {isProcessing ? (
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    ) : (
                      "Waiting for processing..."
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-gray-500 italic">Upload an image to begin</p>
            </div>
          )}

          {/* Hidden Canvas and Image */}
          <canvas ref={canvasRef} className="hidden" />
          {imageSrc && (
            <img ref={imageRef} src={imageSrc} alt="Processing" className="hidden" />
          )}

          {/* Action Buttons */}
          {imageSrc && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={downloadImage}
                disabled={!processedImage || isProcessing}
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
          )}
        </div>

        {/* Information */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-2 text-blue-700">About This Simulator</h2>
          <p className="text-sm text-blue-600">
            This tool simulates common color vision deficiencies:
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><strong>Protanopia</strong>: Red deficiency</li>
              <li><strong>Deuteranopia</strong>: Green deficiency</li>
              <li><strong>Tritanopia</strong>: Blue deficiency</li>
              <li><strong>Monochromacy</strong>: Complete color blindness (grayscale)</li>
            </ul>
            Adjust contrast and brightness for additional customization. Note: These are
            approximations and may not fully replicate real-world perception.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorVisionTestSimulator;