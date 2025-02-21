"use client";
import { useState, useRef } from "react";

const CodeMinifier = () => {
  const [code, setCode] = useState("");
  const [minifiedCode, setMinifiedCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [comments, setComments] = useState([]);
  const [whitespaceRemoved, setWhitespaceRemoved] = useState({
    spaces: 0,
    tabs: 0,
    lineBreaks: 0,
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
    minifyJSON: false,
  });

  // Enhanced language detection
  const detectLanguage = (inputCode) => {
    const trimmed = inputCode.trim();
    if (!trimmed) return "unknown";

    // HTML
    if (trimmed.startsWith("<") && trimmed.includes(">")) return "html";

    // JSON
    if (
      (trimmed.startsWith("{") || trimmed.startsWith("[")) &&
      (trimmed.endsWith("}") || trimmed.endsWith("]"))
    )
      return "json";

    // CSS
    if (trimmed.match(/[#.][\w-]+/)) return "css";

    // JavaScript/TypeScript
    if (
      trimmed.includes(";") ||
      trimmed.includes("function") ||
      trimmed.includes("interface") ||
      trimmed.includes("type ")
    ) {
      return trimmed.includes("interface") || trimmed.includes("type ")
        ? "ts"
        : "js";
    }

    // Python
    if (
      trimmed.includes("def ") ||
      (trimmed.includes(":") && !trimmed.includes(";"))
    )
      return "python";

    // PHP
    if (trimmed.startsWith("<?php") || trimmed.includes("$")) return "php";

    // Default to JS for ambiguous cases
    return "js";
  };

  // Extract comments and whitespace
  const extractCommentsAndWhitespace = (inputCode) => {
    let commentsExtracted = [];
    const spaces = (inputCode.match(/ /g) || []).length;
    const tabs = (inputCode.match(/\t/g) || []).length;
    const lineBreaks = (inputCode.match(/\n/g) || []).length;
    const language = detectLanguage(inputCode);

    if (options.removeInlineComments) {
      if (["js", "ts", "css"].includes(language)) {
        commentsExtracted.push(...(inputCode.match(/\/\/.*$/gm) || []));
      } else if (language === "python" || language === "php") {
        commentsExtracted.push(...(inputCode.match(/#.*/gm) || []));
      }
    }

    if (options.removeBlockComments) {
      if (["js", "ts", "css", "php"].includes(language)) {
        commentsExtracted.push(...(inputCode.match(/\/\*[\s\S]*?\*\//g) || []));
      } else if (language === "html") {
        commentsExtracted.push(...(inputCode.match(/<!--[\s\S]*?-->/g) || []));
      }
    }

    return {
      comments: commentsExtracted,
      whitespace: { spaces, tabs, lineBreaks },
      originalSize: new Blob([inputCode]).size,
    };
  };

  // Minify JavaScript/TypeScript
  const minifyJavaScript = (inputCode) => {
    let result = inputCode;
    if (options.preserveLicenseComments) {
      result = result.replace(
        /(\/\*![\s\S]*?\*\/)/g,
        (match) => `\n${match}\n`
      );
    }
    if (options.removeInlineComments) result = result.replace(/\/\/.*$/gm, "");
    if (options.removeBlockComments)
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    result = result
      .replace(/\s*([{}[\]()=+\-*/;:,<>!&|])\s*/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    if (options.shortenVariableNames) {
      let varMap = new Map();
      let counter = 0;
      result = result.replace(
        /\b(let|const|var)\s+(\w+)\b/g,
        (match, keyword, name) => {
          if (!varMap.has(name))
            varMap.set(name, String.fromCharCode(97 + counter++));
          return `${keyword} ${varMap.get(name)}`;
        }
      );
    }
    return result;
  };

  // Minify CSS
  const minifyCSS = (inputCode) => {
    let result = inputCode;
    if (options.removeBlockComments)
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    return result
      .replace(/\s*([{}:;,])\s*/g, "$1")
      .replace(/\s+/g, " ")
      .replace(/;}/g, "}")
      .trim();
  };

  // Minify HTML
  const minifyHTML = (inputCode) => {
    return inputCode
      .replace(
        /<!--[\s\S]*?-->/g,
        options.preserveLicenseComments ? "<!--LICENSE-->" : ""
      )
      .replace(/\n/g, "")
      .replace(/\s+/g, " ")
      .replace(/>\s+</g, "><")
      .replace(/\s*(=)\s*/g, "$1")
      .trim();
  };

  // Minify JSON
  const minifyJSONCode = (inputCode) => {
    try {
      return JSON.stringify(JSON.parse(inputCode));
    } catch (err) {
      throw new Error("Invalid JSON: " + err.message);
    }
  };

  // Minify Python
  const minifyPython = (inputCode) => {
    let result = inputCode;
    if (options.removeInlineComments) result = result.replace(/#.*/gm, "");
    return result
      .replace(/\s*([=+\-*/:()\[\]])\s*/g, "$1") // Preserve indentation
      .replace(/^\s+/gm, (match) => " ".repeat(Math.floor(match.length / 2))) // Reduce indentation
      .replace(/\n{2,}/g, "\n")
      .trim();
  };

  // Minify PHP
  const minifyPHP = (inputCode) => {
    let result = inputCode;
    if (options.preserveLicenseComments) {
      result = result.replace(
        /(\/\*![\s\S]*?\*\/)/g,
        (match) => `\n${match}\n`
      );
    }
    if (options.removeInlineComments) result = result.replace(/#.*/gm, "");
    if (options.removeBlockComments)
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    return result
      .replace(/\s*([{}[\]()=+\-*/;:,<>!&|])\s*/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Handle file upload
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
    reader.onerror = () => {
      setError("Error reading file");
      setIsLoading(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Core minification logic
  const handleMinifyLogic = (inputCode) => {
    setError("");
    setOriginalCode(inputCode);
    const language = detectLanguage(inputCode);
    const { comments, whitespace, originalSize } =
      extractCommentsAndWhitespace(inputCode);

    let minified = inputCode;
    try {
      switch (language) {
        case "js":
        case "ts":
          minified = minifyJavaScript(inputCode);
          break;
        case "css":
          minified = minifyCSS(inputCode);
          break;
        case "html":
          minified = minifyHTML(inputCode);
          break;
        case "json":
          if (options.minifyJSON) minified = minifyJSONCode(inputCode);
          break;
        case "python":
          minified = minifyPython(inputCode);
          break;
        case "php":
          minified = minifyPHP(inputCode);
          break;
        default:
          setError(`Unsupported language detected: ${language}`);
          return;
      }

      setMinifiedCode(minified);
      setComments(comments);
      setWhitespaceRemoved({
        ...whitespace,
        minifiedSize: new Blob([minified]).size,
        reduction: originalSize - new Blob([minified]).size,
      });
    } catch (err) {
      setError(err.message);
      setMinifiedCode("");
    }
  };

  const handleMinify = () => {
    handleMinifyLogic(code);
  };

  const copyToClipboard = () => {
    if (minifiedCode) {
      navigator.clipboard.writeText(minifiedCode);
      alert("Minified code copied to clipboard!");
    }
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="relative mb-4">
        <textarea
          className="w-full p-2 border rounded-lg h-40 disabled:bg-gray-100"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your code here or upload a file..."
          disabled={isLoading}
        />
        <label className="absolute top-2 right-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
          Upload File
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
      <div className="flex flex-wrap space-x-4 mb-4">
        {Object.keys(options).map((option) => (
          <label key={option} className="flex items-center text-secondary">
            <input
              type="checkbox"
              checked={options[option]}
              onChange={() =>
                setOptions((prev) => ({ ...prev, [option]: !prev[option] }))
              }
              className="accent-primary"
              disabled={isLoading}
            />
            <span className="ml-2">
              {option
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </span>
          </label>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text rounded-lg border hover:border-secondary disabled:opacity-50"
          onClick={handleMinify}
          disabled={isLoading || !code.trim()}
        >
          {isLoading ? "Minifying..." : "Minify Code"}
        </button>
        <button
          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text rounded-lg border hover:border-secondary disabled:opacity-50"
          onClick={() => {
            setCode("");
            setMinifiedCode("");
            setError("");
            setComments([]);
            setWhitespaceRemoved({ spaces: 0, tabs: 0, lineBreaks: 0 });
          }}
          disabled={isLoading}
        >
          Clear
        </button>
        <button
          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text rounded-lg border hover:border-secondary disabled:opacity-50"
          onClick={copyToClipboard}
          disabled={!minifiedCode || isLoading}
        >
          Copy Minified Code
        </button>
      </div>

      {/* Minified Output */}
      {minifiedCode && (
        <>
          <h3 className="text-lg font-semibold mt-4 text-secondary">
            Minified Code:
          </h3>
          <textarea
            className="w-full p-2 border rounded-lg h-40 mt-2 bg-gray-50"
            readOnly
            value={minifiedCode}
          />

          {/* Statistics */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-secondary">
                Removed Comments:
              </h4>
              <ul className="list-disc pl-5 max-h-40 overflow-y-auto">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <li key={index} className="truncate">
                      {comment}
                    </li>
                  ))
                ) : (
                  <li>No comments removed</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-secondary">
                Whitespace Removed:
              </h4>
              <p>Spaces: {whitespaceRemoved.spaces}</p>
              <p>Tabs: {whitespaceRemoved.tabs}</p>
              <p>Line Breaks: {whitespaceRemoved.lineBreaks}</p>
              {whitespaceRemoved.minifiedSize && (
                <>
                  <p>Original Size: {whitespaceRemoved.originalSize} bytes</p>
                  <p>Minified Size: {whitespaceRemoved.minifiedSize} bytes</p>
                  <p>
                    Reduction: {whitespaceRemoved.reduction} bytes (
                    {(
                      (whitespaceRemoved.reduction /
                        whitespaceRemoved.originalSize) *
                      100
                    ).toFixed(2)}
                    %)
                  </p>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Example */}
      {!code && (
        <div className="mt-4 text-sm text-gray-600">
          <p>Example inputs by language:</p>
          <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto">
            {`// JavaScript
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
<?php $x = 1; // comment`}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeMinifier;
