"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaRandom, FaUndo } from "react-icons/fa";

const GradientGenerator = () => {
  const [colors, setColors] = useState(["#ff5733", "#3498db"]);
  const [angle, setAngle] = useState(90);
  const [gradientType, setGradientType] = useState("linear");
  const [textColor, setTextColor] = useState("#000000");
  const [gradientHistory, setGradientHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [gradientSize, setGradientSize] = useState({ width: 400, height: 150 });

  // Dynamically generate gradient style
  const gradientStyle = {
    background:
      gradientType === "linear"
        ? `linear-gradient(${angle}deg, ${colors.join(", ")})`
        : gradientType === "radial"
        ? `radial-gradient(circle at ${angle}%, ${colors.join(", ")})`
        : `conic-gradient(from ${angle}deg, ${colors.join(", ")})`,
  };

  // Save state to history
  const saveToHistory = useCallback(() => {
    const currentState = { colors: [...colors], angle, gradientType };
    setGradientHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Limit to 10 history states
    });
    setHistoryIndex((prev) => prev + 1);
  }, [colors, angle, gradientType, historyIndex]);

  // Handle color change
  const handleColorChange = (index, newColor) => {
    saveToHistory();
    const updatedColors = [...colors];
    updatedColors[index] = newColor;
    setColors(updatedColors);
  };

  // Add a new color
  const addColor = () => {
    saveToHistory();
    setColors([...colors, "#ffffff"]);
  };

  // Remove a color
  const removeColor = (index) => {
    if (colors.length > 2) {
      saveToHistory();
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  // Reverse colors
  const reverseColors = () => {
    saveToHistory();
    setColors([...colors].reverse());
  };

  // Random color generator
  const randomColor = () =>
    `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;

  // Random gradient
  const generateRandomGradient = () => {
    saveToHistory();
    setColors([randomColor(), randomColor(), randomColor()]);
    setAngle(Math.floor(Math.random() * 360));
  };

  // Undo action
  const undo = () => {
    if (historyIndex > 0) {
      const prevState = gradientHistory[historyIndex - 1];
      setColors(prevState.colors);
      setAngle(prevState.angle);
      setGradientType(prevState.gradientType);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  // Redo action
  const redo = () => {
    if (historyIndex < gradientHistory.length - 1) {
      const nextState = gradientHistory[historyIndex + 1];
      setColors(nextState.colors);
      setAngle(nextState.angle);
      setGradientType(nextState.gradientType);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  // Copy CSS to clipboard
  const handleCopyCSS = () => {
    const cssCode =
      gradientType === "linear"
        ? `background: linear-gradient(${angle}deg, ${colors.join(", ")});`
        : gradientType === "radial"
        ? `background: radial-gradient(circle at ${angle}%, ${colors.join(", ")});`
        : `background: conic-gradient(from ${angle}deg, ${colors.join(", ")});`;
    navigator.clipboard.writeText(cssCode);
    alert("CSS copied to clipboard!");
  };

  // Download gradient as image
  const downloadImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = gradientSize.width;
    canvas.height = gradientSize.height;
    const ctx = canvas.getContext("2d");

    const gradient =
      gradientType === "linear"
        ? ctx.createLinearGradient(0, 0, gradientSize.width, 0)
        : gradientType === "radial"
        ? ctx.createRadialGradient(
            gradientSize.width / 2,
            gradientSize.height / 2,
            0,
            gradientSize.width / 2,
            gradientSize.height / 2,
            Math.max(gradientSize.width, gradientSize.height) / 2
          )
        : ctx.createConicGradient(
            (angle * Math.PI) / 180,
            gradientSize.width / 2,
            gradientSize.height / 2
          );

    colors.forEach((color, i) =>
      gradient.addColorStop(i / (colors.length - 1), color)
    );
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gradientSize.width, gradientSize.height);

    const link = document.createElement("a");
    link.download = `gradient-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Gradient Generator
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel: Controls */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Colors</h3>
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between mb-3"
                >
                  <span className="text-sm text-gray-600">Color {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="w-10 h-10 rounded-md cursor-pointer border-none"
                    />
                    {colors.length > 2 && (
                      <button
                        onClick={() => removeColor(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={addColor}
                className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Add Color
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gradient Type
                </label>
                <select
                  value={gradientType}
                  onChange={(e) => {
                    saveToHistory();
                    setGradientType(e.target.value);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                  <option value="conic">Conic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Angle/Spread ({angle}°)
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => {
                    saveToHistory();
                    setAngle(e.target.value);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  value={gradientSize.width}
                  onChange={(e) =>
                    setGradientSize((prev) => ({
                      ...prev,
                      width: Math.max(100, Math.min(2000, e.target.value)),
                    }))
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  value={gradientSize.height}
                  onChange={(e) =>
                    setGradientSize((prev) => ({
                      ...prev,
                      height: Math.max(100, Math.min(2000, e.target.value)),
                    }))
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded-md cursor-pointer border-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUndo className="mr-2" /> Undo
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= gradientHistory.length - 1}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaRandom className="mr-2" /> Redo
              </button>
              <button
                onClick={reverseColors}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reverse
              </button>
              <button
                onClick={generateRandomGradient}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                <FaRandom className="mr-2" /> Random
              </button>
            </div>
          </div>

          {/* Right Panel: Preview and Actions */}
          <div className="flex flex-col gap-4">
            <div
              className="w-full rounded-lg shadow-md border border-gray-200 overflow-hidden"
              style={{
                ...gradientStyle,
                height: `${gradientSize.height}px`,
                maxHeight: "400px",
              }}
            />

            <p
              className="text-lg font-semibold text-center py-2 rounded-md shadow-sm"
              style={{ background: gradientStyle.background, color: textColor }}
            >
              Gradient Text Preview
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">CSS Code</p>
              <code className="block bg-gray-100 p-2 rounded-md text-sm text-gray-800 whitespace-pre-wrap">
                {gradientType === "linear"
                  ? `background: linear-gradient(${angle}deg, ${colors.join(", ")});`
                  : gradientType === "radial"
                  ? `background: radial-gradient(circle at ${angle}%, ${colors.join(", ")});`
                  : `background: conic-gradient(from ${angle}deg, ${colors.join(", ")});`}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleCopyCSS}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaCopy className="mr-2" /> Copy CSS
              </button>
              <button
                onClick={downloadImage}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Linear, Radial, and Conic gradient types</li>
            <li>Dynamic color management (add/remove/reverse)</li>
            <li>Undo/Redo functionality with history</li>
            <li>Customizable gradient size</li>
            <li>Random gradient generation</li>
            <li>Copy CSS and download as PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GradientGenerator;