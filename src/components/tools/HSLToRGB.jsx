// app/components/HSLToRGB.jsx
'use client';

import React, { useState, useEffect } from 'react';

const HSLToRGB = () => {
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 });
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hex, setHex] = useState('#FF0000');

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s; // Chroma
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
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
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // Update RGB and HEX when HSL changes
  useEffect(() => {
    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  }, [hsl]);

  // Handle HSL input changes
  const handleHslChange = (channel, value) => {
    let numValue;
    if (channel === 'h') {
      numValue = Math.max(0, Math.min(360, parseInt(value) || 0));
    } else {
      numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    }
    setHsl(prev => ({ ...prev, [channel]: numValue }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          HSL to RGB Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HSL Input */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">HSL Values</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Hue (°)</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={(e) => handleHslChange('h', e.target.value)}
                    className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Saturation (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={(e) => handleHslChange('s', e.target.value)}
                    className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Lightness (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) => handleHslChange('l', e.target.value)}
                    className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RGB and HEX Output */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Converted Color</h2>
              <div
                className="w-full h-24 rounded-lg shadow-inner mb-2"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-2 text-sm">
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
                <p>
                  HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%
                  <button
                    onClick={() => navigator.clipboard.writeText(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`)}
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
          <h2 className="text-lg font-semibold mb-2">About HSL to RGB Conversion</h2>
          <div className="text-sm text-gray-700">
            <p>Converts HSL (perceptual color model) to RGB (screen color model):</p>
            <ul className="list-disc ml-5 mt-1">
              <li>HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</li>
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>HEX: 6-digit hexadecimal code</li>
            </ul>
            <p className="mt-1">Adjust HSL values to see the corresponding RGB and HEX output.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HSLToRGB;