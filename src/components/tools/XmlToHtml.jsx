"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaCopy } from "react-icons/fa";

const XmlToHtml = () => {
  const [xmlInput, setXmlInput] = useState("");
  const [htmlOutput, setHtmlOutput] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    indent: 2,
    collapseContent: false,
    syntaxHighlight: true,
    includeComments: true,
    wrapLines: false,
    lineWidth: 80,
  });

  const xmlToHtml = useCallback((xml) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "application/xml");

      // Check for XML parsing errors
      const parserError = xmlDoc.querySelector("parsererror");
      if (parserError) {
        throw new Error("Invalid XML: " + parserError.textContent);
      }

      const convertNode = (node, level = 0) => {
        const indent = " ".repeat(level * options.indent);

        if (node.nodeType === Node.COMMENT_NODE && options.includeComments) {
          return options.syntaxHighlight
            ? `${indent}<span class="text-gray-500">&lt;!--${node.textContent}--&gt;</span>`
            : `${indent}<!--${node.textContent}-->`;
        }

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent.trim();
          return text
            ? options.syntaxHighlight
              ? `<span class="text-gray-800">${text}</span>`
              : text
            : "";
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return "";

        let html = options.syntaxHighlight
          ? `${indent}<span class="text-blue-600">&lt;${node.nodeName}</span>`
          : `${indent}<${node.nodeName}`;

        // Handle attributes
        if (node.attributes.length > 0) {
          for (let attr of node.attributes) {
            html += options.syntaxHighlight
              ? ` <span class="text-purple-600">${attr.name}</span>=<span class="text-green-600">"${attr.value}"</span>`
              : ` ${attr.name}="${attr.value}"`;
          }
        }

        html += options.syntaxHighlight ? '<span class="text-blue-600">&gt;</span>' : ">";

        // Handle child nodes
        const children = Array.from(node.childNodes)
          .map((child) => convertNode(child, level + 1))
          .filter(Boolean);

        if (children.length > 0) {
          if (
            !options.collapseContent ||
            children.length > 1 ||
            node.childNodes[0].nodeType !== Node.TEXT_NODE
          ) {
            html += "\n" + children.join("\n");
            if (options.wrapLines) {
              html = wrapText(html, options.lineWidth, indent);
            }
            html += "\n" + indent;
          } else {
            html += children[0];
          }
        }

        html += options.syntaxHighlight
          ? `<span class="text-blue-600">&lt;/${node.nodeName}&gt;</span>`
          : `</${node.nodeName}>`;

        return html;
      };

      const wrapText = (text, width, indent) => {
        const lines = text.split("\n");
        return lines
          .map((line) => {
            if (line.length <= width) return line;
            const words = line.trim().split(" ");
            let newLine = indent;
            let currentLine = "";
            for (const word of words) {
              if ((currentLine + word).length > width) {
                newLine += currentLine.trim() + "\n" + indent;
                currentLine = word + " ";
              } else {
                currentLine += word + " ";
              }
            }
            newLine += currentLine.trim();
            return newLine;
          })
          .join("\n");
      };

      const htmlContent = Array.from(xmlDoc.childNodes)
        .map((node) => convertNode(node))
        .join("\n");

      return `<pre class="p-4 bg-gray-100 rounded-md overflow-auto text-sm font-mono">${htmlContent}</pre>`;
    } catch (err) {
      setError(err.message);
      return "";
    }
  }, [options]);

  const handleConvert = () => {
    setError("");
    setHtmlOutput("");
    if (!xmlInput.trim()) {
      setError("Please enter an XML string");
      return;
    }
    const html = xmlToHtml(xmlInput);
    setHtmlOutput(html);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => {
      const newOptions = { ...prev, [key]: value };
      if (xmlInput) {
        setHtmlOutput(xmlToHtml(xmlInput));
      }
      return newOptions;
    });
  };

  const loadSampleXml = () => {
    const sample = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Sample XML Document -->
<root>
  <person id="1" type="employee">
    <name>John Doe</name>
    <age>30</age>
    <bio>A software developer with a passion for coding.</bio>
  </person>
</root>`;
    setXmlInput(sample);
    setError("");
    setHtmlOutput(xmlToHtml(sample));
  };

  const reset = () => {
    setXmlInput("");
    setHtmlOutput("");
    setError("");
    setOptions({
      indent: 2,
      collapseContent: false,
      syntaxHighlight: true,
      includeComments: true,
      wrapLines: false,
      lineWidth: 80,
    });
  };

  const copyToClipboard = () => {
    if (htmlOutput) {
      const text = htmlOutput.replace(/<[^>]+>/g, ""); // Strip HTML tags for plain text
      navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  const downloadHtml = () => {
    if (htmlOutput) {
      const blob = new Blob([htmlOutput], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `converted-html-${Date.now()}.html`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          XML to HTML Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">XML Input</label>
            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              placeholder="Enter your XML here..."
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            />
            <div className="mt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleConvert}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Convert to HTML
              </button>
              <button
                onClick={loadSampleXml}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Load Sample
              </button>
              <button
                onClick={reset}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Indent Size
                </label>
                <select
                  value={options.indent}
                  onChange={(e) => handleOptionChange("indent", parseInt(e.target.value))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>No Indent</option>
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.collapseContent}
                    onChange={(e) => handleOptionChange("collapseContent", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Collapse Single Text</span>
                </label>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.syntaxHighlight}
                    onChange={(e) => handleOptionChange("syntaxHighlight", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Syntax Highlighting</span>
                </label>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.includeComments}
                    onChange={(e) => handleOptionChange("includeComments", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Include Comments</span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.wrapLines}
                    onChange={(e) => handleOptionChange("wrapLines", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Wrap Lines</span>
                </label>
                {options.wrapLines && (
                  <div className="mt-1">
                    <label className="block text-xs text-gray-600">Line Width: {options.lineWidth}</label>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      value={options.lineWidth}
                      onChange={(e) => handleOptionChange("lineWidth", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Output Section */}
          {htmlOutput && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800">HTML Output</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    title="Copy to Clipboard"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    title="Download HTML"
                  >
                    <FaDownload />
                  </button>
                </div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Converts XML to formatted HTML with customizable options</li>
              <li>Syntax highlighting for tags, attributes, and text</li>
              <li>Support for comments and line wrapping</li>
              <li>Download output as HTML file</li>
              <li>Copy output to clipboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XmlToHtml;