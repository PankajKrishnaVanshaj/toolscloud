"use client";
import { useState, useEffect, useRef } from "react";
import {
  AiOutlineFileText,
  AiOutlineClear,
  AiOutlineDownload,
  AiOutlineCopy,
} from "react-icons/ai";

const JSONFormatter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const fileInputRef = useRef(null);

  // Validate JSON in real-time
  useEffect(() => {
    if (!jsonInput.trim()) {
      setIsValid(false);
      setError("");
      return;
    }
    try {
      JSON.parse(jsonInput);
      setIsValid(true);
      setError("");
    } catch (err) {
      setIsValid(false);
      setError(`Invalid JSON: ${err.message}`);
    }
  }, [jsonInput]);

  // Format JSON with specified indentation
  const formatJSON = (space = 2) => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormattedJson(JSON.stringify(parsed, null, space));
      setError("");
    } catch (err) {
      setError(`Formatting error: ${err.message}`);
      setFormattedJson("");
    }
  };

  // Minify JSON
  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormattedJson(JSON.stringify(parsed));
      setError("");
    } catch (err) {
      setError(`Minifying error: ${err.message}`);
      setFormattedJson("");
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
      try {
        const parsed = JSON.parse(jsonData);
        setFormattedJson(JSON.stringify(parsed, null, 2));
        setError("");
      } catch (err) {
        setError(`Invalid JSON file: ${err.message}`);
        setFormattedJson("");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Error reading file");
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Handle drag and drop
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
      link.download = "formatted.json";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Clear input
  const clearInput = () => {
    setJsonInput("");
    setFormattedJson("");
    setError("");
  };

  // Enhanced syntax highlighting
  const highlightSyntax = (json) => {
    if (!json) return "";
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = "";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) 
            ? "text-blue-600 font-semibold" // Keys
            : "text-green-600"; // Strings
        } else if (/true|false/.test(match)) {
          cls = "text-purple-600 font-semibold"; // Booleans
        } else if (/null/.test(match)) {
          cls = "text-gray-500 italic"; // Null
        } else {
          cls = "text-red-600"; // Numbers
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="relative w-full  bg-white shadow-lg rounded-2xl p-6">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            JSON copied to clipboard!
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-800 mb-6">JSON Formatter</h1>

        {/* Validation Indicator */}
        {jsonInput && (
          <div
            className={`mb-4 p-2 rounded-lg text-sm font-medium ${
              isValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isValid ? "Valid JSON" : error}
          </div>
        )}

        {/* Input Area */}
        <div
          className={`mb-6 border-2 rounded-lg ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex justify-between items-center p-2">
            <label className="text-sm font-medium text-gray-700">
              JSON Input
            </label>
            <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
              Upload File
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
          <textarea
            className="w-full h-40 p-3 border-t border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y disabled:bg-gray-100"
            placeholder="Paste your JSON here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            disabled={isLoading}
            aria-label="JSON input"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => formatJSON(2)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-colors"
            disabled={isLoading || !isValid}
          >
            <AiOutlineFileText />
            Beautify
          </button>
          <button
            onClick={minifyJSON}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-colors"
            disabled={isLoading || !isValid}
          >
            <AiOutlineFileText />
            Minify
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-colors"
            disabled={isLoading || !formattedJson}
          >
            <AiOutlineCopy />
            Copy
          </button>
          <button
            onClick={clearInput}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 transition-colors"
            disabled={isLoading}
          >
            <AiOutlineClear />
            Clear
          </button>
          {formattedJson && (
            <button
              onClick={downloadJSON}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
              disabled={isLoading}
            >
              <AiOutlineDownload />
              Download
            </button>
          )}
        </div>

        {/* Output Area */}
        {formattedJson && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Formatted JSON
            </label>
            <pre className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono overflow-x-auto max-h-96">
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightSyntax(formattedJson),
                }}
              />
            </pre>
          </div>
        )}

        {/* Example */}
        <div className="mt-6 text-sm text-gray-600">
          <p>Example input:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            {`{"name":"John","age":30,"isStudent":true,"grades":[85,90,null]}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default JSONFormatter;