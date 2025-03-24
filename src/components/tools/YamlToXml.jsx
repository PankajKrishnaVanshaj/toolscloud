"use client";

import React, { useState, useCallback } from "react";
import yaml from "js-yaml";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const YamlToXml = () => {
  const [yamlInput, setYamlInput] = useState("");
  const [xmlOutput, setXmlOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [rootNode, setRootNode] = useState("root");
  const [wrapCdata, setWrapCdata] = useState(false);
  const [xmlDeclaration, setXmlDeclaration] = useState(true);
  const [attributeMode, setAttributeMode] = useState(false);

  // Convert YAML to XML
  const convertYamlToXml = useCallback(() => {
    setError("");
    setXmlOutput("");

    if (!yamlInput.trim()) {
      setError("Please enter YAML input");
      return;
    }

    try {
      const jsonData = yaml.load(yamlInput);
      const xml = jsonToXml(jsonData, rootNode, 0);
      setXmlOutput(
        xmlDeclaration
          ? `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`
          : xml
      );
    } catch (err) {
      setError(`Invalid YAML: ${err.message}`);
    }
  }, [yamlInput, rootNode, indent, wrapCdata, xmlDeclaration, attributeMode]);

  // JSON to XML conversion logic
  const jsonToXml = (obj, nodeName, level) => {
    const indentStr = " ".repeat(level * indent);

    if (obj === null || obj === undefined) {
      return `${indentStr}<${nodeName}/>`;
    }

    if (typeof obj !== "object" || obj instanceof Date) {
      const value = obj.toString();
      return `${indentStr}<${nodeName}${
        attributeMode && level === 1 ? ` value="${escapeXml(value)}"` : ""
      }>${wrapCdata ? `<![CDATA[${value}]]>` : escapeXml(value)}</${nodeName}>`;
    }

    if (Array.isArray(obj)) {
      return obj
        .map((item) => jsonToXml(item, "item", level))
        .join("\n");
    }

    const children = Object.entries(obj)
      .map(([key, value]) => jsonToXml(value, key, level + 1))
      .join("\n");

    return children
      ? `${indentStr}<${nodeName}>\n${children}\n${indentStr}</${nodeName}>`
      : `${indentStr}<${nodeName}/>`;
  };

  // Proper XML escaping
  const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "'": return "&apos;";
        case '"': return "&quot;";
        default: return c;
      }
    });
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (xmlOutput) {
      navigator.clipboard.writeText(xmlOutput);
    }
  };

  // Download as XML file
  const downloadXml = () => {
    if (xmlOutput) {
      const blob = new Blob([xmlOutput], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `converted-${Date.now()}.xml`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Reset all fields
  const reset = () => {
    setYamlInput("");
    setXmlOutput("");
    setError("");
    setIndent(2);
    setRootNode("root");
    setWrapCdata(false);
    setXmlDeclaration(true);
    setAttributeMode(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          YAML to XML Converter
        </h1>

        <div className="space-y-6">
          {/* Input and Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YAML Input
              </label>
              <textarea
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                placeholder="Enter YAML here..."
                className="w-full h-64 sm:h-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                XML Output
              </label>
              <textarea
                value={xmlOutput}
                readOnly
                placeholder="XML output will appear here..."
                className="w-full h-64 sm:h-80 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm resize-y"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Root Node Name
              </label>
              <input
                type="text"
                value={rootNode}
                onChange={(e) => setRootNode(e.target.value || "root")}
                placeholder="e.g., root"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indentation (spaces)
              </label>
              <select
                value={indent}
                onChange={(e) => setIndent(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>No indentation</option>
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={wrapCdata}
                  onChange={(e) => setWrapCdata(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Wrap with CDATA</span>
              </label>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={xmlDeclaration}
                  onChange={(e) => setXmlDeclaration(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Include XML Declaration</span>
              </label>
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={attributeMode}
                  onChange={(e) => setAttributeMode(e.target.checked)}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-700">Use Attributes for Values</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={convertYamlToXml}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Convert to XML
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!xmlOutput}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy to Clipboard
            </button>
            <button
              onClick={downloadXml}
              disabled={!xmlOutput}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download XML
            </button>
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Usage */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Converts YAML to XML with customizable root node</li>
              <li>Adjustable indentation (0, 2, 4, 8 spaces)</li>
              <li>Optional XML declaration</li>
              <li>Wrap content in CDATA sections</li>
              <li>Use attributes for top-level values</li>
              <li>Copy to clipboard or download as XML file</li>
              <li>
                Example: <code>name: John</code> →{" "}
                <code>
                  &lt;root&gt;&lt;name&gt;John&lt;/name&gt;&lt;/root&gt;
                </code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YamlToXml;