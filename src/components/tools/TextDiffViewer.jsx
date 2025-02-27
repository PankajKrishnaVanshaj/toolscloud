"use client";
import React, { useState, useEffect } from "react";

const TextDiffViewer = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffResult, setDiffResult] = useState({ left: [], right: [] });
  const [showDiff, setShowDiff] = useState(false);

  // Simple diff algorithm (line-based)
  const computeDiff = (oldText, newText) => {
    const oldLines = oldText.split("\n");
    const newLines = newText.split("\n");
    const left = [];
    const right = [];

    let i = 0, j = 0;
    while (i < oldLines.length || j < newLines.length) {
      if (i >= oldLines.length) {
        right.push({ type: "added", text: newLines[j] });
        left.push({ type: "empty", text: "" });
        j++;
      } else if (j >= newLines.length) {
        left.push({ type: "removed", text: oldLines[i] });
        right.push({ type: "empty", text: "" });
        i++;
      } else if (oldLines[i] === newLines[j]) {
        left.push({ type: "unchanged", text: oldLines[i] });
        right.push({ type: "unchanged", text: newLines[j] });
        i++;
        j++;
      } else {
        // Look ahead to find a match
        let foundMatch = false;
        for (let k = j; k < Math.min(j + 3, newLines.length); k++) {
          if (oldLines[i] === newLines[k]) {
            while (j < k) {
              right.push({ type: "added", text: newLines[j] });
              left.push({ type: "empty", text: "" });
              j++;
            }
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          for (let k = i; k < Math.min(i + 3, oldLines.length); k++) {
            if (oldLines[k] === newLines[j]) {
              while (i < k) {
                left.push({ type: "removed", text: oldLines[i] });
                right.push({ type: "empty", text: "" });
                i++;
              }
              foundMatch = true;
              break;
            }
          }
        }
        if (!foundMatch) {
          left.push({ type: "removed", text: oldLines[i] });
          right.push({ type: "added", text: newLines[j] });
          i++;
          j++;
        }
      }
    }

    return { left, right };
  };

  // Update diff whenever text changes
  useEffect(() => {
    if (text1 || text2) {
      const diff = computeDiff(text1, text2);
      setDiffResult(diff);
      setShowDiff(true);
    } else {
      setShowDiff(false);
    }
  }, [text1, text2]);

  const reset = () => {
    setText1("");
    setText2("");
    setShowDiff(false);
  };

  const copyLeft = () => navigator.clipboard.writeText(text1);
  const copyRight = () => navigator.clipboard.writeText(text2);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">
          Text Diff Viewer
        </h1>

        {/* Controls */}
        <div className="flex justify-between mb-4">
          <div className="space-x-2">
            <button
              onClick={copyLeft}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              Copy Left
            </button>
            <button
              onClick={copyRight}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
            >
              Copy Right
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Input and Diff Display */}
        <div className="flex flex-col md:flex-row gap-4 flex-grow">
          {/* Left Text (Original) */}
          <div className="w-full md:w-1/2 flex flex-col">
            <label className="block text-gray-700 font-medium mb-2">
              Original Text
            </label>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow resize-y transition-all"
              placeholder="Enter original text here..."
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {text1.length} characters
            </div>
          </div>

          {/* Right Text (Modified) */}
          <div className="w-full md:w-1/2 flex flex-col">
            <label className="block text-gray-700 font-medium mb-2">
              Modified Text
            </label>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 flex-grow resize-y transition-all"
              placeholder="Enter modified text here..."
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {text2.length} characters
            </div>
          </div>
        </div>

        {/* Diff Output */}
        {showDiff && (
          <div className="mt-8 flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">
                Original with Changes
              </h2>
              <div className="p-3 border border-gray-300 rounded-lg bg-white h-64 overflow-auto">
                {diffResult.left.map((line, index) => (
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
                Modified with Changes
              </h2>
              <div className="p-3 border border-gray-300 rounded-lg bg-white h-64 overflow-auto">
                {diffResult.right.map((line, index) => (
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

export default TextDiffViewer;