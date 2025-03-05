// app/components/ColorNameFinder.jsx
'use client';

import React, { useState, useEffect } from 'react';

// Simplified list of common color names with HEX values
const colorNames = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Pink', hex: '#FFC1CC' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Lime', hex: '#00FF00' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Violet', hex: '#EE82EE' },
  { name: 'Turquoise', hex: '#40E0D0' }
];

const ColorNameFinder = () => {
  const [inputColor, setInputColor] = useState('#FF6B6B');
  const [closestMatch, setClosestMatch] = useState(null);

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Calculate Euclidean distance between two RGB colors
  const calculateDistance = (rgb1, rgb2) => {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  };

  // Find closest color name
  const findClosestColor = (hex) => {
    const inputRgb = hexToRgb(hex);
    let minDistance = Infinity;
    let closest = null;

    colorNames.forEach(color => {
      const colorRgb = hexToRgb(color.hex);
      const distance = calculateDistance(inputRgb, colorRgb);
      if (distance < minDistance) {
        minDistance = distance;
        closest = { ...color, distance };
      }
    });

    return closest;
  };

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(inputColor)) {
      const match = findClosestColor(inputColor);
      setClosestMatch(match);
    } else {
      setClosestMatch(null);
    }
  }, [inputColor]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Name Finder
        </h1>

        <div className="space-y-6">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={inputColor}
                onChange={(e) => setInputColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={inputColor}
                onChange={(e) => setInputColor(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="#FF6B6B"
              />
            </div>
          </div>

          {/* Result */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Closest Match</h2>
            {closestMatch ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Color</p>
                    <div
                      className="w-full h-24 rounded-lg shadow-inner"
                      style={{ backgroundColor: inputColor }}
                    />
                    <p className="text-sm mt-1 text-center">{inputColor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Closest Named Color</p>
                    <div
                      className="w-full h-24 rounded-lg shadow-inner"
                      style={{ backgroundColor: closestMatch.hex }}
                    />
                    <p className="text-sm mt-1 text-center">{closestMatch.name} ({closestMatch.hex})</p>
                  </div>
                </div>
                <p className="text-sm">
                  Distance: {closestMatch.distance.toFixed(2)} (RGB Euclidean)
                  <button
                    onClick={() => navigator.clipboard.writeText(closestMatch.hex)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy HEX
                  </button>
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Enter a valid HEX color (e.g., #FF6B6B) to find the closest match
              </p>
            )}
          </div>

          {/* Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">About Color Name Finder</h2>
            <div className="text-sm text-gray-700">
              <p>Finds the closest named color from a predefined list:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Matches based on RGB Euclidean distance</li>
                <li>Uses a simplified list of common color names</li>
                <li>Lower distance indicates a closer match</li>
              </ul>
              <p className="mt-1">Note: This is an approximation; actual color names may vary by context or standard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorNameFinder;