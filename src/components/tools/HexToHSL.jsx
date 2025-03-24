"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const HexToHSL = () => {
  const [hex, setHex] = useState("#FF6B6B");
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [mode, setMode] = useState("hex"); // hex, rgb, hsl
  const [error, setError] = useState("");

  // Convert HEX to RGB
  const hexToRgb = useCallback((hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }, []);

  // Convert RGB to HSL
  const rgbToHsl = useCallback((r, g, b) => {
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
  }, []);

  // Convert HSL to RGB
  const hslToRgb = useCallback((h, s, l) => {
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
  }, []);

  // Convert RGB to HEX
  const rgbToHex = useCallback((r, g, b) => {
    return `#${[r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")}`;
  }, []);

  // Update conversions based on input mode
  useEffect(() => {
    setError("");
    if (mode === "hex" && /^#[0-9A-Fa-f]{6}$/.test(hex)) {
      const newRgb = hexToRgb(hex);
      setRgb(newRgb);
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    } else if (mode === "rgb") {
      if (rgb.r >= 0 && rgb.r <= 255 && rgb.g >= 0 && rgb.g <= 255 && rgb.b >= 0 && rgb.b <= 255) {
        setHsl(rgbToHsl(rgb.r, rgb.g, rgb.b));
        setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
      } else {
        setError("RGB values must be between 0 and 255");
      }
    } else if (mode === "hsl") {
      if (hsl.h >= 0 && hsl.h <= 360 && hsl.s >= 0 && hsl.s <= 100 && hsl.l >= 0 && hsl.l <= 100) {
        const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      } else {
        setError("HSL: H (0-360), S (0-100), L (0-100)");
      }
    }
  }, [hex, rgb, hsl, mode, hexToRgb, rgbToHsl, hslToRgb, rgbToHex]);

  // Input handlers
  const handleHexChange = (value) => setHex(value.toUpperCase());
  const handleRgbChange = (key) => (e) =>
    setRgb((prev) => ({ ...prev, [key]: parseInt(e.target.value) || 0 }));
  const handleHslChange = (key) => (e) =>
    setHsl((prev) => ({ ...prev, [key]: parseInt(e.target.value) || 0 }));

  // Reset to default
  const reset = () => {
    setHex("#FF6B6B");
    setRgb({ r: 255, g: 107, b: 107 });
    setHsl({ h: 0, s: 100, l: 71 });
    setMode("hex");
    setError("");
  };

  // Copy to clipboard
  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Converter (HEX ⇄ RGB ⇄ HSL)
        </h1>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Input Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full sm:w-40 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {mode === "hex" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HEX Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border-none"
                  />
                  <input
                    type="text"
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="#FF6B6B"
                  />
                </div>
              </div>
            )}
            {mode === "rgb" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">RGB Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {["r", "g", "b"].map((key) => (
                    <input
                      key={key}
                      type="number"
                      min="0"
                      max="255"
                      value={rgb[key]}
                      onChange={handleRgbChange(key)}
                      placeholder={key.toUpperCase()}
                      className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
              </div>
            )}
            {mode === "hsl" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">HSL Color</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={handleHslChange("h")}
                    placeholder="H"
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={handleHslChange("s")}
                    placeholder="S"
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={handleHslChange("l")}
                    placeholder="L"
                    className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={reset}
              className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Converted Color</h2>
              <div
                className="w-full h-32 rounded-lg shadow-inner mb-4"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-2 text-sm">
                <p className="flex items-center justify-between">
                  HSL: {hsl.h}°, {hsl.s}%, {hsl.l}%
                  <button
                    onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <FaCopy /> Copy
                  </button>
                </p>
                <p className="flex items-center justify-between">
                  RGB: {rgb.r}, {rgb.g}, {rgb.b}
                  <button
                    onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <FaCopy /> Copy
                  </button>
                </p>
                <p className="flex items-center justify-between">
                  HEX: {hex}
                  <button
                    onClick={() => copyToClipboard(hex)}
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <FaCopy /> Copy
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">About Color Conversion</h2>
          <div className="text-sm text-blue-600">
            <p>Convert between HEX, RGB, and HSL color formats:</p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>HEX: 6-digit hexadecimal code (e.g., #FF6B6B)</li>
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</li>
            </ul>
            <p className="mt-1">
              Select an input mode, enter values, and see real-time conversions with a color preview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HexToHSL;