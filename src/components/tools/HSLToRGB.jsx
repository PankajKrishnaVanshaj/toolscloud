"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaRandom } from "react-icons/fa";

const HSLToRGB = () => {
  const [hsl, setHsl] = useState({ h: 0, s: 100, l: 50 });
  const [rgb, setRgb] = useState({ r: 255, g: 0, b: 0 });
  const [hex, setHex] = useState("#FF0000");
  const [showSliders, setShowSliders] = useState(true);
  const [contrastColor, setContrastColor] = useState("#000000"); // For text contrast

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

  // Calculate contrast color (black or white) for readability
  const getContrastColor = useCallback((r, g, b) => {
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }, []);

  // Update RGB, HEX, and contrast when HSL changes
  useEffect(() => {
    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHex(newHex);
    setContrastColor(getContrastColor(newRgb.r, newRgb.g, newRgb.b));
  }, [hsl, hslToRgb, rgbToHex, getContrastColor]);

  // Handle HSL input changes
  const handleHslChange = (channel, value) => {
    let numValue;
    if (channel === "h") {
      numValue = Math.max(0, Math.min(360, parseInt(value) || 0));
    } else {
      numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    }
    setHsl((prev) => ({ ...prev, [channel]: numValue }));
  };

  // Randomize HSL values
  const randomizeColor = () => {
    setHsl({
      h: Math.floor(Math.random() * 361),
      s: Math.floor(Math.random() * 101),
      l: Math.floor(Math.random() * 101),
    });
  };

  // Reset to default
  const reset = () => {
    setHsl({ h: 0, s: 100, l: 50 });
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          HSL to RGB Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HSL Input */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">HSL Values</h2>
                <button
                  onClick={() => setShowSliders(!showSliders)}
                  className="text-blue-500 hover:underline text-sm"
                >
                  {showSliders ? "Hide Sliders" : "Show Sliders"}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["h", "s", "l"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {channel === "h" ? "Hue (°)" : channel === "s" ? "Saturation (%)" : "Lightness (%)"}
                    </label>
                    <input
                      type="number"
                      min={channel === "h" ? 0 : 0}
                      max={channel === "h" ? 360 : 100}
                      value={hsl[channel]}
                      onChange={(e) => handleHslChange(channel, e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    {showSliders && (
                      <input
                        type="range"
                        min={channel === "h" ? 0 : 0}
                        max={channel === "h" ? 360 : 100}
                        value={hsl[channel]}
                        onChange={(e) => handleHslChange(channel, e.target.value)}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={randomizeColor}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaRandom className="mr-2" /> Randomize
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* RGB and HEX Output */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Converted Color</h2>
              <div
                className="w-full h-32 rounded-lg shadow-inner mb-4 transition-colors duration-300"
                style={{ backgroundColor: hex }}
              />
              <div className="space-y-3 text-sm" style={{ color: contrastColor }}>
                {[
                  { label: "RGB", value: `${rgb.r}, ${rgb.g}, ${rgb.b}` },
                  { label: "HEX", value: hex },
                  { label: "HSL", value: `${hsl.h}°, ${hsl.s}%, ${hsl.l}%` },
                ].map(({ label, value }) => (
                  <p key={label} className="flex items-center justify-between">
                    <span>
                      {label}: {value}
                    </span>
                    <button
                      onClick={() => copyToClipboard(value)}
                      className="ml-2 p-1 text-blue-500 hover:text-blue-700 transition-colors"
                      title={`Copy ${label}`}
                    >
                      <FaCopy />
                    </button>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert HSL to RGB and HEX</li>
            <li>Interactive sliders and number inputs</li>
            <li>Copy values to clipboard</li>
            <li>Randomize color option</li>
            <li>Dynamic text contrast for readability</li>
            <li>Responsive design with Tailwind CSS</li>
          </ul>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">About HSL to RGB Conversion</h3>
          <div className="text-sm text-gray-700">
            <p>Converts HSL (perceptual color model) to RGB (screen color model):</p>
            <ul className="list-disc ml-5 mt-1">
              <li>HSL: Hue (0-360°), Saturation (0-100%), Lightness (0-100%)</li>
              <li>RGB: Red, Green, Blue (0-255)</li>
              <li>HEX: 6-digit hexadecimal code</li>
            </ul>
            <p className="mt-1">Adjust HSL values to see the corresponding RGB and HEX output in real-time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HSLToRGB;