"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  AiOutlineFileText,
  AiOutlineClear,
  AiOutlineDownload,
  AiOutlineCopy,
  AiOutlineEye,
} from "react-icons/ai";
import { FaSync } from "react-icons/fa";

const JSONFormatter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [indentLevel, setIndentLevel] = useState(2);
  const [showRawOutput, setShowRawOutput] = useState(false);
  const fileInputRef = useRef(null);
  const [history, setHistory] = useState([]);

  // Validate JSON
  const validateJSON = useCallback((input) => {
    if (!input.trim()) {
      setIsValid(false);
      setError("");
      return false;
    }
    try {
      JSON.parse(input);
      setIsValid(true);
      setError("");
      return true;
    } catch (err) {
      setIsValid(false);
      setError(`Invalid JSON: ${err.message}`);
      return false;
    }
  }, []);

  useEffect(() => {
    validateJSON(jsonInput);
  }, [jsonInput, validateJSON]);

  // Format JSON
  const formatJSON = useCallback((space = indentLevel) => {
    if (validateJSON(jsonInput)) {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, space);
      setFormattedJson(formatted);
      setHistory(prev => [...prev, formatted].slice(-5));
    }
  }, [jsonInput, indentLevel, validateJSON]);

  // Minify JSON
  const minifyJSON = () => {
    if (validateJSON(jsonInput)) {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setFormattedJson(minified);
      setHistory(prev => [...prev, minified].slice(-5));
    }
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const jsonData = event.target.result;
      setJsonInput(jsonData);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError("Error reading file");
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/json") {
      handleFileUpload(file);
    } else {
      setError("Please drop a valid JSON file (.json)");
    }
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (formattedJson) {
      navigator.clipboard.writeText(formattedJson);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Download JSON
  const downloadJSON = () => {
    if (formattedJson) {
      const blob = new Blob([formattedJson], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `json-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Clear input
  const clearInput = () => {
    setJsonInput("");
    setFormattedJson("");
    setError("");
    setShowRawOutput(false);
  };

  // Syntax highlighting
  const highlightSyntax = (json) => {
    if (!json) return "";
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "text-blue-600 font-semibold" : "text-green-600";
        } else if (/true|false/.test(match)) {
          cls = "text-purple-600 font-semibold";
        } else if (/null/.test(match)) {
          cls = "text-gray-500 italic";
        } else {
          cls = "text-red-600";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="relative w-full bg-white shadow-xl rounded-2xl p-6 sm:p-8">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            JSON copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">JSON Formatter</h1>

        {/* Validation Indicator */}
        {jsonInput && (
          <div className={`mb-6 p-3 rounded-lg text-sm font-medium ${isValid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {isValid ? "✓ Valid JSON" : `✗ ${error}`}
          </div>
        )}

        {/* Input Area */}
        <div
          className={`mb-6 border-2 rounded-lg ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-2">
            <label className="text-sm font-medium text-gray-700">JSON Input</label>
            <div className="flex gap-2">
              <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center">
                <AiOutlineFileText className="mr-1" /> Upload File
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  accept=".json"
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>
          <textarea
            className="w-full h-48 sm:h-64 p-4 border-t border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y disabled:bg-gray-100"
            placeholder="Paste your JSON here or drop a .json file..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            disabled={isLoading}
            aria-label="JSON Input"
          />
        </div>

        {/* Formatting Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Formatting Options</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Indent Level:
              <select
                value={indentLevel}
                onChange={(e) => setIndentLevel(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {[0, 2, 4, 8].map(level => (
                  <option key={level} value={level}>{level} spaces</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => formatJSON()}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            disabled={isLoading || !isValid}
          >
            <AiOutlineFileText className="mr-2" /> Beautify
          </button>
          <button
            onClick={minifyJSON}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            disabled={isLoading || !isValid}
          >
            <AiOutlineFileText className="mr-2" /> Minify
          </button>
          <button
            onClick={copyToClipboard}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            disabled={isLoading || !formattedJson}
          >
            <AiOutlineCopy className="mr-2" /> Copy
          </button>
          <button
            onClick={clearInput}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            <AiOutlineClear className="mr-2" /> Clear
          </button>
          <button
            onClick={downloadJSON}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            disabled={isLoading || !formattedJson}
          >
            <AiOutlineDownload className="mr-2" /> Download
          </button>
        </div>

        {/* Output Area */}
        {formattedJson && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Formatted JSON</label>
              <button
                onClick={() => setShowRawOutput(!showRawOutput)}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <AiOutlineEye className="mr-1" /> {showRawOutput ? "Hide Raw" : "Show Raw"}
              </button>
            </div>
            <pre className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-sm font-mono overflow-x-auto max-h-96">
              {showRawOutput ? (
                formattedJson
              ) : (
                <code dangerouslySetInnerHTML={{ __html: highlightSyntax(formattedJson) }} />
              )}
            </pre>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center mb-2">
              <FaSync className="mr-2" /> Recent Formats (Last 5)
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>{entry.slice(0, 50)}...</span>
                  <button
                    onClick={() => setFormattedJson(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Example */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Example</h3>
          <pre className="bg-white p-2 rounded-md text-sm font-mono overflow-x-auto">
            {`{"name": "John", "age": 30, "isStudent": true, "grades": [85, 90, null]}`}
          </pre>
        </div>

        {/* Animation */}
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
          }
        `}</style>
      </div>
    </div>
  );
};

export default JSONFormatter;