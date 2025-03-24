"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaCog } from "react-icons/fa";

const XMLFormatter = () => {
  const [inputXML, setInputXML] = useState("");
  const [formattedXML, setFormattedXML] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    indentSize: 2,
    preserveComments: true,
    minify: false,
    validate: true,
  });

  const formatXML = useCallback((xmlString) => {
    setError(null);
    setFormattedXML("");
    setCopied(false);

    if (!xmlString.trim()) {
      setError("Please enter some XML to format");
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const errorNode = xmlDoc.querySelector("parsererror");
      if (options.validate && errorNode) {
        throw new Error(`Invalid XML: ${errorNode.textContent}`);
      }

      const formatNode = (node, level = 0) => {
        const indent = options.minify ? "" : " ".repeat(options.indentSize * level);
        let result = "";

        if (node.nodeType === Node.ELEMENT_NODE) {
          const tagName = node.tagName;
          const attributes = Array.from(node.attributes)
            .map((attr) => `${attr.name}="${attr.value}"`)
            .join(" ");
          
          result += `${indent}<${tagName}${attributes ? " " + attributes : ""}`;

          const children = Array.from(node.childNodes);
          if (children.length === 0) {
            result += options.minify ? "/>" : " />\n";
          } else {
            result += options.minify ? ">" : ">\n";
            children.forEach((child) => {
              if (child.nodeType === Node.COMMENT_NODE && !options.preserveComments) return;
              result += formatNode(child, level + 1);
            });
            result += options.minify ? `</${tagName}>` : `${indent}</${tagName}>\n`;
          }
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const text = node.textContent.trim();
          result += options.minify ? text : `${indent}${text}\n`;
        } else if (node.nodeType === Node.COMMENT_NODE && options.preserveComments) {
          result += options.minify ? `<!--${node.textContent}-->` : `${indent}<!--${node.textContent}-->\n`;
        }

        return result;
      };

      const formatted = formatNode(xmlDoc.documentElement);
      setFormattedXML(formatted.trim());
    } catch (err) {
      setError("Error formatting XML: " + err.message);
    }
  }, [options]);

  const handleSubmit = (e) => {
    e.preventDefault();
    formatXML(inputXML);
  };

  const handleCopy = () => {
    if (formattedXML) {
      navigator.clipboard.writeText(formattedXML);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (formattedXML) {
      const blob = new Blob([formattedXML], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `formatted-${Date.now()}.xml`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputXML("");
    setFormattedXML("");
    setError(null);
    setCopied(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">XML Formatter</h2>

        {/* Input Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input XML
            </label>
            <textarea
              value={inputXML}
              onChange={(e) => setInputXML(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder='<root><child attr="value">Text</child></root>'
              aria-label="XML Input"
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
                    min="1"
                    max="8"
                    value={options.indentSize}
                    onChange={(e) => setOptions({ ...options, indentSize: Number(e.target.value) })}
                    className="w-16 p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    disabled={options.minify}
                  />
                  <span className="text-sm text-gray-600">Indent Size</span>
                </label>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.preserveComments}
                  onChange={(e) => setOptions({ ...options, preserveComments: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Preserve Comments</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.minify}
                  onChange={(e) => setOptions({ ...options, minify: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Minify Output</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.validate}
                  onChange={(e) => setOptions({ ...options, validate: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Validate XML</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!inputXML.trim()}
            >
              Format XML
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!formattedXML}
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

        {/* Formatted Output */}
        {formattedXML && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-700">Formatted XML</h3>
              <button
                onClick={handleCopy}
                className={`py-1 px-3 text-sm rounded transition-colors flex items-center ${
                  copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200 max-h-96 overflow-auto">
              {formattedXML}
            </pre>
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Formats XML with customizable indentation</li>
            <li>Optional XML validation</li>
            <li>Minify option for compact output</li>
            <li>Preserve or remove comments</li>
            <li>Copy to clipboard and download as .xml</li>
            <li>Supports complex nested structures</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default XMLFormatter;