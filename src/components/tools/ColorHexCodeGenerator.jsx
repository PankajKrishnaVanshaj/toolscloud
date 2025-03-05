// app/components/ColorHexCodeGenerator.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorHexCodeGenerator = () => {
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hex, setHex] = useState('#FF6B6B');
  const [favorites, setFavorites] = useState([]);

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Generate random color
  const generateRandomColor = () => {
    const newRgb = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256)
    };
    setRgb(newRgb);
  };

  // Update HEX when RGB changes
  useEffect(() => {
    setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
  }, [rgb]);

  // Handle RGB slider changes
  const handleRgbChange = (channel, value) => {
    setRgb(prev => ({
      ...prev,
      [channel]: parseInt(value)
    }));
  };

  // Handle HEX input change
  const handleHexChange = (value) => {
    setHex(value);
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setRgb(hexToRgb(value));
    }
  };

  // Add to favorites
  const addToFavorites = () => {
    if (!favorites.includes(hex)) {
      setFavorites([...favorites, hex]);
    }
  };

  // Remove from favorites
  const removeFromFavorites = (color) => {
    setFavorites(favorites.filter(fav => fav !== color));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color HEX Code Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Preview
              </label>
              <div
                className="h-32 rounded-lg shadow-inner flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: hex }}
              >
                {hex}
              </div>
            </div>

            <div className="space-y-4">
              {['r', 'g', 'b'].map(channel => (
                <div key={channel}>
                  <label className="block text-sm text-gray-600 capitalize">
                    {channel}: {rgb[channel]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={rgb[channel]}
                    onChange={(e) => handleRgbChange(channel, e.target.value)}
                    className="w-full"
                    style={{ accentColor: channel === 'r' ? 'red' : channel === 'g' ? 'green' : 'blue' }}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={hex}
                onChange={(e) => handleHexChange(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="#HEXCODE"
              />
              <button
                onClick={generateRandomColor}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Random
              </button>
            </div>

            <button
              onClick={addToFavorites}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Add to Favorites
            </button>
          </div>

          {/* Favorites */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Favorites</h2>
            {favorites.length === 0 ? (
              <p className="text-gray-500 text-sm">No favorite colors yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {favorites.map((favColor, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded shadow cursor-pointer"
                      style={{ backgroundColor: favColor }}
                      onClick={() => setHex(favColor)}
                    />
                    <p className="text-xs mt-1">{favColor}</p>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => copyToClipboard(favColor)}
                        className="text-blue-500 text-xs hover:underline"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => removeFromFavorites(favColor)}
                        className="text-red-500 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Utility function to copy to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
};

export default ColorHexCodeGenerator;