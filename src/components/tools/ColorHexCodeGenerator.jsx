"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaTrash, FaRandom, FaHeart, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading color card

const ColorHexCodeGenerator = () => {
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hex, setHex] = useState("#FF6B6B");
  const [favorites, setFavorites] = useState([]);
  const [colorName, setColorName] = useState("");
  const [contrastColor, setContrastColor] = useState("#000000");
  const previewRef = React.useRef(null);

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  };

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

  // Calculate contrast color (black or white) for readability
  const calculateContrastColor = (r, g, b) => {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  // Generate random color
  const generateRandomColor = useCallback(() => {
    const newRgb = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
    setRgb(newRgb);
    setColorName(""); // Clear custom name on random generation
  }, []);

  // Update HEX and contrast color when RGB changes
  useEffect(() => {
    const newHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setHex(newHex);
    setContrastColor(calculateContrastColor(rgb.r, rgb.g, rgb.b));
  }, [rgb]);

  // Handle RGB slider changes
  const handleRgbChange = (channel, value) => {
    setRgb((prev) => ({
      ...prev,
      [channel]: parseInt(value),
    }));
  };

  // Handle HEX input change
  const handleHexChange = (value) => {
    setHex(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setRgb(hexToRgb(value));
    }
  };

  // Add to favorites with optional name
  const addToFavorites = () => {
    if (!favorites.some((fav) => fav.hex === hex)) {
      setFavorites([...favorites, { hex, name: colorName || `Color ${favorites.length + 1}` }]);
      setColorName("");
    }
  };

  // Remove from favorites
  const removeFromFavorites = (colorHex) => {
    setFavorites(favorites.filter((fav) => fav.hex !== colorHex));
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied ${text} to clipboard!`);
  };

  // Download color card
  const downloadColorCard = () => {
    if (previewRef.current) {
      html2canvas(previewRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `color-card-${hex.slice(1)}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color HEX Code Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Controls */}
          <div className="space-y-6">
            <div ref={previewRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Preview
              </label>
              <div
                className="h-40 rounded-lg shadow-inner flex flex-col items-center justify-center text-white font-medium transition-colors"
                style={{ backgroundColor: hex, color: contrastColor }}
              >
                <span className="text-2xl">{hex}</span>
                <span className="text-sm mt-2">{colorName || "Custom Color"}</span>
              </div>
            </div>

            <div className="space-y-4">
              {["r", "g", "b"].map((channel) => (
                <div key={channel}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {channel}: {rgb[channel]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb[channel]}
                    onChange={(e) => handleRgbChange(channel, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      accentColor:
                        channel === "r" ? "red" : channel === "g" ? "green" : "blue",
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HEX Code</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="#HEXCODE"
                  />
                  <button
                    onClick={() => copyToClipboard(hex)}
                    className="p-2 text-blue-500 hover:text-blue-700"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Name
                </label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a name"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={generateRandomColor}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaRandom className="mr-2" /> Random
              </button>
              <button
                onClick={addToFavorites}
                disabled={favorites.some((fav) => fav.hex === hex)}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaHeart className="mr-2" /> Add to Favorites
              </button>
              <button
                onClick={downloadColorCard}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download Card
              </button>
            </div>
          </div>

          {/* Favorites */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Favorites</h2>
            {favorites.length === 0 ? (
              <p className="text-gray-500 text-sm">No favorite colors yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                {favorites.map((fav, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded shadow cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: fav.hex }}
                      onClick={() => {
                        setHex(fav.hex);
                        setColorName(fav.name);
                      }}
                    />
                    <p className="text-xs mt-1 text-center">{fav.name}</p>
                    <p className="text-xs text-gray-600">{fav.hex}</p>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => copyToClipboard(fav.hex)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <FaCopy size={12} />
                      </button>
                      <button
                        onClick={() => removeFromFavorites(fav.hex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>RGB sliders and HEX input</li>
            <li>Random color generation</li>
            <li>Favorite colors with custom names</li>
            <li>Contrast-aware text color</li>
            <li>Copy to clipboard functionality</li>
            <li>Downloadable color card</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorHexCodeGenerator;