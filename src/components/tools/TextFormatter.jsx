"use client";
import React, { useState } from "react";

const TextFormatter = () => {
  const [inputText, setInputText] = useState("");
  const [formattedText, setFormattedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    caseStyle: "none",      // none, lower, upper, title, sentence
    wrapLines: false,       // Wrap each line with prefix/suffix
    prefix: "",             // Text to add before each line
    suffix: "",             // Text to add after each line
    align: "left",          // left, right, center (for fixed width)
    width: 20,              // Width for alignment
    trim: true,             // Trim whitespace
  });

  // Format text based on options
  const formatText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to format" };
    }

    let result = text;

    // Apply case style
    switch (options.caseStyle) {
      case "lower":
        result = result.toLowerCase();
        break;
      case "upper":
        result = result.toUpperCase();
        break;
      case "title":
        result = result.replace(/\b\w/g, char => char.toUpperCase());
        break;
      case "sentence":
        result = result.replace(/(^\s*\w|[.!?]\s+\w)/g, char => char.toUpperCase());
        break;
      default:
        // "none" keeps original case
        break;
    }

    // Split into lines for further processing
    let lines = result.split("\n");

    // Trim lines
    if (options.trim) {
      lines = lines.map(line => line.trim());
    }

    // Apply wrapping and alignment
    lines = lines.map(line => {
      let formattedLine = line;

      // Apply alignment with fixed width
      if (options.width > 0 && formattedLine.length < options.width) {
        const padding = " ".repeat(options.width - formattedLine.length);
        switch (options.align) {
          case "left":
            formattedLine = formattedLine + padding;
            break;
          case "right":
            formattedLine = padding + formattedLine;
            break;
          case "center":
            const leftPadding = " ".repeat(Math.floor((options.width - formattedLine.length) / 2));
            const rightPadding = " ".repeat(options.width - formattedLine.length - leftPadding.length);
            formattedLine = leftPadding + formattedLine + rightPadding;
            break;
          default:
            break;
        }
      }

      // Apply wrapping
      if (options.wrapLines) {
        formattedLine = `${options.prefix}${formattedLine}${options.suffix}`;
      }

      return formattedLine;
    });

    result = lines.join("\n");

    return {
      original: text,
      formatted: result,
      changes: getChanges(text, result),
    };
  };

  // Helper to identify changes made
  const getChanges = (original, formatted) => {
    const changes = [];
    if (original === formatted) return ["No changes made"];

    if (options.caseStyle !== "none" && original !== formatted.toLowerCase() && original !== formatted.toUpperCase()) {
      changes.push(`Applied ${options.caseStyle} case`);
    }
    if (options.trim && (original.startsWith(" ") || original.endsWith(" ") || original.startsWith("\n") || original.endsWith("\n"))) {
      changes.push("Trimmed whitespace");
    }
    if (options.width > 0 && options.align !== "left") {
      changes.push(`Aligned ${options.align} with width ${options.width}`);
    }
    if (options.wrapLines && (options.prefix || options.suffix)) {
      changes.push(`Wrapped lines with prefix "${options.prefix}" and suffix "${options.suffix}"`);
    }
    return changes.length > 0 ? changes : ["Applied basic formatting"];
  };

  const handleFormat = async () => {
    setError("");
    setFormattedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = formatText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setFormattedText(result.formatted);
    } catch (err) {
      setError("An error occurred while formatting the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setFormattedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(0, value) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Formatter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Format:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 resize-y transition-all"
              placeholder="e.g., hello world\nthis is a test"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Formatting Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Case Style:</label>
                <select
                  value={options.caseStyle}
                  onChange={(e) => handleOptionChange("caseStyle", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="none">None</option>
                  <option value="lower">Lowercase</option>
                  <option value="upper">Uppercase</option>
                  <option value="title">Title Case</option>
                  <option value="sentence">Sentence Case</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Align:</label>
                <select
                  value={options.align}
                  onChange={(e) => handleOptionChange("align", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="center">Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Width:</label>
                <input
                  type="number"
                  value={options.width}
                  onChange={(e) => handleOptionChange("width", parseInt(e.target.value) || 0)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max="100"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.wrapLines}
                  onChange={() => handleOptionChange("wrapLines", !options.wrapLines)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span>Wrap Lines</span>
              </label>
              {options.wrapLines && (
                <>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Prefix:</label>
                    <input
                      type="text"
                      value={options.prefix}
                      onChange={(e) => handleOptionChange("prefix", e.target.value)}
                      className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Suffix:</label>
                    <input
                      type="text"
                      value={options.suffix}
                      onChange={(e) => handleOptionChange("suffix", e.target.value)}
                      className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength="10"
                    />
                  </div>
                </>
              )}
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.trim}
                  onChange={() => handleOptionChange("trim", !options.trim)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span>Trim</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleFormat}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Formatting..." : "Format Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {formattedText && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Formatted Text
            </h2>
            <pre className="mt-3 text-lg text-gray-700 whitespace-pre-wrap break-all">
              {formattedText}
            </pre>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {formatText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(formattedText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              Copy Formatted Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextFormatter;