"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const ColorTintGenerator = () => {
  const [baseColor, setBaseColor] = useState("#FF6B6B");
  const [steps, setSteps] = useState(5);
  const [tints, setTints] = useState([]);
  const [direction, setDirection] = useState("lighten"); // Lighten (to white) or darken (to black)
  const [exportFormat, setExportFormat] = useState("css"); // CSS, JSON, Array
  const [isValidColor, setIsValidColor] = useState(true);

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

  // Generate tints or shades
  const generateTints = useCallback(() => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
      setIsValidColor(false);
      setTints([]);
      return;
    }
    setIsValidColor(true);

    const rgb = hexToRgb(baseColor);
    const target = direction === "lighten" ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
    const newTints = [];

    for (let i = 0; i < steps; i++) {
      const factor = i / (steps - 1);
      const r = rgb.r + (target.r - rgb.r) * factor;
      const g = rgb.g + (target.g - rgb.g) * factor;
      const b = rgb.b + (target.b - rgb.b) * factor;
      newTints.push(rgbToHex(r, g, b));
    }

    setTints(newTints);
  }, [baseColor, steps, direction]);

  useEffect(() => {
    generateTints();
  }, [generateTints]);

  // Export in different formats
  const exportColors = () => {
    let output;
    switch (exportFormat) {
      case "css":
        output = `:root {\n${tints
          .map((color, i) => `  --${direction === "lighten" ? "tint" : "shade"}-${i + 1}: ${color};`)
          .join("\n")}\n}`;
        break;
      case "json":
        output = JSON.stringify(
          tints.reduce((acc, color, i) => {
            acc[`${direction === "lighten" ? "tint" : "shade"}${i + 1}`] = color;
            return acc;
          }, {}),
          null,
          2
        );
        break;
      case "array":
        output = JSON.stringify(tints);
        break;
      default:
        output = "";
    }

    navigator.clipboard.writeText(output);
    alert(`${exportFormat.toUpperCase()} copied to clipboard!`);
  };

  // Download as PNG
  const downloadAsImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = tints.length * 100;
    canvas.height = 150;

    tints.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * 100, 0, 100, 100);
      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(color, i * 100 + 50, 120);
    });

    const link = document.createElement("a");
    link.download = `color-${direction === "lighten" ? "tints" : "shades"}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Reset to default
  const reset = () => {
    setBaseColor("#FF6B6B");
    setSteps(5);
    setDirection("lighten");
    setExportFormat("css");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Tint & Shade Generator
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value.toUpperCase())}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase ${
                    !isValidColor ? "border-red-500" : ""
                  }`}
                  placeholder="#FF6B6B"
                />
              </div>
              {!isValidColor && (
                <p className="text-red-500 text-xs mt-1">
                  Please enter a valid HEX color (e.g., #FF6B6B)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Steps: {steps}
              </label>
              <input
                type="range"
                min="2"
                max="12"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="lighten">Lighten (to White)</option>
                <option value="darken">Darken (to Black)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="css">CSS Variables</option>
                <option value="json">JSON Object</option>
                <option value="array">Array</option>
              </select>
            </div>
          </div>

          {/* Tints/Shades Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Generated {direction === "lighten" ? "Tints" : "Shades"}
            </h2>
            {tints.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {tints.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-16 h-16 rounded shadow-md transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs mt-1 font-mono">{color}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="text-blue-500 text-xs hover:underline mt-1 flex items-center gap-1"
                      >
                        <FaCopy /> Copy
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={exportColors}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Export {exportFormat.toUpperCase()}
                  </button>
                  <button
                    onClick={downloadAsImage}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download PNG
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                Enter a valid HEX color to generate{" "}
                {direction === "lighten" ? "tints" : "shades"}
              </p>
            )}
          </div>
        </div>

        {/* Preview */}
        {tints.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">
              {direction === "lighten" ? "Tint" : "Shade"} Preview
            </h2>
            <div className="flex h-24 rounded-lg overflow-hidden shadow-md">
              {tints.map((color, index) => (
                <div
                  key={index}
                  className="flex-1 transition-colors"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features and Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Generate tints (to white) or shades (to black)</li>
              <li>Customizable number of steps (2-12)</li>
              <li>Export as CSS variables, JSON, or array</li>
              <li>Download as PNG image</li>
              <li>Real-time preview</li>
            </ul>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">How It Works</h3>
            <p className="text-sm text-gray-600">
              Colors are generated by linearly interpolating between the base color and{" "}
              {direction === "lighten" ? "white (#FFFFFF)" : "black (#000000)"} in RGB space.
              Adjust the steps and direction to create your desired palette.
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={reset}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <FaSync /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorTintGenerator;