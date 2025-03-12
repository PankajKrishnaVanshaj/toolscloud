"use client";
import React, { useState, useRef, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaFileUpload } from "react-icons/fa";

const CodeMinifier = () => {
  const [code, setCode] = useState("");
  const [minifiedCode, setMinifiedCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [comments, setComments] = useState([]);
  const [whitespaceRemoved, setWhitespaceRemoved] = useState({
    spaces: 0,
    tabs: 0,
    lineBreaks: 0,
    originalSize: 0,
    minifiedSize: 0,
    reduction: 0,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [options, setOptions] = useState({
    removeInlineComments: true,
    removeBlockComments: true,
    preserveLicenseComments: false,
    shortenVariableNames: false,
    removeUnusedCode: false,
    minifyJSON: true,
    preserveWhitespace: false,
    compressCSSProperties: false,
    removeHTMLAttributes: false,
  });

  const detectLanguage = useCallback((inputCode) => {
    const trimmed = inputCode.trim();
    if (!trimmed) return "unknown";
    if (trimmed.startsWith("<") && trimmed.includes(">")) return "html";
    if ((trimmed.startsWith("{") || trimmed.startsWith("[")) && (trimmed.endsWith("}") || trimmed.endsWith("]"))) return "json";
    if (trimmed.match(/[#.][\w-]+/)) return "css";
    if (trimmed.includes(";") || trimmed.includes("function") || trimmed.includes("interface") || trimmed.includes("type ")) {
      return trimmed.includes("interface") || trimmed.includes("type ") ? "ts" : "js";
    }
    if (trimmed.includes("def ") || (trimmed.includes(":") && !trimmed.includes(";"))) return "python";
    if (trimmed.startsWith("<?php") || trimmed.includes("$")) return "php";
    return "js";
  }, []);

  const extractCommentsAndWhitespace = useCallback((inputCode) => {
    const language = detectLanguage(inputCode);
    let commentsExtracted = [];
    const spaces = (inputCode.match(/ /g) || []).length;
    const tabs = (inputCode.match(/\t/g) || []).length;
    const lineBreaks = (inputCode.match(/\n/g) || []).length;

    if (options.removeInlineComments) {
      if (["js", "ts", "css"].includes(language)) commentsExtracted.push(...(inputCode.match(/\/\/.*$/gm) || []));
      else if (language === "python" || language === "php") commentsExtracted.push(...(inputCode.match(/#.*/gm) || []));
    }
    if (options.removeBlockComments) {
      if (["js", "ts", "css", "php"].includes(language)) commentsExtracted.push(...(inputCode.match(/\/\*[\s\S]*?\*\//g) || []));
      else if (language === "html") commentsExtracted.push(...(inputCode.match(/<!--[\s\S]*?-->/g) || []));
    }

    return { comments: commentsExtracted, whitespace: { spaces, tabs, lineBreaks }, originalSize: new Blob([inputCode]).size };
  }, [options]);

  const minifyJavaScript = (inputCode) => {
    let result = inputCode;
    if (options.preserveLicenseComments) result = result.replace(/(\/\*![\s\S]*?\*\/)/g, (match) => `\n${match}\n`);
    if (options.removeInlineComments) result = result.replace(/\/\/.*$/gm, "");
    if (options.removeBlockComments) result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    if (!options.preserveWhitespace) result = result.replace(/\s*([{}[\]()=+\-*/;:,<>!&|])\s*/g, "$1").replace(/\s+/g, " ").trim();
    if (options.shortenVariableNames) {
      let varMap = new Map();
      let counter = 0;
      result = result.replace(/\b(let|const|var)\s+(\w+)\b/g, (match, keyword, name) => {
        if (!varMap.has(name)) varMap.set(name, String.fromCharCode(97 + counter++));
        return `${keyword} ${varMap.get(name)}`;
      });
    }
    return result;
  };

  const minifyCSS = (inputCode) => {
    let result = inputCode;
    if (options.removeBlockComments) result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    if (!options.preserveWhitespace) result = result.replace(/\s*([{}:;,])\s*/g, "$1").replace(/\s+/g, " ").replace(/;}/g, "}");
    if (options.compressCSSProperties) result = result.replace(/0(px|em|rem)/g, "0");
    return result.trim();
  };

  const minifyHTML = (inputCode) => {
    let result = inputCode;
    if (options.removeBlockComments) result = result.replace(/<!--[\s\S]*?-->/g, options.preserveLicenseComments ? "<!--LICENSE-->" : "");
    if (!options.preserveWhitespace) result = result.replace(/\n/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><");
    if (options.removeHTMLAttributes) result = result.replace(/\s+(class|id)=["'][^"']*["']/g, "");
    return result.trim();
  };

  const minifyJSONCode = (inputCode) => options.minifyJSON ? JSON.stringify(JSON.parse(inputCode)) : inputCode;

  const minifyPython = (inputCode) => {
    let result = inputCode;
    if (options.removeInlineComments) result = result.replace(/#.*/gm, "");
    if (!options.preserveWhitespace) result = result.replace(/\s*([=+\-*/:()\[\]])\s*/g, "$1").replace(/\n{2,}/g, "\n");
    return result.trim();
  };

  const minifyPHP = (inputCode) => {
    let result = inputCode;
    if (options.preserveLicenseComments) result = result.replace(/(\/\*![\s\S]*?\*\/)/g, (match) => `\n${match}\n`);
    if (options.removeInlineComments) result = result.replace(/#.*/gm, "");
    if (options.removeBlockComments) result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    if (!options.preserveWhitespace) result = result.replace(/\s*([{}[\]()=+\-*/;:,<>!&|])\s*/g, "$1").replace(/\s+/g, " ");
    return result.trim();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContent = event.target.result;
      setCode(fileContent);
      handleMinifyLogic(fileContent);
      setIsLoading(false);
    };
    reader.onerror = () => setError("Error reading file") && setIsLoading(false);
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleMinifyLogic = (inputCode) => {
    setError("");
    setOriginalCode(inputCode);
    const language = detectLanguage(inputCode);
    const { comments, whitespace, originalSize } = extractCommentsAndWhitespace(inputCode);

    try {
      let minified;
      switch (language) {
        case "js": case "ts": minified = minifyJavaScript(inputCode); break;
        case "css": minified = minifyCSS(inputCode); break;
        case "html": minified = minifyHTML(inputCode); break;
        case "json": minified = minifyJSONCode(inputCode); break;
        case "python": minified = minifyPython(inputCode); break;
        case "php": minified = minifyPHP(inputCode); break;
        default: throw new Error(`Unsupported language: ${language}`);
      }

      setMinifiedCode(minified);
      setComments(comments);
      setWhitespaceRemoved({
        ...whitespace,
        minifiedSize: new Blob([minified]).size,
        reduction: originalSize - new Blob([minified]).size,
        originalSize,
      });
    } catch (err) {
      setError(err.message);
      setMinifiedCode("");
    }
  };

  const handleMinify = () => handleMinifyLogic(code);

  const copyToClipboard = () => {
    if (minifiedCode) {
      navigator.clipboard.writeText(minifiedCode);
      alert("Minified code copied to clipboard!");
    }
  };

  const handleDownload = () => {
    if (minifiedCode) {
      const blob = new Blob([minifiedCode], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `minified-${detectLanguage(code)}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Code Minifier</h1>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Input Area */}
        <div className="mb-6 relative">
          <textarea
            className="w-full h-48 sm:h-64 p-4 border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 font-mono text-sm disabled:bg-gray-100"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code here or upload a file..."
            disabled={isLoading}
            aria-label="Code Input"
          />
          <label className="absolute top-4 right-4 flex items-center text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
            <FaFileUpload className="mr-2" /> Upload
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".js,.ts,.css,.html,.json,.py,.php"
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>

        {/* Options */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Minification Options</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(options).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => setOptions(prev => ({ ...prev, [key]: !prev[key] }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-600">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={handleMinify}
            disabled={isLoading || !code.trim()}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
            {isLoading ? "Minifying..." : "Minify"}
          </button>
          <button
            onClick={() => { setCode(""); setMinifiedCode(""); setError(""); setComments([]); setWhitespaceRemoved({ spaces: 0, tabs: 0, lineBreaks: 0, originalSize: 0, minifiedSize: 0, reduction: 0 }); }}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Clear
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!minifiedCode || isLoading}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCopy className="mr-2" /> Copy
          </button>
          <button
            onClick={handleDownload}
            disabled={!minifiedCode || isLoading}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download
          </button>
        </div>

        {/* Minified Output */}
        {minifiedCode && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Minified Code</h3>
            <textarea
              className="w-full h-48 p-4 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm"
              readOnly
              value={minifiedCode}
            />
          </div>
        )}

        {/* Statistics */}
        {minifiedCode && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Minification Stats</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-600">Removed Comments</h4>
                <ul className="list-disc pl-5 max-h-40 overflow-y-auto text-sm text-gray-600">
                  {comments.length > 0 ? comments.map((comment, index) => (
                    <li key={index} className="truncate">{comment}</li>
                  )) : <li>No comments removed</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-600">Whitespace Stats</h4>
                <p className="text-sm text-gray-600">Spaces: {whitespaceRemoved.spaces}</p>
                <p className="text-sm text-gray-600">Tabs: {whitespaceRemoved.tabs}</p>
                <p className="text-sm text-gray-600">Line Breaks: {whitespaceRemoved.lineBreaks}</p>
                <p className="text-sm text-gray-600">Original Size: {whitespaceRemoved.originalSize} bytes</p>
                <p className="text-sm text-gray-600">Minified Size: {whitespaceRemoved.minifiedSize} bytes</p>
                <p className="text-sm text-gray-600">
                  Reduction: {whitespaceRemoved.reduction} bytes ({((whitespaceRemoved.reduction / whitespaceRemoved.originalSize) * 100).toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Example */}
        {!code && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Example Input</h3>
            <pre className="text-sm text-blue-600 overflow-x-auto">{`// JavaScript
function example() { /* comment */ let x = 1; }

// CSS
body { margin: 0; /* comment */ padding: 10px; }

// HTML
<div>  <p>Hello</p>  </div>

// JSON
{"key": "value", "num": 42}

// Python
def func(): # comment
    x = 1

// PHP
<?php $x = 1; // comment`}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeMinifier;