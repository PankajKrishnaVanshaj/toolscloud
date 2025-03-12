"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaSync, FaDownload, FaEye } from "react-icons/fa";

const HTMLValidator = () => {
  const [htmlInput, setHtmlInput] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const validationCount = useRef(0);
  const [lastValidation, setLastValidation] = useState(null);
  const [validationOptions, setValidationOptions] = useState({
    checkEssentialTags: true,
    checkTagMatching: true,
    checkDuplicateIds: true,
    checkAttributes: false,
  });

  const validateHTML = useCallback((html) => {
    setLoading(true);
    const results = [];
    let previewDoc = null;

    try {
      const doc = new DOMParser().parseFromString(html, "text/html");
      previewDoc = doc;

      // Check for parsing errors
      if (doc.documentElement.nodeName === "parsererror") {
        results.push(`HTML parsing error: ${doc.documentElement.textContent}`);
      }

      // Essential tags check
      if (validationOptions.checkEssentialTags) {
        ['html', 'head', 'body'].forEach(tag => {
          if (!doc.querySelector(tag)) {
            results.push(`Missing essential tag: <${tag}>`);
          }
        });
      }

      // Tag matching
      if (validationOptions.checkTagMatching) {
        const stack = [];
        const regex = /<([a-z1-6]+)(?![^>]*\/>)|<\/([a-z1-6]+)>/gi;
        let match;
        while ((match = regex.exec(html))) {
          if (match[1]) stack.push(match[1]);
          else if (match[2]) {
            if (stack.length === 0 || stack.pop() !== match[2]) {
              results.push(`Mismatched or unclosed tag: </${match[2]}>`);
            }
          }
        }
        if (stack.length > 0) {
          results.push(`Unclosed tags: ${stack.join(', ')}`);
        }
      }

      // Duplicate IDs
      if (validationOptions.checkDuplicateIds) {
        const ids = doc.querySelectorAll('[id]');
        const duplicateIds = Array.from(ids).reduce((acc, el) => {
          acc[el.id] = (acc[el.id] || 0) + 1;
          return acc;
        }, {});
        const duplicates = Object.keys(duplicateIds).filter(id => duplicateIds[id] > 1);
        if (duplicates.length > 0) {
          results.push(`Duplicate IDs found: ${duplicates.join(', ')}`);
        }
      }

      // Attribute validation
      if (validationOptions.checkAttributes) {
        const elements = doc.getElementsByTagName('*');
        Array.from(elements).forEach(el => {
          Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('data-') && !/^[a-z-]+$/.test(attr.name.slice(5))) {
              results.push(`Invalid data attribute: ${attr.name}`);
            }
          });
        });
      }

      setLoading(false);
      setLastValidation(new Date());
      return {
        isValid: results.length === 0,
        messages: results,
        preview: previewDoc ? new XMLSerializer().serializeToString(previewDoc) : null
      };
    } catch (e) {
      setLoading(false);
      return { isValid: false, messages: ["Validation error occurred"], preview: null };
    }
  }, [validationOptions]);

  const handleValidate = () => {
    const result = validateHTML(htmlInput);
    setValidationResult(result);
    validationCount.current += 1;
  };

  const handleReset = () => {
    setHtmlInput("");
    setValidationResult(null);
    validationCount.current = 0;
    setShowPreview(false);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlInput], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `html-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => { validationCount.current = 0; };
  }, []);

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">HTML Validator</h1>

        {/* Input Section */}
        <div className="mb-6">
          <textarea
            value={htmlInput}
            onChange={(e) => setHtmlInput(e.target.value)}
            className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Enter your HTML code here..."
            aria-label="HTML Input"
          />
        </div>

        {/* Validation Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Validation Options</h2>
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
                  {key.replace(/check/, '').replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleValidate}
            disabled={loading || !htmlInput.trim()}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : null}
            {loading ? "Validating..." : "Validate HTML"}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={handleDownload}
            disabled={!htmlInput.trim()}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
        </div>

        {/* Results */}
        {validationResult && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Validation Results
            </h2>
            {validationResult.messages.length === 0 ? (
              <p className="text-green-700">✓ HTML is valid!</p>
            ) : (
              <ul className="space-y-2">
                {validationResult.messages.map((msg, index) => (
                  <li key={index} className="text-red-700">✗ {msg}</li>
                ))}
              </ul>
            )}
            {lastValidation && (
              <p className="text-gray-500 text-sm mt-3">
                Last validated: {lastValidation.toLocaleTimeString()} on {lastValidation.toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Preview */}
        <div className="mb-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            <FaEye className="mr-2" /> {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
          {showPreview && validationResult?.preview && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white overflow-auto max-h-64">
              <iframe
                srcDoc={validationResult.preview}
                className="w-full h-48 border-none"
                title="HTML Preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Validates essential HTML structure</li>
            <li>Checks tag matching and closure</li>
            <li>Detects duplicate IDs</li>
            <li>Optional attribute validation</li>
            <li>Live preview of rendered HTML</li>
            <li>Download validated HTML</li>
            <li>Customizable validation options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HTMLValidator;