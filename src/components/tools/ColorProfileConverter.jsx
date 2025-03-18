"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaCopy, FaSync } from "react-icons/fa";

const ColorProfileConverter = () => {
  const [hex, setHex] = useState("#FF6B6B");
  const [rgb, setRgb] = useState({ r: 255, g: 107, b: 107 });
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });
  const [inputMode, setInputMode] = useState("hex"); // hex, rgb, hsl, cmyk

  // Color conversion functions
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

  const rgbToHex = ({ r, g, b }) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.max(0, Math.min(255, x)).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
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

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
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

    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
    };
  };

  // Update all color profiles
  const updateColors = useCallback(
    (source, values) => {
      let newRgb;
      switch (source) {
        case "hex":
          newRgb = hexToRgb(values);
          break;
        case "rgb":
          newRgb = values;
          break;
        case "hsl":
          newRgb = hslToRgb(values.h, values.s, values.l);
          break;
        case "cmyk":
          newRgb = cmykToRgb(values.c, values.m, values.y, values.k);
          break;
        default:
          return;
      }
      setRgb(newRgb);
      setHex(rgbToHex(newRgb));
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
      setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    },
    []
  );

  useEffect(() => {
    if (inputMode === "hex") updateColors("hex", hex);
  }, [hex, inputMode, updateColors]);

  // Handle input changes
  const handleChange = (mode, values) => {
    setInputMode(mode);
    updateColors(mode, values);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`${text} copied to clipboard!`);
  };

  const reset = () => {
    setHex("#FF6B6B");
    setInputMode("hex");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Color Profile Converter
          </h1>
          <button
            onClick={reset}
            className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Preview and Input Mode Selector */}
          <div className="space-y-6">
            <div
              className="h-48 rounded-lg flex items-center justify-center text-white text-lg font-medium shadow-inner transition-colors"
              style={{ backgroundColor: hex }}
            >
              Color Preview
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Mode
              </label>
              <select
                value={inputMode}
                onChange={(e) => setInputMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
                <option value="cmyk">CMYK</option>
              </select>
            </div>
          </div>

          {/* Color Profile Inputs */}
          <div className="space-y-6">
            {/* HEX */}
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                HEX
                <button
                  onClick={() => copyToClipboard(hex.toUpperCase())}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <FaCopy />
                </button>
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleChange("hex", e.target.value)}
                  className="w-12 h-12 rounded cursor-pointer"
                  disabled={inputMode !== "hex"}
                />
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleChange("hex", e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                  disabled={inputMode !== "hex"}
                />
              </div>
            </div>

            {/* RGB */}
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                RGB
                <button
                  onClick={() => copyToClipboard(`${rgb.r}, ${rgb.g}, ${rgb.b}`)}
                  className="p-1 text-gray-500 hover:text-gray-700"
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
                      onChange={(e) =>
                        handleChange("rgb", {
                          ...rgb,
                          [channel]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                      disabled={inputMode !== "rgb"}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* HSL */}
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                HSL
                <button
                  onClick={() => copyToClipboard(`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`)}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <FaCopy />
                </button>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm text-gray-600">H</label>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={(e) =>
                      handleChange("hsl", {
                        ...hsl,
                        h: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={inputMode !== "hsl"}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">S</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={(e) =>
                      handleChange("hsl", {
                        ...hsl,
                        s: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={inputMode !== "hsl"}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">L</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) =>
                      handleChange("hsl", {
                        ...hsl,
                        l: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={inputMode !== "hsl"}
                  />
                </div>
              </div>
            </div>

            {/* CMYK */}
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center justify-between">
                CMYK
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`
                    )
                  }
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <FaCopy />
                </button>
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {["c", "m", "y", "k"].map((channel) => (
                  <div key={channel}>
                    <label className="block text-sm text-gray-600 capitalize">
                      {channel}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={cmyk[channel]}
                      onChange={(e) =>
                        handleChange("cmyk", {
                          ...cmyk,
                          [channel]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500"
                      disabled={inputMode !== "cmyk"}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color Values Display */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Color Values</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              HEX: <span className="font-mono">{hex.toUpperCase()}</span>
            </p>
            <p>
              RGB: <span className="font-mono">{`${rgb.r}, ${rgb.g}, ${rgb.b}`}</span>
            </p>
            <p>
              HSL:{" "}
              <span className="font-mono">{`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`}</span>
            </p>
            <p>
              CMYK:{" "}
              <span className="font-mono">{`${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`}</span>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert between HEX, RGB, HSL, and CMYK</li>
            <li>Input from any color space</li>
            <li>Real-time color preview</li>
            <li>Copy values to clipboard</li>
            <li>Reset to default color</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorProfileConverter;