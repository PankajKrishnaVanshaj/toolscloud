"use client";

import { useState } from "react";

const ColorPicker = () => {
  const [color, setColor] = useState("#3498db");

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg text-center">

      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-24 h-24 border-none cursor-pointer"
      />

      <div className="mt-4">
        <p className="text-lg font-medium">Selected Color:</p>
        <div
          className="w-full h-14 rounded-lg mt-2"
          style={{ backgroundColor: color }}
        ></div>
        <p className="mt-2 text-gray-700 font-semibold">{color}</p>
      </div>
    </div>
  );
};

export default ColorPicker;
