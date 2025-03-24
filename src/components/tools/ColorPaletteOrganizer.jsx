"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaTrash, FaCopy } from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading palettes

const ColorPaletteOrganizer = () => {
  const [palettes, setPalettes] = useState([
    { name: "Palette 1", colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"] },
  ]);
  const [newColor, setNewColor] = useState("#000000");
  const [newPaletteName, setNewPaletteName] = useState("");
  const paletteContainerRef = React.useRef(null);

  // Add a new color to a palette
  const addColor = useCallback(
    (paletteIndex) => {
      const updatedPalettes = [...palettes];
      updatedPalettes[paletteIndex].colors.push(newColor);
      setPalettes(updatedPalettes);
      setNewColor("#000000");
    },
    [newColor, palettes]
  );

  // Remove a color from a palette
  const removeColor = (paletteIndex, colorIndex) => {
    const updatedPalettes = [...palettes];
    updatedPalettes[paletteIndex].colors.splice(colorIndex, 1);
    setPalettes(updatedPalettes);
  };

  // Move color within a palette
  const moveColor = (paletteIndex, fromIndex, toIndex) => {
    const updatedPalettes = [...palettes];
    const [movedColor] = updatedPalettes[paletteIndex].colors.splice(fromIndex, 1);
    updatedPalettes[paletteIndex].colors.splice(toIndex, 0, movedColor);
    setPalettes(updatedPalettes);
  };

  // Add a new palette
  const addPalette = () => {
    if (newPaletteName.trim()) {
      setPalettes([...palettes, { name: newPaletteName.trim(), colors: [] }]);
      setNewPaletteName("");
    }
  };

  // Remove a palette
  const removePalette = (paletteIndex) => {
    setPalettes(palettes.filter((_, index) => index !== paletteIndex));
  };

  // Copy color to clipboard
  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
    alert(`Copied ${color} to clipboard!`);
  };

  // Download palette as image
  const downloadPalette = (paletteIndex) => {
    const paletteElement = paletteContainerRef.current.children[paletteIndex];
    html2canvas(paletteElement).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${palettes[paletteIndex].name}-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  // Reset all palettes
  const resetAll = () => {
    setPalettes([]);
    setNewColor("#000000");
    setNewPaletteName("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Color Palette Organizer
          </h1>
          <button
            onClick={resetAll}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaSync className="mr-2" /> Reset All
          </button>
        </div>

        {/* New Palette Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Create New Palette</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              value={newPaletteName}
              onChange={(e) => setNewPaletteName(e.target.value)}
              placeholder="Palette Name"
              className="flex-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addPalette}
              disabled={!newPaletteName.trim()}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Add Palette
            </button>
          </div>
        </div>

        {/* Palettes List */}
        <div ref={paletteContainerRef} className="space-y-6">
          {palettes.map((palette, paletteIndex) => (
            <div
              key={paletteIndex}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{palette.name}</h3>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => downloadPalette(paletteIndex)}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <FaDownload className="mr-1" /> Download
                  </button>
                  <button
                    onClick={() => removePalette(paletteIndex)}
                    className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>

              {/* Color List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                {palette.colors.map((color, colorIndex) => (
                  <div key={colorIndex} className="flex flex-col items-center group">
                    <div
                      className="w-16 h-16 rounded-lg shadow-md transition-transform group-hover:scale-105"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs mt-1 font-mono">{color.toUpperCase()}</p>
                    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => moveColor(paletteIndex, colorIndex, colorIndex - 1)}
                        disabled={colorIndex === 0}
                        className="text-blue-500 text-xs disabled:text-gray-400 hover:text-blue-700"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveColor(paletteIndex, colorIndex, colorIndex + 1)}
                        disabled={colorIndex === palette.colors.length - 1}
                        className="text-blue-500 text-xs disabled:text-gray-400 hover:text-blue-700"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => copyColor(color)}
                        className="text-gray-500 text-xs hover:text-gray-700"
                      >
                        <FaCopy />
                      </button>
                      <button
                        onClick={() => removeColor(paletteIndex, colorIndex)}
                        className="text-red-500 text-xs hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Color */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-12 h-12 rounded-md cursor-pointer border"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase font-mono"
                />
                <button
                  onClick={() => addColor(paletteIndex)}
                  className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Color
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Palette Summary */}
        {palettes.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Palette Summary</h2>
            <p className="text-sm text-gray-600">Total Palettes: {palettes.length}</p>
            <p className="text-sm text-gray-600">
              Total Colors: {palettes.reduce((sum, p) => sum + p.colors.length, 0)}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Create and manage multiple color palettes</li>
            <li>Add, remove, and reorder colors</li>
            <li>Copy color codes to clipboard</li>
            <li>Download palettes as PNG images</li>
            <li>Hover effects for better interaction</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteOrganizer;