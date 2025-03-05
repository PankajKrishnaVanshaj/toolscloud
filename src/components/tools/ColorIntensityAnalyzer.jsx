// app/components/ColorIntensityAnalyzer.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorIntensityAnalyzer = () => {
  const [color, setColor] = useState('#FF6B6B');
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });

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
    r /= 255;
    g /= 255;
    b /= 255;
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

  // Update color analysis when color changes
  useEffect(() => {
    const rgbValues = hexToRgb(color);
    setRgb(rgbValues);
    setHsl(rgbToHsl(rgbValues.r, rgbValues.g, rgbValues.b));
  }, [color]);

  // Progress bar component
  const ProgressBar = ({ value, max, color, label }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Intensity Analyzer
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
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div
              className="h-32 rounded-lg flex items-center justify-center text-white text-lg font-medium shadow-inner"
              style={{ backgroundColor: color }}
            >
              Color Preview
            </div>
          </div>

          {/* Color Analysis */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">RGB Analysis</h2>
              <div className="space-y-3">
                <ProgressBar value={rgb.r} max={255} color="bg-red-500" label="Red" />
                <ProgressBar value={rgb.g} max={255} color="bg-green-500" label="Green" />
                <ProgressBar value={rgb.b} max={255} color="bg-blue-500" label="Blue" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">HSL Analysis</h2>
              <div className="space-y-3">
                <ProgressBar value={hsl.h} max={360} color="bg-purple-500" label="Hue" />
                <ProgressBar value={hsl.s} max={100} color="bg-indigo-500" label="Saturation" />
                <ProgressBar value={hsl.l} max={100} color="bg-gray-500" label="Lightness" />
              </div>
            </div>
          </div>
        </div>

        {/* Color Values */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Color Values</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>RGB: {rgb.r}, {rgb.g}, {rgb.b}</p>
              <p>HEX: {color.toUpperCase()}</p>
            </div>
            <div>
              <p>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</p>
              <p>Intensity: {Math.round((rgb.r + rgb.g + rgb.b) / 7.65)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorIntensityAnalyzer;