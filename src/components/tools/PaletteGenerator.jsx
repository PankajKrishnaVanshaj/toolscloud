"use client";

import { useState } from "react";

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
};

const PaletteGenerator = () => {
  const [colors, setColors] = useState(Array.from({ length: 5 }, generateRandomColor));

  const generateNewPalette = () => {
    setColors(Array.from({ length: 5 }, generateRandomColor));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg text-center">

      <div className="grid grid-cols-5 gap-2 mb-4">
        {colors.map((color, index) => (
          <div key={index} className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center" style={{ backgroundColor: color }}>
            <span className="text-xs font-medium text-white" style={{ textShadow: "0px 0px 3px rgba(0,0,0,0.5)" }}>
              {color}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={generateNewPalette}
        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Generate New Palette
      </button>
    </div>
  );
};

export default PaletteGenerator;
