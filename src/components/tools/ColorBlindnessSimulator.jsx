"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaUpload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading results

const ColorBlindnessSimulator = () => {
  const [inputType, setInputType] = useState("color");
  const [inputColor, setInputColor] = useState("#FF6B6B");
  const [imageSrc, setImageSrc] = useState(null);
  const [simulatedColors, setSimulatedColors] = useState({});
  const [simulatedImages, setSimulatedImages] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState({
    normal: true,
    protanopia: true,
    deuteranopia: true,
    tritanopia: true,
  });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const resultRef = useRef(null);

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  };

  // Simulate color vision deficiencies (simplified approximations)
  const simulateColorVision = (r, g, b, type) => {
    switch (type) {
      case "protanopia": // Red deficiency
        return {
          r: 0.567 * r + 0.433 * g,
          g: 0.558 * r + 0.442 * g,
          b: b,
        };
      case "deuteranopia": // Green deficiency
        return {
          r: 0.625 * r + 0.375 * g,
          g: 0.7 * r + 0.3 * g,
          b: b,
        };
      case "tritanopia": // Blue deficiency
        return {
          r: r,
          g: 0.95 * g + 0.05 * b,
          b: 0.433 * g + 0.567 * b,
        };
      case "achromatopsia": // Total color blindness (grayscale)
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        return { r: gray, g: gray, b: gray };
      default: // Normal vision
        return { r, g, b };
    }
  };

  // Process single color
  const processColor = useCallback(() => {
    const rgb = hexToRgb(inputColor);
    const types = Object.keys(selectedTypes).filter((type) => selectedTypes[type]);
    const results = {};

    types.forEach((type) => {
      const simulated = simulateColorVision(rgb.r, rgb.g, rgb.b, type);
      results[type] = rgbToHex(
        Math.min(255, Math.max(0, simulated.r)),
        Math.min(255, Math.max(0, simulated.g)),
        Math.min(255, Math.max(0, simulated.b))
      );
    });

    setSimulatedColors(results);
    setSimulatedImages({});
  }, [inputColor, selectedTypes]);

  // Process image
  const processImage = useCallback(() => {
    if (!imageSrc) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const types = Object.keys(selectedTypes).filter((type) => selectedTypes[type]);
    const results = {};

    types.forEach((type) => {
      ctx.drawImage(img, 0, 0); // Reset canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const simulated = simulateColorVision(r, g, b, type);

        data[i] = Math.min(255, Math.max(0, simulated.r));
        data[i + 1] = Math.min(255, Math.max(0, simulated.g));
        data[i + 2] = Math.min(255, Math.max(0, simulated.b));
      }

      ctx.putImageData(imageData, 0, 0);
      results[type] = canvas.toDataURL("image/png");
    });

    setSimulatedImages(results);
    setSimulatedColors({});
    setIsProcessing(false);
  }, [imageSrc, selectedTypes]);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        setSimulatedColors({});
      };
      reader.readAsDataURL(file);
    }
  };

  // Download results
  const downloadResults = () => {
    if (resultRef.current) {
      html2canvas(resultRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `colorblind-simulation-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Reset all
  const reset = () => {
    setInputType("color");
    setInputColor("#FF6B6B");
    setImageSrc(null);
    setSimulatedColors({});
    setSimulatedImages({});
    setSelectedTypes({
      normal: true,
      protanopia: true,
      deuteranopia: true,
      tritanopia: true,
    });
  };

  useEffect(() => {
    if (inputType === "color") {
      processColor();
    } else if (inputType === "image" && imageSrc) {
      processImage();
    }
  }, [inputType, inputColor, imageSrc, processColor, processImage]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Blindness Simulator
        </h1>

        <div className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Type
              </label>
              <select
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="color">Single Color</option>
                <option value="image">Image</option>
              </select>
            </div>
            {inputType === "color" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={inputColor}
                    onChange={(e) => setInputColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={inputColor}
                    onChange={(e) => setInputColor(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="#FF6B6B"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            )}
          </div>

          {/* Simulation Type Selection */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Select Simulation Types</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Object.keys(selectedTypes).map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTypes[type]}
                    onChange={() =>
                      setSelectedTypes((prev) => ({
                        ...prev,
                        [type]: !prev[type],
                      }))
                    }
                    className="accent-blue-500"
                  />
                  <span className="text-sm capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Simulation Results */}
          <div ref={resultRef} className="bg-gray-50 p-4 rounded-lg relative">
            <h2 className="text-lg font-semibold mb-4">Simulation Results</h2>
            {isProcessing ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {inputType === "color" && Object.keys(simulatedColors).length > 0 ? (
                  Object.entries(simulatedColors).map(([type, color]) => (
                    <div key={type} className="space-y-2">
                      <p className="text-sm font-medium capitalize">{type}</p>
                      <div
                        className="w-full h-24 rounded-lg shadow-inner border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-sm text-center">
                        {color}
                        <button
                          onClick={() => navigator.clipboard.writeText(color)}
                          className="ml-2 text-blue-500 hover:underline text-xs"
                        >
                          Copy
                        </button>
                      </p>
                    </div>
                  ))
                ) : inputType === "image" && Object.keys(simulatedImages).length > 0 ? (
                  Object.entries(simulatedImages).map(([type, src]) => (
                    <div key={type} className="space-y-2">
                      <p className="text-sm font-medium capitalize">{type}</p>
                      <img
                        src={src}
                        alt={`${type} simulation`}
                        className="w-full h-auto rounded border border-gray-200 shadow-sm transition-transform hover:scale-105"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm col-span-full">
                    {inputType === "color"
                      ? "Select a color to simulate"
                      : "Upload an image to simulate"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={downloadResults}
              disabled={
                (inputType === "color" && !Object.keys(simulatedColors).length) ||
                (inputType === "image" && !Object.keys(simulatedImages).length) ||
                isProcessing
              }
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Results
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Hidden Elements */}
          <canvas ref={canvasRef} className="hidden" />
          {imageSrc && (
            <img ref={imageRef} src={imageSrc} alt="Processing" className="hidden" />
          )}

          {/* Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              About Color Blindness Simulation
            </h2>
            <div className="text-sm text-blue-600">
              <p>Simulates common color vision deficiencies:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li><strong>Protanopia:</strong> Red deficiency</li>
                <li><strong>Deuteranopia:</strong> Green deficiency</li>
                <li><strong>Tritanopia:</strong> Blue deficiency</li>
                <li><strong>Achromatopsia:</strong> Total color blindness (grayscale)</li>
              </ul>
              <p className="mt-1">
                Uses simplified transformation matrices; actual perception may vary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorBlindnessSimulator;