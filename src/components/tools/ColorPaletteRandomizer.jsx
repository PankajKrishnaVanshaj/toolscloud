// app/components/ColorPaletteRandomizer.jsx
'use client';

import React, { useState } from 'react';

const ColorPaletteRandomizer = () => {
  const [paletteSize, setPaletteSize] = useState(5);
  const [palette, setPalette] = useState([]);
  const [lockedColors, setLockedColors] = useState(new Set());
  const [harmony, setHarmony] = useState('random');

  // Generate random HEX color
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Generate palette with harmony
  const generatePalette = () => {
    const newPalette = [];
    const baseColor = generateRandomColor();
    const baseRgb = hexToRgb(baseColor);
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

    for (let i = 0; i < paletteSize; i++) {
      if (lockedColors.has(i) && palette[i]) {
        newPalette.push(palette[i]);
      } else {
        let newColor;
        switch (harmony) {
          case 'complementary':
            newColor = i === 0 ? baseColor : rgbToHex(hslToRgb((baseHsl.h + 180) % 360, baseHsl.s, baseHsl.l));
            break;
          case 'analogous':
            newColor = rgbToHex(hslToRgb((baseHsl.h + (i * 30 - 60)) % 360, baseHsl.s, baseHsl.l));
            break;
          case 'triadic':
            newColor = rgbToHex(hslToRgb((baseHsl.h + (i * 120)) % 360, baseHsl.s, baseHsl.l));
            break;
          case 'monochromatic':
            newColor = rgbToHex(hslToRgb(baseHsl.h, baseHsl.s, Math.max(0.1, Math.min(0.9, baseHsl.l + (i * 0.15 - 0.3)))));
            break;
          default: // random
            newColor = generateRandomColor();
        }
        newPalette.push(newColor);
      }
    }
    setPalette(newPalette);
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
    return { h: h * 360, s, l };
  };

  // Convert HSL to RGB
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

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Toggle lock on a color
  const toggleLock = (index) => {
    const newLocked = new Set(lockedColors);
    if (newLocked.has(index)) {
      newLocked.delete(index);
    } else {
      newLocked.add(index);
    }
    setLockedColors(newLocked);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Palette Randomizer
        </h1>

        <div className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palette Size
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={paletteSize}
                onChange={(e) => setPaletteSize(Math.max(2, Math.min(10, parseInt(e.target.value))))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
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
                <option value="random">Random</option>
                <option value="complementary">Complementary</option>
                <option value="analogous">Analogous</option>
                <option value="triadic">Triadic</option>
                <option value="monochromatic">Monochromatic</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={generatePalette}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Generate Palette
              </button>
            </div>
          </div>

          {/* Palette Display */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Generated Palette</h2>
            {palette.length === 0 ? (
              <p className="text-gray-500">Click "Generate Palette" to start</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {palette.map((color, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="w-20 h-20 rounded shadow relative"
                      style={{ backgroundColor: color }}
                    >
                      <button
                        onClick={() => toggleLock(index)}
                        className={`absolute top-1 right-1 p-1 rounded-full ${lockedColors.has(index) ? 'bg-yellow-500' : 'bg-gray-300'} text-white`}
                      >
                        {lockedColors.has(index) ? '🔒' : '🔓'}
                      </button>
                    </div>
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
            )}
          </div>

          {/* Palette Preview */}
          {palette.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Palette Preview</h2>
              <div className="flex h-24 rounded-lg overflow-hidden">
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteRandomizer;