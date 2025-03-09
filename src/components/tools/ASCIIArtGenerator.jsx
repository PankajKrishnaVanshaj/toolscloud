"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaHistory, FaUndo } from "react-icons/fa";

const ASCIIArtGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [asciiArt, setAsciiArt] = useState("");
  const [fontStyle, setFontStyle] = useState("standard");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    maxLength: 20,         // Max input length
    horizontalScale: 1,    // Scale width of characters
    verticalScale: 1,      // Scale height of art
    alignment: "left",     // left, center, right
  });

  // Expanded ASCII font styles
  const asciiFonts = {
    standard: {
      A: " A ", B: " B ", C: " C ", D: " D ", E: " E ",
      F: " F ", G: " G ", H: " H ", I: " I ", J: " J ",
      K: " K ", L: " L ", M: " M ", N: " N ", O: " O ",
      P: " P ", Q: " Q ", R: " R ", S: " S ", T: " T ",
      U: " U ", V: " V ", W: " W ", X: " X ", Y: " Y ",
      Z: " Z ", " ": "   ",
    },
    block: {
      A: "███", B: "███", C: "██ ", D: "███", E: "███",
      F: "███", G: "██ ", H: "█ █", I: " █ ", J: "  █",
      K: "█ █", L: "█  ", M: "█ █", N: "█ █", O: "███",
      P: "███", Q: "███", R: "███", S: "██ ", T: "███",
      U: "█ █", V: "█ █", W: "█ █", X: "█ █", Y: "█ █",
      Z: "██ ", " ": "   ",
    },
    banner: {
      A: "   A   ", B: "  BB  ", C: " CCC  ", D: "  DD  ", E: "  EEE ",
      F: "  FFF ", G: " GGG  ", H: " H  H ", I: "  III ", J: "    J ",
      K: " K  K ", L: " L    ", M: " M  M ", N: " N  N ", O: " OOO  ",
      P: " PPP  ", Q: " QQQ  ", R: " RRR  ", S: "  SSS ", T: " TTTTT",
      U: " U  U ", V: " V  V ", W: " W  W ", X: " X  X ", Y: " Y  Y ",
      Z: " ZZZZ ", " ": "       ",
    },
    slant: {
      A: "  /\\  ", B: " _/  ", C: "/   ", D: " _/ ", E: " _/ ",
      F: " _/ ", G: "  /_ ", H: "/ / ", I: " / ", J: "   /",
      K: "/ / ", L: "/  ", M: "|\\/|", N: "| / ", O: " /\\ ",
      P: "|  ", Q: " /\\ ", R: "|_/ ", S: "  / ", T: " /| ",
      U: "\\/ ", V: " \\/ ", W: "\\/\\/", X: " /\\ ", Y: "\\/ ",
      Z: "_/ ", " ": "    ",
    },
  };

  const generateASCIIArt = useCallback(() => {
    if (!inputText.trim()) {
      setAsciiArt("Please enter some text!");
      return;
    }

    const selectedFont = asciiFonts[fontStyle];
    const upperText = inputText.toUpperCase().slice(0, options.maxLength);
    let lines = Array(options.verticalScale).fill("");

    for (let char of upperText) {
      const charArt = selectedFont[char] || selectedFont[" "] || " ? ";
      for (let i = 0; i < options.verticalScale; i++) {
        let lineArt = charArt;
        if (fontStyle === "block" && i > 0) {
          lineArt = char === " " ? "   " : i === 1 ? "█ █" : "███";
        } else if (fontStyle === "banner" && i > 0) {
          lineArt = char === " " ? "       " : "  ***  ";
        } else if (fontStyle === "slant" && i > 0) {
          lineArt = char === " " ? "    " : i === 1 ? " /  " : "/   ";
        }
        lines[i] += charArt.repeat(options.horizontalScale);
      }
    }

    // Apply alignment
    const maxLineLength = Math.max(...lines.map((line) => line.length));
    const alignedLines = lines.map((line) => {
      const padding = maxLineLength - line.length;
      if (options.alignment === "center") {
        const leftPad = " ".repeat(Math.floor(padding / 2));
        const rightPad = " ".repeat(Math.ceil(padding / 2));
        return leftPad + line + rightPad;
      } else if (options.alignment === "right") {
        return " ".repeat(padding) + line;
      }
      return line; // left alignment
    });

    const result = alignedLines.filter((line) => line.trim()).join("\n");
    setAsciiArt(result);
    setHistory((prev) => [
      ...prev,
      { input: inputText, art: result, fontStyle, options },
    ].slice(-5));
    setIsCopied(false);
  }, [inputText, fontStyle, options]);

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(asciiArt)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const clearArt = () => {
    setInputText("");
    setAsciiArt("");
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setInputText(entry.input);
    setAsciiArt(entry.art);
    setFontStyle(entry.fontStyle);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced ASCII Art Generator
        </h1>

        <div className="space-y-6">
          {/* Input and Font Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Text (max {options.maxLength} characters)
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, options.maxLength))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text to convert"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Style
              </label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="standard">Standard</option>
                <option value="block">Block</option>
                <option value="banner">Banner</option>
                <option value="slant">Slant</option>
              </select>
            </div>
          </div>

          {/* Customization Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Customization Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Length:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={options.maxLength}
                  onChange={(e) =>
                    handleOptionChange("maxLength", Math.max(1, Math.min(50, Number(e.target.value) || 20)))
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Horizontal Scale:</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={options.horizontalScale}
                  onChange={(e) =>
                    handleOptionChange("horizontalScale", Math.max(1, Math.min(5, Number(e.target.value) || 1)))
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Vertical Scale:</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={options.verticalScale}
                  onChange={(e) =>
                    handleOptionChange("verticalScale", Math.max(1, Math.min(5, Number(e.target.value) || 1)))
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Alignment:</label>
                <select
                  value={options.alignment}
                  onChange={(e) => handleOptionChange("alignment", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateASCIIArt}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Generate ASCII Art
            </button>
            {asciiArt && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={clearArt}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output */}
        {asciiArt && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Generated ASCII Art:
            </h2>
            <pre className="text-sm font-mono text-gray-800 whitespace-pre max-h-96 overflow-auto">
              {asciiArt}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Art (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.input.slice(0, 10)}... ({entry.fontStyle})
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
            <li>Multiple font styles: Standard, Block, Banner, Slant</li>
            <li>Customizable max length, scaling, and alignment</li>
            <li>Copy and track recent ASCII art</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ASCIIArtGenerator;