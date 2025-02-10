"use client";

import { useState } from "react";

const ContrastChecker = () => {
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  // Function to calculate contrast ratio
  const luminance = (color) => {
    const rgb = color.match(/\w\w/g).map((c) => parseInt(c, 16) / 255);
    const a = rgb.map((c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const contrastRatio = () => {
    const lum1 = luminance(textColor);
    const lum2 = luminance(bgColor);
    const ratio =
      (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    return ratio.toFixed(2);
  };

  const ratio = contrastRatio();
  const isAccessible = ratio >= 4.5 ? "✔ Accessible" : "❌ Not Accessible";

  return (
    <div className="mx-auto p-6 bg-white shadow-lg rounded-lg text-center">

      <div className="flex justify-center gap-4 mb-4">
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Text Color</p>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="w-16 h-16 cursor-pointer"
          />
        </div>

        <div className="flex flex-col items-center">
          <p className="text-sm font-medium">Background Color</p>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="w-16 h-16 cursor-pointer"
          />
        </div>
      </div>

      <div
        className="w-full h-20 flex items-center justify-center rounded-lg mt-4 text-lg font-semibold"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        Sample Text
      </div>

      <p className="mt-4 text-lg font-medium">
        Contrast Ratio: <strong>{ratio}:1</strong>
      </p>

      <p
        className={`mt-2 font-medium ${
          ratio >= 4.5 ? "text-green-600" : "text-red-600"
        }`}
      >
        {isAccessible} (WCAG 2.0)
      </p>
    </div>
  );
};

export default ContrastChecker;
