"use client";

import React, { useState, useCallback, useRef } from "react";
import { FaSync, FaDownload, FaPlus } from "react-icons/fa";

const CSSSpecificityChecker = () => {
  const [selectors, setSelectors] = useState([{ id: Date.now(), value: "" }]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    showBreakdown: true,
    ignoreComments: true,
    compareSelectors: false,
  });
  const resultsRef = useRef(null);

  const calculateSpecificity = useCallback((cssSelector) => {
    if (!cssSelector.trim()) {
      return { error: "Selector cannot be empty" };
    }

    try {
      let a = 0; // IDs
      let b = 0; // Classes, attributes, pseudo-classes
      let c = 0; // Elements, pseudo-elements

      let cleanSelector = cssSelector;
      if (options.ignoreComments) {
        cleanSelector = cleanSelector.replace(/\/\*.*?\*\//g, "").trim();
      }

      const parts = cleanSelector.split(/[\s>+~]+/).filter(Boolean);

      parts.forEach((part) => {
        const idCount = (part.match(/#[-\w]+/g) || []).length;
        a += idCount;

        const classCount = (part.match(/\.[-\w]+/g) || []).length;
        const attrCount = (part.match(/\[[^\]]+\]/g) || []).length;
        const pseudoClassCount = (part.match(/:(?!:)[\w-]+(?:\([^)]+\))?|^::[\w-]+/g) || []).length;
        b += classCount + attrCount + pseudoClassCount;

        const elementCount = (part.match(/^[a-z]+|\*[^\.#:[>]|^(?![#\.:\[])[-\w]+/gi) || []).length;
        c += elementCount;

        const pseudoElementCount = (part.match(/::[\w-]+/g) || []).length;
        b -= pseudoElementCount;
        c += pseudoElementCount;
      });

      const hasImportant = cleanSelector.includes("!important");

      return {
        score: `${a},${b},${c}`,
        value: a * 10000 + b * 100 + c, // Numeric value for comparison
        breakdown: { IDs: a, ClassesAttributesPseudo: b, Elements: c },
        hasImportant,
        selector: cssSelector,
      };
    } catch (err) {
      return { error: "Invalid CSS selector: " + err.message };
    }
  }, [options.ignoreComments]);

  const handleCalculate = (e) => {
    e.preventDefault();
    setError(null);
    setResults([]);

    const newResults = selectors.map((sel) => {
      const result = calculateSpecificity(sel.value);
      return { ...result, id: sel.id };
    });

    const hasErrors = newResults.some((r) => r.error);
    if (hasErrors) {
      setError("One or more selectors are invalid");
    }
    setResults(newResults);

    if (options.compareSelectors && newResults.length > 1 && !hasErrors) {
      newResults.sort((a, b) => b.value - a.value || (b.hasImportant ? 1 : a.hasImportant ? -1 : 0));
    }

    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const addSelector = () => {
    setSelectors([...selectors, { id: Date.now(), value: "" }]);
  };

  const removeSelector = (id) => {
    if (selectors.length > 1) {
      setSelectors(selectors.filter((sel) => sel.id !== id));
      setResults(results.filter((res) => res.id !== id));
    }
  };

  const updateSelector = (id, value) => {
    setSelectors(selectors.map((sel) => (sel.id === id ? { ...sel, value } : sel)));
  };

  const handleReset = () => {
    setSelectors([{ id: Date.now(), value: "" }]);
    setResults([]);
    setError(null);
  };

  const handleDownload = () => {
    const content = results
      .map((res) => `${res.selector}: ${res.score}${res.hasImportant ? " (!important)" : ""}`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `specificity-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">CSS Specificity Checker</h2>

        {/* Form */}
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="space-y-4">
            {selectors.map((sel, index) => (
              <div key={sel.id} className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="text"
                  value={sel.value}
                  onChange={(e) => updateSelector(sel.id, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Selector ${index + 1} (e.g., #main .content)`}
                  aria-label={`CSS Selector ${index + 1}`}
                />
                {selectors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSelector(sel.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSelector}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaPlus className="mr-2" /> Add Another Selector
            </button>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!selectors.some((sel) => sel.value.trim())}
            >
              Calculate Specificity
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
              disabled={!results.length}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
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
        {results.length > 0 && (
          <div ref={resultsRef} className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-gray-700">Results</h3>
            {results.map((result, index) => (
              <div key={result.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-600">Selector: {result.selector}</p>
                {result.error ? (
                  <p className="text-red-700 mt-2">✗ {result.error}</p>
                ) : (
                  <>
                    <p className="text-lg text-gray-800 mt-1">Score: {result.score}</p>
                    {result.hasImportant && (
                      <p className="text-sm text-orange-600 mt-1">Contains !important (overrides specificity)</p>
                    )}
                    {options.showBreakdown && (
                      <ul className="mt-2 text-sm text-gray-600 space-y-1">
                        <li>ID selectors: {result.breakdown.IDs}</li>
                        <li>Classes, Attributes, Pseudo-classes: {result.breakdown.ClassesAttributesPseudo}</li>
                        <li>Elements, Pseudo-elements: {result.breakdown.Elements}</li>
                      </ul>
                    )}
                    {options.compareSelectors && results.length > 1 && (
                      <p className="text-sm text-blue-600 mt-2">
                        Rank: {index + 1} {index === 0 ? "(Highest specificity)" : ""}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {!results.length && !error && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">How to Use</h3>
            <p className="text-sm text-blue-600">
              Enter CSS selectors to calculate their specificity. Add multiple selectors to compare them.
            </p>
            <p className="text-sm text-blue-600 mt-2">Examples:</p>
            <ul className="list-disc pl-5 text-sm text-blue-600">
              <li>#id → 1,0,0</li>
              <li>.class → 0,1,0</li>
              <li>div:hover → 0,1,1</li>
              <li>#main .content div → 1,1,1</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSSSpecificityChecker;