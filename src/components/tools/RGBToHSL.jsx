// app/components/RGBToHSL.jsx
'use client';

import React, { useState, useEffect } from 'react';

const RGBToHSL = () => {
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [hex, setHex] = useState('#FF6B6B');

  // Convert RGB to HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // Achromatic
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

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Update HSL and HEX when RGB changes
  useEffect(() => {
    const newHsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setHsl(newHsl);
    setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
  }, [rgb]);

  // Handle RGB input changes
  const handleRgbChange = (channel, value) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    setRgb(prev => ({ ...prev, [channel]: numValue }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          RGB to HSL Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RGB Input */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">RGB Values</h2>
              <div className="grid grid-cols-3 gap-4">
                {['r', 'g', 'b'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel === 'r' ? 'Red' : channel === 'g' ? 'Green' : 'Blue'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb[channel]}
                      onChange={(e) => handleRgbChange(channel, e.target.value)}
                      className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* HSL and HEX Output */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Converted Color</h2>
              <div
                className="w-full h-24 rounded-lg shadow-inner mb-2"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-2 text-sm">
                <p>
                  HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%
                  <button
                    onClick={() => navigator.clipboard.writeText(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  RGB: {rgb.r}, {rgb.g}, {rgb.b}
                  <button
                    onClick={() => navigator.clipboard.writeText(`${rgb.r}, ${rgb.g}, ${rgb.b}`)}
                    className="ml-2 text-blue-500 hover:underline text-xs"
                  >
                    Copy
                  </button>
                </p>
                <p>
                  HEX: {hex}
                  <button
                    onClick={() => navigator.clipboard.writeText(hex)}
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
          <h2 className="text-lg font-semibold mb-2">About RGB to HSL Conversion</h2>
          <div className="text-sm text-gray-700">
            <p>Converts RGB (screen color model) to HSL (perceptual color model):</p>
            <ul className="list-disc ml-5 mt-1">
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</li>
              <li>HEX: 6-digit hexadecimal code</li>
            </ul>
            <p className="mt-1">Adjust RGB values to see the corresponding HSL and HEX output.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RGBToHSL;