"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaAlignLeft,
} from "react-icons/fa";

const TextAligner = () => {
  const [inputText, setInputText] = useState("");
  const [alignedText, setAlignedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    alignment: "left",         // left, right, center, justify
    width: 20,
    alignChar: " ",
    trim: true,
    alignLinesSeparately: true,
    maxLines: 0,              // Limit number of lines (0 = unlimited)
    preserveCase: true,       // Preserve original case
    wrapEnds: "",             // Wrap aligned text with custom chars
    autoWidth: false,         // Auto-set width to longest line
  });

  const alignText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to align" };
    }

    if (options.width < 1 && !options.autoWidth) {
      return { error: "Width must be at least 1 unless auto-width is enabled" };
    }

    if (options.alignChar.length !== 1) {
      return { error: "Alignment character must be a single character" };
    }

    let lines = text.split("\n").map(line => options.trim ? line.trim() : line);
    if (options.maxLines > 0 && lines.length > options.maxLines) {
      lines = lines.slice(0, options.maxLines);
    }

    let effectiveWidth = options.width;
    if (options.autoWidth) {
      effectiveWidth = Math.max(...lines.map(line => line.length));
    }

    const justifyLine = (line) => {
      if (line.length >= effectiveWidth) return line;
      const words = line.split(/\s+/).filter(w => w.length > 0);
      if (words.length <= 1) return line + options.alignChar.repeat(effectiveWidth - line.length);

      const totalSpaces = effectiveWidth - words.join("").length;
      const spacesPerGap = Math.floor(totalSpaces / (words.length - 1));
      const extraSpaces = totalSpaces % (words.length - 1);
      let result = words[0];
      for (let i = 1; i < words.length; i++) {
        const spaces = spacesPerGap + (i <= extraSpaces ? 1 : 0);
        result += options.alignChar.repeat(spaces) + words[i];
      }
      return result;
    };

    let result;
    if (options.alignLinesSeparately) {
      result = lines.map(line => {
        let cleanedLine = options.preserveCase ? line : line.toLowerCase();
        if (cleanedLine.length >= effectiveWidth) return cleanedLine;

        const paddingLength = effectiveWidth - cleanedLine.length;
        const padding = options.alignChar.repeat(paddingLength);

        let alignedLine;
        switch (options.alignment) {
          case "left":
            alignedLine = cleanedLine + padding;
            break;
          case "right":
            alignedLine = padding + cleanedLine;
            break;
          case "center":
            const leftPadding = options.alignChar.repeat(Math.floor(paddingLength / 2));
            const rightPadding = options.alignChar.repeat(paddingLength - leftPadding.length);
            alignedLine = leftPadding + cleanedLine + rightPadding;
            break;
          case "justify":
            alignedLine = justifyLine(cleanedLine);
            break;
          default:
            alignedLine = cleanedLine;
        }
        return options.wrapEnds ? `${options.wrapEnds}${alignedLine}${options.wrapEnds}` : alignedLine;
      }).join("\n");
    } else {
      let cleanedText = options.trim ? text.replace(/\s+/g, " ").trim() : text;
      cleanedText = options.preserveCase ? cleanedText : cleanedText.toLowerCase();
      if (cleanedText.length >= effectiveWidth) return cleanedText;

      const paddingLength = effectiveWidth - cleanedText.length;
      const padding = options.alignChar.repeat(paddingLength);

      switch (options.alignment) {
        case "left":
          result = cleanedText + padding;
          break;
        case "right":
          result = padding + cleanedText;
          break;
        case "center":
          const leftPadding = options.alignChar.repeat(Math.floor(paddingLength / 2));
          const rightPadding = options.alignChar.repeat(paddingLength - leftPadding.length);
          result = leftPadding + cleanedText + rightPadding;
          break;
        case "justify":
          result = justifyLine(cleanedText);
          break;
        default:
          result = cleanedText;
      }
      result = options.wrapEnds ? `${options.wrapEnds}${result}${options.wrapEnds}` : result;
    }

    return {
      original: text,
      aligned: result,
      changes: getChanges(text, result, effectiveWidth),
    };
  };

  const getChanges = (original, aligned, effectiveWidth) => {
    const changes = [];
    if (original === aligned) return ["No changes made"];

    if (options.trim && (original !== original.trim() || (options.alignLinesSeparately && original.split("\n").some(line => line !== line.trim())))) {
      changes.push("Trimmed whitespace");
    }
    changes.push(`Aligned ${options.alignment} with width ${effectiveWidth} using "${options.alignChar}"`);
    if (options.autoWidth) changes.push("Width auto-set to longest line");
    if (!options.preserveCase) changes.push("Converted to lowercase");
    if (options.maxLines > 0) changes.push(`Limited to ${options.maxLines} lines`);
    if (options.wrapEnds) changes.push(`Wrapped with "${options.wrapEnds}"`);
    if (!options.alignLinesSeparately) changes.push("Processed as single block");
    return changes;
  };

  const handleAlign = useCallback(async () => {
    setError("");
    setAlignedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = alignText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setAlignedText(result.aligned);
        setHistory(prev => [...prev, { input: inputText, output: result.aligned, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setAlignedText("");
    setError("");
    setOptions({
      alignment: "left",
      width: 20,
      alignChar: " ",
      trim: true,
      alignLinesSeparately: true,
      maxLines: 0,
      preserveCase: true,
      wrapEnds: "",
      autoWidth: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const exportAlignedText = () => {
    const content = `Original Text:\n${inputText}\n\nAligned Text:\n${alignedText}\n\nChanges:\n${alignText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `aligned_text_${options.alignment}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Aligner
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Align:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-48 resize-y transition-all font-mono"
              placeholder="e.g., Hello\nWorld"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Alignment Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Alignment:</label>
                <select
                  value={options.alignment}
                  onChange={(e) => handleOptionChange("alignment", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="center">Center</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Width:</label>
                <input
                  type="number"
                  value={options.width}
                  onChange={(e) => handleOptionChange("width", parseInt(e.target.value) || 1)}
                  disabled={options.autoWidth}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500 ${options.autoWidth ? "opacity-50" : ""}`}
                  min="1"
                  max="200"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Align Character:</label>
                <input
                  type="text"
                  value={options.alignChar}
                  onChange={(e) => handleOptionChange("alignChar", e.target.value.slice(0, 1))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength="1"
                  placeholder=" "
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Lines (0 = unlimited):</label>
                <input
                  type="number"
                  value={options.maxLines}
                  onChange={(e) => handleOptionChange("maxLines", parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Wrap Ends (optional):</label>
                <input
                  type="text"
                  value={options.wrapEnds}
                  onChange={(e) => handleOptionChange("wrapEnds", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  maxLength="5"
                  placeholder="e.g., |"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.trim}
                    onChange={() => handleOptionChange("trim", !options.trim)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Trim Whitespace</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.alignLinesSeparately}
                    onChange={() => handleOptionChange("alignLinesSeparately", !options.alignLinesSeparately)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Align Lines Separately</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveCase}
                    onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Preserve Case</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.autoWidth}
                    onChange={() => handleOptionChange("autoWidth", !options.autoWidth)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Auto-Width</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleAlign}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-teal-400 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              <FaAlignLeft className="inline mr-2" />
              {isLoading ? "Aligning..." : "Align Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {alignedText && (
              <button
                onClick={exportAlignedText}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
              >
                <FaDownload className="inline mr-2" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {alignedText && (
          <div className="mt-8 p-6 bg-teal-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Aligned Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all font-mono max-h-64 overflow-auto">
              {alignedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {alignText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(alignedText)}
              className="mt-4 w-full py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Aligned Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Alignments (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.alignment}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setAlignedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-teal-500 hover:text-teal-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-300">
          <h3 className="font-semibold text-teal-700">Features</h3>
          <ul className="list-disc list-inside text-teal-600 text-sm">
            <li>Left, right, center, and justify alignment</li>
            <li>Custom width or auto-width based on longest line</li>
            <li>Trim, preserve case, and wrap options</li>
            <li>Line-by-line or block alignment</li>
            <li>Export aligned text and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextAligner;