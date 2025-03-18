"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const ColorSpaceConverter = () => {
  const [hex, setHex] = useState("#FF6B6B");
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [xyz, setXyz] = useState({ x: 0, y: 0, z: 0 });
  const [lab, setLab] = useState({ l: 0, a: 0, b: 0 });
  const [notification, setNotification] = useState("");

  // Conversion Functions
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  };

  const rgbToCmyk = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  };

  const cmykToRgb = (c, m, y, k) => {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  };

  const rgbToXyz = (r, g, b) => {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100;
    g *= 100;
    b *= 100;
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

    let X = x / refX;
    let Y = y / refY;
    let Z = z / refZ;
    X = X > 0.008856 ? Math.pow(X, 1 / 3) : 7.787 * X + 16 / 116;
    Y = Y > 0.008856 ? Math.pow(Y, 1 / 3) : 7.787 * Y + 16 / 116;
    Z = Z > 0.008856 ? Math.pow(Z, 1 / 3) : 7.787 * Z + 16 / 116;

    const l = 116 * Y - 16;
    const a = 500 * (X - Y);
    const bLab = 200 * (Y - Z);
    return { l: l.toFixed(2), a: a.toFixed(2), b: bLab.toFixed(2) };
  };

  // Update all color spaces
  const updateAllFromRgb = useCallback((newRgb) => {
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    setXyz(rgbToXyz(newRgb.r, newRgb.g, newRgb.b));
    setLab(rgbToLab(newRgb.r, newRgb.g, newRgb.b));
  }, []);

  useEffect(() => {
    updateAllFromRgb(rgb);
  }, []); // Initial update

  // Handle input changes
  const handleHexChange = (value) => {
    if (/^#?([a-f\d]{6})$/i.test(value) || value === "#") {
      setHex(value);
      if (value.length === 7) {
        updateAllFromRgb(hexToRgb(value));
      }
    }
  };

  const handleRgbChange = (channel, value) => {
    const newRgb = {
      ...rgb,
      [channel]: Math.max(0, Math.min(255, parseInt(value) || 0)),
    };
    updateAllFromRgb(newRgb);
  };

  const handleHslChange = (channel, value) => {
    const newHsl = {
      ...hsl,
      [channel]:
        channel === "h"
          ? Math.max(0, Math.min(360, parseInt(value) || 0))
          : Math.max(0, Math.min(100, parseInt(value) || 0)),
    };
    setHsl(newHsl);
    updateAllFromRgb(hslToRgb(newHsl.h, newHsl.s, newHsl.l));
  };

  const handleCmykChange = (channel, value) => {
    const newCmyk = {
      ...cmyk,
      [channel]: Math.max(0, Math.min(100, parseInt(value) || 0)),
    };
    setCmyk(newCmyk);
    updateAllFromRgb(cmykToRgb(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k));
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setNotification(`Copied ${text} to clipboard!`);
    setTimeout(() => setNotification(""), 2000);
  };

  // Reset to default
  const reset = () => {
    const defaultRgb = { r: 255, g: 107, b: 107 };
    setHex("#FF6B6B");
    updateAllFromRgb(defaultRgb);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Space Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  maxLength={7}
                />
                <button
                  onClick={() => copyToClipboard(hex)}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Copy HEX"
                >
                  <FaCopy />
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Preview</h2>
              <div
                className="h-40 rounded-lg shadow-inner flex items-center justify-center text-white text-lg font-medium transition-colors"
                style={{ backgroundColor: hex }}
              >
                {hex}
              </div>
            </div>

            <button
              onClick={reset}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Color Spaces */}
          <div className="space-y-4">
            {/* RGB */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2 flex items-center justify-between">
                RGB
                <button
                  onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                  className="text-gray-600 hover:text-blue-600"
                  title="Copy RGB"
                >
                  <FaCopy />
                </button>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {["r", "g", "b"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb[channel]}
                      onChange={(e) => handleRgbChange(channel, e.target.value)}
                      className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* HSL */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2 flex items-center justify-between">
                HSL
                <button
                  onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                  className="text-gray-600 hover:text-blue-600"
                  title="Copy HSL"
                >
                  <FaCopy />
                </button>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {["h", "s", "l"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600">
                      {channel}
                      {channel !== "h" ? "%" : "°"}
                    </label>
                    <input
                      type="number"
                      min={channel === "h" ? 0 : 0}
                      max={channel === "h" ? 360 : 100}
                      value={hsl[channel]}
                      onChange={(e) => handleHslChange(channel, e.target.value)}
                      className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CMYK */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2 flex items-center justify-between">
                CMYK
                <button
                  onClick={() =>
                    copyToClipboard(
                      `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
                    )
                  }
                  className="text-gray-600 hover:text-blue-600"
                  title="Copy CMYK"
                >
                  <FaCopy />
                </button>
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {["c", "m", "y", "k"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}%
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={cmyk[channel]}
                      onChange={(e) => handleCmykChange(channel, e.target.value)}
                      className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* XYZ */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2 flex items-center justify-between">
                XYZ
                <button
                  onClick={() =>
                    copyToClipboard(`xyz(${xyz.x}, ${xyz.y}, ${xyz.z})`)
                  }
                  className="text-gray-600 hover:text-blue-600"
                  title="Copy XYZ"
                >
                  <FaCopy />
                </button>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {["x", "y", "z"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}
                    </label>
                    <input
                      type="number"
                      value={xyz[channel]}
                      className="w-full p-1 border rounded-md bg-gray-100"
                      disabled
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Lab */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-md font-semibold mb-2 flex items-center justify-between">
                Lab
                <button
                  onClick={() =>
                    copyToClipboard(`lab(${lab.l}, ${lab.a}, ${lab.b})`)
                  }
                  className="text-gray-600 hover:text-blue-600"
                  title="Copy Lab"
                >
                  <FaCopy />
                </button>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {["l", "a", "b"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}
                    </label>
                    <input
                      type="number"
                      value={lab[channel]}
                      className="w-full p-1 border rounded-md bg-gray-100"
                      disabled
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded-md text-center">
            {notification}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-2 text-blue-700">About Color Spaces</h2>
          <div className="text-sm text-blue-600">
            <p>Convert between common color spaces:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>HEX: 6-digit hexadecimal color code</li>
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</li>
              <li>CMYK: Cyan, Magenta, Yellow, Key/Black (0-100%)</li>
              <li>XYZ: CIE 1931 color space</li>
              <li>Lab: CIE L*a*b* perceptual color space</li>
            </ul>
            <p className="mt-2">
              Edit via HEX, RGB, HSL, or CMYK; other spaces update automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorSpaceConverter;