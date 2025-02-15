"use client";

import { useState } from "react";
import { FaCopy, FaRandom } from "react-icons/fa";

const ContrastChecker = () => {
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [previewText, setPreviewText] = useState("Sample Text");

  const luminance = (color) => {
    const rgb = color.match(/\w\w/g).map((c) => parseInt(c, 16) / 255);
    return rgb
      .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
      .reduce((acc, val, index) => acc + val * [0.2126, 0.7152, 0.0722][index], 0);
  };

  const contrastRatio = () => {
    const ratio =
      (Math.max(luminance(textColor), luminance(bgColor)) + 0.05) /
      (Math.min(luminance(textColor), luminance(bgColor)) + 0.05);
    return ratio.toFixed(2);
  };

  const isAccessible = contrastRatio() >= 4.5 ? "✔ Accessible" : "❌ Not Accessible";

  const generateRandomColor = () =>
    `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;

  const generateAccessibleColors = () => {
    let newTextColor, newBgColor;
    do {
      newTextColor = generateRandomColor();
      newBgColor = generateRandomColor();
    } while (
      (Math.max(luminance(newTextColor), luminance(newBgColor)) + 0.05) /
        (Math.min(luminance(newTextColor), luminance(newBgColor)) + 0.05) <
      4.5
    );
    setTextColor(newTextColor);
    setBgColor(newBgColor);
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color);
    alert(`${color} copied to clipboard!`);
  };

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg text-center max-w-lg">
      <h2 className="text-xl font-bold mb-4">Contrast Checker</h2>

      <div className="flex justify-center gap-4 mb-4">
        {/* Color Picker Block */}
        {[
          { label: "Text Color", color: textColor, setColor: setTextColor },
          { label: "Background Color", color: bgColor, setColor: setBgColor },
        ].map(({ label, color, setColor }) => (
          <div key={label} className="flex flex-col items-center">
            <p className="text-sm font-medium">{label}</p>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-16 cursor-pointer"
            />
            <div className="flex items-center mt-2">
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="border p-1 rounded w-20 text-center"
                maxLength={7}
              />
              <button
                onClick={() => copyToClipboard(color)}
                className="ml-2 p-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                <FaCopy />
              </button>
              <button
                onClick={() => setColor(generateRandomColor())}
                className="ml-2 p-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                <FaRandom />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Accessible Colors Button */}
      <button
        onClick={generateAccessibleColors}
        className="bg-primary text-white px-4 py-2 rounded-lg mt-4 hover:bg-primary/90"
      >
        Generate Random Accessible Colors
      </button>

      {/* Preview Area */}
      <textarea
        value={previewText}
        onChange={(e) => setPreviewText(e.target.value)}
        className="w-full h-16 border rounded-lg p-2 mt-4 text-center resize-none"
        style={{ backgroundColor: bgColor, color: textColor }}
      ></textarea>

      {/* Contrast Info */}
      <p className="mt-4 text-lg font-medium">
        Contrast Ratio: <strong>{contrastRatio()}:1</strong>
      </p>
      <p
        className={`mt-2 font-medium ${
          contrastRatio() >= 4.5 ? "text-green-600" : "text-red-600"
        }`}
      >
        {isAccessible} (WCAG 2.0)
      </p>
    </div>
  );
};

export default ContrastChecker;
