"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaCopy, FaTrash, FaPlus, FaRandom } from "react-icons/fa";

const ColorPaletteExporter = () => {
  const [palette, setPalette] = useState(["#FF6B6B", "#4ECDC4", "#45B7D1"]);
  const [paletteName, setPaletteName] = useState("My Palette");
  const [exportFormat, setExportFormat] = useState("json");
  const [newColor, setNewColor] = useState("#000000");

  // Add a new color
  const addColor = useCallback(() => {
    if (/^#[0-9A-F]{6}$/i.test(newColor) && !palette.includes(newColor)) {
      setPalette((prev) => [...prev, newColor]);
      setNewColor("#000000");
    }
  }, [newColor, palette]);

  // Update a color
  const updateColor = (index, value) => {
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      const newPalette = [...palette];
      newPalette[index] = value;
      setPalette(newPalette);
    }
  };

  // Remove a color
  const removeColor = (index) => {
    setPalette((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate random color
  const generateRandomColor = () => {
    const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    setNewColor(randomColor);
  };

  // Clear palette
  const clearPalette = () => {
    setPalette([]);
    setNewColor("#000000");
  };

  // Generate export content
  const generateExportContent = useCallback(() => {
    switch (exportFormat) {
      case "json":
        return JSON.stringify({ name: paletteName, colors: palette }, null, 2);
      case "css":
        return `:root {\n${palette.map((color, i) => `  --${paletteName.toLowerCase().replace(/\s+/g, "-")}-${i + 1}: ${color};`).join("\n")}\n}`;
      case "scss":
        return palette.map((color, i) => `$${paletteName.toLowerCase().replace(/\s+/g, "-")}-${i + 1}: ${color};`).join("\n");
      case "hex":
        return palette.join("\n");
      case "rgb":
        return palette.map(hexToRGB).join("\n");
      default:
        return "";
    }
  }, [exportFormat, palette, paletteName]);

  // Convert HEX to RGB
  const hexToRGB = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateExportContent());
    alert("Palette copied to clipboard!");
  };

  // Download as file
  const downloadFile = () => {
    const content = generateExportContent();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paletteName.replace(/\s+/g, "_").toLowerCase()}.${exportFormat === "hex" ? "txt" : exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Color Palette Exporter
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Palette Editor */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palette Name
              </label>
              <input
                type="text"
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="My Palette"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">{paletteName}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-80 overflow-y-auto">
                {palette.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-24 p-1 text-sm border rounded text-center uppercase focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeColor(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="w-12 h-12 rounded cursor-pointer"
              />
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
              />
              <button
                onClick={generateRandomColor}
                className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                title="Random Color"
              >
                <FaRandom />
              </button>
              <button
                onClick={addColor}
                className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" /> Add
              </button>
            </div>

            <button
              onClick={clearPalette}
              className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
              disabled={palette.length === 0}
            >
              <FaTrash className="mr-2" /> Clear Palette
            </button>
          </div>

          {/* Export Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Export Palette</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="css">CSS Variables</option>
                <option value="scss">SCSS Variables</option>
                <option value="hex">HEX List</option>
                <option value="rgb">RGB List</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-semibold mb-2">Export Preview</h3>
              <pre className="text-sm bg-gray-100 p-3 rounded-lg max-h-60 overflow-y-auto whitespace-pre-wrap">
                {generateExportContent()}
              </pre>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  disabled={palette.length === 0}
                >
                  <FaCopy className="mr-2" /> Copy
                </button>
                <button
                  onClick={downloadFile}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center"
                  disabled={palette.length === 0}
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Palette Preview */}
        {palette.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Palette Preview</h2>
            <div className="flex h-32 rounded-lg overflow-hidden shadow-md">
              {palette.map((color, index) => (
                <div
                  key={index}
                  className="flex-1 transition-all hover:flex-[2]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Custom palette name and color editing</li>
            <li>Multiple export formats: JSON, CSS, SCSS, HEX, RGB</li>
            <li>Random color generator</li>
            <li>Interactive palette preview with hover effect</li>
            <li>Copy to clipboard or download as file</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteExporter;