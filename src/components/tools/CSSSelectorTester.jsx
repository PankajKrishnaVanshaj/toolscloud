"use client";

import React, { useState, useRef, useEffect } from 'react';

const CSSSelectorTester = () => {
  const [selector, setSelector] = useState('');
  const [htmlInput, setHtmlInput] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);
  const previewRef = useRef(null);

  const testSelector = () => {
    setError(null);
    setMatches([]);

    if (!selector.trim()) {
      setError('Please enter a CSS selector');
      return;
    }
    if (!htmlInput.trim()) {
      setError('Please enter some HTML content');
      return;
    }

    try {
      // Create a temporary DOM element to parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div id="test-root">${htmlInput}</div>`, 'text/html');
      const root = doc.getElementById('test-root');

      // Test the selector
      const matchedElements = Array.from(root.querySelectorAll(selector));
      const matchDetails = matchedElements.map((el, index) => ({
        index,
        tagName: el.tagName.toLowerCase(),
        outerHTML: el.outerHTML.slice(0, 100) + (el.outerHTML.length > 100 ? '...' : '')
      }));

      setMatches(matchDetails);

      // Update preview with highlights
      matchedElements.forEach((el) => {
        el.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
        el.style.border = '1px solid #ffcc00';
      });
      if (previewRef.current) {
        previewRef.current.innerHTML = root.innerHTML;
      }
    } catch (err) {
      setError('Invalid selector or HTML: ' + err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    testSelector();
  };

  useEffect(() => {
    if (previewRef.current && htmlInput && !selector) {
      // Update preview with plain HTML when no selector is applied
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div id="test-root">${htmlInput}</div>`, 'text/html');
      const root = doc.getElementById('test-root');
      previewRef.current.innerHTML = root.innerHTML;
    }
  }, [htmlInput]);

  return (
    <div className="w-full max-w-6xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">CSS Selector Tester</h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CSS Selector
              </label>
              <input
                type="text"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder=".class, #id, div > p"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTML Content
              </label>
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="<div><p class='intro'>Hello</p><p>World</p></div>"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Selector
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Results */}
        {(matches.length > 0 || htmlInput) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* HTML Preview */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">HTML Preview</h3>
              <div
                ref={previewRef}
                className="p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto max-h-96"
              />
            </div>

            {/* Match Details */}
            {matches.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Matches ({matches.length})</h3>
                <div className="p-4 bg-gray-50 rounded-md max-h-96 overflow-auto">
                  {matches.length === 0 ? (
                    <p className="text-sm text-gray-600">No elements matched the selector.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-gray-600">
                      {matches.map(match => (
                        <li key={match.index} className="border-b pb-2">
                          <span className="font-mono">{match.tagName}</span> - {match.outerHTML}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {!matches.length && !error && !htmlInput && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Enter a CSS selector and HTML content to see which elements match.</p>
            <p className="mt-1">Examples:</p>
            <ul className="list-disc pl-5">
              <li>Selector: <code>.intro</code> - Matches elements with class "intro"</li>
              <li>Selector: <code>div &gt; p</code> - Matches <code>p</code> elements directly inside <code>div</code></li>
              <li>Selector: <code>[data-test]</code> - Matches elements with a "data-test" attribute</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSSSelectorTester;