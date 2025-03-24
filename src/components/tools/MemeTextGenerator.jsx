"use client";

import React, { useState, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo } from "react-icons/fa";

const MemeTextGenerator = () => {
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [outlineWidth, setOutlineWidth] = useState(2);
  const [fontFamily, setFontFamily] = useState("Impact");
  const [textAlign, setTextAlign] = useState("center");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const previewRef = useRef(null);

  const generateMemeTextStyle = (position) => ({
    fontFamily: `${fontFamily}, sans-serif`,
    fontSize: `${fontSize}px`,
    color: textColor,
    textTransform: "uppercase",
    textAlign,
    WebkitTextStroke: `${outlineWidth}px ${outlineColor}`,
    position: "absolute",
    width: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    ...(position === "top" ? { top: "10px" } : { bottom: "10px" }),
  });

  const copyToClipboard = () => {
    const text = `${topText}\n${bottomText}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const resetForm = () => {
    setTopText("");
    setBottomText("");
    setFontSize(40);
    setTextColor("#FFFFFF");
    setOutlineColor("#000000");
    setOutlineWidth(2);
    setFontFamily("Impact");
    setTextAlign("center");
    setIsCopied(false);
  };

  const downloadMeme = useCallback(() => {
    if (!previewRef.current) return;
    html2canvas(previewRef.current).then((canvas) => {
      const link = document.createElement("a");
      link.download = `meme-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }, []);

  const saveToHistory = () => {
    setHistory((prev) => [
      ...prev,
      {
        topText,
        bottomText,
        fontSize,
        textColor,
        outlineColor,
        outlineWidth,
        fontFamily,
        textAlign,
      },
    ].slice(-5));
  };

  const restoreFromHistory = (entry) => {
    setTopText(entry.topText);
    setBottomText(entry.bottomText);
    setFontSize(entry.fontSize);
    setTextColor(entry.textColor);
    setOutlineColor(entry.outlineColor);
    setOutlineWidth(entry.outlineWidth);
    setFontFamily(entry.fontFamily);
    setTextAlign(entry.textAlign);
  };

  const handleGenerate = () => {
    saveToHistory();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Meme Text Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top Text
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter top text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bottom Text
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter bottom text"
              />
            </div>
          </div>

          {/* Customization Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Customization Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Font Size (20-80px)
                </label>
                <input
                  type="number"
                  min="20"
                  max="80"
                  value={fontSize}
                  onChange={(e) => setFontSize(Math.max(20, Math.min(80, Number(e.target.value))))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Impact">Impact</option>
                  <option value="Arial">Arial</option>
                  <option value="Comic Sans MS">Comic Sans</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Text Color</label>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-10 p-1 border rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Outline Color</label>
                <input
                  type="color"
                  value={outlineColor}
                  onChange={(e) => setOutlineColor(e.target.value)}
                  className="w-full h-10 p-1 border rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Outline Width (0-5px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={outlineWidth}
                  onChange={(e) => setOutlineWidth(Math.max(0, Math.min(5, Number(e.target.value))))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Text Alignment</label>
                <select
                  value={textAlign}
                  onChange={(e) => setTextAlign(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                handleGenerate();
                copyToClipboard();
              }}
              className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                isCopied
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              <FaCopy className="mr-2" />
              {isCopied ? "Copied!" : "Copy Text"}
            </button>
            <button
              onClick={() => {
                handleGenerate();
                downloadMeme();
              }}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDownload className="mr-2" />
              Download Image
            </button>
            <button
              onClick={resetForm}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaTrash className="mr-2" />
              Reset
            </button>
          </div>

          {/* Preview */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Preview:</h2>
            <div
              ref={previewRef}
              className="relative w-full h-64 bg-gray-300 rounded-md overflow-hidden"
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600" />
              {topText && (
                <div style={generateMemeTextStyle("top")}>{topText}</div>
              )}
              {bottomText && (
                <div style={generateMemeTextStyle("bottom")}>{bottomText}</div>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Memes (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>
                      {entry.topText || "No Top"} / {entry.bottomText || "No Bottom"}
                    </span>
                    <button
                      onClick={() => restoreFromHistory(entry)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaUndo />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Features Info */}
          <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
            <h3 className="font-semibold text-blue-700">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm">
              <li>Custom font size, family, and alignment</li>
              <li>Adjustable text color and outline</li>
              <li>Copy text or download as image</li>
              <li>Track and restore recent memes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeTextGenerator;