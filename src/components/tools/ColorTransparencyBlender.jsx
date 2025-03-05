// app/components/ColorTransparencyBlender.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorTransparencyBlender = () => {
  const [color1, setColor1] = useState('#FF6B6B');
  const [color2, setColor2] = useState('#4ECDC4');
  const [alpha1, setAlpha1] = useState(0.5);
  const [alpha2, setAlpha2] = useState(0.5);
  const [blendedColor, setBlendedColor] = useState('');
  const [backgroundType, setBackgroundType] = useState('checkerboard');

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Blend two colors with alpha
  const blendColors = () => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    // Formula: out = (src * srcAlpha) + (dst * dstAlpha * (1 - srcAlpha))
    const r = (rgb1.r * alpha1) + (rgb2.r * alpha2 * (1 - alpha1));
    const g = (rgb1.g * alpha1) + (rgb2.g * alpha2 * (1 - alpha1));
    const b = (rgb1.b * alpha1) + (rgb2.b * alpha2 * (1 - alpha1));

    const blended = rgbToHex(
      Math.min(255, Math.max(0, r)),
      Math.min(255, Math.max(0, g)),
      Math.min(255, Math.max(0, b))
    );
    setBlendedColor(blended);
  };

  useEffect(() => {
    blendColors();
  }, [color1, color2, alpha1, alpha2]);

  // Background styles
  const backgrounds = {
    checkerboard: {
      background: `linear-gradient(45deg, #ccc 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #ccc 75%),
                  #fff`,
      backgroundSize: '20px 20px'
    },
    white: { background: '#ffffff' },
    black: { background: '#000000' },
    gray: { background: '#808080' }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Transparency Blender
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Inputs */}
          <div className="space-y-6">
            {/* Color 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm text-gray-600">Transparency: {Math.round(alpha1 * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={alpha1}
                  onChange={(e) => setAlpha1(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Color 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm text-gray-600">Transparency: {Math.round(alpha2 * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={alpha2}
                  onChange={(e) => setAlpha2(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Preview and Results */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Preview
              </label>
              <select
                value={backgroundType}
                onChange={(e) => setBackgroundType(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="checkerboard">Checkerboard</option>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="gray">Gray</option>
              </select>
              <div
                className="h-40 rounded-lg relative"
                style={backgrounds[backgroundType]}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: color2,
                    opacity: alpha2
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: color1,
                    opacity: alpha1
                  }}
                />
              </div>
            </div>

            {/* Blended Result */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Blended Result</h2>
              <div
                className="w-24 h-24 rounded-lg mx-auto mb-2"
                style={{ backgroundColor: blendedColor }}
              />
              <div className="text-sm text-center">
                <p>HEX: {blendedColor.toUpperCase()}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(blendedColor)}
                  className="mt-2 text-blue-500 hover:underline text-xs"
                >
                  Copy HEX
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTransparencyBlender;