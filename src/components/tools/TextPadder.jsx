"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaExpand,
} from "react-icons/fa";

const TextPadder = () => {
  const [inputText, setInputText] = useState("");
  const [paddedText, setPaddedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    padDirection: "right",    // left, right, both
    padChar: " ",             // Single character or custom string for padding
    targetLength: 10,
    padLinesSeparately: true,
    truncateIfLonger: false,  // Truncate lines longer than target length
    padBetweenWords: false,   // Pad between words instead of ends
    customPadString: "",      // Custom string for padding (overrides padChar if set)
  });

  const padText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to pad" };
    }

    const padStr = options.customPadString || options.padChar;
    if (!padStr) {
      return { error: "Padding character/string cannot be empty" };
    }

    if (options.targetLength < 1) {
      return { error: "Target length must be at least 1" };
    }

    let result;
    if (options.padLinesSeparately) {
      const lines = text.split("\n");
      result = lines.map(line => {
        if (options.padBetweenWords) {
          return padWordsInLine(line);
        }
        return padLine(line);
      }).join("\n");
    } else {
      if (options.padBetweenWords) {
        result = padWordsInLine(text);
      } else {
        result = padLine(text);
      }
    }

    return {
      original: text,
a: text,
      padded: result,
      changes: getChanges(),
    };
  };

  const padLine = (line) => {
    const padStr = options.customPadString || options.padChar.repeat(Math.max(1, options.targetLength - line.length));
    if (line.length >= options.targetLength && options.truncateIfLonger) {
      return options.padDirection === "left" ? line.slice(-options.targetLength) : line.slice(0, options.targetLength);
    }
    if (line.length >= options.targetLength) return line;

    const padLength = options.targetLength - line.length;
    const leftPad = options.padDirection === "both" ? padStr.slice(0, Math.floor(padLength / 2)) : options.padDirection === "left" ? padStr.slice(0, padLength) : "";
    const rightPad = options.padDirection === "both" ? padStr.slice(0, Math.ceil(padLength / 2)) : options.padDirection === "right" ? padStr.slice(0, padLength) : "";
    return leftPad + line + rightPad;
  };

  const padWordsInLine = (line) => {
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length <= 1) return line;
    const totalLength = words.reduce((sum, w) => sum + w.length, 0);
    if (totalLength >= options.targetLength) return line;
    const spacesNeeded = options.targetLength - totalLength;
    const gaps = words.length - 1;
    const padPerGap = Math.floor(spacesNeeded / gaps);
    const extraSpaces = spacesNeeded % gaps;
    const padStr = options.customPadString || options.padChar;
    return words.reduce((acc, word, i) => {
      if (i === 0) return word;
      const extra = i <= extraSpaces ? 1 : 0;
      return acc + padStr.repeat(padPerGap + extra) + word;
    }, "");
  };

  const getChanges = () => {
    const changes = [`Padded to length ${options.targetLength}`];
    changes.push(`Direction: ${options.padDirection}`);
    changes.push(`Padding: "${options.customPadString || options.padChar}"`);
    if (options.padLinesSeparately) changes.push("Padded lines separately");
    if (options.padBetweenWords) changes.push("Padded between words");
    if (options.truncateIfLonger) changes.push("Truncated longer lines");
    return changes;
  };

  const handlePad = useCallback(async () => {
    setError("");
    setPaddedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = padText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setPaddedText(result.padded);
        setHistory(prev => [...prev, { input: inputText, output: result.padded, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setPaddedText("");
    setError("");
    setOptions({
      padDirection: "right",
      padChar: " ",
      targetLength: 10,
      padLinesSeparately: true,
      truncateIfLonger: false,
      padBetweenWords: false,
      customPadString: "",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : value,
    }));
  };

  const exportPaddedText = () => {
    const content = `Original Text:\n${inputText}\n\nPadded Text:\n${paddedText}\n\nChanges:\n${padText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `padded_text_${options.padDirection}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full ">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Padder
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Pad:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-48 resize-y transition-all"
              placeholder="e.g., Hello\nWorld"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Padding Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pad Direction:</label>
                <select
                  value={options.padDirection}
                  onChange={(e) => handleOptionChange("padDirection", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pad Character:</label>
                <input
                  type="text"
                  value={options.padChar}
                  onChange={(e) => handleOptionChange("padChar", e.target.value.slice(0, 1))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength="1"
                  placeholder=" "
                  disabled={options.customPadString}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Pad String:</label>
                <input
                  type="text"
                  value={options.customPadString}
                  onChange={(e) => handleOptionChange("customPadString", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., -="
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Target Length:</label>
                <input
                  type="number"
                  value={options.targetLength}
                  onChange={(e) => handleOptionChange("targetLength", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="1000"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.padLinesSeparately}
                    onChange={() => handleOptionChange("padLinesSeparately", !options.padLinesSeparately)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Pad Lines Separately</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.truncateIfLonger}
                    onChange={() => handleOptionChange("truncateIfLonger", !options.truncateIfLonger)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Truncate if Longer</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.padBetweenWords}
                    onChange={() => handleOptionChange("padBetweenWords", !options.padBetweenWords)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Pad Between Words</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handlePad}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              <FaExpand className="inline mr-2" />
              {isLoading ? "Padding..." : "Pad Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {paddedText && (
              <button
                onClick={exportPaddedText}
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
        {paddedText && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Padded Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all max-h-64 overflow-auto">
              {paddedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {padText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(paddedText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Padded Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Paddings (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}" ({entry.options.targetLength})
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setPaddedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-300">
          <h3 className="font-semibold text-purple-700">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm">
            <li>Pad left, right, or both sides</li>
            <li>Custom pad character or string</li>
            <li>Pad lines separately or whole text</li>
            <li>Pad between words, truncate longer lines</li>
            <li>Export padded text and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextPadder;