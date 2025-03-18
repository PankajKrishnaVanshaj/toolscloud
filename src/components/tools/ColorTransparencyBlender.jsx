"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading the blended result

const ColorTransparencyBlender = () => {
  const [color1, setColor1] = useState("#FF6B6B");
  const [color2, setColor2] = useState("#4ECDC4");
  const [alpha1, setAlpha1] = useState(0.5);
  const [alpha2, setAlpha2] = useState(0.5);
  const [blendMode, setBlendMode] = useState("normal");
  const [blendedColor, setBlendedColor] = useState("");
  const [backgroundType, setBackgroundType] = useState("checkerboard");
  const previewRef = React.useRef(null);

  // Convert hex to RGB
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

  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  // Blend colors with different modes
  const blendColors = useCallback(() => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    let r, g, b;
    switch (blendMode) {
      case "normal":
        r = rgb1.r * alpha1 + rgb2.r * alpha2 * (1 - alpha1);
        g = rgb1.g * alpha1 + rgb2.g * alpha2 * (1 - alpha1);
        b = rgb1.b * alpha1 + rgb2.b * alpha2 * (1 - alpha1);
        break;
      case "multiply":
        r = (rgb1.r * rgb2.r * alpha1) / 255 + rgb2.r * (1 - alpha1);
        g = (rgb1.g * rgb2.g * alpha1) / 255 + rgb2.g * (1 - alpha1);
        b = (rgb1.b * rgb2.b * alpha1) / 255 + rgb2.b * (1 - alpha1);
        break;
      case "screen":
        r = 255 - ((255 - rgb1.r) * (255 - rgb2.r) * alpha1) / 255 + rgb2.r * (1 - alpha1);
        g = 255 - ((255 - rgb1.g) * (255 - rgb2.g) * alpha1) / 255 + rgb2.g * (1 - alpha1);
        b = 255 - ((255 - rgb1.b) * (255 - rgb2.b) * alpha1) / 255 + rgb2.b * (1 - alpha1);
        break;
      default:
        r = rgb1.r * alpha1 + rgb2.r * alpha2 * (1 - alpha1);
        g = rgb1.g * alpha1 + rgb2.g * alpha2 * (1 - alpha1);
        b = rgb1.b * alpha1 + rgb2.b * alpha2 * (1 - alpha1);
    }

    const blended = rgbToHex(
      Math.min(255, Math.max(0, r)),
      Math.min(255, Math.max(0, g)),
      Math.min(255, Math.max(0, b))
    );
    setBlendedColor(blended);
  }, [color1, color2, alpha1, alpha2, blendMode]);

  useEffect(() => {
    blendColors();
  }, [blendColors]);

  // Reset to default values
  const reset = () => {
    setColor1("#FF6B6B");
    setColor2("#4ECDC4");
    setAlpha1(0.5);
    setAlpha2(0.5);
    setBlendMode("normal");
    setBackgroundType("checkerboard");
  };

  // Copy color to clipboard
  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
    alert(`${color} copied to clipboard!`);
  };

  // Download preview as PNG
  const downloadPreview = () => {
    if (previewRef.current) {
      html2canvas(previewRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `blended-color-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  // Background styles
  const backgrounds = {
    checkerboard: {
      background: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #ccc 75%),
                  #fff`,
      backgroundSize: "20px 20px",
    },
    white: { background: "#ffffff" },
    black: { background: "#000000" },
    gray: { background: "#808080" },
    gradient: {
      background: "linear-gradient(90deg, #fff, #000)",
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Transparency Blender
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Inputs */}
          <div className="space-y-6">
            {[
              { label: "Foreground Color", color: color1, setColor: setColor1, alpha: alpha1, setAlpha: setAlpha1 },
              { label: "Background Color", color: color2, setColor: setColor2, alpha: alpha2, setAlpha: setAlpha2 },
            ].map(({ label, color, setColor, alpha, setAlpha }, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                  <button
                    onClick={() => copyColor(color)}
                    className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                  >
                    <FaCopy />
                  </button>
                </div>
                <div className="mt-2">
                  <label className="block text-sm text-gray-600">
                    Transparency: {Math.round(alpha * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={alpha}
                    onChange={(e) => setAlpha(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            ))}

            {/* Blend Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blend Mode</label>
              <select
                value={blendMode}
                onChange={(e) => setBlendMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
              </select>
            </div>
          </div>

          {/* Preview and Results */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Preview
              </label>
              <select
                value={backgroundType}
                onChange={(e) => setBackgroundType(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="checkerboard">Checkerboard</option>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="gray">Gray</option>
                <option value="gradient">Gradient</option>
              </select>
              <div
                ref={previewRef}
                className="h-48 rounded-lg relative overflow-hidden shadow-md"
                style={backgrounds[backgroundType]}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: color2,
                    opacity: alpha2,
                    mixBlendMode: blendMode === "normal" ? "normal" : blendMode,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: color1,
                    opacity: alpha1,
                    mixBlendMode: blendMode === "normal" ? "normal" : blendMode,
                  }}
                />
              </div>
            </div>

            {/* Blended Result */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Blended Result</h2>
              <div
                className="w-24 h-24 rounded-lg mx-auto mb-2 shadow-md"
                style={{ backgroundColor: blendedColor }}
              />
              <div className="text-sm text-center space-y-1">
                <p>HEX: {blendedColor.toUpperCase()}</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => copyColor(blendedColor)}
                    className="flex items-center text-blue-500 hover:underline text-xs"
                  >
                    <FaCopy className="mr-1" /> Copy HEX
                  </button>
                  <button
                    onClick={downloadPreview}
                    className="flex items-center text-green-500 hover:underline text-xs"
                  >
                    <FaDownload className="mr-1" /> Download
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={reset}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Blend two colors with adjustable transparency</li>
            <li>Multiple blend modes: Normal, Multiply, Screen</li>
            <li>Customizable background preview options</li>
            <li>Real-time color blending</li>
            <li>Copy HEX code or download preview as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorTransparencyBlender;