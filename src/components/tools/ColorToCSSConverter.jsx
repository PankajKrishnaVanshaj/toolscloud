// app/components/ColorToCSSConverter.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorToCSSConverter = () => {
  const [color, setColor] = useState('#FF6B6B');
  const [alpha, setAlpha] = useState(1);
  const [cssFormats, setCssFormats] = useState({});

  // Convert hex to RGB
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
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Generate CSS formats
  const generateCSSFormats = () => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    setCssFormats({
      hex: color.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`
    });
  };

  useEffect(() => {
    generateCSSFormats();
  }, [color, alpha]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color to CSS Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Input and Preview */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transparency: {Math.round(alpha * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={alpha}
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div
              className="h-32 rounded-lg flex items-center justify-center text-white text-lg font-medium shadow-inner relative overflow-hidden"
              style={{ backgroundColor: cssFormats.hex }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), #fff',
                  backgroundSize: '20px 20px',
                  opacity: 1 - alpha
                }}
              />
              <span className="relative z-10">Preview</span>
            </div>
          </div>

          {/* CSS Formats */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">CSS Formats</h2>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {Object.entries(cssFormats).map(([format, value]) => (
                <div key={format} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {format}:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">{value}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(value)}
                    className="text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">CSS Usage Example</h2>
          <pre className="text-sm bg-gray-100 p-3 rounded">
            {`.example-element {
  background-color: ${cssFormats.rgba};
  color: ${cssFormats.hex};
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ColorToCSSConverter;