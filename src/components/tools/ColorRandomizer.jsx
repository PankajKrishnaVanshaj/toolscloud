// app/components/ColorRandomizer.jsx
'use client';

import React, { useState } from 'react';

const ColorRandomizer = () => {
  const [color, setColor] = useState('#FF6B6B');
  const [history, setHistory] = useState([]);
  const [randomizeOptions, setRandomizeOptions] = useState({
    hue: true,
    saturation: true,
    lightness: true
  });

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
    return { h: h * 360, s, l };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h = (h % 360 + 360) % 360; // Ensure hue is within 0-360
    h /= 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
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

  // Generate random color
  const generateRandomColor = () => {
    const currentHsl = rgbToHsl(...Object.values(hexToRgb(color)));
    const newHsl = {
      h: randomizeOptions.hue ? Math.random() * 360 : currentHsl.h,
      s: randomizeOptions.saturation ? Math.random() : currentHsl.s,
      l: randomizeOptions.lightness ? Math.random() : currentHsl.l
    };
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setColor(newHex);
    setHistory([newHex, ...history.slice(0, 9)]); // Keep last 10 colors
  };

  // Handle checkbox changes
  const handleOptionChange = (option) => {
    setRandomizeOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Randomizer
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls and Preview */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Current Color</h2>
              <div
                className="h-32 rounded-lg shadow-inner flex items-center justify-center text-white text-lg font-medium"
                style={{ backgroundColor: color }}
              >
                {color}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Randomize Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={randomizeOptions.hue}
                    onChange={() => handleOptionChange('hue')}
                    className="rounded"
                  />
                  Hue
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={randomizeOptions.saturation}
                    onChange={() => handleOptionChange('saturation')}
                    className="rounded"
                  />
                  Saturation
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={randomizeOptions.lightness}
                    onChange={() => handleOptionChange('lightness')}
                    className="rounded"
                  />
                  Lightness
                </label>
              </div>
            </div>

            <button
              onClick={generateRandomColor}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Generate Random Color
            </button>
          </div>

          {/* Color Details and History */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color Details</h2>
              <div className="space-y-2 text-sm">
                <p>
                  HEX: {color}
                  <button
                    onClick={() => navigator.clipboard.writeText(color)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>RGB: {rgb.r}, {rgb.g}, {rgb.b}</p>
                <p>HSL: {Math.round(hsl.h)}°, {Math.round(hsl.s * 100)}%, {Math.round(hsl.l * 100)}%</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color History</h2>
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">No colors generated yet</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-40 overflow-y-auto">
                  {history.map((histColor, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-12 h-12 rounded shadow cursor-pointer"
                        style={{ backgroundColor: histColor }}
                        onClick={() => setColor(histColor)}
                      />
                      <p className="text-xs mt-1">{histColor}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Color Randomizer</h2>
          <div className="text-sm text-gray-700">
            <p>Generate random colors with customizable options:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Check boxes to randomize Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</li>
              <li>Uncheck to keep current value for that component</li>
              <li>History keeps the last 10 generated colors</li>
            </ul>
            <p className="mt-1">Click a history color to set it as the current color.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorRandomizer;