"use client";

import { useState } from "react";

const HexToRGB = () => {
  const [hex, setHex] = useState("#3498db");
  const [rgb, setRgb] = useState("52, 152, 219");

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    let formattedHex = hex.replace(/^#/, "");
    if (formattedHex.length === 3) {
      formattedHex = formattedHex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (formattedHex.length !== 6) return "Invalid Hex";

    const r = parseInt(formattedHex.substring(0, 2), 16);
    const g = parseInt(formattedHex.substring(2, 4), 16);
    const b = parseInt(formattedHex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  };

  // Convert RGB to HEX
  const rgbToHex = (rgb) => {
    const [r, g, b] = rgb.split(",").map((num) => parseInt(num.trim()));
    if (isNaN(r) || isNaN(g) || isNaN(b)) return "Invalid RGB";

    return `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  };

  // Handle HEX input change
  const handleHexChange = (e) => {
    let newHex = e.target.value;
    if (!newHex.startsWith("#")) {
      newHex = `#${newHex}`;
    }
    setHex(newHex);
    setRgb(hexToRgb(newHex));
  };

  // Handle RGB input change
  const handleRgbChange = (e) => {
    const newRgb = e.target.value;
    setRgb(newRgb);
    setHex(rgbToHex(newRgb));
  };

  // Copy value to clipboard
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    alert(`Copied ${value} to clipboard!`);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">Hex to RGB Converter</h2>

      {/* Color Picker */}
      <input
        type="color"
        value={hex}
        onChange={handleHexChange}
        className="w-24 h-24 border-none cursor-pointer"
      />

      {/* HEX Input */}
      <div className="mt-4">
        <p className="text-lg font-medium">HEX:</p>
        <div className="flex justify-center items-center gap-2 mt-2">
          <input
            type="text"
            value={hex}
            onChange={handleHexChange}
            maxLength={7}
            className="w-32 px-3 py-1 text-center border rounded-lg"
          />
          <button
            className="px-4 py-1 bg-primary text-white rounded hover:bg-primary/90"
            onClick={() => copyToClipboard(hex)}
          >
            Copy HEX
          </button>
        </div>
      </div>

      {/* RGB Input */}
      <div className="mt-4">
        <p className="text-lg font-medium">RGB:</p>
        <div className="flex justify-center items-center gap-2 mt-2">
          <input
            type="text"
            value={rgb}
            onChange={handleRgbChange}
            placeholder="Enter RGB (e.g., 52, 152, 219)"
            className="w-48 px-3 py-1 text-center border rounded-lg"
          />
          <button
            className="px-4 py-1 bg-secondary text-white rounded hover:bg-secondary/90"
            onClick={() => copyToClipboard(rgb)}
          >
            Copy RGB
          </button>
        </div>
      </div>

      {/* Display Color Box */}
      <div
        className="w-full h-14 rounded-lg mt-6 border border-gray-300"
        style={{ backgroundColor: hex }}
      ></div>
    </div>
  );
};

export default HexToRGB;
