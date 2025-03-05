// app/components/ColorProfileConverter.jsx
'use client';

import React, { useState, useEffect } from 'react';

const ColorProfileConverter = () => {
  const [hex, setHex] = useState('#FF6B6B');
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });

  // Color conversion functions
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
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
    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }
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

  // Update all color profiles when hex changes
  useEffect(() => {
    const rgbValues = hexToRgb(hex);
    setRgb(rgbValues);
    setHsl(rgbToHsl(rgbValues.r, rgbValues.g, rgbValues.b));
    setCmyk(rgbToCmyk(rgbValues.r, rgbValues.g, rgbValues.b));
  }, [hex]);

  // Handle input changes
  const handleRgbChange = (channel, value) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, value)) };
    setRgb(newRgb);
    setHex(rgbToHex(newRgb));
  };

  const rgbToHex = ({ r, g, b }) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Color Profile Converter
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Color Preview and HEX Input */}
          <div className="space-y-4">
            <div
              className="h-40 rounded-lg flex items-center justify-center text-white text-lg font-medium shadow-inner"
              style={{ backgroundColor: hex }}
            >
              Color Preview
            </div>
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
          </div>

          {/* Color Profile Inputs */}
          <div className="space-y-4">
            {/* RGB */}
            <div>
              <h2 className="text-lg font-semibold mb-2">RGB</h2>
              <div className="grid grid-cols-3 gap-2">
                {['r', 'g', 'b'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb[channel]}
                      onChange={(e) => handleRgbChange(channel, parseInt(e.target.value))}
                      className="w-full p-1 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* HSL */}
            <div>
              <h2 className="text-lg font-semibold mb-2">HSL</h2>
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
                  <label className="block text-sm text-gray-600">S</label>
                  <input
                    type="number"
                    value={hsl.s}
                    className="w-full p-1 border rounded bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">L</label>
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
            <div>
              <h2 className="text-lg font-semibold mb-2">CMYK</h2>
              <div className="grid grid-cols-4 gap-2">
                {['c', 'm', 'y', 'k'].map(channel => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}
                    </label>
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
          </div>
        </div>

        {/* Color Values Display */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Color Values</h2>
          <div className="space-y-2 text-sm">
            <p>HEX: {hex.toUpperCase()}</p>
            <p>RGB: {rgb.r}, {rgb.g}, {rgb.b}</p>
            <p>HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%</p>
            <p>CMYK: {cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorProfileConverter;