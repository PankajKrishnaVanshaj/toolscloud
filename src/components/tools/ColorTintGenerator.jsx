// app/components/ColorTintGenerator.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorTintGenerator = () => {
  const [baseColor, setBaseColor] = useState('#FF6B6B');
  const [steps, setSteps] = useState(5);
  const [tints, setTints] = useState([]);

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Generate tints by mixing with white
  const generateTints = () => {
    const rgb = hexToRgb(baseColor);
    const white = { r: 255, g: 255, b: 255 };
    const newTints = [];

    for (let i = 0; i < steps; i++) {
      const factor = i / (steps - 1); // 0 (base color) to 1 (white)
      const r = rgb.r + (white.r - rgb.r) * factor;
      const g = rgb.g + (white.g - rgb.g) * factor;
      const b = rgb.b + (white.b - rgb.b) * factor;
      newTints.push(rgbToHex(r, g, b));
    }

    setTints(newTints);
  };

  useEffect(() => {
    if (/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
      generateTints();
    } else {
      setTints([]);
    }
  }, [baseColor, steps]);

  // Export as CSS variables
  const exportToCss = () => {
    const css = `:root {\n${tints.map((color, i) => `  --tint-${i + 1}: ${color};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    alert('CSS variables copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Tint Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
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
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#FF6B6B"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Tints: {steps}
              </label>
              <input
                type="range"
                min="2"
                max="10"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Tints Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Generated Tints</h2>
            {tints.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {tints.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-16 h-16 rounded shadow"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs mt-1">{color}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="text-blue-500 text-xs hover:underline mt-1"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={exportToCss}
                  className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
                >
                  Export as CSS Variables
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Enter a valid HEX color (e.g., #FF6B6B) to generate tints
              </p>
            )}
          </div>
        </div>

        {/* Preview */}
        {tints.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Tint Preview</h2>
            <div className="flex h-24 rounded-lg overflow-hidden">
              {tints.map((color, index) => (
                <div
                  key={index}
                  className="flex-1"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Tint Generation</h2>
          <div className="text-sm text-gray-700">
            <p>Generate tints by mixing a base color with white:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Tints range from the base color to pure white</li>
              <li>Steps determine the number of intermediate colors</li>
              <li>Linear interpolation in RGB space</li>
            </ul>
            <p className="mt-1">Export as CSS variables (e.g., --tint-1) for use in projects.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTintGenerator;