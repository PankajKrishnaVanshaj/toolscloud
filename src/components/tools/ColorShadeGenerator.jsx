// app/components/ColorShadeGenerator.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorShadeGenerator = () => {
  const [baseColor, setBaseColor] = useState('#FF6B6B');
  const [shadeCount, setShadeCount] = useState(5); // Total shades including base
  const [stepSize, setStepSize] = useState(10); // Percentage change per step
  const [shades, setShades] = useState([]);

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

  // Generate shades
  const generateShades = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(baseColor)) {
      setShades([]);
      return;
    }

    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const halfCount = Math.floor((shadeCount - 1) / 2); // Shades on each side of base
    const newShades = [];

    // Generate darker shades
    for (let i = halfCount; i > 0; i--) {
      const newL = Math.max(0, hsl.l - (stepSize / 100) * i);
      newShades.push(rgbToHex(hslToRgb(hsl.h, hsl.s, newL)));
    }

    // Add base color
    newShades.push(baseColor);

    // Generate lighter shades
    for (let i = 1; i <= halfCount; i++) {
      const newL = Math.min(1, hsl.l + (stepSize / 100) * i);
      newShades.push(rgbToHex(hslToRgb(hsl.h, hsl.s, newL)));
    }

    setShades(newShades);
  };

  useEffect(() => {
    generateShades();
  }, [baseColor, shadeCount, stepSize]);

  // Export as CSS variables
  const exportToCss = () => {
    const css = `:root {\n${shades.map((color, i) => `  --shade-${i + 1}: ${color};`).join('\n')}\n}`;
    navigator.clipboard.writeText(css);
    alert('Shades copied to clipboard as CSS variables!');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Shade Generator
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
                Number of Shades: {shadeCount}
              </label>
              <input
                type="range"
                min="3"
                max="11"
                step="2" // Odd numbers only to center base color
                value={shadeCount}
                onChange={(e) => setShadeCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Size: {stepSize}%
              </label>
              <input
                type="range"
                min="5"
                max="25"
                step="5"
                value={stepSize}
                onChange={(e) => setStepSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Shades Display */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Generated Shades</h2>
            {shades.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                  {shades.map((color, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-16 h-16 rounded shadow"
                        style={{ backgroundColor: color }}
                      />
                      <p className="text-xs mt-1">{color}</p>
                      <button
                        onClick={() => navigator.clipboard.writeText(color)}
                        className="text-blue-500 text-xs hover:underline"
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
              <p className="text-gray-500 text-sm">Enter a valid HEX color to generate shades</p>
            )}
          </div>
        </div>

        {/* Preview */}
        {shades.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Shade Preview</h2>
            <div className="flex h-24 rounded-lg overflow-hidden">
              {shades.map((color, index) => (
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
          <h2 className="text-lg font-semibold mb-2">About Shade Generator</h2>
          <div className="text-sm text-gray-700">
            <p>Generate shades from a base color:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Uses HSL color space for consistent lightness steps</li>
              <li>Adjustable shade count (3-11, odd numbers) and step size (5-25%)</li>
              <li>Base color is centered, with darker and lighter shades</li>
              <li>Export as CSS variables (e.g., --shade-1, --shade-2)</li>
            </ul>
            <p className="mt-1">Useful for creating color scales in design systems.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorShadeGenerator;