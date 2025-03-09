"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaSync,
} from "react-icons/fa";

const TextDiffViewer = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [diffResult, setDiffResult] = useState({ left: [], right: [] });
  const [showDiff, setShowDiff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    granularity: "line", // line, word, character
    ignoreCase: false,
    ignoreWhitespace: false,
    showOnlyChanges: false,
  });

  // Diff algorithm (supports line, word, character granularity)
  const computeDiff = (oldText, newText) => {
    let oldUnits, newUnits;

    // Prepare text based on granularity
    switch (options.granularity) {
      case "line":
        oldUnits = oldText.split("\n");
        newUnits = newText.split("\n");
        break;
      case "word":
        oldUnits = oldText.split(/\s+/).filter(Boolean);
        newUnits = newText.split(/\s+/).filter(Boolean);
        break;
      case "character":
        oldUnits = oldText.split("");
        newUnits = newText.split("");
        break;
      default:
        oldUnits = oldText.split("\n");
        newUnits = newText.split("\n");
    }

    if (options.ignoreWhitespace) {
      oldUnits = oldUnits.map(unit => unit.trim()).filter(Boolean);
      newUnits = newUnits.map(unit => unit.trim()).filter(Boolean);
    }

    if (options.ignoreCase) {
      oldUnits = oldUnits.map(unit => unit.toLowerCase());
      newUnits = newUnits.map(unit => unit.toLowerCase());
    }

    const left = [];
    const right = [];
    let i = 0, j = 0;

    while (i < oldUnits.length || j < newUnits.length) {
      if (i >= oldUnits.length) {
        right.push({ type: "added", text: newUnits[j] });
        left.push({ type: "empty", text: "" });
        j++;
      } else if (j >= newUnits.length) {
        left.push({ type: "removed", text: oldUnits[i] });
        right.push({ type: "empty", text: "" });
        i++;
      } else if (oldUnits[i] === newUnits[j]) {
        left.push({ type: "unchanged", text: oldUnits[i] });
        right.push({ type: "unchanged", text: newUnits[j] });
        i++;
        j++;
      } else {
        let foundMatch = false;
        for (let k = j; k < Math.min(j + 3, newUnits.length); k++) {
          if (oldUnits[i] === newUnits[k]) {
            while (j < k) {
              right.push({ type: "added", text: newUnits[j] });
              left.push({ type: "empty", text: "" });
              j++;
            }
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          for (let k = i; k < Math.min(i + 3, oldUnits.length); k++) {
            if (oldUnits[k] === newUnits[j]) {
              while (i < k) {
                left.push({ type: "removed", text: oldUnits[i] });
                right.push({ type: "empty", text: "" });
                i++;
              }
              foundMatch = true;
              break;
            }
          }
        }
        if (!foundMatch) {
          left.push({ type: "removed", text: oldUnits[i] });
          right.push({ type: "added", text: newUnits[j] });
          i++;
          j++;
        }
      }
    }

    if (options.showOnlyChanges) {
      const filteredLeft = [];
      const filteredRight = [];
      for (let idx = 0; idx < left.length; idx++) {
        if (left[idx].type !== "unchanged" || right[idx].type !== "unchanged") {
          filteredLeft.push(left[idx]);
          filteredRight.push(right[idx]);
        }
      }
      return { left: filteredLeft, right: filteredRight };
    }

    return { left, right };
  };

  const handleComputeDiff = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const diff = computeDiff(text1, text2);
      setDiffResult(diff);
      setShowDiff(!!text1 || !!text2);
      setIsLoading(false);
    }, 100); // Simulate async processing
  }, [text1, text2, options]);

  useEffect(() => {
    handleComputeDiff();
  }, [handleComputeDiff]);

  const reset = () => {
    setText1("");
    setText2("");
    setShowDiff(false);
  };

  const copyLeft = () => navigator.clipboard.writeText(text1);
  const copyRight = () => navigator.clipboard.writeText(text2);

  const exportDiff = () => {
    const content = `Original Text:\n${text1}\n\nModified Text:\n${text2}\n\nDiff Result (Left):\n${diffResult.left.map(l => `${l.type}: ${l.text}`).join("\n")}\n\nDiff Result (Right):\n${diffResult.right.map(r => `${r.type}: ${r.text}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `text_diff_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen  flex flex-col ">
      <div className=" mx-auto w-full flex-grow flex flex-col">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-900">
          Advanced Text Diff Viewer
        </h1>

        {/* Controls and Options */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyLeft}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Left
            </button>
            <button
              onClick={copyRight}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Right
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {showDiff && (
              <button
                onClick={exportDiff}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold"
              >
                <FaDownload className="inline mr-2" />
                Export Diff
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={options.granularity}
              onChange={(e) => handleOptionChange("granularity", e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="line">Line</option>
              <option value="word">Word</option>
              <option value="character">Character</option>
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={options.ignoreCase}
                onChange={() => handleOptionChange("ignoreCase", !options.ignoreCase)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
              />
              <span>Ignore Case</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={options.ignoreWhitespace}
                onChange={() => handleOptionChange("ignoreWhitespace", !options.ignoreWhitespace)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
              />
              <span>Ignore Whitespace</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={options.showOnlyChanges}
                onChange={() => handleOptionChange("showOnlyChanges", !options.showOnlyChanges)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
              />
              <span>Show Only Changes</span>
            </label>
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow resize-y transition-all min-h-[150px] sm:min-h-[200px]"
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 flex-grow resize-y transition-all min-h-[150px] sm:min-h-[200px]"
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
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2 flex items-center justify-center">
                Original with Changes
                {isLoading && <FaSync className="ml-2 animate-spin" />}
              </h2>
              <div className="p-3 border border-gray-300 rounded-lg bg-white h-64 sm:h-80 overflow-auto">
                {diffResult.left.map((line, index) => (
                  <div
                    key={index}
                    className={`p-1 whitespace-pre-wrap ${
                      line.type === "removed" ? "bg-red-100 text-red-800" :
                      line.type === "added" ? "bg-gray-100 opacity-50" :
                      "bg-white"
                    }`}
                  >
                    {line.text || "\u00A0"}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2 flex items-center justify-center">
                Modified with Changes
                {isLoading && <FaSync className="ml-2 animate-spin" />}
              </h2>
              <div className="p-3 border border-gray-300 rounded-lg bg-white h-64 sm:h-80 overflow-auto">
                {diffResult.right.map((line, index) => (
                  <div
                    key={index}
                    className={`p-1 whitespace-pre-wrap ${
                      line.type === "added" ? "bg-green-100 text-green-800" :
                      line.type === "removed" ? "bg-gray-100 opacity-50" :
                      "bg-white"
                    }`}
                  >
                    {line.text || "\u00A0"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-300">
          <h3 className="font-semibold text-purple-700">Features</h3>
          <ul className="list-disc list-inside text-purple-600 text-sm">
            <li>Compare by line, word, or character</li>
            <li>Ignore case and whitespace options</li>
            <li>Show only changes filter</li>
            <li>Copy and export diff results</li>
            <li>Responsive side-by-side view</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextDiffViewer;