"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { FaSearch, FaSync, FaDownload, FaHighlighter, FaCopy } from "react-icons/fa";

const CSSSelectorTester = () => {
  const [selector, setSelector] = useState("");
  const [htmlInput, setHtmlInput] = useState("");
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const [highlightStyle, setHighlightStyle] = useState("background");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  const testSelector = useCallback(() => {
    setError(null);
    setMatches([]);

    if (!selector.trim()) {
      setError("Please enter a CSS selector");
      return;
    }
    if (!htmlInput.trim()) {
      setError("Please enter some HTML content");
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div id="test-root">${htmlInput}</div>`, "text/html");
      const root = doc.getElementById("test-root");

      const adjustedSelector = caseSensitive ? selector : selector.toLowerCase();
      const matchedElements = Array.from(root.querySelectorAll(adjustedSelector));

      const matchDetails = matchedElements.map((el, index) => ({
        index,
        tagName: el.tagName.toLowerCase(),
        outerHTML: el.outerHTML.slice(0, 150) + (el.outerHTML.length > 150 ? "..." : ""),
        classes: el.className || "N/A",
        id: el.id || "N/A",
        attributes: Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`).join(", "),
      }));

      setMatches(matchDetails);
      setHistory(prev => [...prev, { selector, html: htmlInput, matches: matchDetails }].slice(-5));

      // Apply highlighting
      matchedElements.forEach((el) => {
        el.style.backgroundColor = "";
        el.style.border = "";
        el.style.color = "";
        el.style.fontWeight = "";
        if (highlightStyle === "background") {
          el.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
          el.style.border = "1px solid #ffcc00";
        } else if (highlightStyle === "border") {
          el.style.border = "2px dashed #ff0000";
        } else if (highlightStyle === "text") {
          el.style.color = "#ff0000";
          el.style.fontWeight = "bold";
        }
      });

      if (previewRef.current) {
        previewRef.current.innerHTML = root.innerHTML;
      }
    } catch (err) {
      setError(`Invalid selector or HTML: ${err.message}`);
    }
  }, [selector, htmlInput, highlightStyle, caseSensitive]);

  const handleReset = () => {
    setSelector("");
    setHtmlInput("");
    setMatches([]);
    setError(null);
    setCopied(false);
    if (previewRef.current) previewRef.current.innerHTML = "";
  };

  const handleDownload = () => {
    const blob = new Blob([htmlInput], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `selector-test-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (matches.length > 0) {
      const matchText = matches.map(m => `${m.tagName}: ${m.outerHTML}`).join("\n");
      navigator.clipboard.writeText(matchText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const restoreFromHistory = (entry) => {
    setSelector(entry.selector);
    setHtmlInput(entry.html);
    setMatches(entry.matches);
    testSelector();
  };

  useEffect(() => {
    if (previewRef.current && htmlInput && !selector) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div id="test-root">${htmlInput}</div>`, "text/html");
      const root = doc.getElementById("test-root");
      previewRef.current.innerHTML = root.innerHTML;
    }
  }, [htmlInput]);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">CSS Selector Tester</h2>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); testSelector(); }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CSS Selector</label>
              <input
                type="text"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder=".class, #id, div > p"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HTML Content</label>
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="<div><p class='intro'>Hello</p><p>World</p></div>"
              />
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlight Style</label>
              <select
                value={highlightStyle}
                onChange={(e) => setHighlightStyle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="background">Background</option>
                <option value="border">Border</option>
                <option value="text">Text</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <input
                type="checkbox"
                id="caseSensitive"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="caseSensitive" className="text-sm text-gray-700">Case Sensitive</label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FaSearch className="mr-2" /> Test Selector
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!htmlInput.trim()}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download HTML
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Results */}
        {(matches.length > 0 || htmlInput) && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                <FaHighlighter className="mr-2" /> HTML Preview
              </h3>
              <div
                ref={previewRef}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 overflow-auto max-h-96 text-sm"
              />
            </div>
            {matches.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-700">Matches ({matches.length})</h3>
                  <button
                    onClick={handleCopy}
                    className={`py-1 px-3 rounded-lg flex items-center transition-colors ${
                      copied ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    <FaCopy className="mr-2" /> {copied ? "Copied!" : "Copy Matches"}
                  </button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-auto text-sm">
                  <ul className="space-y-4">
                    {matches.map(match => (
                      <li key={match.index} className="border-b pb-2">
                        <div><strong>Tag:</strong> <code>{match.tagName}</code></div>
                        <div><strong>ID:</strong> {match.id}</div>
                        <div><strong>Classes:</strong> {match.classes}</div>
                        <div><strong>Attributes:</strong> {match.attributes || "N/A"}</div>
                        <div><strong>Outer HTML:</strong> <code>{match.outerHTML}</code></div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3">Recent Tests (Last 5)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="truncate max-w-[70%]">{entry.selector} ({entry.matches.length} matches)</span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Restore
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {!htmlInput && !matches.length && !error && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
              <li>Test any CSS selector against HTML</li>
              <li>Multiple highlight styles (background, border, text)</li>
              <li>Case-sensitive option</li>
              <li>View detailed match information</li>
              <li>Copy matches and download HTML</li>
              <li>History of recent tests</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSSSelectorTester;