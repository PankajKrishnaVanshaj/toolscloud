"use client";
import React, { useState, useRef, useCallback } from "react";
import { parseStringPromise } from "xml2js";
import { FaDownload, FaCopy, FaSync, FaFileUpload } from "react-icons/fa";

const XmlToJson = () => {
  const [xmlInput, setXmlInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [error, setError] = useState("");
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrettyPrint, setIsPrettyPrint] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [parseOptions, setParseOptions] = useState({
    explicitArray: false,
    trim: true,
    normalize: true,
    mergeAttrs: false,
    explicitRoot: true,
    ignoreAttrs: false,
  });
  const fileInputRef = useRef(null);

  // Validate XML basic structure
  const validateXML = useCallback((xml) => {
    if (!xml.trim()) return "XML input is empty";
    if (!xml.startsWith("<")) return "XML must start with a tag";
    if (!xml.endsWith(">")) return "XML must end with a closing tag";
    return "";
  }, []);

  // Convert XML to JSON
  const convertToJson = useCallback(async () => {
    const validationError = validateXML(xmlInput);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await parseStringPromise(xmlInput, parseOptions);
      const jsonString = isPrettyPrint
        ? JSON.stringify(result, null, 2)
        : JSON.stringify(result);
      setJsonOutput(jsonString);
    } catch (err) {
      setError(`XML parsing error: ${err.message}. Check for proper nesting and closing tags.`);
      setJsonOutput("");
    } finally {
      setIsLoading(false);
    }
  }, [xmlInput, parseOptions, isPrettyPrint]);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file) => {
      if (!file) return;

      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const xmlData = event.target.result;
        setXmlInput(xmlData);
        const validationError = validateXML(xmlData);
        if (validationError) {
          setError(validationError);
          setIsLoading(false);
          return;
        }
        try {
          const result = await parseStringPromise(xmlData, parseOptions);
          setJsonOutput(isPrettyPrint ? JSON.stringify(result, null, 2) : JSON.stringify(result));
        } catch (err) {
          setError(`Invalid XML file: ${err.message}`);
          setJsonOutput("");
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Error reading file");
        setIsLoading(false);
      };
      reader.readAsText(file);
    },
    [parseOptions, isPrettyPrint]
  );

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/xml" || file.name.endsWith(".xml"))) {
      handleFileUpload(file);
    } else {
      setError("Please drop a valid XML file");
    }
  };

  // Handle copy
  const handleCopy = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (jsonOutput) {
      const blob = new Blob([jsonOutput], { type: "application/json;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `converted-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  };

  // Clear all
  const clearAll = () => {
    setXmlInput("");
    setJsonOutput("");
    setError("");
    setParseOptions({
      explicitArray: false,
      trim: true,
      normalize: true,
      mergeAttrs: false,
      explicitRoot: true,
      ignoreAttrs: false,
    });
    setIsPrettyPrint(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="relative w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            JSON copied to clipboard!
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">XML to JSON Converter</h1>
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
            disabled={isLoading}
          >
            <FaSync className="inline mr-1" /> Clear All
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Parse Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Parse Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { key: "explicitArray", label: "Explicit Array" },
              { key: "trim", label: "Trim Whitespace" },
              { key: "normalize", label: "Normalize Spaces" },
              { key: "mergeAttrs", label: "Merge Attributes" },
              { key: "explicitRoot", label: "Explicit Root" },
              { key: "ignoreAttrs", label: "Ignore Attributes" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={parseOptions[key]}
                  onChange={(e) =>
                    setParseOptions((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="mr-2 accent-blue-500"
                  disabled={isLoading}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* XML Input */}
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
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <label className="text-sm font-medium text-gray-700">XML Input</label>
            <label className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer flex items-center">
              <FaFileUpload className="mr-1" /> Upload File
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
                accept=".xml"
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>
          <textarea
            value={xmlInput}
            onChange={(e) => {
              setXmlInput(e.target.value);
              setJsonOutput("");
              setError("");
            }}
            placeholder="Paste your XML here or drag-and-drop an XML file"
            className="w-full h-48 sm:h-64 p-3 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y disabled:bg-gray-100"
            disabled={isLoading}
          />
          <button
            onClick={convertToJson}
            className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            disabled={isLoading || !xmlInput.trim()}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : null}
            {isLoading ? "Converting..." : "Convert to JSON"}
          </button>
        </div>

        {/* JSON Output */}
        <div className="mb-6">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <label className="text-sm font-medium text-gray-700">JSON Output</label>
            <button
              onClick={() => {
                if (jsonOutput) {
                  setJsonOutput(
                    isPrettyPrint
                      ? JSON.stringify(JSON.parse(jsonOutput))
                      : JSON.stringify(JSON.parse(jsonOutput), null, 2)
                  );
                  setIsPrettyPrint(!isPrettyPrint);
                }
              }}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors"
              disabled={!jsonOutput || isLoading}
            >
              {isPrettyPrint ? "Minify" : "Pretty Print"}
            </button>
          </div>
          <textarea
            value={jsonOutput}
            readOnly
            placeholder="JSON output will appear here"
            className="w-full h-48 sm:h-64 p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-y"
          />
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={!jsonOutput || isLoading}
            >
              <FaCopy className="mr-2" /> Copy JSON
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              disabled={!jsonOutput || isLoading}
            >
              <FaDownload className="mr-2" /> Download JSON
            </button>
          </div>
        </div>

        {/* Example */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-700 mb-2">Example</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600 mb-1">Input XML:</p>
              <pre className="bg-white p-2 rounded-md text-xs overflow-x-auto">
                {`<people>
  <person id="1">
    <name>John</name>
    <age>30</age>
  </person>
  <person id="2">
    <name>Jane</name>
    <age>25</age>
  </person>
</people>`}
              </pre>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Output JSON:</p>
              <pre className="bg-white p-2 rounded-md text-xs overflow-x-auto">
                {`{
  "people": {
    "person": [
      {
        "id": "1",
        "name": "John",
        "age": "30"
      },
      {
        "id": "2",
        "name": "Jane",
        "age": "25"
      }
    ]
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XmlToJson; 