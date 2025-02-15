"use client";

import { useState, useEffect } from "react";
import {
  FaCopy,
  FaRandom,
  FaLock,
  FaLockOpen,
  FaPaintBrush,
  FaUndo,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
};

const generateShades = (baseColor, numShades = 5) => {
  let shades = [];
  for (let i = 1; i <= numShades; i++) {
    const shade = `#${baseColor
      .replace("#", "")
      .split("")
      .map((char, index) =>
        index % 2 === 0 ? Math.max(0, parseInt(char, 16) - i).toString(16) : char
      )
      .join("")}`;
    shades.push(shade);
  }
  return shades;
};

const PaletteGenerator = () => {
  const [paletteSize, setPaletteSize] = useState(5);
  const [colors, setColors] = useState([]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [newColor, setNewColor] = useState("");

  // Initialize palette based on size
  useEffect(() => {
    setColors(
      Array.from({ length: paletteSize }, () => ({
        color: generateRandomColor(),
        locked: false,
      }))
    );
  }, [paletteSize]);

  // Handlers
  const generateNewPalette = () => {
    setColors((prevColors) =>
      prevColors.map((item) =>
        item.locked ? item : { color: generateRandomColor(), locked: false }
      )
    );
  };

  const generateColorShades = (index) => {
    const shades = generateShades(colors[index].color);
    setColors(
      shades.map((shade) => ({
        color: shade,
        locked: false,
      }))
    );
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
  };

  return (
    <div className="mx-auto p-6 bg-gray-100 text-gray-800 rounded-lg max-w-3xl">
      <h2 className="text-2xl font-bold mb-6">Palette Generator</h2>

      {/* Palette Size Selector */}
      <div className="flex justify-center gap-3 mb-6">
        {[3, 5, 7, 10].map((size) => (
          <button
            key={size}
            onClick={() => setPaletteSize(size)}
            className={`px-3 py-2 rounded-lg font-medium ${
              paletteSize === size ? "bg-primary text-white" : "bg-gray-300 text-gray-800"
            } hover:bg-primary/90 hover:text-white transition`}
          >
            {size} Colors
          </button>
        ))}
      </div>

      {/* Color Palette Cards */}
      <div className="space-y-2">
        {colors.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-lg shadow-md"
            style={{ backgroundColor: item.color }}
          >
            {editingIndex === index ? (
              <input
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="text-lg font-semibold text-black p-1 rounded-md"
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
              >
                <FaCopy size={18} />
              </button>
              <button
                onClick={() => randomizeColor(index)}
                className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 shadow-sm"
              >
                <FaRandom size={18} />
              </button>
              <button
                onClick={() => toggleLockColor(index)}
                className={`p-2 rounded-md ${
                  item.locked ? "bg-green-500 text-white" : "bg-white text-gray-700"
                } hover:bg-gray-200 shadow-sm`}
              >
                {item.locked ? <FaLock size={18} /> : <FaLockOpen size={18} />}
              </button>
              <button
                onClick={() => generateColorShades(index)}
                className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 shadow-sm"
              >
                <FaPaintBrush size={18} />
              </button>
              {editingIndex === index ? (
                <button
                  onClick={() => saveEditedColor(index)}
                  className="p-2 rounded-md bg-primary text-white hover:bg-primary/90 shadow-sm"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => startEditingColor(index)}
                  className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-200 shadow-sm"
                >
                  <FaEdit size={18} />
                </button>
              )}
              <button
                onClick={() => deleteColor(index)}
                className="p-2 rounded-md bg-red-600 text-white hover:bg-red-700 shadow-sm"
              >
                <FaTrash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Palette Actions */}
      <div className="flex justify-between mt-8">
        <button
          onClick={generateNewPalette}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition"
        >
          Generate New Palette
        </button>
        <button
          onClick={resetPalette}
          className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition"
        >
          <FaUndo className="inline-block mr-2" /> Reset Palette
        </button>
        <button
          onClick={copyAllColors}
          className="px-6 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary/90 transition"
        >
          Copy All Colors
        </button>
      </div>
    </div>
  );
};

export default PaletteGenerator;
