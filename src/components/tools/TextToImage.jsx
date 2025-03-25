"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaUndo,
  FaRedo,
  FaDownload,
  FaTrash,
  FaCopy,
  FaFont,
  FaEye,
} from "react-icons/fa";

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
  const [rotation, setRotation] = useState(0);
  const [fontWeight, setFontWeight] = useState("normal");
  const [borderWidth, setBorderWidth] = useState(0);
  const [borderColor, setBorderColor] = useState("#000000");
  const [shadow, setShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState("#000000");
  const [shadowBlur, setShadowBlur] = useState(4);
  const [padding, setPadding] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [textTransform, setTextTransform] = useState("none");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const textRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    drawCanvas();
    updateHistory();
  }, [
    text, fontSize, textColor, bgColor, fontFamily, alignment, position, gradientBg,
    gradientColor1, gradientColor2, rotation, fontWeight, borderWidth, borderColor,
    shadow, shadowColor, shadowBlur, padding, opacity, textTransform,
  ]);

  const updateHistory = useCallback(() => {
    const currentState = {
      text, fontSize, textColor, bgColor, fontFamily, alignment, position,
      gradientBg, gradientColor1, gradientColor2, rotation, fontWeight,
      borderWidth, borderColor, shadow, shadowColor, shadowBlur, padding,
      opacity, textTransform,
    };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      return newHistory.slice(-10); // Limit to last 10 changes
    });
    setHistoryIndex(prev => prev + 1);
  }, [
    text, fontSize, textColor, bgColor, fontFamily, alignment, position, gradientBg,
    gradientColor1, gradientColor2, rotation, fontWeight, borderWidth, borderColor,
    shadow, shadowColor, shadowBlur, padding, opacity, textTransform, historyIndex,
  ]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      applyState(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      applyState(history[historyIndex + 1]);
    }
  };

  const applyState = (state) => {
    setText(state.text);
    setFontSize(state.fontSize);
    setTextColor(state.textColor);
    setBgColor(state.bgColor);
    setFontFamily(state.fontFamily);
    setAlignment(state.alignment);
    setPosition(state.position);
    setGradientBg(state.gradientBg);
    setGradientColor1(state.gradientColor1);
    setGradientColor2(state.gradientColor2);
    setRotation(state.rotation);
    setFontWeight(state.fontWeight);
    setBorderWidth(state.borderWidth);
    setBorderColor(state.borderColor);
    setShadow(state.shadow);
    setShadowColor(state.shadowColor);
    setShadowBlur(state.shadowBlur);
    setPadding(state.padding);
    setOpacity(state.opacity);
    setTextTransform(state.textTransform);
  };

  const handleDragStart = (e) => {
    const rect = previewRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left - position.x,
      y: e.clientY - rect.top - position.y,
    };
    e.dataTransfer.setData("text/plain", "dragging");
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const rect = previewRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.current.x;
    const newY = e.clientY - rect.top - dragOffset.current.y;
    const textWidth = textRef.current.offsetWidth;
    const textHeight = textRef.current.offsetHeight;
    setPosition({
      x: Math.max(padding, Math.min(newX, 400 - textWidth - padding)),
      y: Math.max(padding, Math.min(newY, 300 - textHeight - padding)),
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.clientX === 0 && e.clientY === 0) return;
    const rect = previewRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.current.x;
    const newY = e.clientY - rect.top - dragOffset.current.y;
    const textWidth = textRef.current.offsetWidth;
    const textHeight = textRef.current.offsetHeight;
    setPosition({
      x: Math.max(padding, Math.min(newX, 400 - textWidth - padding)),
      y: Math.max(padding, Math.min(newY, 300 - textHeight - padding)),
    });
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 300;

    // Background
    if (gradientBg) {
      const gradient = ctx.createLinearGradient(0, 0, 400, 300);
      gradient.addColorStop(0, gradientColor1);
      gradient.addColorStop(1, gradientColor2);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = bgColor;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply text transform
    let displayText = text;
    if (textTransform === "uppercase") displayText = text.toUpperCase();
    else if (textTransform === "lowercase") displayText = text.toLowerCase();
    else if (textTransform === "capitalize") {
      displayText = text.replace(/\b\w/g, char => char.toUpperCase());
    }

    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.globalAlpha = opacity;
    ctx.textBaseline = "top";

    const textWidth = ctx.measureText(displayText).width;
    let textX = position.x;
    if (alignment === "center") textX = position.x + (400 - textWidth) / 2 - padding;
    else if (alignment === "right") textX = 400 - textWidth - padding;

    if (shadow) {
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else {
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    ctx.save();
    ctx.translate(textX + (alignment === "center" ? textWidth / 2 : alignment === "right" ? textWidth : 0), position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillText(displayText, alignment === "center" ? -textWidth / 2 : alignment === "right" ? -textWidth : 0, 0);
    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.strokeText(displayText, alignment === "center" ? -textWidth / 2 : alignment === "right" ? -textWidth : 0, 0);
    }
    ctx.restore();
    ctx.globalAlpha = 1; // Reset opacity
  };

  const handleDownload = (format = "png") => {
    drawCanvas();
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `text-image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
  };

  const handleCopy = () => {
    drawCanvas();
    canvasRef.current.toBlob(blob => {
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        .then(() => alert("Image copied to clipboard!"))
        .catch(err => alert("Failed to copy image: " + err));
    });
  };

  const handleReset = () => {
    const defaultState = {
      text: "Your Text Here", fontSize: 24, textColor: "#000000", bgColor: "#ffffff",
      fontFamily: "Arial", alignment: "left", position: { x: 40, y: 40 },
      gradientBg: false, gradientColor1: "#ff7e5f", gradientColor2: "#feb47b",
      rotation: 0, fontWeight: "normal", borderWidth: 0, borderColor: "#000000",
      shadow: false, shadowColor: "#000000", shadowBlur: 4, padding: 0,
      opacity: 1, textTransform: "none",
    };
    applyState(defaultState);
    setHistory([defaultState]);
    setHistoryIndex(0);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white shadow-lg rounded-2xl p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">
          Advanced Text to Image Generator
        </h1>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Preview */}
          <div
            ref={previewRef}
            className="w-full lg:w-1/2 border border-gray-300 rounded-lg p-2 relative overflow-hidden"
            style={{
              width: "400px",
              height: "300px",
              ...(gradientBg
                ? { background: `linear-gradient(45deg, ${gradientColor1}, ${gradientColor2})` }
                : { backgroundColor: bgColor }),
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDrag={handleDrag}
          >
            <span
              ref={textRef}
              draggable
              onDragStart={handleDragStart}
              className="absolute select-none"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                fontSize: `${fontSize}px`,
                color: textColor,
                fontFamily: fontFamily,
                textAlign: alignment,
                fontWeight: fontWeight,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: alignment === "center" ? "center" : alignment === "right" ? "right" : "left",
                cursor: "move",
                opacity,
                textTransform,
                ...(borderWidth > 0 && { WebkitTextStroke: `${borderWidth}px ${borderColor}` }),
                ...(shadow && { textShadow: `2px 2px ${shadowBlur}px ${shadowColor}` }),
              }}
            >
              {textTransform === "uppercase" ? text.toUpperCase() :
               textTransform === "lowercase" ? text.toLowerCase() :
               textTransform === "capitalize" ? text.replace(/\b\w/g, char => char.toUpperCase()) : text}
            </span>
          </div>

          {/* Controls */}
          <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Font Size (px)</label>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(1, e.target.value))}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Font Family</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
                <option value="Impact">Impact</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Text Alignment</label>
              <select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Text Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 p-0 border-0"
              />
           23</div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Background Color</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 p-0 border-0"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Gradient Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={gradientBg}
                  onChange={(e) => setGradientBg(e.target.checked)}
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Rotation (degrees)</label>
              <input
                type="number"
                value={rotation}
                onChange={(e) => setRotation(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Font Weight</label>
              <select
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="bolder">Bolder</option>
                <option value="lighter">Lighter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Border Width (px)</label>
              <input
                type="number"
                value={borderWidth}
                onChange={(e) => setBorderWidth(Math.max(0, e.target.value))}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Border Color</label>
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-10 h-10 p-0 border-0"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Text Shadow</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shadow}
                  onChange={(e) => setShadow(e.target.checked)}
                />
                {shadow && (
                  <>
                    <input
                      type="color"
                      value={shadowColor}
                      onChange={(e) => setShadowColor(e.target.value)}
                      className="w-10 h-10 p-0 border-0"
                    />
                    <input
                      type="number"
                      value={shadowBlur}
                      onChange={(e) => setShadowBlur(Math.max(0, e.target.value))}
                      className="w-20 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Blur"
                    />
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Padding (px)</label>
              <input
                type="number"
                value={padding}
                onChange={(e) => setPadding(Math.max(0, e.target.value))}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Opacity (0-1)</label>
              <input
                type="number"
                value={opacity}
                onChange={(e) => setOpacity(Math.max(0, Math.min(1, e.target.value)))}
                step="0.1"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Text Transform</label>
              <select
                value={textTransform}
                onChange={(e) => setTextTransform(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="capitalize">Capitalize</option>
              </select>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mt-4 flex flex-wrap gap-2 sm:gap-3 justify-center">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:bg-gray-400"
          >
            <FaUndo /> Undo
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:bg-gray-400"
          >
            <FaRedo /> Redo
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            <FaTrash /> Reset
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-sm"
          >
            <FaCopy /> Copy Image
          </button>
          <button
            onClick={() => handleDownload("png")}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <FaDownload /> Download PNG
          </button>
          <button
            onClick={() => handleDownload("jpeg")}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <FaDownload /> Download JPEG
          </button>
        </div>

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700 text-sm sm:text-base">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-xs sm:text-sm">
            <li>Customizable text with drag-and-drop positioning</li>
            <li>Advanced styling (gradient, shadow, border, opacity, transform)</li>
            <li>Undo/redo history (up to 10 steps)</li>
            <li>Export as PNG/JPEG or copy to clipboard</li>
          </ul>
        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} width={400} height={300} />
      </div>
    </div>
  );
};

export default TextToImage;