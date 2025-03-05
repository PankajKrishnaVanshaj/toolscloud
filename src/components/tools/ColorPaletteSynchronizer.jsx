// app/components/ColorPaletteSynchronizer.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorPaletteSynchronizer = () => {
  const [baseColor, setBaseColor] = useState('#FF6B6B');
  const [harmony, setHarmony] = useState('complementary');
  const [palette, setPalette] = useState([]);

  // Color conversion utilities
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = ({ r, g, b }) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

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
    return { h: h * 360, s, l };
  };

  const hslToRgb = (h, s, l) => {
    h /= 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 1/6) { r = c; g = x; b = 0; }
    else if (h < 2/6) { r = x; g = c; b = 0; }
    else if (h < 3/6) { r = 0; g = c; b = x; }
    else if (h < 4/6) { r = 0; g = x; b = c; }
    else if (h < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  // Generate palette based on harmony
  const generatePalette = () => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let colors = [baseColor];

    switch (harmony) {
      case 'complementary':
        colors.push(rgbToHex(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l)));
        break;
      case 'analogous':
        colors.push(rgbToHex(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l)));
        colors.push(rgbToHex(hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)));
        break;
      case 'triadic':
        colors.push(rgbToHex(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l)));
        colors.push(rgbToHex(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)));
        break;
      case 'split-complementary':
        colors.push(rgbToHex(hslToRgb((hsl.h + 150) % 360, hsl.s, hsl.l)));
        colors.push(rgbToHex(hslToRgb((hsl.h + 210) % 360, hsl.s, hsl.l)));
        break;
      case 'monochromatic':
        colors.push(rgbToHex(hslToRgb(hsl.h, hsl.s, Math.min(0.8, hsl.l + 0.2))));
        colors.push(rgbToHex(hslToRgb(hsl.h, hsl.s, Math.max(0.2, hsl.l - 0.2))));
        break;
    }
    setPalette(colors);
  };

  useEffect(() => {
    generatePalette();
  }, [baseColor, harmony]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Palette Synchronizer
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base Color and Harmony Selection */}
          <div className="space-y-4">
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
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color Harmony
              </label>
              <select
                value={harmony}
                onChange={(e) => setHarmony(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="complementary">Complementary</option>
                <option value="analogous">Analogous</option>
                <option value="triadic">Triadic</option>
                <option value="split-complementary">Split Complementary</option>
                <option value="monochromatic">Monochromatic</option>
              </select>
            </div>
          </div>

          {/* Palette Preview */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Palette Preview</h2>
            <div className="grid grid-cols-1 gap-2">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="h-16 rounded flex items-center justify-between px-4 text-white font-medium shadow"
                  style={{ backgroundColor: color }}
                >
                  <span>{color.toUpperCase()}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(color)}
                    className="bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Palette Visualization */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Visualization</h2>
          <div className="flex h-32 rounded-lg overflow-hidden">
            {palette.map((color, index) => (
              <div
                key={index}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteSynchronizer;