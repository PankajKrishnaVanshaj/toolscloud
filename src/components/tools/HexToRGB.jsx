"use client";
import { useState, useCallback } from "react";
import { FaCopy, FaSync, FaRandom } from "react-icons/fa";

const HexToRGB = () => {
  const [hex, setHex] = useState("#3498db");
  const [rgb, setRgb] = useState("52, 152, 219");
  const [opacity, setOpacity] = useState(1.0); // New: Opacity control
  const [format, setFormat] = useState("rgb"); // New: Toggle between RGB/RGBA

  // Convert HEX to RGB/RGBA
  const hexToRgb = useCallback((hex) => {
    let formattedHex = hex.replace(/^#/, "");
    if (formattedHex.length === 3) {
      formattedHex = formattedHex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (!/^[0-9A-Fa-f]{6}$/.test(formattedHex)) return "Invalid Hex";

    const r = parseInt(formattedHex.substring(0, 2), 16);
    const g = parseInt(formattedHex.substring(2, 4), 16);
    const b = parseInt(formattedHex.substring(4, 6), 16);

    return format === "rgb" ? `${r}, ${g}, ${b}` : `${r}, ${g}, ${b}, ${opacity}`;
  }, [format, opacity]);

  // Convert RGB/RGBA to HEX
  const rgbToHex = useCallback((rgb) => {
    const values = rgb.split(",").map((num) => parseInt(num.trim()));
    const [r, g, b, a] = values.length === 4 ? values : [...values, 1];
    if (isNaN(r) || isNaN(g) || isNaN(b) || r > 255 || g > 255 || b > 255)
      return "Invalid RGB";
    if (values.length === 4 && (a < 0 || a > 1)) return "Invalid Alpha";

    setOpacity(a || 1); // Update opacity if provided
    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  }, []);

  // Handle HEX input change
  const handleHexChange = (e) => {
    let newHex = e.target.value;
    if (!newHex.startsWith("#")) newHex = `#${newHex}`;
    setHex(newHex);
    const newRgb = hexToRgb(newHex);
    if (newRgb !== "Invalid Hex") setRgb(newRgb);
  };

  // Handle RGB/RGBA input change
  const handleRgbChange = (e) => {
    const newRgb = e.target.value;
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb);
    if (newHex !== "Invalid RGB" && newHex !== "Invalid Alpha") setHex(newHex);
  };

  // Handle opacity change
  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity);
    setRgb(hexToRgb(hex)); // Update RGB with new opacity
  };

  // Copy value to clipboard
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    alert(`Copied "${value}" to clipboard!`);
  };

  // Reset to default
  const reset = () => {
    setHex("#3498db");
    setRgb("52, 152, 219");
    setOpacity(1.0);
    setFormat("rgb");
  };

  // Generate random color
  const randomColor = () => {
    const newHex = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()}`;
    setHex(newHex);
    setRgb(hexToRgb(newHex));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          HEX ↔ RGB Converter
        </h2>

        {/* Color Preview */}
        <div
          className="w-full h-24 rounded-lg mb-6 border border-gray-300 transition-all"
          style={{ backgroundColor: hex, opacity }}
        />

        {/* Inputs */}
        <div className="space-y-6">
          {/* HEX Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">HEX</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hex}
                onChange={handleHexChange}
                className="w-12 h-12 border-none cursor-pointer rounded-md"
              />
              <input
                type="text"
                value={hex}
                onChange={handleHexChange}
                maxLength={7}
                className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="#RRGGBB"
              />
              <button
                onClick={() => copyToClipboard(hex)}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCopy />
              </button>
            </div>
          </div>

          {/* RGB/RGBA Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {format.toUpperCase()}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={rgb}
                onChange={handleRgbChange}
                placeholder={format === "rgb" ? "R, G, B" : "R, G, B, A"}
                className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => copyToClipboard(rgb)}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaCopy />
              </button>
            </div>
          </div>

          {/* Opacity and Format Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opacity ({opacity.toFixed(2)})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={handleOpacityChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  setRgb(hexToRgb(hex));
                }}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="rgb">RGB</option>
                <option value="rgba">RGBA</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={randomColor}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaRandom className="mr-2" /> Random
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between HEX and RGB/RGBA</li>
            <li>Color picker integration</li>
            <li>Adjustable opacity with RGBA support</li>
            <li>Copy values to clipboard</li>
            <li>Random color generator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HexToRGB;