"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaRandom } from "react-icons/fa";

const RGBToHSL = () => {
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [hex, setHex] = useState("#FF6B6B");
  const [inputMode, setInputMode] = useState("rgb"); // rgb, hsl, or hex
  const [history, setHistory] = useState([]);

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

  // Convert RGB to HEX
  const rgbToHex = (r, g, b) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
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

  // Convert HEX to RGB
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

  // Update all color formats
  const updateColors = useCallback((newRgb) => {
    const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setRgb(newRgb);
    setHsl(newHsl);
    setHex(newHex);
    setHistory((prev) => [...prev, { rgb: newRgb, hsl: newHsl, hex: newHex }].slice(-5));
  }, []);

  useEffect(() => {
    updateColors(rgb);
  }, []); // Initial update

  // Handle input changes
  const handleChange = (type, values) => {
    let newRgb;
    switch (type) {
      case "rgb":
        newRgb = {
          r: Math.max(0, Math.min(255, parseInt(values.r) || 0)),
          g: Math.max(0, Math.min(255, parseInt(values.g) || 0)),
          b: Math.max(0, Math.min(255, parseInt(values.b) || 0)),
        };
        break;
      case "hsl":
        newRgb = hslToRgb(
          Math.max(0, Math.min(360, parseInt(values.h) || 0)),
          Math.max(0, Math.min(100, parseInt(values.s) || 0)),
          Math.max(0, Math.min(100, parseInt(values.l) || 0))
        );
        break;
      case "hex":
        newRgb = hexToRgb(values.hex);
        break;
    }
    updateColors(newRgb);
  };

  // Random color generator
  const generateRandomColor = () => {
    const newRgb = {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
    updateColors(newRgb);
  };

  // Reset to default
  const reset = () => {
    updateColors({ r: 255, g: 107, b: 107 });
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
            className="w-full sm:w-40 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
            <option value="hex">HEX</option>
          </select>
        </div>

        {/* Input and Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {inputMode === "rgb" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">RGB Input</h2>
                <div className="grid grid-cols-3 gap-4">
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
                        onChange={(e) =>
                          handleChange("rgb", { ...rgb, [channel]: e.target.value })
                        }
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {inputMode === "hsl" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">HSL Input</h2>
                <div className="grid grid-cols-3 gap-4">
                  {["h", "s", "l"].map((channel) => (
                    <div key={channel}>
                      <label className="block text-sm text-gray-600 capitalize">
                        {channel === "h" ? "Hue" : channel === "s" ? "Saturation" : "Lightness"}
                      </label>
                      <input
                        type="number"
                        min={channel === "h" ? 0 : 0}
                        max={channel === "h" ? 360 : 100}
                        value={hsl[channel]}
                        onChange={(e) =>
                          handleChange("hsl", { ...hsl, [channel]: e.target.value })
                        }
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {inputMode === "hex" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">HEX Input</h2>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleChange("hex", { hex: e.target.value })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="#RRGGBB"
                />
              </div>
            )}

            {/* Actions */}
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

          {/* Output Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color Preview</h2>
              <div
                className="w-full h-32 rounded-lg shadow-inner mb-4 transition-colors duration-300"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-2 text-sm">
                {[
                  { label: "RGB", value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
                  { label: "HSL", value: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` },
                  { label: "HEX", value: hex },
                ].map(({ label, value }) => (
                  <p key={label}>
                    {label}: {value}
                    <button
                      onClick={() => navigator.clipboard.writeText(value)}
                      className="ml-2 text-blue-500 hover:underline text-xs"
                    >
                      <FaCopy className="inline mr-1" /> Copy
                    </button>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Color History (Last 5)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => updateColors(entry.rgb)}
                  >
                    <div
                      className="w-12 h-12 rounded-full shadow-inner hover:scale-110 transition-transform"
                      style={{ backgroundColor: entry.hex }}
                    />
                    <span className="text-xs text-gray-600 mt-1">{entry.hex}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-2 text-blue-700">About Color Conversion</h2>
          <div className="text-sm text-blue-600">
            <p>Convert between RGB, HSL, and HEX color formats:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</li>
              <li>HEX: 6-digit hexadecimal code (#RRGGBB)</li>
            </ul>
            <p className="mt-1">
              Use the input mode selector to enter values in your preferred format.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RGBToHSL;