// app/components/ColorLuminanceCalculator.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorLuminanceCalculator = () => {
  const [color, setColor] = useState('#FF6B6B');
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [luminance, setLuminance] = useState(0);
  const [adjustment, setAdjustment] = useState(0);

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
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Calculate relative luminance (WCAG formula)
  const calculateLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Adjust color brightness
  const adjustBrightness = (r, g, b, factor) => {
    const adjust = (value) => {
      return Math.round(value * (1 + factor));
    };
    return {
      r: adjust(r),
      g: adjust(g),
      b: adjust(b)
    };
  };

  useEffect(() => {
    const baseRgb = hexToRgb(color);
    setRgb(baseRgb);
    const adjustedRgb = adjustBrightness(baseRgb.r, baseRgb.g, baseRgb.b, adjustment);
    setLuminance(calculateLuminance(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b));
  }, [color, adjustment]);

  const adjustedColor = rgbToHex(
    adjustBrightness(rgb.r, rgb.g, rgb.b, adjustment).r,
    adjustBrightness(rgb.r, rgb.g, rgb.b, adjustment).g,
    adjustBrightness(rgb.r, rgb.g, rgb.b, adjustment).b
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Luminance Calculator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Input and Adjustment */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Color
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
                Brightness Adjustment: {Math.round(adjustment * 100)}%
              </label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={adjustment}
                onChange={(e) => setAdjustment(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* RGB Values */}
            <div>
              <h2 className="text-lg font-semibold mb-2">RGB Values</h2>
              <div className="grid grid-cols-3 gap-2">
                {['r', 'g', 'b'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}
                    </label>
                    <input
                      type="number"
                      value={adjustBrightness(rgb.r, rgb.g, rgb.b, adjustment)[channel]}
                      className="w-full p-1 border rounded bg-gray-100"
                      disabled
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview and Results */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Color Preview</h2>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Original</p>
                  <div
                    className="h-24 rounded-lg shadow-inner"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Adjusted</p>
                  <div
                    className="h-24 rounded-lg shadow-inner"
                    style={{ backgroundColor: adjustedColor }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Luminance Analysis</h2>
              <div className="space-y-2 text-sm">
                <p>Relative Luminance: {luminance.toFixed(4)}</p>
                <p>Adjusted HEX: {adjustedColor.toUpperCase()}
                  <button
                    onClick={() => navigator.clipboard.writeText(adjustedColor)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${luminance * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  (0 = pure black, 1 = pure white)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorLuminanceCalculator;