"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaSync, FaDownload, FaEye, FaCode } from "react-icons/fa";

const XMLValidator = () => {
  const [xmlInput, setXmlInput] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFormatted, setShowFormatted] = useState(false);
  const validationCount = useRef(0);
  const [validationOptions, setValidationOptions] = useState({
    checkEmptyTags: true,
    checkDuplicateIds: true,
    checkComments: false,
    strictMode: false,
  });

  const formatXML = (xml) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(doc);
      return formatted.replace(/></g, ">\n<").replace(/^\s+|\s+$/g, "");
    } catch {
      return xml;
    }
  };

  const validateXML = useCallback((xml) => {
    setError(null);
    setValidationResult(null);
    setLoading(true);

    if (!xml.trim()) {
      setError("Please enter some XML content");
      setLoading(false);
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, "application/xml");
      const parserError = doc.querySelector("parsererror");

      if (parserError) {
        throw new Error(parserError.textContent || "Unknown parsing error");
      }

      const analysis = {
        isValid: true,
        rootElement: doc.documentElement.tagName,
        elementCount: doc.getElementsByTagName("*").length,
        attributesCount: Array.from(doc.getElementsByTagName("*")).reduce(
          (count, el) => count + el.attributes.length,
          0
        ),
        issues: [],
        formattedXML: formatXML(xml),
      };

      // Enhanced validation checks
      const elements = doc.getElementsByTagName("*");
      const ids = new Set();

      Array.from(elements).forEach((el, index) => {
        // Check empty tags
        if (
          validationOptions.checkEmptyTags &&
          !el.textContent.trim() &&
          !el.hasChildNodes() &&
          !el.attributes.length
        ) {
          analysis.issues.push({
            message: `Empty element found: <${el.tagName}>`,
            line: index + 1,
          });
        }

        // Check duplicate IDs
        if (validationOptions.checkDuplicateIds && el.hasAttribute("id")) {
          const id = el.getAttribute("id");
          if (ids.has(id)) {
            analysis.issues.push({
              message: `Duplicate ID found: "${id}"`,
              line: index + 1,
            });
          } else {
            ids.add(id);
          }
        }
      });

      // Check comments
      if (validationOptions.checkComments) {
        const commentRegex = /<!--[\s\S]*?-->/g;
        const comments = xml.match(commentRegex) || [];
        comments.forEach((comment, index) => {
          if (!comment.trim().endsWith("-->")) {
            analysis.issues.push({
              message: "Malformed comment detected",
              line: xml.substr(0, xml.indexOf(comment)).split("\n").length,
            });
          }
        });
      }

      // Strict mode: additional checks
      if (validationOptions.strictMode) {
        if (!xml.startsWith('<?xml')) {
          analysis.issues.push({
            message: "Missing XML declaration",
            line: 1,
          });
        }
        if (!doc.documentElement.hasAttribute("xmlns") && doc.documentElement.tagName !== "root") {
          analysis.issues.push({
            message: "Missing namespace declaration in non-trivial root",
            line: 1,
          });
        }
      }

      setValidationResult(analysis);
    } catch (err) {
      setValidationResult({
        isValid: false,
        issues: [{ message: err.message, line: "N/A" }],
        formattedXML: xml,
      });
    } finally {
      setLoading(false);
      validationCount.current += 1;
    }
  }, [validationOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    validateXML(xmlInput);
  };

  const handleReset = () => {
    setXmlInput("");
    setValidationResult(null);
    setError(null);
    setShowFormatted(false);
    validationCount.current = 0;
  };

  const handleDownload = () => {
    const blob = new Blob([xmlInput], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `xml-${Date.now()}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">XML Validator</h2>

        {/* XML Input */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              XML Content
            </label>
            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item id="1">Hello</item>
  <item id="2">World</item>
</root>`}
              aria-label="XML Input"
            />
          </div>

          {/* Validation Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Validation Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(validationOptions).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setValidationOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/check/, "").replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || !xmlInput.trim()}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <span className="animate-spin mr-2">⏳</span>
              ) : null}
              {loading ? "Validating..." : "Validate XML"}
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={!xmlInput.trim()}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Validation Result */}
        {validationResult && (
          <div className="mt-6 space-y-6">
            <div className={`p-4 rounded-lg ${validationResult.isValid && validationResult.issues.length === 0 ? "bg-green-50" : "bg-red-50"}`}>
              <h3 className="font-semibold text-gray-700">Validation Status</h3>
              <p className={`text-lg ${validationResult.isValid && validationResult.issues.length === 0 ? "text-green-700" : "text-red-700"}`}>
                {validationResult.isValid && validationResult.issues.length === 0 ? "✓ Valid XML" : "✗ Invalid or Issues Found"}
              </p>
            </div>

            {validationResult.isValid && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Analysis</h3>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li>Root Element: <span className="font-mono">{validationResult.rootElement}</span></li>
                  <li>Total Elements: {validationResult.elementCount}</li>
                  <li>Total Attributes: {validationResult.attributesCount}</li>
                </ul>
              </div>
            )}

            {validationResult.issues.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Issues Found</h3>
                <ul className="text-sm text-red-600 list-disc pl-5 space-y-1">
                  {validationResult.issues.map((issue, index) => (
                    <li key={index}>
                      {issue.message} {issue.line !== "N/A" ? `(Line ~${issue.line})` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formatted XML Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <button
                onClick={() => setShowFormatted(!showFormatted)}
                className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <FaCode className="mr-2" /> {showFormatted ? "Hide Formatted XML" : "Show Formatted XML"}
              </button>
              {showFormatted && (
                <pre className="mt-4 p-4 bg-white border border-gray-200 rounded-lg text-sm font-mono text-gray-800 overflow-auto max-h-64">
                  {validationResult.formattedXML}
                </pre>
              )}
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
              <ul className="text-sm text-blue-600 list-disc pl-5 space-y-1">
                <li>Checks XML well-formedness</li>
                <li>Detects empty tags and duplicate IDs</li>
                <li>Optional comment validation</li>
                <li>Strict mode for additional checks</li>
                <li>Formatted XML preview</li>
                <li>Download as .xml file</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default XMLValidator;