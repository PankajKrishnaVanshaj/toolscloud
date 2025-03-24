"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaPalette } from "react-icons/fa";

const HSLToHex = () => {
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 });
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });
  const [hex, setHex] = useState("#FF0000");
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState({ hex: false, rgb: false });

  // Convert HSL to RGB
  const hslToRgb = useCallback((h, s, l) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
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
      b: Math.round((b + m) * 255),
    };
  }, []);

  // Convert RGB to HEX
  const rgbToHex = useCallback((r, g, b) => {
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
  }, []);

  // Update RGB, HEX, and history
  const updateColor = useCallback((newHsl) => {
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setRgb(newRgb);
    setHex(newHex);
    setHistory((prev) => {
      const newEntry = { hsl: newHsl, hex: newHex };
      return [newEntry, ...prev.filter((item) => item.hex !== newHex)].slice(0, 5); // Keep last 5 unique colors
    });
  }, [hslToRgb, rgbToHex]);

  useEffect(() => {
    updateColor(hsl);
  }, [hsl, updateColor]);

  // Handle HSL input changes
  const handleHslChange = (channel) => (e) => {
    const value = parseInt(e.target.value) || 0;
    const numValue = channel === "h" ? Math.max(0, Math.min(360, value)) : Math.max(0, Math.min(100, value));
    setHsl((prev) => ({ ...prev, [channel]: numValue }));
  };

  // Copy to clipboard
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 1500);
  };

  // Reset to default
  const reset = () => {
    setHsl({ h: 0, s: 100, l: 50 });
    setHistory([]);
  };

  // Select from history
  const selectFromHistory = (color) => {
    setHsl(color.hsl);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FaPalette className="mr-2" /> HSL to HEX Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HSL Input */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-gray-700">HSL Values</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["h", "s", "l"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel === "h" ? "Hue (°)" : channel === "s" ? "Saturation (%)" : "Lightness (%)"}
                    </label>
                    <input
                      type="number"
                      min={channel === "h" ? 0 : 0}
                      max={channel === "h" ? 360 : 100}
                      value={hsl[channel]}
                      onChange={handleHslChange(channel)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="range"
                      min={channel === "h" ? 0 : 0}
                      max={channel === "h" ? 360 : 100}
                      value={hsl[channel]}
                      onChange={handleHslChange(channel)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Color History</h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => selectFromHistory(color)}
                      className="w-10 h-10 rounded-full shadow-sm hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.hex }}
                      title={`HSL: ${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}% - HEX: ${color.hex}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* HEX and RGB Output */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Converted Color</h2>
              <div
                className="w-full h-32 rounded-lg shadow-inner mb-4 transition-colors"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-3 text-sm">
                <p className="flex items-center">
                  HEX: {hex}
                  <button
                    onClick={() => copyToClipboard(hex, "hex")}
                    className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaCopy /> {copied.hex ? "Copied!" : "Copy"}
                  </button>
                </p>
                <p className="flex items-center">
                  RGB: {rgb.r}, {rgb.g}, {rgb.b}
                  <button
                    onClick={() => copyToClipboard(`${rgb.r}, ${rgb.g}, ${rgb.b}`, "rgb")}
                    className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <FaCopy /> {copied.rgb ? "Copied!" : "Copy"}
                  </button>
                </p>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={reset}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Info and Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">About HSL to HEX Conversion</h2>
          <div className="text-sm text-blue-600 space-y-2">
            <p>Convert HSL (Hue, Saturation, Lightness) to HEX and RGB color formats:</p>
            <ul className="list-disc ml-5">
              <li>Hue: 0-360° (color wheel)</li>
              <li>Saturation: 0-100% (color intensity)</li>
              <li>Lightness: 0-100% (brightness)</li>
            </ul>
            <p>Features:</p>
            <ul className="list-disc ml-5">
              <li>Interactive sliders and number inputs</li>
              <li>Real-time color preview</li>
              <li>Copy HEX or RGB to clipboard</li>
              <li>Color history (last 5 unique colors)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HSLToHex;