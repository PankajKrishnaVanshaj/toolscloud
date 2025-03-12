"use client";

import React, { useState, useCallback, useEffect } from "react";
import * as Diff from "diff";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const DiffViewer = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffResult, setDiffResult] = useState([]);
  const [viewMode, setViewMode] = useState("sideBySide");
  const [copied, setCopied] = useState(false);
  const [diffOptions, setDiffOptions] = useState({
    ignoreWhitespace: true,
    ignoreCase: false,
    wordDiff: false,
  });

  const computeDiff = useCallback(() => {
    if (!text1.trim() && !text2.trim()) {
      setDiffResult([]);
      return;
    }

    let diff;
    if (diffOptions.wordDiff) {
      diff = Diff.diffWords(
        diffOptions.ignoreCase ? text1.toLowerCase() : text1,
        diffOptions.ignoreCase ? text2.toLowerCase() : text2,
        { ignoreWhitespace: diffOptions.ignoreWhitespace }
      );
    } else {
      diff = Diff.diffLines(
        text1,
        text2,
        { ignoreWhitespace: diffOptions.ignoreWhitespace, ignoreCase: diffOptions.ignoreCase }
      );
    }
    setDiffResult(diff);
    setCopied(false);
  }, [text1, text2, diffOptions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    computeDiff();
  };

  const handleCopy = () => {
    if (diffResult.length > 0) {
      const diffText = diffResult
        .map(part => {
          const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
          return part.value.split("\n").map(line => (line ? `${prefix}${line}` : "")).join("\n");
        })
        .join("");
      navigator.clipboard.writeText(diffText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const diffText = diffResult
      .map(part => {
        const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
        return part.value.split("\n").map(line => (line ? `${prefix}${line}` : "")).join("\n");
      })
      .join("");
    const blob = new Blob([diffText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diff-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setText1("");
    setText2("");
    setDiffResult([]);
    setCopied(false);
  };

  const renderSideBySide = () => {
    const oldLines = [];
    const newLines = [];
    diffResult.forEach(part => {
      const lines = part.value.split("\n").filter(line => line !== "");
      if (part.added) {
        newLines.push(...lines.map(line => ({ text: line, type: "added" })));
        oldLines.push(...lines.map(() => ({ text: "", type: "empty" })));
      } else if (part.removed) {
        oldLines.push(...lines.map(line => ({ text: line, type: "removed" })));
        newLines.push(...lines.map(() => ({ text: "", type: "empty" })));
      } else {
        oldLines.push(...lines.map(line => ({ text: line, type: "unchanged" })));
        newLines.push(...lines.map(line => ({ text: line, type: "unchanged" })));
      }
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Original Text</h3>
          <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-96 overflow-auto">
            {oldLines.map((line, index) => (
              <div
                key={index}
                className={`py-1 ${line.type === "removed" ? "bg-red-100 text-red-800" : line.type === "empty" ? "bg-gray-100" : ""}`}
              >
                {line.text}
              </div>
            ))}
          </pre>
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">New Text</h3>
          <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-96 overflow-auto">
            {newLines.map((line, index) => (
              <div
                key={index}
                className={`py-1 ${line.type === "added" ? "bg-green-100 text-green-800" : line.type === "empty" ? "bg-gray-100" : ""}`}
              >
                {line.text}
              </div>
            ))}
          </pre>
        </div>
      </div>
    );
  };

  const renderInline = () => {
    return (
      <div>
        <h3 className="font-semibold text-gray-700 mb-2">Diff</h3>
        <pre className="p-4 bg-gray-50 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap break-all max-h-96 overflow-auto">
          {diffResult.map((part, index) => (
            <span
              key={index}
              className={part.added ? "bg-green-100 text-green-800" : part.removed ? "bg-red-100 text-red-800" : ""}
            >
              {part.value}
            </span>
          ))}
        </pre>
      </div>
    );
  };

  useEffect(() => {
    computeDiff();
  }, [diffOptions, computeDiff]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Diff Viewer</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Original Text</label>
              <textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter original text here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Text</label>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="w-full h-48 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new text here..."
              />
            </div>
          </div>

          {/* Diff Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Diff Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(diffOptions).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setDiffOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Compare
            </button>
            <button
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sideBySide">Side by Side</option>
              <option value="inline">Inline</option>
            </select>
          </div>
        </form>

        {/* Diff Result */}
        {diffResult.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
              <h3 className="font-semibold text-gray-700 text-lg">Comparison Result</h3>
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className={`py-2 px-4 rounded-lg flex items-center justify-center transition-colors ${
                    copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy Diff"}
                </button>
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download
                </button>
              </div>
            </div>
            {viewMode === "sideBySide" ? renderSideBySide() : renderInline()}
          </div>
        )}

        {/* Features List */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Side-by-side or inline diff views</li>
            <li>Word-level or line-level comparison</li>
            <li>Ignore whitespace and case options</li>
            <li>Copy diff to clipboard</li>
            <li>Download diff as text file</li>
            <li>Responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiffViewer;