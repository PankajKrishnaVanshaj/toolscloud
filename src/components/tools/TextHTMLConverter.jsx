"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaCode,
} from "react-icons/fa";

const TextHTMLConverter = () => {
  const [inputText, setInputText] = useState("");
  const [htmlOutput, setHtmlOutput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    wrapParagraphs: true,
    detectHeadings: true,
    detectLists: true,
    escapeSpecialChars: true,
    addInlineStyles: false,      // Add basic inline CSS
    wrapInContainer: false,      // Wrap in <div> or custom tag
    containerTag: "div",         // Custom container tag
    detectBoldItalic: true,      // Detect *bold* and _italic_
    indentOutput: true,          // Indent HTML output
  });

  const convertToHTML = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to convert" };
    }

    let lines = text.split("\n").filter(line => line.trim());
    let result = [];

    const escapeHtml = (str) => {
      if (!options.escapeSpecialChars) return str;
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const applyInlineStyles = (tag, content) => {
      if (!options.addInlineStyles) return `<${tag}>${content}</${tag}>`;
      const styles = {
        h1: 'style="font-size: 2em; font-weight: bold;"',
        h2: 'style="font-size: 1.5em; font-weight: bold;"',
        h3: 'style="font-size: 1.25em; font-weight: bold;"',
        p: 'style="margin: 1em 0;"',
        ul: 'style="list-style-type: disc; margin-left: 2em;"',
        ol: 'style="list-style-type: decimal; margin-left: 2em;"',
        li: 'style="margin: 0.5em 0;"',
        strong: 'style="font-weight: bold;"',
        em: 'style="font-style: italic;"',
      };
      return `<${tag} ${styles[tag] || ""}>${content}</${tag}>`;
    };

    let inList = false;
    let listType = "";
    let listItems = [];
    let indentLevel = options.indentOutput ? 0 : -1;

    const indent = (str, level = indentLevel) => 
      options.indentOutput && level >= 0 ? "  ".repeat(level) + str : str;

    lines.forEach((line, index) => {
      line = line.trim();

      // Detect bold (*text*) and italic (_text_)
      if (options.detectBoldItalic) {
        line = line
          .replace(/\*(.*?)\*/g, (_, content) => `<strong>${escapeHtml(content)}</strong>`)
          .replace(/_(.*?)_/g, (_, content) => `<em>${escapeHtml(content)}</em>`);
      }

      // Detect headings
      if (options.detectHeadings && line.match(/^#+/)) {
        if (inList) {
          result.push(renderList(listType, listItems, indentLevel));
          inList = false;
          listItems = [];
        }
        const level = Math.min(line.match(/^#+/)[0].length, 6);
        const content = escapeHtml(line.replace(/^#+/, "").trim());
        result.push(indent(applyInlineStyles(`h${level}`, content)));
        return;
      }

      // Detect lists
      if (options.detectLists && (line.match(/^[-*]/) || line.match(/^\d+\./))) {
        if (!inList) {
          inList = true;
          listType = line.match(/^[-*]/) ? "ul" : "ol";
        } else if ((listType === "ul" && line.match(/^\d+\./)) || (listType === "ol" && line.match(/^[-*]/))) {
          result.push(renderList(listType, listItems, indentLevel));
          listType = line.match(/^[-*]/) ? "ul" : "ol";
          listItems = [];
        }
        const content = escapeHtml(line.replace(/^[-*]|\d+\./, "").trim());
        listItems.push(indent(applyInlineStyles("li", content), indentLevel + 1));
        return;
      }

      // Close list if needed
      if (inList) {
        result.push(renderList(listType, listItems, indentLevel));
        inList = false;
        listItems = [];
      }

      // Wrap in paragraph or leave as is
      if (options.wrapParagraphs && line) {
        result.push(indent(applyInlineStyles("p", escapeHtml(line))));
      } else if (line) {
        result.push(indent(escapeHtml(line)));
      }
    });

    if (inList) {
      result.push(renderList(listType, listItems, indentLevel));
    }

    let finalOutput = result.join("\n");
    if (options.wrapInContainer) {
      const tag = options.containerTag || "div";
      finalOutput = `${indent(`<${tag}>`, indentLevel)}\n${finalOutput}\n${indent(`</${tag}>`, indentLevel)}`;
    }

    return finalOutput;
  };

  const renderList = (type, items, indentLevel) => {
    return `${indent(`<${type}>`, indentLevel)}\n${items.join("\n")}\n${indent(`</${type}>`, indentLevel)}`;
  };

  const handleConvert = useCallback(async () => {
    setError("");
    setHtmlOutput("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = convertToHTML(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setHtmlOutput(result);
        setHistory(prev => [...prev, { input: inputText, output: result, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setHtmlOutput("");
    setError("");
    setOptions({
      wrapParagraphs: true,
      detectHeadings: true,
      detectLists: true,
      escapeSpecialChars: true,
      addInlineStyles: false,
      wrapInContainer: false,
      containerTag: "div",
      detectBoldItalic: true,
      indentOutput: true,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "boolean" ? !prev[option] : value,
    }));
  };

  const exportHTML = () => {
    const content = options.wrapInContainer ? htmlOutput : `<!DOCTYPE html>\n<html>\n<body>\n${htmlOutput}\n</body>\n</html>`;
    const blob = new Blob([content], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `converted_${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text to HTML Converter
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Convert:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 sm:h-48 resize-y transition-all"
              placeholder={"# Heading\n- List item\n*Bold* text\nText paragraph"}
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Conversion Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.wrapParagraphs}
                    onChange={() => handleOptionChange("wrapParagraphs")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Wrap Paragraphs</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.detectHeadings}
                    onChange={() => handleOptionChange("detectHeadings")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Detect Headings</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.detectLists}
                    onChange={() => handleOptionChange("detectLists")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Detect Lists</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.escapeSpecialChars}
                    onChange={() => handleOptionChange("escapeSpecialChars")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Escape Special Chars</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.addInlineStyles}
                    onChange={() => handleOptionChange("addInlineStyles")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Add Inline Styles</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.wrapInContainer}
                    onChange={() => handleOptionChange("wrapInContainer")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Wrap in Container</span>
                </label>
                {options.wrapInContainer && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Container Tag:</label>
                    <input
                      type="text"
                      value={options.containerTag}
                      onChange={(e) => handleOptionChange("containerTag", e.target.value || "div")}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., div, section"
                      maxLength="20"
                    />
                  </div>
                )}
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.detectBoldItalic}
                    onChange={() => handleOptionChange("detectBoldItalic")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Detect Bold/Italic</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.indentOutput}
                    onChange={() => handleOptionChange("indentOutput")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Indent Output</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaCode className="inline mr-2" />
              {isLoading ? "Converting..." : "Convert to HTML"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {htmlOutput && (
              <button
                onClick={exportHTML}
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
        {htmlOutput && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">HTML Output</h2>
            <pre className="mt-3 text-gray-700 whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
              {htmlOutput}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(htmlOutput)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy to Clipboard
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Conversions (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>"{entry.input.slice(0, 20)}..."</span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setHtmlOutput(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-blue-500 hover:text-blue-700"
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
            <li>Detect headings (#), lists (-, 1.), bold (*), italic (_)</li>
            <li>Optional inline styles and container wrapping</li>
            <li>Customizable HTML output formatting</li>
            <li>Exportable HTML with history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextHTMLConverter;