"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaCog } from "react-icons/fa";

const CSSBeautifier = () => {
  const [inputCSS, setInputCSS] = useState("");
  const [outputCSS, setOutputCSS] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indentSize: 2,
    removeComments: true,
    sortProperties: false,
    addNewlines: true,
  });

  const beautifyCSS = useCallback((css) => {
    setError(null);
    setOutputCSS("");
    setCopied(false);

    if (!css.trim()) {
      setError("Please enter some CSS to beautify");
      return;
    }

    try {
      let formatted = "";
      let indentLevel = 0;
      let inRule = false;
      let properties = [];

      // Initial CSS processing
      let processedCSS = css;
      if (options.removeComments) {
        processedCSS = processedCSS
          .replace(/\/\*[\s\S]*?\*\//g, "") // Multi-line comments
          .replace(/\/\/.*$/gm, ""); // Single-line comments
      }
      processedCSS = processedCSS.replace(/\s+/g, " ").trim();

      const lines = processedCSS.split(/([{}])/).filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line === "{") {
          formatted += " ".repeat(indentLevel * options.indentSize) + lines[i - 1].trim() + " {\n";
          indentLevel++;
          inRule = true;
          properties = [];
        } else if (line === "}") {
          if (properties.length > 0) {
            if (options.sortProperties) {
              properties.sort();
            }
            formatted += properties
              .map(prop => " ".repeat(indentLevel * options.indentSize) + prop + ";")
              .join(options.addNewlines ? "\n" : " ");
            if (options.addNewlines) formatted += "\n";
          }
          indentLevel = Math.max(0, indentLevel - 1);
          formatted += " ".repeat(indentLevel * options.indentSize) + "}\n";
          inRule = false;
        } else if (inRule && line) {
          const props = line.split(";").filter(Boolean);
          properties.push(...props.map(p => p.trim()));
        } else if (!inRule && line) {
          formatted += line + (options.addNewlines ? "\n" : " ");
        }
      }

      setOutputCSS(formatted.trim());
    } catch (err) {
      setError("Error beautifying CSS: " + err.message);
    }
  }, [options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    beautifyCSS(inputCSS);
  };

  const handleCopy = () => {
    if (outputCSS) {
      navigator.clipboard.writeText(outputCSS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (outputCSS) {
      const blob = new Blob([outputCSS], { type: "text/css" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `beautified-${Date.now()}.css`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputCSS("");
    setOutputCSS("");
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">CSS Beautifier</h2>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Input CSS</label>
            <textarea
              value={inputCSS}
              onChange={(e) => setInputCSS(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="body{font-size:16px;color:#333;}div{margin:0 auto;}"
              aria-label="CSS Input"
            />
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FaCog className="mr-2" /> Formatting Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={options.indentSize}
                    onChange={(e) => setOptions(prev => ({ ...prev, indentSize: Number(e.target.value) }))}
                    className="w-16 p-1 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Indent Size</span>
                </label>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.removeComments}
                  onChange={(e) => setOptions(prev => ({ ...prev, removeComments: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Remove Comments</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.sortProperties}
                  onChange={(e) => setOptions(prev => ({ ...prev, sortProperties: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Sort Properties</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.addNewlines}
                  onChange={(e) => setOptions(prev => ({ ...prev, addNewlines: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Add Newlines</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Beautify CSS
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={!outputCSS}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Beautified Output */}
        {outputCSS && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
              <h3 className="font-semibold text-gray-700">Beautified CSS</h3>
              <button
                onClick={handleCopy}
                className={`py-2 px-4 rounded-lg transition-colors flex items-center justify-center ${
                  copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm font-mono text-gray-800 whitespace-pre-wrap max-h-96 overflow-auto">
              {outputCSS}
            </pre>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Customizable indentation size</li>
            <li>Optional comment removal</li>
            <li>Alphabetical property sorting</li>
            <li>Control over newline insertion</li>
            <li>Copy and download formatted CSS</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CSSBeautifier;