"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaEyeSlash,
} from "react-icons/fa";

const TextObfuscator = () => {
  const [inputText, setInputText] = useState("");
  const [obfuscatedText, setObfuscatedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    method: "substitute",     // substitute, base64, random, caesar, reverse
    substituteChar: "*",      // Character for substitution
    preserveSpaces: true,
    caesarShift: 3,           // Shift for Caesar cipher
    preserveCase: true,       // Preserve original case
    includeNumbers: true,     // Obfuscate numbers too
    customChars: "",          // Custom character set for random method
  });

  const obfuscateText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to obfuscate" };
    }

    let result;
    switch (options.method) {
      case "substitute":
        result = substituteText(text);
        break;
      case "base64":
        result = base64Obfuscate(text);
        break;
      case "random":
        result = randomObfuscate(text);
        break;
      case "caesar":
        result = caesarObfuscate(text);
        break;
      case "reverse":
        result = reverseObfuscate(text);
        break;
      default:
        return { error: "Invalid obfuscation method" };
    }

    return {
      original: text,
      obfuscated: result,
      method: options.method,
      changes: getChanges(),
    };
  };

  const substituteText = (text) => {
    return text.split("").map(char => {
      if (options.preserveSpaces && /\s/.test(char)) return char;
      if ((/[a-zA-Z]/.test(char) || (options.includeNumbers && /\d/.test(char))) && char !== options.substituteChar) {
        return options.substituteChar;
      }
      return char;
    }).join("");
  };

  const base64Obfuscate = (text) => {
    return btoa(text);
  };

  const randomObfuscate = (text) => {
    const defaultChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const chars = options.customChars || defaultChars;
    return text.split("").map(char => {
      if (options.preserveSpaces && /\s/.test(char)) return char;
      if ((/[a-zA-Z]/.test(char) || (options.includeNumbers && /\d/.test(char)))) {
        return chars[Math.floor(Math.random() * chars.length)];
      }
      return char;
    }).join("");
  };

  const caesarObfuscate = (text) => {
    const shift = options.caesarShift % 26 || 1;
    return text.split("").map(char => {
      if (options.preserveSpaces && /\s/.test(char)) return char;
      if (/[a-z]/.test(char)) {
        return String.fromCharCode((char.charCodeAt(0) - 97 + shift) % 26 + 97);
      } else if (/[A-Z]/.test(char) && options.preserveCase) {
        return String.fromCharCode((char.charCodeAt(0) - 65 + shift) % 26 + 65);
      } else if (options.includeNumbers && /\d/.test(char)) {
        return String.fromCharCode((char.charCodeAt(0) - 48 + shift) % 10 + 48);
      }
      return char;
    }).join("");
  };

  const reverseObfuscate = (text) => {
    let lines = options.preserveSpaces ? text.split("\n") : [text];
    lines = lines.map(line => line.split("").reverse().join(""));
    return options.preserveSpaces ? lines.join("\n") : lines[0];
  };

  const getChanges = () => {
    const changes = [`Obfuscated using ${options.method}`];
    if (options.method === "substitute") changes.push(`Substitute char: "${options.substituteChar}"`);
    if (options.method === "caesar") changes.push(`Shift: ${options.caesarShift}`);
    if (options.method === "random" && options.customChars) changes.push(`Custom chars: "${options.customChars}"`);
    if (options.preserveSpaces) changes.push("Preserved spaces");
    if (!options.preserveCase) changes.push("Converted to lowercase");
    if (options.includeNumbers) changes.push("Included numbers");
    return changes;
  };

  const handleObfuscate = useCallback(async () => {
    setError("");
    setObfuscatedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = obfuscateText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setObfuscatedText(result.obfuscated);
        setHistory(prev => [...prev, { input: inputText, output: result.obfuscated, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setObfuscatedText("");
    setError("");
    setOptions({
      method: "substitute",
      substituteChar: "*",
      preserveSpaces: true,
      caesarShift: 3,
      preserveCase: true,
      includeNumbers: true,
      customChars: "",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, value) : option === "substituteChar" ? value.slice(0, 1) : value,
    }));
  };

  const exportObfuscatedText = () => {
    const content = `Original Text:\n${inputText}\n\nObfuscated Text (${options.method}):\n${obfuscatedText}\n\nChanges:\n${obfuscateText(inputText).changes.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `obfuscated_text_${options.method}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Obfuscator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Obfuscate:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-48 resize-y transition-all"
              placeholder="e.g., Hello World 123"
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Obfuscation Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Method:</label>
                <select
                  value={options.method}
                  onChange={(e) => handleOptionChange("method", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="substitute">Substitute</option>
                  <option value="base64">Base64</option>
                  <option value="random">Random</option>
                  <option value="caesar">Caesar Cipher</option>
                  <option value="reverse">Reverse</option>
                </select>
              </div>
              {options.method === "substitute" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Substitute Character:</label>
                  <input
                    type="text"
                    value={options.substituteChar}
                    onChange={(e) => handleOptionChange("substituteChar", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    maxLength="1"
                    placeholder="*"
                  />
                </div>
              )}
              {options.method === "caesar" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Caesar Shift (1-25):</label>
                  <input
                    type="number"
                    value={options.caesarShift}
                    onChange={(e) => handleOptionChange("caesarShift", parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    max="25"
                  />
                </div>
              )}
              {options.method === "random" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Custom Chars (optional):</label>
                  <input
                    type="text"
                    value={options.customChars}
                    onChange={(e) => handleOptionChange("customChars", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., ABC123"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveSpaces}
                    onChange={() => handleOptionChange("preserveSpaces", !options.preserveSpaces)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Preserve Spaces</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveCase}
                    onChange={() => handleOptionChange("preserveCase", !options.preserveCase)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Preserve Case</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.includeNumbers}
                    onChange={() => handleOptionChange("includeNumbers", !options.includeNumbers)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Include Numbers</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleObfuscate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              <FaEyeSlash className="inline mr-2" />
              {isLoading ? "Obfuscating..." : "Obfuscate Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {obfuscatedText && (
              <button
                onClick={exportObfuscatedText}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
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
        {obfuscatedText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Obfuscated Text ({options.method})
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-auto">
              {obfuscatedText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {obfuscateText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(obfuscatedText)}
              className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Obfuscated Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Obfuscations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.method}: "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}"
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setObfuscatedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-indigo-500 hover:text-indigo-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-indigo-100 rounded-lg border border-indigo-300">
          <h3 className="font-semibold text-indigo-700">Features</h3>
          <ul className="list-disc list-inside text-indigo-600 text-sm">
            <li>Methods: Substitute, Base64, Random, Caesar, Reverse</li>
            <li>Customizable substitute char, shift, and random chars</li>
            <li>Preserve spaces, case, and include numbers</li>
            <li>Export obfuscated text and history tracking</li>
            <li>Supports up to 10000 characters</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextObfuscator;