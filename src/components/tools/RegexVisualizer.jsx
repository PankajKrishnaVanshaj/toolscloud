"use client";

import React, { useState, useEffect } from 'react';

const RegexVisualizer = () => {
  const [regexInput, setRegexInput] = useState('');
  const [testText, setTestText] = useState('');
  const [flags, setFlags] = useState('g');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  const analyzeRegex = () => {
    setError(null);
    setMatches([]);

    if (!regexInput.trim()) {
      return;
    }

    try {
      const regex = new RegExp(regexInput, flags);
      const text = testText || '';
      const matchResults = [];
      let match;

      // Reset the lastIndex for global regex
      regex.lastIndex = 0;

      while ((match = regex.exec(text)) !== null) {
        matchResults.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          groups: match.slice(1)
        });
        // Prevent infinite loop for zero-length matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }

      setMatches(matchResults);
    } catch (err) {
      setError('Invalid regex: ' + err.message);
    }
  };

  useEffect(() => {
    analyzeRegex();
  }, [regexInput, testText, flags]);

  const highlightMatches = () => {
    if (!testText || matches.length === 0) return testText;

    let result = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      // Add text before the match
      if (match.start > lastIndex) {
        result.push(testText.slice(lastIndex, match.start));
      }
      // Add highlighted match
      result.push(
        <span key={index} className="bg-yellow-200 px-1 rounded">
          {match.text}
        </span>
      );
      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < testText.length) {
      result.push(testText.slice(lastIndex));
    }

    return result;
  };

  const handleFlagChange = (flag) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''));
    } else {
      setFlags(flags + flag);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Regex Visualizer</h2>

        {/* Regex Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regular Expression
            </label>
            <input
              type="text"
              value={regexInput}
              onChange={(e) => setRegexInput(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="[a-z]+"
            />
          </div>

          {/* Flags */}
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={flags.includes('g')}
                onChange={() => handleFlagChange('g')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Global (g)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={flags.includes('i')}
                onChange={() => handleFlagChange('i')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Case-insensitive (i)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={flags.includes('m')}
                onChange={() => handleFlagChange('m')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Multiline (m)</span>
            </label>
          </div>

          {/* Test Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Text
            </label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to test your regex against"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Visualization */}
        {(regexInput || testText) && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Matches</h3>
              <div className="text-sm text-gray-800 whitespace-pre-wrap">
                {highlightMatches()}
              </div>
              {matches.length === 0 && testText && (
                <p className="text-gray-600 italic">No matches found</p>
              )}
            </div>

            {matches.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-semibold text-gray-700 mb-2">Match Details</h3>
                <ul className="space-y-2 text-sm">
                  {matches.map((match, index) => (
                    <li key={index}>
                      <span className="font-mono">"{match.text}"</span> 
                      <span className="text-gray-600"> (at {match.start}-{match.end})</span>
                      {match.groups.length > 0 && (
                        <ul className="ml-4 list-disc">
                          {match.groups.map((group, gIndex) => (
                            <li key={gIndex}>Group {gIndex + 1}: "{group}"</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegexVisualizer;