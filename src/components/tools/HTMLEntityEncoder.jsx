"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaEye } from "react-icons/fa";

const HTMLEntityEncoder = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [options, setOptions] = useState({
    encodeAll: false,
    useNamedEntities: true,
    encodeSpaces: false,
    encodeNonAscii: false,
  });
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const encodeEntities = useCallback((text, opts) => {
    if (!text.trim()) return "";

    if (opts.encodeAll) {
      return text
        .split("")
        .map(char => `&#${char.charCodeAt(0)};`)
        .join("");
    }

    const namedEntities = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
      " ": opts.encodeSpaces ? "&nbsp;" : " ",
    };

    if (opts.useNamedEntities) {
      return text.replace(/[<>&"']|\s/g, char => namedEntities[char] || char);
    }

    if (opts.encodeNonAscii) {
      return text.replace(/[^\x00-\x7F]/g, char => `&#${char.charCodeAt(0)};`);
    }

    const textarea = document.createElement("textarea");
    textarea.textContent = text;
    return textarea.innerHTML;
  }, []);

  const processText = () => {
    setError(null);
    setOutputText("");
    setCopied(false);

    if (!inputText.trim()) {
      setError("Please enter some text to encode");
      return;
    }

    try {
      const result = encodeEntities(inputText, options);
      setOutputText(result);
    } catch (err) {
      setError("Error encoding text: " + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processText();
  };

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (outputText) {
      const blob = new Blob([outputText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `encoded-html-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleReset = () => {
    setInputText("");
    setOutputText("");
    setError(null);
    setCopied(false);
    setShowPreview(false);
  };

  const entityTable = [
    { char: "<", entity: "&lt;", description: "Less than" },
    { char: ">", entity: "&gt;", description: "Greater than" },
    { char: "&", entity: "&amp;", description: "Ampersand" },
    { char: '"', entity: "&quot;", description: "Double quote" },
    { char: "'", entity: "&apos;", description: "Single quote" },
    { char: " ", entity: "&nbsp;", description: "Non-breaking space" },
  ];

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">HTML Entity Encoder</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-40 sm:h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter text to encode (e.g., Hello <world> & friends!)"
              aria-label="Text to encode"
            />
          </div>

          {/* Encoding Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Encoding Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={key === "encodeAll" && Object.values(options).some((v, i) => i !== 0 && v)}
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={!inputText.trim()}
          >
            Encode
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Output */}
        {outputText && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-3 gap-3">
              <h3 className="font-semibold text-gray-700">Encoded Text</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-1 px-3 text-sm rounded-lg transition-colors flex items-center ${
                    copied ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1 px-3 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={handleReset}
                  className="py-1 px-3 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <FaSync className="mr-2" />
                  Reset
                </button>
              </div>
            </div>
            <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all border border-gray-200">
              {outputText}
            </pre>
          </div>
        )}

        {/* Preview */}
        {outputText && (
          <div className="mt-6">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <FaEye className="mr-2" />
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
            {showPreview && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white overflow-auto max-h-64">
                <div dangerouslySetInnerHTML={{ __html: outputText }} />
              </div>
            )}
          </div>
        )}

        {/* Entity Reference Table */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-3">Common HTML Entities</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-blue-600">
              <thead className="text-xs uppercase bg-blue-100">
                <tr>
                  <th className="px-4 py-2">Character</th>
                  <th className="px-4 py-2">Entity</th>
                  <th className="px-4 py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {entityTable.map((entity, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2 font-mono">{entity.char}</td>
                    <td className="px-4 py-2 font-mono">{entity.entity}</td>
                    <td className="px-4 py-2">{entity.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-blue-600">
            Note: "Encode All" overrides other options and converts every character to numeric entities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HTMLEntityEncoder;