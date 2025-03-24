"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaSync,
} from "react-icons/fa";

const TextRotator = () => {
  const [inputText, setInputText] = useState("");
  const [rotatedText, setRotatedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    rotationType: "shift",    // reverse, shift, rot13, mirror, word-reverse
    shiftAmount: 1,           // For shift rotation (1-25)
    preserveCase: true,
    preserveSpaces: true,     // Keep spaces unchanged
    includeNumbers: false,    // Rotate numbers in shift/caesar
    reverseLines: false,      // Reverse by lines instead of whole text
  });

  const rotateText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to rotate" };
    }

    const processedText = options.preserveCase ? text : text.toLowerCase();
    let result;

    switch (options.rotationType) {
      case "reverse":
        result = reverseText(processedText);
        break;
      case "shift":
        result = shiftText(processedText, options.shiftAmount);
        break;
      case "rot13":
        result = rot13Text(processedText);
        break;
      case "mirror":
        result = mirrorText(processedText);
        break;
      case "word-reverse":
        result = wordReverseText(processedText);
        break;
      default:
        return { error: "Invalid rotation type" };
    }

    return {
      original: text,
      rotated: result,
      type: options.rotationType,
      changes: getChanges(),
    };
  };

  const reverseText = (text) => {
    if (options.reverseLines) {
      return text.split("\n").map(line => line.split("").reverse().join("")).join("\n");
    }
    return text.split("").reverse().join("");
  };

  const shiftText = (text, shift) => {
    return text.split("").map(char => {
      if (options.preserveSpaces && /\s/.test(char)) return char;
      if (/[A-Za-z]/.test(char)) {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        const rotatedCode = ((code - base + shift) % 26) + base;
        return String.fromCharCode(rotatedCode);
      } else if (options.includeNumbers && /\d/.test(char)) {
        const code = char.charCodeAt(0);
        const rotatedCode = ((code - 48 + shift) % 10) + 48;
        return String.fromCharCode(rotatedCode);
      }
      return char;
    }).join("");
  };

  const rot13Text = (text) => {
    return shiftText(text, 13);
  };

  const mirrorText = (text) => {
    const mirrorMap = {
      a: "ɒ", b: "d", c: "ɔ", d: "b", e: "ɘ", f: "ʇ", g: "ƍ", h: "ʜ", i: "i", j: "ɾ",
      k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "q", q: "p", r: "ɹ", s: "ƨ", t: "ʇ",
      u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
      A: "∀", B: "ᗺ", C: "Ɔ", D: "ᗡ", E: "Ǝ", F: "Ⅎ", G: "⅁", H: "H", I: "I", J: "ᒋ",
      K: "⋊", L: "⅂", M: "W", N: "И", O: "O", P: "Ԁ", Q: "Ò", R: "Я", S: "S", T: "⊥",
      U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
    };
    return text.split("").map(char => {
      if (options.preserveSpaces && /\s/.test(char)) return char;
      if (options.includeNumbers && /\d/.test(char)) return char.split("").reverse().join("");
      return mirrorMap[char] || char;
    }).join("");
  };

  const wordReverseText = (text) => {
    if (options.reverseLines) {
      return text.split("\n").map(line => line.split(/\s+/).reverse().join(" ")).join("\n");
    }
    return text.split(/\s+/).reverse().join(" ");
  };

  const getChanges = () => {
    const changes = [`Rotated using ${options.rotationType}`];
    if (options.rotationType === "shift") changes.push(`Shift: ${options.shiftAmount}`);
    if (options.preserveCase) changes.push("Preserved case");
    if (options.preserveSpaces) changes.push("Preserved spaces");
    if (options.includeNumbers) changes.push("Included numbers");
    if (options.reverseLines) changes.push("Reversed by lines");
    return changes;
  };

  const handleRotate = useCallback(async () => {
    setError("");
    setRotatedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = rotateText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setRotatedText(result.rotated);
        setHistory(prev => [...prev, { input: inputText, output: result.rotated, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setRotatedText("");
    setError("");
    setOptions({
      rotationType: "shift",
      shiftAmount: 1,
      preserveCase: true,
      preserveSpaces: true,
      includeNumbers: false,
      reverseLines: false,
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, Math.min(25, value)) : value,
    }));
  };

  const exportRotatedText = () => {
    const content = `Original Text:\n${inputText}\n\nRotated Text (${options.rotationType}):\n${rotatedText}\n\nChanges:\n${rotateText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rotated_text_${options.rotationType}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Rotator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Rotate:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-48 resize-y transition-all"
              placeholder="e.g., Hello World"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Rotation Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Rotation Type:</label>
                <select
                  value={options.rotationType}
                  onChange={(e) => handleOptionChange("rotationType", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="reverse">Reverse</option>
                  <option value="shift">Shift (Caesar)</option>
                  <option value="rot13">ROT13</option>
                  <option value="mirror">Mirror</option>
                  <option value="word-reverse">Word Reverse</option>
                </select>
              </div>
              {options.rotationType === "shift" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Shift Amount (1-25):</label>
                  <input
                    type="number"
                    value={options.shiftAmount}
                    onChange={(e) => handleOptionChange("shiftAmount", parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                    max="25"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveCase}
                    onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Preserve Case</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveSpaces}
                    onChange={() => handleOptionChange("preserveSpaces", !options.preserveSpaces)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Preserve Spaces</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.includeNumbers}
                    onChange={() => handleOptionChange("includeNumbers", !options.includeNumbers)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Include Numbers</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.reverseLines}
                    onChange={() => handleOptionChange("reverseLines", !options.reverseLines)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <span>Reverse by Lines</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleRotate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FaSync className="inline mr-2" />
              {isLoading ? "Rotating..." : "Rotate Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {rotatedText && (
              <button
                onClick={exportRotatedText}
                className="flex-1 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-semibold"
              >
                <FaDownload className="inline mr-2" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {rotatedText && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Rotated Text ({options.rotationType})
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-auto">
              {rotatedText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {rotateText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(rotatedText)}
              className="mt-4 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Rotated Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Rotations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.rotationType}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setRotatedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-300">
          <h3 className="font-semibold text-green-700">Features</h3>
          <ul className="list-disc list-inside text-green-600 text-sm">
            <li>Rotation types: Reverse, Shift, ROT13, Mirror, Word Reverse</li>
            <li>Custom shift amount for Caesar rotation</li>
            <li>Preserve case, spaces, and include numbers</li>
            <li>Line-by-line reversal option</li>
            <li>Export rotated text and history tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextRotator;