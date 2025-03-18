"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaRandom } from "react-icons/fa";

const RGBToHex = () => {
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hex, setHex] = useState("#FF6B6B");
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [inputMode, setInputMode] = useState("rgb");

  // Convert RGB to HEX
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

  // Convert RGB to HSL
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
      h = s = 0; // Achromatic
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
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  // Convert RGB to CMYK
  const rgbToCmyk = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  };

  // Convert HEX to RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  // Convert HSL to RGB
  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // Achromatic
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

  // Update all color formats based on current input
  const updateColors = useCallback(() => {
    let newRgb = rgb;
    if (inputMode === "hex") {
      newRgb = hexToRgb(hex);
      setRgb(newRgb);
    } else if (inputMode === "hsl") {
      newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
      setRgb(newRgb);
    }
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
  }, [rgb, hex, hsl, inputMode]);

  useEffect(() => {
    updateColors();
  }, [rgb, updateColors]);

  // Handle input changes
  const handleRgbChange = (channel, value) => {
    const numValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    setRgb((prev) => ({ ...prev, [channel]: numValue }));
  };

  const handleHexChange = (value) => {
    const validHex = /^#?[0-9A-Fa-f]{0,6}$/.test(value) ? value : hex;
    setHex(validHex.startsWith("#") ? validHex : "#" + validHex);
  };

  const handleHslChange = (channel, value) => {
    const limits = { h: 360, s: 100, l: 100 };
    const numValue = Math.max(0, Math.min(limits[channel], parseInt(value) || 0));
    setHsl((prev) => ({ ...prev, [channel]: numValue }));
  };

  // Random color generator
  const generateRandomColor = () => {
    const newRgb = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
    setRgb(newRgb);
  };

  // Reset to default
  const reset = () => {
    setRgb({ r: 255, g: 107, b: 107 });
    setInputMode("rgb");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Converter
        </h1>

        {/* Input Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Mode
          </label>
          <select
            value={inputMode}
            onChange={(e) => setInputMode(e.target.value)}
            className="w-full sm:w-48 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="rgb">RGB</option>
            <option value="hex">HEX</option>
            <option value="hsl">HSL</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Input */}
          <div className="space-y-6">
            {inputMode === "rgb" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">RGB Values</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["r", "g", "b"].map((channel) => (
                    <div key={channel}>
                      <label className="block text-sm text-gray-600 capitalize">
                        {channel === "r" ? "Red" : channel === "g" ? "Green" : "Blue"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        value={rgb[channel]}
                        onChange={(e) => handleRgbChange(channel, e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={rgb[channel]}
                        onChange={(e) => handleRgbChange(channel, e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {inputMode === "hex" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">HEX Value</h2>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  onBlur={updateColors}
                  maxLength={7}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="#FF6B6B"
                />
              </div>
            )}
            {inputMode === "hsl" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">HSL Values</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["h", "s", "l"].map((channel) => (
                    <div key={channel}>
                      <label className="block text-sm text-gray-600 capitalize">
                        {channel === "h" ? "Hue" : channel === "s" ? "Saturation" : "Lightness"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={channel === "h" ? 360 : 100}
                        value={hsl[channel]}
                        onChange={(e) => handleHslChange(channel, e.target.value)}
                        onBlur={updateColors}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="range"
                        min="0"
                        max={channel === "h" ? 360 : 100}
                        value={hsl[channel]}
                        onChange={(e) => handleHslChange(channel, e.target.value)}
                        onMouseUp={updateColors}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={generateRandomColor}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaRandom className="mr-2" /> Random
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Color Output */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color Preview</h2>
              <div
                className="w-full h-32 rounded-lg shadow-inner mb-4 transition-colors duration-300"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-2 text-sm">
                {[
                  { label: "HEX", value: hex },
                  { label: "RGB", value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
                  { label: "HSL", value: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` },
                  { label: "CMYK", value: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%` },
                ].map(({ label, value }) => (
                  <p key={label} className="flex items-center justify-between">
                    <span>
                      {label}: {value}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(value)}
                      className="text-blue-500 hover:underline text-xs flex items-center gap-1"
                    >
                      <FaCopy /> Copy
                    </button>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">About Color Conversion</h2>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>RGB: Red, Green, Blue (0-255) - Screen colors</li>
            <li>HEX: 6-digit hexadecimal code - Web standard</li>
            <li>HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%) - Intuitive model</li>
            <li>CMYK: Cyan, Magenta, Yellow, Key/Black (0-100%) - Print colors</li>
            <li>Switch input modes and adjust values to convert between formats</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RGBToHex;