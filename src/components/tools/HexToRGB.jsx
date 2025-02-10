"use client";

import { useState } from "react";

const HexToRGB = () => {
  const [hex, setHex] = useState("#3498db");
  const [rgb, setRgb] = useState("52, 152, 219");

  const hexToRgb = (hex) => {
    let formattedHex = hex.replace(/^#/, "");
    if (formattedHex.length === 3) {
      formattedHex = formattedHex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (formattedHex.length !== 6) return "Invalid Hex";

    const r = parseInt(formattedHex.substring(0, 2), 16);
    const g = parseInt(formattedHex.substring(2, 4), 16);
    const b = parseInt(formattedHex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  };

  const handleChange = (e) => {
    const newHex = e.target.value;
    setHex(newHex);
    setRgb(hexToRgb(newHex));
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg text-center">

      <input
        type="color"
        value={hex}
        onChange={handleChange}
        className="w-24 h-24 border-none cursor-pointer"
      />

      <div className="mt-4">
        <p className="text-lg font-medium">HEX:</p>
        <input
          type="text"
          value={hex}
          onChange={handleChange}
          maxLength={7}
          className="w-32 px-3 py-1 text-center border rounded-lg mt-2"
        />

        <p className="text-lg font-medium mt-4">RGB:</p>
        <p className="text-gray-700 font-semibold">{rgb}</p>

        <div
          className="w-full h-14 rounded-lg mt-2"
          style={{ backgroundColor: hex }}
        ></div>
      </div>
    </div>
  );
};

export default HexToRGB;
