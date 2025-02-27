"use client";
import React, { useState } from "react";

const TextComparator = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [comparisonResult, setComparisonResult] = useState({ left: [], right: [] });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    ignoreCase: false,      // Ignore case differences
    trimLines: true,        // Trim whitespace from lines
    ignoreEmpty: true,      // Ignore empty lines
  });

  // Simple line-based diff algorithm
  const compareText = (text1, text2) => {
    if (!text1.trim() || !text2.trim()) {
      return { error: "Please enter text in both fields to compare" };
    }

    let lines1 = text1.split("\n");
    let lines2 = text2.split("\n");

    // Apply trimming and empty line filtering
    if (options.trimLines) {
      lines1 = lines1.map(line => line.trim());
      lines2 = lines2.map(line => line.trim());
    }
    if (options.ignoreEmpty) {
      lines1 = lines1.filter(line => line.length > 0);
      lines2 = lines2.filter(line => line.length > 0);
    }

    if (lines1.length === 0 || lines2.length === 0) {
      return { error: "No valid lines to compare after filtering" };
    }

    const left = [];
    const right = [];
    let i = 0, j = 0;

    while (i < lines1.length || j < lines2.length) {
      const line1 = i < lines1.length ? lines1[i] : "";
      const line2 = j < lines2.length ? lines2[j] : "";
      const compare1 = options.ignoreCase && line1 ? line1.toLowerCase() : line1;
      const compare2 = options.ignoreCase && line2 ? line2.toLowerCase() : line2;

      if (i >= lines1.length) {
        left.push({ type: "empty", text: "" });
        right.push({ type: "added", text: line2 });
        j++;
      } else if (j >= lines2.length) {
        left.push({ type: "removed", text: line1 });
        right.push({ type: "empty", text: "" });
        i++;
      } else if (compare1 === compare2) {
        left.push({ type: "unchanged", text: line1 });
        right.push({ type: "unchanged", text: line2 });
        i++;
        j++;
      } else {
        // Look ahead to find a match
        let foundMatch = false;
        for (let k = j; k < Math.min(j + 3, lines2.length); k++) {
          if (compare1 === (options.ignoreCase ? lines2[k].toLowerCase() : lines2[k])) {
            while (j < k) {
              left.push({ type: "empty", text: "" });
              right.push({ type: "added", text: lines2[j] });
              j++;
            }
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          for (let k = i; k < Math.min(i + 3, lines1.length); k++) {
            if (compare2 === (options.ignoreCase ? lines1[k].toLowerCase() : lines1[k])) {
              while (i < k) {
                left.push({ type: "removed", text: lines1[i] });
                right.push({ type: "empty", text: "" });
                i++;
              }
              foundMatch = true;
              break;
            }
          }
        }
        if (!foundMatch) {
          left.push({ type: "removed", text: line1 });
          right.push({ type: "added", text: line2 });
          i++;
          j++;
        }
      }
    }

    return {
      left,
      right,
    };
  };

  const handleCompare = async () => {
    setError("");
    setComparisonResult({ left: [], right: [] });
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = compareText(text1, text2);

      if (result.error) {
        setError(result.error);
        return;
      }

      setComparisonResult(result);
    } catch (err) {
      setError("An error occurred while comparing the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setText1("");
    setText2("");
    setComparisonResult({ left: [], right: [] });
    setError("");
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">
          Text Comparator
        </h1>

        {/* Input Section */}
        <div className="space-y-6 flex-grow">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 font-medium mb-2">
                Text 1 (Original):
              </label>
              <textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y transition-all"
                placeholder="Enter first text here..."
                maxLength={5000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {text1.length}/5000 characters
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-gray-700 font-medium mb-2">
                Text 2 (Modified):
              </label>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-40 resize-y transition-all"
                placeholder="Enter second text here..."
                maxLength={5000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {text2.length}/5000 characters
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Comparison Options:</p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreCase}
                  onChange={() => handleOptionChange("ignoreCase")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Ignore Case</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.trimLines}
                  onChange={() => handleOptionChange("trimLines")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Trim Lines</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.ignoreEmpty}
                  onChange={() => handleOptionChange("ignoreEmpty")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Ignore Empty Lines</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleCompare}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Comparing..." : "Compare Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Comparison Result */}
        {comparisonResult.left.length > 0 && comparisonResult.right.length > 0 && (
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                Original Text
              </h2>
              <div className="p-3 border border-gray-300 rounded-lg bg-white h-64 overflow-auto">
                {comparisonResult.left.map((line, index) => (
                  <div
                    key={index}
                    className={`p-1 ${
                      line.type === "removed" ? "bg-red-100" :
                      line.type === "added" ? "bg-gray-100 opacity-50" :
                      "bg-white"
                    }`}
                  >
                    {line.text || "\u00A0"} {/* Non-breaking space for empty lines */}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                Modified Text
              </h2>
              <div className="p-3 border border-gray-300 rounded-lg bg-white h-64 overflow-auto">
                {comparisonResult.right.map((line, index) => (
                  <div
                    key={index}
                    className={`p-1 ${
                      line.type === "added" ? "bg-green-100" :
                      line.type === "removed" ? "bg-gray-100 opacity-50" :
                      "bg-white"
                    }`}
                  >
                    {line.text || "\u00A0"} {/* Non-breaking space for empty lines */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextComparator;