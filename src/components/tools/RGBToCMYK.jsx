"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync, FaEyeDropper } from "react-icons/fa";

const RGBToCMYK = () => {
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hex, setHex] = useState("#FF6B6B");
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [history, setHistory] = useState([]);
  const [isPickerActive, setIsPickerActive] = useState(false);

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

  // Convert RGB to CMYK
  const rgbToCmyk = (r, g, b) => {
    r = r / 255;
    g = g / 255;
    b = b / 255;
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

  // Update RGB and save to history
  const handleRgbChange = useCallback(
    (channel, value) => {
      const newValue = Math.max(0, Math.min(255, parseInt(value) || 0));
      const newRgb = { ...rgb, [channel]: newValue };
      setRgb(newRgb);
      setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
      setHistory((prev) => [
        { rgb: newRgb, hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b) },
        ...prev.slice(0, 9),
      ]);
    },
    [rgb]
  );

  // Update HEX
  const handleHexChange = useCallback(
    (value) => {
      setHex(value);
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        const newRgb = hexToRgb(value);
        setRgb(newRgb);
        setHistory((prev) => [
          { rgb: newRgb, hex: value },
          ...prev.slice(0, 9),
        ]);
      }
    },
    []
  );

  // Update CMYK on RGB change
  useEffect(() => {
    const newCmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    setCmyk(newCmyk);
  }, [rgb]);

  // Reset to default
  const reset = () => {
    setRgb({ r: 255, g: 107, b: 107 });
    setHex("#FF6B6B");
    setHistory([]);
  };

  // Color picker simulation (requires browser EyeDropper API support)
  const pickColor = () => {
    if ("EyeDropper" in window) {
      setIsPickerActive(true);
      const eyeDropper = new window.EyeDropper();
      eyeDropper
        .open()
        .then((result) => {
          const newHex = result.sRGBHex;
          handleHexChange(newHex);
        })
        .catch(() => {
          console.log("Color picking cancelled or failed.");
        })
        .finally(() => setIsPickerActive(false));
    } else {
      alert("EyeDropper API is not supported in this browser.");
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          RGB to CMYK Converter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
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
                    placeholder="#FF6B6B"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(hex)}
                    className="p-2 text-gray-600 hover:text-blue-500"
                    title="Copy HEX"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
              <button
                onClick={pickColor}
                disabled={isPickerActive}
                className="mt-6 sm:mt-0 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaEyeDropper className="mr-2" /> Pick Color
              </button>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">RGB Input</h2>
              <div className="space-y-4">
                {["r", "g", "b"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel === "r" ? "Red" : channel === "g" ? "Green" : "Blue"}: {rgb[channel]}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={rgb[channel]}
                      onChange={(e) => handleRgbChange(channel, e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        accentColor:
                          channel === "r" ? "red" : channel === "g" ? "green" : "blue",
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb[channel]}
                      onChange={(e) => handleRgbChange(channel, e.target.value)}
                      className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500 mt-1"
                    />
                  </div>
                ))}
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

          {/* Result Section */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Color Preview</h2>
              <div
                className="w-full h-32 rounded-lg shadow-inner mb-2 transition-colors"
                style={{ backgroundColor: hex }}
              />
              <p className="text-sm text-center">
                HEX: {hex}{" "}
                <button
                  onClick={() => navigator.clipboard.writeText(hex)}
                  className="text-blue-500 hover:underline text-xs"
                >
                  Copy
                </button>
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">CMYK Result</h2>
              <div className="grid grid-cols-2 gap-2">
                {["c", "m", "y", "k"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel === "c"
                        ? "Cyan"
                        : channel === "m"
                        ? "Magenta"
                        : channel === "y"
                        ? "Yellow"
                        : "Black"}{" "}
                      (%)
                    </label>
                    <input
                      type="number"
                      value={cmyk[channel]}
                      className="w-full p-1 border rounded-md bg-gray-100"
                      disabled
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm mt-2">
                CMYK: {cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`
                    )
                  }
                  className="ml-2 text-blue-500 hover:underline text-xs"
                >
                  Copy
                </button>
              </p>
            </div>

            {/* Color History */}
            {history.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Color History</h2>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {history.map((entry, index) => (
                    <div
                      key={index}
                      className="w-10 h-10 rounded cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: entry.hex }}
                      title={`RGB: ${entry.rgb.r}, ${entry.rgb.g}, ${entry.rgb.b}`}
                      onClick={() => {
                        setRgb(entry.rgb);
                        setHex(entry.hex);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Features</h2>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert RGB to CMYK and HEX</li>
            <li>Interactive color picker (EyeDropper API)</li>
            <li>Color history tracking (up to 10 colors)</li>
            <li>Copy HEX and CMYK values to clipboard</li>
            <li>Real-time preview and updates</li>
          </ul>
          
        </div>
      </div>
    </div>
  );
};

export default RGBToCMYK;