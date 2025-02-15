"use client";

import { useState } from "react";

const GradientGenerator = () => {
  const [colors, setColors] = useState(["#ff5733", "#3498db"]);
  const [angle, setAngle] = useState(90);
  const [gradientType, setGradientType] = useState("linear");
  const [textColor, setTextColor] = useState("#000000");

  // Dynamically generate gradient style
  const gradientStyle = {
    background:
      gradientType === "linear"
        ? `linear-gradient(${angle}deg, ${colors.join(", ")})`
        : gradientType === "radial"
        ? `radial-gradient(circle at ${angle}%, ${colors.join(", ")})`
        : `conic-gradient(from ${angle}deg, ${colors.join(", ")})`,
  };

  // Handle color change for each input
  const handleColorChange = (index, newColor) => {
    const updatedColors = [...colors];
    updatedColors[index] = newColor;
    setColors(updatedColors);
  };

  // Add a new color to the gradient
  const addColor = () => setColors([...colors, "#ffffff"]);

  // Remove a color, keeping a minimum of 2
  const removeColor = (index) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  // Reverse the order of colors
  const reverseColors = () => setColors([...colors].reverse());

  // Generate a random hex color
  const randomColor = () =>
    `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;

  // Create a random gradient
  const generateRandomGradient = () =>
    setColors([randomColor(), randomColor()]);

  // Copy gradient CSS to clipboard
  const handleCopyCSS = () => {
    const cssCode =
      gradientType === "linear"
        ? `background: linear-gradient(${angle}deg, ${colors.join(", ")});`
        : gradientType === "radial"
        ? `background: radial-gradient(circle at ${angle}%, ${colors.join(
            ", "
          )});`
        : `background: conic-gradient(from ${angle}deg, ${colors.join(", ")});`;

    navigator.clipboard.writeText(cssCode);
    alert("Copied CSS to clipboard!");
  };

  // Download gradient as an image
  const downloadImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");

    const gradient =
      gradientType === "linear"
        ? ctx.createLinearGradient(0, 0, 400, 0)
        : gradientType === "radial"
        ? ctx.createRadialGradient(200, 75, 0, 200, 75, 200)
        : ctx.createConicGradient((angle * Math.PI) / 180, 200, 75);

    colors.forEach((color, i) =>
      gradient.addColorStop(i / (colors.length - 1), color)
    );
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 150);

    const link = document.createElement("a");
    link.download = "gradient-preview.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Gradient Generator
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Panel: Gradient Controls */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium">Color {index + 1}</p>
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                className="w-16 h-10 cursor-pointer border rounded-md"
              />
              {colors.length > 2 && (
                <button
                  className="text-red-500 text-sm font-medium ml-2"
                  onClick={() => removeColor(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            className="mt-2 w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={addColor}
          >
            Add Color
          </button>

          <div className="mt-6">
            <label className="text-sm font-medium mr-2">Gradient Type:</label>
            <select
              value={gradientType}
              onChange={(e) => setGradientType(e.target.value)}
              className="border px-2 py-1 rounded-lg"
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
              <option value="conic">Conic</option>
            </select>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium mr-2">Angle / Spread:</label>
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium">Text Color</p>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-16 h-10 cursor-pointer border rounded-md"
            />
          </div>

          <div className="flex justify-center gap-2">
            <button
              className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
              onClick={generateRandomGradient}
            >
              Random Gradient
            </button>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              onClick={reverseColors}
            >
              Reverse Colors
            </button>
          </div>
        </div>

        {/* Right Panel: Gradient Preview and Actions */}
        <div className="flex flex-col justify-between">
          <div
            className="w-full h-48 rounded-lg shadow-md border border-gray-300 mb-6"
            style={gradientStyle}
          ></div>

          <p
            className="text-lg font-semibold text-center py-2"
            style={{ background: gradientStyle.background, color: textColor }}
          >
            Gradient Text Preview
          </p>

          <p className="mt-4 text-sm font-medium text-gray-600 text-center">
            CSS:{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {gradientType === "linear"
                ? `background: linear-gradient(${angle}deg, ${colors.join(
                    ", "
                  )});`
                : gradientType === "radial"
                ? `background: radial-gradient(circle at ${angle}%, ${colors.join(
                    ", "
                  )});`
                : `background: conic-gradient(from ${angle}deg, ${colors.join(
                    ", "
                  )});`}
            </code>
          </p>

          <div className="flex justify-center gap-4 mt-6">
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              onClick={handleCopyCSS}
            >
              Copy CSS
            </button>
            <button
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90"
              onClick={downloadImage}
            >
              Download as Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientGenerator;
