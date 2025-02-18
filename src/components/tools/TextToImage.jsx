"use client";
import React, { useState, useRef } from "react";

const TextToImage = () => {
  const [text, setText] = useState("Your Text Here");
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [alignment, setAlignment] = useState("left");
  const [position, setPosition] = useState({ x: 40, y: 40 });
  const [gradientBg, setGradientBg] = useState(false);
  const [gradientColor1, setGradientColor1] = useState("#ff7e5f");
  const [gradientColor2, setGradientColor2] = useState("#feb47b");
  const canvasRef = useRef(null); // Reference to the canvas

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", `${e.clientX},${e.clientY}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const offsetX =
      e.clientX -
      parseInt(e.dataTransfer.getData("text/plain").split(",")[0], 10);
    const offsetY =
      e.clientY -
      parseInt(e.dataTransfer.getData("text/plain").split(",")[1], 10);
    setPosition((prevPos) => ({
      x: prevPos.x + offsetX,
      y: prevPos.y + offsetY,
    }));
  };

  const handleReset = () => {
    setText("Your Text Here");
    setFontSize(24);
    setTextColor("#000000");
    setBgColor("#ffffff");
    setGradientBg(false);
    setGradientColor1("#ff7e5f");
    setGradientColor2("#feb47b");
  };

  return (
    <div className="container mx-auto p-4">
      {/* Text Input */}
      <div className="mb-4">
        <label className="block font-medium">Enter Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border border-gray-300 rounded p-2 w-full"
        />
      </div>

      <div className="flex gap-5">
        {/* Image with Text Overlay */}
        <div
          className="flex-1 inline-block border border-gray-300 rounded-lg p-2"
          style={{
            width: "400px",
            height: "300px",
            position: "relative",
            ...(gradientBg
              ? {
                  background: `linear-gradient(45deg, ${gradientColor1}, ${gradientColor2})`,
                }
              : {
                  backgroundColor: bgColor,
                }),
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <span
            draggable
            onDragStart={handleDragStart}
            className="absolute"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              fontSize: `${fontSize}px`,
              color: textColor,
              fontFamily: fontFamily,
              textAlign: alignment,
              cursor: "move",
              fontWeight: "bold",
              zIndex: 10,
            }}
          >
            {text}
          </span>
        </div>
        <div className="flex-1">
          {/* Font Size */}
          <div className="flex justify-around">
            <div className="mb-4">
              <label className="block font-medium">Font Size</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
              />
            </div>
            {/* Font Family */}
            <div className="mb-4">
              <label className="block font-medium">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>

            {/* Text Alignment */}
            <div className="mb-4">
              <label className="block font-medium">Text Alignment</label>
              <select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value)}
                className="border border-gray-300 rounded p-2 w-full"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <div className="flex justify-around">
            {/* Text Color */}
            <div className="mb-4">
              <label className="block font-medium">Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 p-0 border-0"
              />
            </div>

            {/* Background Color */}
            <div className="mb-4">
              <label className="block font-medium">Background Color</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 p-0 border-0"
              />
            </div>

            {/* Text Background Gradient */}
            <div className="mb-4">
              <label className="block font-medium">
                Text Background Gradient
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={gradientBg}
                  onChange={(e) => setGradientBg(e.target.checked)}
                  className="w-5 h-5"
                />
                {gradientBg && (
                  <>
                    <input
                      type="color"
                      value={gradientColor1}
                      onChange={(e) => setGradientColor1(e.target.value)}
                      className="w-10 h-10 p-0 border-0"
                    />
                    <input
                      type="color"
                      value={gradientColor2}
                      onChange={(e) => setGradientColor2(e.target.value)}
                      className="w-10 h-10 p-0 border-0"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Buttons */}
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 w-full"
            >
              Reset
            </button>
        </div>
      </div>

      {/* Canvas for Download */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default TextToImage;
