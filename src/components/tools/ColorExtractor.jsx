"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading palette

const ColorExtractor = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [colorCount, setColorCount] = useState(5);
  const [samplingRate, setSamplingRate] = useState(20); // Pixels to skip
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const paletteRef = useRef(null);
  const fileInputRef = useRef(null);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setExtractedColors([]);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  };

  // Improved color extraction with k-means clustering simulation
  const extractColors = useCallback(() => {
    if (!imageSrc || !canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = [];

    // Collect color samples
    for (let i = 0; i < imageData.length; i += samplingRate * 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const alpha = imageData[i + 3];

      if (alpha > 0) {
        colors.push([r, g, b]);
      }
    }

    // Simple k-means clustering simulation
    const clusters = [];
    const step = Math.floor(colors.length / colorCount);
    for (let i = 0; i < colorCount; i++) {
      clusters.push(colors[i * step] || colors[0]);
    }

    // Iterate to refine clusters (basic simulation)
    for (let iter = 0; iter < 3; iter++) {
      const newClusters = clusters.map(() => ({ r: 0, g: 0, b: 0, count: 0 }));
      colors.forEach(([r, g, b]) => {
        const distances = clusters.map(([cr, cg, cb]) =>
          Math.sqrt((r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2)
        );
        const closest = distances.indexOf(Math.min(...distances));
        newClusters[closest].r += r;
        newClusters[closest].g += g;
        newClusters[closest].b += b;
        newClusters[closest].count += 1;
      });

      clusters.forEach((_, i) => {
        const cluster = newClusters[i];
        if (cluster.count > 0) {
          clusters[i] = [
            Math.round(cluster.r / cluster.count),
            Math.round(cluster.g / cluster.count),
            Math.round(cluster.b / cluster.count),
          ];
        }
      });
    }

    const extracted = clusters.map(([r, g, b]) => rgbToHex(r, g, b));
    setExtractedColors(extracted);
    setIsProcessing(false);
  }, [imageSrc, colorCount, samplingRate]);

  // Trigger extraction on image load or parameter change
  useEffect(() => {
    if (imageSrc && imageRef.current) {
      const img = imageRef.current;
      img.onload = extractColors;
    }
  }, [imageSrc, colorCount, samplingRate, extractColors]);

  // Copy color to clipboard
  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
  };

  // Download palette as image
  const downloadPalette = () => {
    if (paletteRef.current && extractedColors.length > 0) {
      html2canvas(paletteRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `color-palette-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset everything
  const reset = () => {
    setImageSrc(null);
    setExtractedColors([]);
    setColorCount(5);
    setSamplingRate(20);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Extractor
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Upload and Settings */}
          <div className="space-y-6">
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
                Number of Colors ({colorCount})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={colorCount}
                onChange={(e) => setColorCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sampling Rate ({samplingRate}px)
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={samplingRate}
                onChange={(e) => setSamplingRate(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower values increase accuracy but slow processing
              </p>
            </div>

            {imageSrc && (
              <div className="relative">
                <h2 className="text-lg font-semibold mb-2">Image Preview</h2>
                <img
                  src={imageSrc}
                  alt="Uploaded"
                  className="max-w-full h-auto rounded-lg shadow-md max-h-96 object-contain"
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-lg">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Extracted Colors */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Extracted Colors</h2>
              {extractedColors.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {extractedColors.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-16 h-16 rounded-lg shadow-md transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs font-mono mt-2">{color}</p>
                      <button
                        onClick={() => copyColor(color)}
                        className="flex items-center gap-1 text-blue-500 text-xs hover:text-blue-700 mt-1 transition-colors"
                      >
                        <FaCopy /> Copy
                      </button>
                    </div>
                  ))}
                </div>
              ) : imageSrc ? (
                <p className="text-gray-500 text-sm italic">Extracting colors...</p>
              ) : (
                <p className="text-gray-500 text-sm italic">
                  Upload an image to extract colors
                </p>
              )}
            </div>

            {extractedColors.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Color Palette Preview</h2>
                  <button
                    onClick={downloadPalette}
                    className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <FaDownload /> Download
                  </button>
                </div>
                <div
                  ref={paletteRef}
                  className="flex h-24 rounded-lg overflow-hidden shadow-md"
                >
                  {extractedColors.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync /> Reset
          </button>
        </div>

        {/* Hidden Elements */}
        <canvas ref={canvasRef} className="hidden" />
        {imageSrc && (
          <img ref={imageRef} src={imageSrc} alt="Processing" className="hidden" />
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Extract dominant colors using k-means clustering simulation</li>
            <li>Adjustable number of colors (1-10)</li>
            <li>Customizable sampling rate for speed vs. accuracy</li>
            <li>Copy colors to clipboard</li>
            <li>Download palette as PNG</li>
            <li>Real-time processing indicator</li>
          </ul>
        </div>

        
      </div>
    </div>
  );
};

export default ColorExtractor;