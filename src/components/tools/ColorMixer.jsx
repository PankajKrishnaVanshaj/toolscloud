// app/components/ColorMixer.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorMixer = () => {
  const [colors, setColors] = useState([
    { hex: '#FF6B6B', weight: 50 },
    { hex: '#4ECDC4', weight: 50 }
  ]);
  const [newColor, setNewColor] = useState('#000000');
  const [mixedColor, setMixedColor] = useState('');

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

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Mix colors based on weights
  const mixColors = () => {
    const totalWeight = colors.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) return;

    let r = 0, g = 0, b = 0;
    colors.forEach(color => {
      const rgb = hexToRgb(color.hex);
      const weight = color.weight / totalWeight;
      r += rgb.r * weight;
      g += rgb.g * weight;
      b += rgb.b * weight;
    });

    const mixedRgb = {
      r: Math.min(255, Math.max(0, r)),
      g: Math.min(255, Math.max(0, g)),
      b: Math.min(255, Math.max(0, b))
    };

    setMixedColor(rgbToHex(mixedRgb.r, mixedRgb.g, mixedRgb.b));
  };

  useEffect(() => {
    mixColors();
  }, [colors]);

  // Add a new color
  const addColor = () => {
    if (/^#[0-9A-F]{6}$/i.test(newColor) && !colors.some(c => c.hex === newColor)) {
      setColors([...colors, { hex: newColor, weight: 50 }]);
      setNewColor('#000000');
    }
  };

  // Update color HEX
  const updateColorHex = (index, value) => {
    const newColors = [...colors];
    newColors[index].hex = value;
    setColors(newColors);
  };

  // Update color weight
  const updateColorWeight = (index, value) => {
    const newColors = [...colors];
    newColors[index].weight = Math.max(0, Math.min(100, parseInt(value) || 0));
    setColors(newColors);
  };

  // Remove a color
  const removeColor = (index) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const mixedRgb = hexToRgb(mixedColor);
  const mixedHsl = rgbToHsl(mixedRgb.r, mixedRgb.g, mixedRgb.b);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Mixer
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Inputs */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  placeholder="#HEXCODE"
                />
                <button
                  onClick={addColor}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Input Colors</h2>
              {colors.map((color, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => updateColorHex(index, e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color.hex}
                    onChange={(e) => updateColorHex(index, e.target.value)}
                    className="w-24 p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={color.weight}
                    onChange={(e) => updateColorWeight(index, e.target.value)}
                    className="w-20 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    placeholder="Weight"
                  />
                  {colors.length > 2 && (
                    <button
                      onClick={() => removeColor(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mixed Color */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Mixed Color</h2>
              <div
                className="w-full h-32 rounded-lg shadow-inner mb-2"
                style={{ backgroundColor: mixedColor }}
              />
              <div className="space-y-2 text-sm">
                <p>
                  HEX: {mixedColor}
                  <button
                    onClick={() => navigator.clipboard.writeText(mixedColor)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  RGB: {mixedRgb.r}, {mixedRgb.g}, {mixedRgb.b}
                  <button
                    onClick={() => navigator.clipboard.writeText(`${mixedRgb.r}, ${mixedRgb.g}, ${mixedRgb.b}`)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  HSL: {mixedHsl.h}°, {mixedHsl.s}%, {mixedHsl.l}%
                  <button
                    onClick={() => navigator.clipboard.writeText(`${mixedHsl.h}, ${mixedHsl.s}%, ${mixedHsl.l}%`)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Color Mixing</h2>
          <div className="text-sm text-gray-700">
            <p>Mixes colors based on weighted averages in RGB space:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Add colors with HEX codes and assign weights (0-100)</li>
              <li>Weights determine each color's contribution to the mix</li>
              <li>Result is a weighted average of RGB values</li>
            </ul>
            <p className="mt-1">Minimum of 2 colors required; weights are normalized to sum to 100%.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorMixer;