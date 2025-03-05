// app/components/ColorOpacityAdjuster.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorOpacityAdjuster = () => {
  const [baseColor, setBaseColor] = useState('#FF6B6B');
  const [opacity, setOpacity] = useState(1);
  const [backgroundType, setBackgroundType] = useState('checkerboard');
  const [adjustedColor, setAdjustedColor] = useState('');

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
  const rgbToHex = (r, g, b, a) => {
    const hex = [r, g, b].map(x => {
      const val = Math.round(x).toString(16);
      return val.length === 1 ? '0' + val : val;
    });
    if (a !== undefined) {
      const alpha = Math.round(a * 255).toString(16);
      hex.push(alpha.length === 1 ? '0' + alpha : alpha);
    }
    return '#' + hex.join('').toUpperCase();
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

  // Update adjusted color when base color or opacity changes
  useEffect(() => {
    const rgb = hexToRgb(baseColor);
    setAdjustedColor(rgbToHex(rgb.r, rgb.g, rgb.b, opacity));
  }, [baseColor, opacity]);

  const rgb = hexToRgb(baseColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

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
          Color Opacity Adjuster
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
                Opacity: {Math.round(opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Preview
              </label>
              <select
                value={backgroundType}
                onChange={(e) => setBackgroundType(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="checkerboard">Checkerboard</option>
                <option value="white">White</option>
                <option value="black">Black</option>
                <option value="gray">Gray</option>
              </select>
            </div>
          </div>

          {/* Preview and Results */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div
                className="h-32 rounded-lg relative flex items-center justify-center text-white text-lg font-medium"
                style={backgrounds[backgroundType]}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: adjustedColor, opacity }}
                />
                <span className="relative z-10">Sample Text</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color Values</h2>
              <div className="space-y-2 text-sm">
                <p>
                  HEX with Alpha: {adjustedColor}
                  <button
                    onClick={() => navigator.clipboard.writeText(adjustedColor)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  RGBA: rgba({rgb.r}, {rgb.g}, {rgb.b}, {opacity.toFixed(2)})
                  <button
                    onClick={() => navigator.clipboard.writeText(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity.toFixed(2)})`)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  HSLA: hsla({hsl.h}, {hsl.s}%, {hsl.l}%, {opacity.toFixed(2)})
                  <button
                    onClick={() => navigator.clipboard.writeText(`hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${opacity.toFixed(2)})`)}
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
          <h2 className="text-lg font-semibold mb-2">About Opacity Adjustment</h2>
          <div className="text-sm text-gray-700">
            <p>Adjust the opacity of a base color and preview it over different backgrounds:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>HEX with Alpha: 8-digit HEX including opacity (e.g., #FF6B6BFF)</li>
              <li>RGBA: RGB with alpha channel (0-1)</li>
              <li>HSLA: HSL with alpha channel (0-1)</li>
            </ul>
            <p className="mt-1">Use the slider to set opacity from 0% (transparent) to 100% (opaque).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorOpacityAdjuster;