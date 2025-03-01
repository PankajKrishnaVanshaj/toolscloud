"use client";

import React, { useState } from "react";

const CSSBeautifier = () => {
  const [inputCSS, setInputCSS] = useState("");
  const [outputCSS, setOutputCSS] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const beautifyCSS = (css) => {
    setError(null);
    setOutputCSS("");
    setCopied(false);

    if (!css.trim()) {
      setError("Please enter some CSS to beautify");
      return;
    }

    try {
      let formatted = "";
      let indentLevel = 0;
      const indentSize = 2; // Spaces per indent level
      let inRule = false; // Track if we're inside a rule block
      let buffer = ""; // Buffer for building current line

      // Remove comments and normalize whitespace
      css = css
        .replace(/\/\*[\s\S]*?\*\//g, "") // Multi-line comments
        .replace(/\/\/.*$/gm, "") // Single-line comments
        .replace(/\s+/g, " ")
        .trim();

      for (let i = 0; i < css.length; i++) {
        const char = css[i];

        switch (char) {
          case "{":
            if (buffer.trim()) {
              formatted +=
                " ".repeat(indentLevel * indentSize) + buffer.trim() + " {\n";
            }
            indentLevel++;
            inRule = true;
            buffer = "";
            break;

          case "}":
            if (buffer.trim()) {
              formatted +=
                " ".repeat(indentLevel * indentSize) + buffer.trim() + ";\n";
            }
            indentLevel = Math.max(0, indentLevel - 1);
            formatted += " ".repeat(indentLevel * indentSize) + "}\n";
            inRule = false;
            buffer = "";
            break;

          case ";":
            if (inRule) {
              buffer += char;
              formatted +=
                " ".repeat(indentLevel * indentSize) + buffer.trim() + "\n";
              buffer = "";
            } else {
              buffer += char;
            }
            break;

          case ",":
            if (inRule) {
              buffer += char + " ";
            } else {
              formatted += buffer.trim() + ",\n";
              buffer = "";
            }
            break;

          default:
            buffer += char;
            break;
        }
      }

      // Handle any remaining buffer content
      if (buffer.trim()) {
        formatted +=
          " ".repeat(indentLevel * indentSize) +
          buffer.trim() +
          (inRule ? ";\n" : "\n");
      }

      setOutputCSS(formatted.trim());
    } catch (err) {
      setError("Error beautifying CSS: " + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    beautifyCSS(inputCSS);
  };

  const handleCopy = () => {
    if (outputCSS) {
      navigator.clipboard.writeText(outputCSS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          CSS Beautifier
        </h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Input CSS
            </label>
            <textarea
              value={inputCSS}
              onChange={(e) => setInputCSS(e.target.value)}
              className="w-full h-48 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="body{font-size:16px;color:#333;}div{margin:0 auto;}"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Beautify CSS
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Beautified Output */}
        {outputCSS && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-700">Beautified CSS</h3>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="p-4 bg-gray-50 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap">
              {outputCSS}
            </pre>
          </div>
        )}

        {/* Notes */}
        {!outputCSS && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Enter minified or unformatted CSS to format it with proper
              indentation and spacing.
            </p>
            <p className="mt-1">Example:</p>
            <p className="font-mono">
              Input:{" "}
              <code>{`body {
  font-size: 16px;
  color: #333;
}`}</code>
            </p>
            <p className="font-mono">Output:</p>
            <pre className="font-mono">
              {`body {
  font-size: 16px;
  color: #333;
}`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSSBeautifier;
