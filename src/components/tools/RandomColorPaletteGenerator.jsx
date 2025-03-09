"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const RandomColorPaletteGenerator = () => {
  const [paletteSize, setPaletteSize] = useState(5);
  const [palette, setPalette] = useState([]);
  const [isCopied, setIsCopied] = useState(null); // null, index, or -1 for all
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    format: "hex",        // hex, rgb, hsl
    harmony: "random",    // random, analogous, complementary, triadic
    alpha: false,         // Include alpha channel (for RGB/HSL)
  });

  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = options.alpha ? Math.random().toFixed(2) : 1;
    return { r, g, b, a };
  };

  const toHex = (color) => {
    const { r = 0, g = 0, b = 0 } = color || {}; // Fallback to 0 if undefined
    return `#${[r, g, b]
      .map((x) => Math.floor(x).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`;
  };

  const toRGB = (color) => {
    const { r = 0, g = 0, b = 0, a = 1 } = color || {};
    return options.alpha ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  };

  const toHSL = (color) => {
    const { r = 0, g = 0, b = 0, a = 1 } = color || {};
    let rNorm = r / 255;
    let gNorm = g / 255;
    let bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return options.alpha ? `hsla(${h}, ${s}%, ${l}%, ${a})` : `hsl(${h}, ${s}%, ${l}%)`;
  };

  const HSLtoRGB = (h, s, l) => {
    h = h % 360; // Ensure h is within 0-360
    s = Math.max(0, Math.min(100, s)) / 100; // Clamp s between 0-100
    l = Math.max(0, Math.min(100, l)) / 100; // Clamp l between 0-100
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
      r: Math.round(f(0) * 255),
      g: Math.round(f(8) * 255),
      b: Math.round(f(4) * 255),
    };
  };

  const generateHarmoniousColors = (baseColor, size) => {
    const colors = [baseColor];
    const hslBase = toHSL(baseColor).match(/\d+/g)?.map(Number) || [0, 0, 0]; // Fallback if match fails

    if (options.harmony === "analogous") {
      for (let i = 1; i < size; i++) {
        const h = (hslBase[0] + i * 30) % 360;
        const rgb = HSLtoRGB(h, hslBase[1], hslBase[2]);
        colors.push({ ...rgb, a: baseColor.a });
      }
    } else if (options.harmony === "complementary") {
      const rgb = HSLtoRGB((hslBase[0] + 180) % 360, hslBase[1], hslBase[2]);
      colors.push({ ...rgb, a: baseColor.a });
    } else if (options.harmony === "triadic") {
      colors.push({ ...HSLtoRGB((hslBase[0] + 120) % 360, hslBase[1], hslBase[2]), a: baseColor.a });
      if (size > 2)
        colors.push({ ...HSLtoRGB((hslBase[0] + 240) % 360, hslBase[1], hslBase[2]), a: baseColor.a });
    }

    while (colors.length < size) colors.push(generateRandomColor());
    return colors.slice(0, size);
  };

  const generatePalette = useCallback(() => {
    const size = Math.min(paletteSize, 10);
    const baseColor = generateRandomColor();
    const rawPalette =
      options.harmony === "random"
        ? Array.from({ length: size }, generateRandomColor)
        : generateHarmoniousColors(baseColor, size);

    const formattedPalette = rawPalette.map((color) => {
      switch (options.format) {
        case "rgb":
          return toRGB(color);
        case "hsl":
          return toHSL(color);
        case "hex":
        default:
          return toHex(color);
      }
    });

    setPalette(formattedPalette);
    setHistory((prev) => [...prev, { colors: formattedPalette, options: { ...options, paletteSize } }].slice(-5));
    setIsCopied(null);
  }, [paletteSize, options]);

  const copyToClipboard = (index) => {
    navigator.clipboard
      .writeText(palette[index])
      .then(() => {
        setIsCopied(index);
        setTimeout(() => setIsCopied(null), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const copyAllToClipboard = () => {
    navigator.clipboard
      .writeText(palette.join(", "))
      .then(() => {
        setIsCopied(-1);
        setTimeout(() => setIsCopied(null), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = palette.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `palette-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSS = () => {
    const css = `:root {\n${palette.map((color, i) => `  --color-${i + 1}: ${color};`).join("\n")}\n}`;
    const blob = new Blob([css], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `palette-${Date.now()}.css`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearPalette = () => {
    setPalette([]);
    setIsCopied(null);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Random Color Palette Generator
        </h1>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Palette Size (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={paletteSize}
                onChange={(e) => setPaletteSize(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Customization Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Color Format:</label>
                <select
                  value={options.format}
                  onChange={(e) => handleOptionChange("format", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hex">HEX</option>
                  <option value="rgb">RGB</option>
                  <option value="hsl">HSL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Harmony Mode:</label>
                <select
                  value={options.harmony}
                  onChange={(e) => handleOptionChange("harmony", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="random">Random</option>
                  <option value="analogous">Analogous</option>
                  <option value="complementary">Complementary</option>
                  <option value="triadic">Triadic</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.alpha}
                  onChange={() => handleOptionChange("alpha", !options.alpha)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Alpha</label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generatePalette}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Palette
            </button>
            {palette.length > 0 && (
              <>
                <button
                  onClick={copyAllToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied === -1
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied === -1 ? "Copied All!" : "Copy All"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download TXT
                </button>
                <button
                  onClick={exportAsCSS}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Export CSS
                </button>
                <button
                  onClick={clearPalette}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {palette.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                Generated Palette ({palette.length} colors):
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {palette.map((color, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-md border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-mono text-sm text-gray-800 flex-1 truncate">{color}</span>
                    <button
                      onClick={() => copyToClipboard(index)}
                      className={`px-2 py-1 rounded-md text-sm transition-colors ${
                        isCopied === index
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-600 text-white hover:bg-gray-700"
                      }`}
                    >
                      <FaCopy />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Palettes (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>
                      {entry.colors.length} colors ({entry.options.format}, {entry.options.harmony})
                    </span>
                    <button
                      onClick={() => {
                        setPalette(entry.colors);
                        setPaletteSize(entry.options.paletteSize);
                        setOptions(entry.options);
                        setIsCopied(null);
                      }}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaUndo />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
            <h3 className="font-semibold text-blue-700">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm">
              <li>Generate palettes in HEX, RGB, or HSL formats</li>
              <li>Harmony modes: Random, Analogous, Complementary, Triadic</li>
              <li>Optional alpha channel for RGB/HSL</li>
              <li>Copy individual colors, all colors, or export as TXT/CSS</li>
              <li>Track and restore recent palettes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomColorPaletteGenerator;