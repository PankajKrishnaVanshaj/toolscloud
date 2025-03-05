// app/components/ColorSchemeGenerator.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorSchemeGenerator = () => {
  const [baseColor, setBaseColor] = useState('#FF6B6B');
  const [schemeType, setSchemeType] = useState('monochromatic');
  const [schemeColors, setSchemeColors] = useState([]);
  const [variation, setVariation] = useState(20); // Variation in percentage for monochromatic

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
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
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
    return { h: h * 360, s, l };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360; s = s; l = l;
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

  // Generate color scheme
  const generateScheme = () => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let colors = [];

    switch (schemeType) {
      case 'monochromatic':
        colors = [
          rgbToHex(hslToRgb(hsl.h, hsl.s, Math.max(0.1, hsl.l - variation / 100))),
          baseColor,
          rgbToHex(hslToRgb(hsl.h, hsl.s, Math.min(0.9, hsl.l + variation / 100)))
        ];
        break;
      case 'complementary':
        colors = [
          baseColor,
          rgbToHex(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))
        ];
        break;
      case 'analogous':
        colors = [
          rgbToHex(hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l)),
          baseColor,
          rgbToHex(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l))
        ];
        break;
      case 'triadic':
        colors = [
          baseColor,
          rgbToHex(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l)),
          rgbToHex(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l))
        ];
        break;
      case 'tetradic':
        colors = [
          baseColor,
          rgbToHex(hslToRgb((hsl.h + 90) % 360, hsl.s, hsl.l)),
          rgbToHex(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l)),
          rgbToHex(hslToRgb((hsl.h + 270) % 360, hsl.s, hsl.l))
        ];
        break;
    }
    setSchemeColors(colors);
  };

  useEffect(() => {
    generateScheme();
  }, [baseColor, schemeType, variation]);

  // Export as CSS
  const exportToCss = () => {
    const css = `:root {\n${schemeColors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    alert('CSS variables copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Scheme Generator
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
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheme Type
              </label>
              <select
                value={schemeType}
                onChange={(e) => setSchemeType(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="monochromatic">Monochromatic</option>
                <option value="complementary">Complementary</option>
                <option value="analogous">Analogous</option>
                <option value="triadic">Triadic</option>
                <option value="tetradic">Tetradic</option>
              </select>
            </div>

            {schemeType === 'monochromatic' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variation: {variation}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={variation}
                  onChange={(e) => setVariation(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Scheme Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Generated Scheme</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {schemeColors.map((color, index) => (
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
        </div>

        {/* Preview */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Scheme Preview</h2>
          <div className="flex h-24 rounded-lg overflow-hidden">
            {schemeColors.map((color, index) => (
              <div
                key={index}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Color Schemes</h2>
          <div className="text-sm text-gray-700">
            <p>Generate color schemes based on a base color:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Monochromatic: Varying lightness of the base color</li>
              <li>Complementary: Opposite color on the color wheel</li>
              <li>Analogous: Adjacent colors (30° apart)</li>
              <li>Triadic: Three evenly spaced colors (120° apart)</li>
              <li>Tetradic: Four colors in a rectangle (90° apart)</li>
            </ul>
            <p className="mt-1">Export as CSS variables for easy use in projects.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSchemeGenerator;