// app/components/ColorSpaceConverter.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorSpaceConverter = () => {
  const [hex, setHex] = useState('#FF6B6B');
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [xyz, setXyz] = useState({ x: 0, y: 0, z: 0 });
  const [lab, setLab] = useState({ l: 0, a: 0, b: 0 });

  // Conversion Functions
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

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

  const rgbToCmyk = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  const rgbToXyz = (r, g, b) => {
    r = r / 255; g = g / 255; b = b / 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100; g *= 100; b *= 100;
    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
    return { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) };
  };

  const rgbToLab = (r, g, b) => {
    const { x, y, z } = rgbToXyz(r, g, b);
    const refX = 95.047; // D65 illuminant
    const refY = 100.0;
    const refZ = 108.883;

    let X = x / refX; let Y = y / refY; let Z = z / refZ;
    X = X > 0.008856 ? Math.pow(X, 1/3) : (7.787 * X) + (16 / 116);
    Y = Y > 0.008856 ? Math.pow(Y, 1/3) : (7.787 * Y) + (16 / 116);
    Z = Z > 0.008856 ? Math.pow(Z, 1/3) : (7.787 * Z) + (16 / 116);

    const l = (116 * Y) - 16;
    const a = 500 * (X - Y);
    const bLab = 200 * (Y - Z);
    return { l: l.toFixed(2), a: a.toFixed(2), b: bLab.toFixed(2) };
  };

  // Update all color spaces when HEX changes
  useEffect(() => {
    const rgbValue = hexToRgb(hex);
    setRgb(rgbValue);
    setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b));
    setCmyk(rgbToCmyk(rgbValue.r, rgbValue.g, rgbValue.b));
    setXyz(rgbToXyz(rgbValue.r, rgbValue.g, rgbValue.b));
    setLab(rgbToLab(rgbValue.r, rgbValue.g, rgbValue.b));
  }, [hex]);

  // Handle RGB input changes
  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, parseInt(value) || 0)) };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Space Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input and Preview */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HEX Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div
                className="h-32 rounded-lg shadow-inner flex items-center justify-center text-white text-lg font-medium"
                style={{ backgroundColor: hex }}
              >
                {hex}
              </div>
            </div>
          </div>

          {/* Color Spaces */}
          <div className="space-y-4">
            {/* RGB */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2">RGB</h2>
              <div className="grid grid-cols-3 gap-2">
                {['r', 'g', 'b'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">{channel}</label>
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

            {/* HSL */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2">HSL</h2>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm text-gray-600">H</label>
                  <input
                    type="number"
                    value={hsl.h}
                    className="w-full p-1 border rounded bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">S%</label>
                  <input
                    type="number"
                    value={hsl.s}
                    className="w-full p-1 border rounded bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">L%</label>
                  <input
                    type="number"
                    value={hsl.l}
                    className="w-full p-1 border rounded bg-gray-100"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* CMYK */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2">CMYK</h2>
              <div className="grid grid-cols-4 gap-2">
                {['c', 'm', 'y', 'k'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">{channel}%</label>
                    <input
                      type="number"
                      value={cmyk[channel]}
                      className="w-full p-1 border rounded bg-gray-100"
                      disabled
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* XYZ */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2">XYZ</h2>
              <div className="grid grid-cols-3 gap-2">
                {['x', 'y', 'z'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">{channel}</label>
                    <input
                      type="number"
                      value={xyz[channel]}
                      className="w-full p-1 border rounded bg-gray-100"
                      disabled
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Lab */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2">Lab</h2>
              <div className="grid grid-cols-3 gap-2">
                {['l', 'a', 'b'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">{channel}</label>
                    <input
                      type="number"
                      value={lab[channel]}
                      className="w-full p-1 border rounded bg-gray-100"
                      disabled
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">About Color Spaces</h2>
          <div className="text-sm text-gray-700">
            <p>Convert between common color spaces:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>HEX: 6-digit hexadecimal color code</li>
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</li>
              <li>CMYK: Cyan, Magenta, Yellow, Key/Black (0-100%)</li>
              <li>XYZ: CIE 1931 color space</li>
              <li>Lab: CIE L*a*b* perceptual color space</li>
            </ul>
            <p className="mt-1">Edit via HEX or RGB; other spaces update automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSpaceConverter;