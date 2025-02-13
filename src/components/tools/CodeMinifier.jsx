"use client";

import { useState } from "react";

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

  const options = {
    removeInlineComments: useState(true),
    removeBlockComments: useState(true),
    preserveLicenseComments: useState(false),
    shortenVariableNames: useState(false),
    removeUnusedCode: useState(false),
    minifyJSON: useState(false),
  };

  // Detect language (simple heuristic)
  const detectLanguage = (inputCode) => {
    if (inputCode.trim().startsWith("<")) return "html";
    if (inputCode.includes("{") && inputCode.includes(";")) return "css";
    if (inputCode.trim().startsWith("{") && inputCode.trim().endsWith("}"))
      return "json";
    return "js";
  };

  // Extract comments and calculate whitespace
  const extractCommentsAndWhitespace = (inputCode) => {
    let commentsExtracted = [];
    const spaces = (inputCode.match(/ /g) || []).length;
    const tabs = (inputCode.match(/\t/g) || []).length;
    const lineBreaks = (inputCode.match(/\n/g) || []).length;

    if (options.removeInlineComments[0]) {
      commentsExtracted.push(...(inputCode.match(/\/\/.*$/gm) || []));
    }

    if (options.removeBlockComments[0]) {
      commentsExtracted.push(...(inputCode.match(/\/\*[\s\S]*?\*\//g) || []));
    }

    return {
      comments: commentsExtracted,
      whitespace: { spaces, tabs, lineBreaks },
    };
  };

  // Minify JavaScript
  const minifyJavaScript = (inputCode) => {
    let result = inputCode;

    if (options.preserveLicenseComments[0]) {
      // Keep comments starting with "/*!"
      result = result.replace(
        /(\/\*![\s\S]*?\*\/)/g,
        (match) => `\n${match}\n`
      );
    }

    if (options.removeInlineComments[0])
      result = result.replace(/\/\/.*$/gm, "");
    if (options.removeBlockComments[0])
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");

    result = result
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*/g, ";")
      .trim();

    if (options.shortenVariableNames[0]) {
      // Replace variable names with single letters (basic example, no scope checking)
      result = result.replace(
        /\b(let|const|var) (\w+)/g,
        (match, p1, p2) => `${p1} ${p2.charAt(0)}`
      );
    }

    if (options.removeUnusedCode[0]) {
      console.warn(
        "Tree-shaking (removing unused code) is not fully implemented."
      );
    }

    return result;
  };

  // Minify CSS
  const minifyCSS = (inputCode) => {
    let result = inputCode;
    if (options.removeBlockComments[0])
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    return result.replace(/\s+/g, " ").trim();
  };

  // Minify HTML
  const minifyHTML = (inputCode) => {
    return inputCode
      .replace(/\n/g, "")
      .replace(/\s+/g, " ")
      .replace(/>\s+</g, "><")
      .trim();
  };

  // Minify JSON
  const minifyJSONCode = (inputCode) => {
    try {
      return JSON.stringify(JSON.parse(inputCode));
    } catch {
      setError("Invalid JSON input.");
      return inputCode;
    }
  };

  const handleMinify = () => {
    setError("");
    setOriginalCode(code);
    const language = detectLanguage(code);
    const { comments, whitespace } = extractCommentsAndWhitespace(code);

    let minified = "";
    try {
      if (language === "js") minified = minifyJavaScript(code);
      if (language === "css") minified = minifyCSS(code);
      if (language === "html") minified = minifyHTML(code);
      if (language === "json" && options.minifyJSON[0])
        minified = minifyJSONCode(code);
    } catch {
      setError("Syntax error detected during minification.");
      return;
    }

    setMinifiedCode(minified);
    setComments(comments);
    setWhitespaceRemoved(whitespace);
    alert("Code minified successfully!");
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(minifiedCode);
    alert("Minified code copied to clipboard!");
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg">
      <textarea
        className="w-full p-2 border rounded-lg h-40 mb-4"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter your code here..."
      />
      <div className="flex flex-wrap space-x-4 mb-4">
        {Object.keys(options).map((option) => (
          <label key={option} className="flex items-center text-secondary">
            <input
              type="checkbox"
              checked={options[option][0]}
              onChange={() => options[option][1](!options[option][0])}
              className="accent-primary"
            />
            <span className="ml-2">
              {option
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
            </span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text rounded-lg border hover:border-secondary"
          onClick={handleMinify}
        >
          Minify Code
        </button>

        <button
          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text rounded-lg border hover:border-secondary"
          onClick={() => {
            setCode("");
            setMinifiedCode("");
            setError("");
          }}
        >
          Clear
        </button>
        <button
          className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text rounded-lg border hover:border-secondary"
          onClick={copyToClipboard}
          disabled={!minifiedCode}
        >
          Copy Minified Code
        </button>
      </div>
      <h3 className="text-lg font-semibold mt-4 text-secondary">Minified Code:</h3>
      <textarea
        className="w-full p-2 border rounded-lg h-40 mt-2"
        readOnly
        value={minifiedCode}
      />
    </div>
  );
};

export default CodeMinifier;
