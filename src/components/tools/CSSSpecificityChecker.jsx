"use client";

import React, { useState } from 'react';

const CSSSpecificityChecker = () => {
  const [selector, setSelector] = useState('');
  const [specificity, setSpecificity] = useState(null);
  const [error, setError] = useState(null);

  const calculateSpecificity = (cssSelector) => {
    setError(null);
    setSpecificity(null);

    if (!cssSelector.trim()) {
      setError('Please enter a CSS selector');
      return;
    }

    try {
      // Basic specificity calculation based on CSS rules
      let a = 0; // Inline styles (not applicable here), IDs
      let b = 0; // Classes, attributes, pseudo-classes
      let c = 0; // Elements, pseudo-elements

      // Remove comments and extra whitespace
      const cleanSelector = cssSelector.replace(/\/\*.*?\*\//g, '').trim();

      // Split by combinators but keep them for context
      const parts = cleanSelector.split(/[\s>+~]+/).filter(Boolean);

      parts.forEach(part => {
        // Count IDs (#)
        const idCount = (part.match(/#[-\w]+/g) || []).length;
        a += idCount;

        // Count classes (.), attributes ([]), and pseudo-classes (:)
        const classCount = (part.match(/\.[-\w]+/g) || []).length;
        const attrCount = (part.match(/\[[^\]]+\]/g) || []).length;
        const pseudoClassCount = (part.match(/:(?!:)[\w-]+(?:\([^)]+\))?|^::[\w-]+/g) || []).length;
        b += classCount + attrCount + pseudoClassCount;

        // Count elements and pseudo-elements (::)
        const elementCount = (part.match(/^[a-z]+|\*[^\.#:[>]|^(?![#\.:\[])[-\w]+/gi) || []).length;
        c += elementCount;

        // Adjust for pseudo-elements (counted in c, not b)
        const pseudoElementCount = (part.match(/::[\w-]+/g) || []).length;
        b -= pseudoElementCount;
        c += pseudoElementCount;
      });

      // Handle !important (overrides everything, but we'll just note it)
      const hasImportant = cleanSelector.includes('!important');

      setSpecificity({
        score: `${a},${b},${c}`,
        breakdown: { IDs: a, ClassesAttributesPseudo: b, Elements: c },
        hasImportant
      });
    } catch (err) {
      setError('Invalid CSS selector: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    calculateSpecificity(selector);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">CSS Specificity Checker</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSS Selector
            </label>
            <input
              type="text"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., #main .content div:hover"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate Specificity
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Specificity Result */}
        {specificity && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Specificity Score</h3>
              <p className="text-xl text-gray-800">{specificity.score}</p>
              {specificity.hasImportant && (
                <p className="text-sm text-orange-600 mt-1">Contains !important (overrides specificity)</p>
              )}
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Breakdown</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>ID selectors: {specificity.breakdown.IDs}</li>
                <li>Classes, Attributes, Pseudo-classes: {specificity.breakdown.ClassesAttributesPseudo}</li>
                <li>Elements, Pseudo-elements: {specificity.breakdown.Elements}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!specificity && !error && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter a CSS selector to calculate its specificity.</p>
            <p className="mt-1">Examples:</p>
            <ul className="list-disc pl-5">
              <li>#id → 1,0,0</li>
              <li>.class → 0,1,0</li>
              <li>div → 0,0,1</li>
              <li>#main .content:hover → 1,1,0</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSSSpecificityChecker;