"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaPlus, FaTrash, FaCopy, FaSync } from "react-icons/fa";

const ColorPaletteImporter = () => {
  const [palette, setPalette] = useState([]);
  const [importText, setImportText] = useState("");
  const [paletteName, setPaletteName] = useState("Imported Palette");
  const [format, setFormat] = useState("hex"); // hex, rgb, hsl
  const [previewStyle, setPreviewStyle] = useState("swatches"); // swatches, gradient

  // Convert color formats
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToHsl = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
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
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  // Parse colors with multiple formats
  const parseColors = useCallback((text) => {
    const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
    let colors = [];

    try {
      const jsonData = JSON.parse(text);
      if (Array.isArray(jsonData)) {
        colors = jsonData.filter((color) => /^#[0-9a-fA-F]{6}$/i.test(color));
      } else if (typeof jsonData === "object") {
        colors = Object.values(jsonData).filter((color) =>
          /^#[0-9a-fA-F]{6}$/i.test(color)
        );
      }
    } catch (e) {
      colors = (text.match(hexRegex) || []).map((color) => {
        if (color.length === 4) {
          return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
        }
        return color;
      });
    }
    return colors;
  }, []);

  // Handle import
  const handleImport = () => {
    const importedColors = parseColors(importText);
    if (importedColors.length > 0) {
      setPalette(importedColors);
      setImportText("");
    } else {
      alert("No valid colors found in the input!");
    }
  };

  // Format color based on selected format
  const formatColor = (hex) => {
    switch (format) {
      case "rgb":
        return hexToRgb(hex);
      case "hsl":
        return hexToHsl(hex);
      default:
        return hex;
    }
  };

  // Update, remove, add colors
  const updateColor = (index, value) => {
    const newPalette = [...palette];
    newPalette[index] = value;
    setPalette(newPalette);
  };

  const removeColor = (index) => {
    setPalette(palette.filter((_, i) => i !== index));
  };

  const addColor = () => {
    setPalette([...palette, "#000000"]);
  };

  // Export palette
  const exportPalette = (type) => {
    let data;
    if (type === "json") {
      data = JSON.stringify(palette, null, 2);
    } else if (type === "css") {
      data = palette.map((c, i) => `--color-${i + 1}: ${formatColor(c)};`).join("\n");
    }
    navigator.clipboard.writeText(data);
    alert(`Palette copied to clipboard as ${type.toUpperCase()}!`);
  };

  // Download as image
  const downloadPalette = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = palette.length * 100;
    canvas.height = 100;
    palette.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(i * 100, 0, 100, 100);
    });
    const link = document.createElement("a");
    link.download = `${paletteName}-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // Reset palette
  const resetPalette = () => {
    setPalette([]);
    setImportText("");
    setPaletteName("Imported Palette");
    setFormat("hex");
    setPreviewStyle("swatches");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Palette Importer
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Import Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palette Name
              </label>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Imported Palette"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Import Colors
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={`Paste colors in various formats:
- JSON: ["#FF6B6B", "#4ECDC4"]
- CSS: #FF6B6B, #4ECDC4
- Plain text: #FF6B6B #4ECDC4`}
              />
              <button
                onClick={handleImport}
                className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Import Palette
              </button>
            </div>
          </div>

          {/* Palette Management */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{paletteName}</h2>
              <div className="flex gap-2">
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="p-1 border rounded-md text-sm"
                >
                  <option value="hex">HEX</option>
                  <option value="rgb">RGB</option>
                  <option value="hsl">HSL</option>
                </select>
                <select
                  value={previewStyle}
                  onChange={(e) => setPreviewStyle(e.target.value)}
                  className="p-1 border rounded-md text-sm"
                >
                  <option value="swatches">Swatches</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>
            </div>
            {palette.length === 0 ? (
              <p className="text-gray-500 italic">No colors imported yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {palette.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer border"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formatColor(color)}
                        onChange={(e) => updateColor(index, e.target.value)}
                        className="w-full p-1 text-xs border rounded uppercase"
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => navigator.clipboard.writeText(formatColor(color))}
                          className="text-blue-500 text-xs hover:underline flex items-center"
                        >
                          <FaCopy className="mr-1" /> Copy
                        </button>
                        <button
                          onClick={() => removeColor(index)}
                          className="text-red-500 text-xs hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {palette.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  onClick={addColor}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaPlus className="mr-2" /> Add Color
                </button>
                <button
                  onClick={() => exportPalette("json")}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => exportPalette("css")}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Export CSS
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        {palette.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Palette Preview</h2>
            {previewStyle === "swatches" ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className="h-16 rounded-lg shadow"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="h-24 rounded-lg shadow"
                style={{
                  background: `linear-gradient(to right, ${palette.join(", ")})`,
                }}
              />
            )}
            <button
              onClick={downloadPalette}
              className="mt-2 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaDownload /> Download as PNG
            </button>
          </div>
        )}

        {/* Features and Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Import from JSON, CSS, or plain text</li>
            <li>Multiple color formats: HEX, RGB, HSL</li>
            <li>Edit, add, or remove colors</li>
            <li>Preview as swatches or gradient</li>
            <li>Export as JSON, CSS, or PNG</li>
          </ul>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={resetPalette}
            className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <FaSync /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteImporter;