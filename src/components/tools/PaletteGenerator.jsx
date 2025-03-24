"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaCopy,
  FaRandom,
  FaLock,
  FaLockOpen,
  FaPaintBrush,
  FaUndo,
  FaTrash,
  FaEdit,
  FaDownload,
  FaPlus,
} from "react-icons/fa";
import html2canvas from "html2canvas"; // For downloading palette

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
};

const generateShades = (baseColor, numShades = 5) => {
  const baseRGB = hexToRGB(baseColor);
  let shades = [];
  for (let i = 0; i < numShades; i++) {
    const factor = i / (numShades - 1);
    const shadeRGB = {
      r: Math.round(baseRGB.r * (1 - factor)),
      g: Math.round(baseRGB.g * (1 - factor)),
      b: Math.round(baseRGB.b * (1 - factor)),
    };
    shades.push(rgbToHex(shadeRGB.r, shadeRGB.g, shadeRGB.b));
  }
  return shades;
};

const hexToRGB = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const rgbToHex = (r, g, b) => {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const PaletteGenerator = () => {
  const [paletteSize, setPaletteSize] = useState(5);
  const [colors, setColors] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newColor, setNewColor] = useState("");
  const [shadeCount, setShadeCount] = useState(5);
  const paletteRef = React.useRef(null);

  // Initialize palette
  useEffect(() => {
    setColors(
      Array.from({ length: paletteSize }, () => ({
        color: generateRandomColor(),
        locked: false,
      }))
    );
  }, [paletteSize]);

  // Handlers
  const generateNewPalette = useCallback(() => {
    setColors((prevColors) =>
      prevColors.map((item) =>
        item.locked ? item : { color: generateRandomColor(), locked: false }
      )
    );
  }, []);

  const generateColorShades = (index) => {
    const shades = generateShades(colors[index].color, shadeCount);
    setColors(shades.map((shade) => ({ color: shade, locked: false })));
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    alert(`${color} copied to clipboard!`);
  };

  const randomizeColor = (index) => {
    setColors((prevColors) =>
      prevColors.map((item, i) =>
        i === index && !item.locked ? { ...item, color: generateRandomColor() } : item
      )
    );
  };

  const toggleLockColor = (index) => {
    setColors((prevColors) =>
      prevColors.map((item, i) =>
        i === index ? { ...item, locked: !item.locked } : item
      )
    );
  };

  const deleteColor = (index) => {
    setColors((prevColors) => prevColors.filter((_, i) => i !== index));
  };

  const addColor = () => {
    setColors((prevColors) => [
      ...prevColors,
      { color: generateRandomColor(), locked: false },
    ]);
  };

  const startEditingColor = (index) => {
    setEditingIndex(index);
    setNewColor(colors[index].color);
  };

  const saveEditedColor = (index) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      setColors((prevColors) =>
        prevColors.map((item, i) =>
          i === index ? { ...item, color: newColor } : item
        )
      );
      setEditingIndex(null);
    } else {
      alert("Please enter a valid hex color (e.g., #FFFFFF)");
    }
  };

  const copyAllColors = () => {
    const allColors = colors.map((item) => item.color).join(", ");
    navigator.clipboard.writeText(allColors);
    alert(`All colors copied: ${allColors}`);
  };

  const resetPalette = () => {
    setColors(
      Array.from({ length: paletteSize }, () => ({
        color: generateRandomColor(),
        locked: false,
      }))
    );
    setShadeCount(5);
  };

  const downloadPalette = () => {
    if (paletteRef.current) {
      html2canvas(paletteRef.current).then((canvas) => {
        const link = document.createElement("a");
        link.download = `palette-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
          Palette Generator
        </h2>

        {/* Controls */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palette Size
              </label>
              <select
                value={paletteSize}
                onChange={(e) => setPaletteSize(parseInt(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[3, 5, 7, 10, 15].map((size) => (
                  <option key={size} value={size}>
                    {size} Colors
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shades Count ({shadeCount})
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={shadeCount}
                onChange={(e) => setShadeCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Color Palette */}
          <div ref={paletteRef} className="space-y-4">
            {colors.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: item.color }}
              >
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="text-lg font-semibold text-black p-1 rounded-md w-28"
                  />
                ) : (
                  <span
                    className="text-lg font-semibold text-white"
                    style={{ textShadow: "0px 0px 3px rgba(0,0,0,0.5)" }}
                  >
                    {item.color}
                  </span>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(item.color)}
                    className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 shadow-sm"
                    title="Copy Color"
                  >
                    <FaCopy size={16} />
                  </button>
                  <button
                    onClick={() => randomizeColor(index)}
                    className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 shadow-sm"
                    title="Randomize"
                    disabled={item.locked}
                  >
                    <FaRandom size={16} />
                  </button>
                  <button
                    onClick={() => toggleLockColor(index)}
                    className={`p-2 rounded-md ${
                      item.locked
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-200"
                    } shadow-sm`}
                    title={item.locked ? "Unlock" : "Lock"}
                  >
                    {item.locked ? <FaLock size={16} /> : <FaLockOpen size={16} />}
                  </button>
                  <button
                    onClick={() => generateColorShades(index)}
                    className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 shadow-sm"
                    title="Generate Shades"
                  >
                    <FaPaintBrush size={16} />
                  </button>
                  {editingIndex === index ? (
                    <button
                      onClick={() => saveEditedColor(index)}
                      className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                      title="Save"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditingColor(index)}
                      className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 shadow-sm"
                      title="Edit"
                    >
                      <FaEdit size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteColor(index)}
                    className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700 shadow-sm"
                    title="Delete"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addColor}
              className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> Add Color
            </button>
          </div>

          {/* Palette Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateNewPalette}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaRandom className="mr-2" /> Generate New Palette
            </button>
            <button
              onClick={resetPalette}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaUndo className="mr-2" /> Reset Palette
            </button>
            <button
              onClick={copyAllColors}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy All
            </button>
            <button
              onClick={downloadPalette}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Generate random color palettes</li>
            <li>Lock/unlock colors</li>
            <li>Generate shades from a base color</li>
            <li>Edit colors manually</li>
            <li>Add/remove colors dynamically</li>
            <li>Copy individual or all colors</li>
            <li>Download palette as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaletteGenerator;