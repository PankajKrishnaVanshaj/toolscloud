"use client";

import { useState, useCallback } from "react";
import {
  FaCopy,
  FaDownload,
  FaUpload,
  FaUndo,
  FaRedo,
  FaTrash,
} from "react-icons/fa";

const TextLineNumberer = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [options, setOptions] = useState({
    startNumber: 1,
    increment: 1,
    padding: 2,
    separator: ": ",
    alignRight: false,
    prefix: "",
    suffix: "",
    skipEmptyLines: false,
    numberOnlyNonEmpty: false,
  });

  const updateHistory = useCallback((newOutput) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ inputText, outputText: newOutput });
      return newHistory.slice(-10); // Limit to 10 entries
    });
    setHistoryIndex(prev => prev + 1);
  }, [inputText, historyIndex]);

  const numberLines = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to number" };
    }

    const lines = text.split("\n");
    let currentNumber = options.startNumber;
    let maxNumberLength = String(options.startNumber + (lines.length - 1) * options.increment).length;

    const numberedLines = lines.map((line, index) => {
      const isEmpty = line.trim() === "";
      if (options.skipEmptyLines && isEmpty) return line;
      if (options.numberOnlyNonEmpty && isEmpty) return line;

      const lineNumber = currentNumber + (index * options.increment);
      const paddedNumber = String(lineNumber).padStart(Math.max(options.padding, maxNumberLength), "0");
      const formattedNumber = options.alignRight
        ? paddedNumber.padStart(Math.max(options.padding, maxNumberLength), " ")
        : paddedNumber;
      return `${options.prefix}${formattedNumber}${options.separator}${line}${options.suffix}`;
    });

    return { numbered: numberedLines.join("\n") };
  };

  const handleNumberLines = async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = numberLines(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setOutputText(result.numbered);
      updateHistory(result.numbered);
    } catch (err) {
      setError("An error occurred while numbering the lines");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevState = history[historyIndex - 1];
      setInputText(prevState.inputText);
      setOutputText(prevState.outputText);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextState = history[historyIndex + 1];
      setInputText(nextState.inputText);
      setOutputText(nextState.outputText);
    }
  };

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
    setHistory([]);
    setHistoryIndex(-1);
    setOptions({
      startNumber: 1,
      increment: 1,
      padding: 2,
      separator: ": ",
      alignRight: false,
      prefix: "",
      suffix: "",
      skipEmptyLines: false,
      numberOnlyNonEmpty: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInputText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `numbered_text_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    alert("Numbered text copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-gray-900">
          Advanced Text Line Numberer
        </h1>

        {/* Input Section */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Enter Text to Number:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 sm:h-40 resize-y transition-all text-sm sm:text-base"
              placeholder="e.g., First line\nSecond line\nThird line"
              maxLength={10000}
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm sm:text-base font-medium text-gray-700">Numbering Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Start Number:</label>
                <input
                  type="number"
                  value={options.startNumber}
                  onChange={(e) => handleOptionChange("startNumber", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Increment:</label>
                <input
                  type="number"
                  value={options.increment}
                  onChange={(e) => handleOptionChange("increment", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Padding (digits):</label>
                <input
                  type="number"
                  value={options.padding}
                  onChange={(e) => handleOptionChange("padding", parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Separator:</label>
                <input
                  type="text"
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Prefix:</label>
                <input
                  type="text"
                  value={options.prefix}
                  onChange={(e) => handleOptionChange("prefix", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-gray-600 mb-1">Suffix:</label>
                <input
                  type="text"
                  value={options.suffix}
                  onChange={(e) => handleOptionChange("suffix", e.target.value)}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  maxLength="5"
                />
              </div>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.alignRight}
                  onChange={() => handleOptionChange("alignRight", !options.alignRight)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Align Numbers Right</span>
              </label>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.skipEmptyLines}
                  onChange={() => handleOptionChange("skipEmptyLines", !options.skipEmptyLines)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Skip Empty Lines</span>
              </label>
              <label className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.numberOnlyNonEmpty}
                  onChange={() => handleOptionChange("numberOnlyNonEmpty", !options.numberOnlyNonEmpty)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Number Only Non-Empty Lines</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <button
              onClick={handleNumberLines}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base disabled:bg-blue-400`}
            >
              {isLoading ? "Numbering..." : "Number Lines"}
            </button>
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base disabled:bg-gray-400"
            >
              <FaUndo /> Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base disabled:bg-gray-400"
            >
              <FaRedo /> Redo
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm sm:text-base disabled:bg-gray-400"
            >
              <FaTrash /> Reset
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm sm:text-base cursor-pointer">
              <FaUpload /> Import
              <input
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 sm:mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Output Display */}
        {outputText && (
          <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-blue-50 rounded-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center">
              Numbered Text
            </h2>
            <pre className="mt-3 text-gray-700 whitespace-pre-wrap break-all text-sm sm:text-base max-h-60 overflow-auto">
              {outputText}
            </pre>
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3 justify-center">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all text-sm sm:text-base"
              >
                <FaCopy /> Copy
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base"
              >
                <FaDownload /> Export
              </button>
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-4 sm:mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700 text-sm sm:text-base">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-xs sm:text-sm">
            <li>Customizable line numbering with prefix/suffix</li>
            <li>Options to skip or number only non-empty lines</li>
            <li>Undo/redo history (up to 10 steps)</li>
            <li>Import/export text with numbers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextLineNumberer;