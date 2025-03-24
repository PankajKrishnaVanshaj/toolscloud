"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const TextToAscii = () => {
  const [text, setText] = useState("");
  const [asciiOutput, setAsciiOutput] = useState("");
  const [format, setFormat] = useState("decimal");
  const [delimiter, setDelimiter] = useState("space");
  const [customDelimiter, setCustomDelimiter] = useState("");
  const [reverseInput, setReverseInput] = useState("");
  const [reverseOutput, setReverseOutput] = useState("");
  const [error, setError] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [includeCharMap, setIncludeCharMap] = useState(false);

  const textToAscii = useCallback(
    (input) => {
      setError("");
      if (!input) {
        setAsciiOutput("");
        return;
      }

      const processedInput = caseSensitive ? input : input.toLowerCase();
      const codes = processedInput.split("").map((char) => char.charCodeAt(0));
      let formattedOutput;

      switch (format) {
        case "decimal":
          formattedOutput = codes.join(getDelimiter());
          break;
        case "hex":
          formattedOutput = codes
            .map((code) => code.toString(16).toUpperCase().padStart(2, "0"))
            .join(getDelimiter());
          break;
        case "binary":
          formattedOutput = codes
            .map((code) => code.toString(2).padStart(8, "0"))
            .join(getDelimiter());
          break;
        case "octal":
          formattedOutput = codes
            .map((code) => code.toString(8).padStart(3, "0"))
            .join(getDelimiter());
          break;
        default:
          formattedOutput = codes.join(getDelimiter());
      }

      if (includeCharMap) {
        const charMap = processedInput
          .split("")
          .map((char, i) => `${char}: ${codes[i]}`)
          .join("\n");
        formattedOutput = `${formattedOutput}\n\nCharacter Map:\n${charMap}`;
      }

      setAsciiOutput(formattedOutput);
    },
    [format, delimiter, customDelimiter, caseSensitive, includeCharMap]
  );

  const asciiToText = useCallback(
    (input) => {
      setError("");
      if (!input) {
        setReverseOutput("");
        return;
      }

      const delimiterUsed = getDelimiter();
      const codes = input.split(delimiterUsed).map((str) => str.trim()).filter(Boolean);

      try {
        let textOutput;
        switch (format) {
          case "decimal":
            textOutput = codes.map((code) => String.fromCharCode(parseInt(code, 10))).join("");
            break;
          case "hex":
            textOutput = codes.map((code) => String.fromCharCode(parseInt(code, 16))).join("");
            break;
          case "binary":
            textOutput = codes.map((code) => String.fromCharCode(parseInt(code, 2))).join("");
            break;
          case "octal":
            textOutput = codes.map((code) => String.fromCharCode(parseInt(code, 8))).join("");
            break;
          default:
            textOutput = codes.map((code) => String.fromCharCode(parseInt(code, 10))).join("");
        }
        setReverseOutput(textOutput);
      } catch (err) {
        setError(`Invalid ${format} input: ${err.message}`);
        setReverseOutput("");
      }
    },
    [format, delimiter, customDelimiter]
  );

  const getDelimiter = () => {
    switch (delimiter) {
      case "space":
        return " ";
      case "comma":
        return ", ";
      case "custom":
        return customDelimiter || " ";
      default:
        return " ";
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadOutput = (content, filename) => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const reset = () => {
    setText("");
    setAsciiOutput("");
    setReverseInput("");
    setReverseOutput("");
    setError("");
    setFormat("decimal");
    setDelimiter("space");
    setCustomDelimiter("");
    setCaseSensitive(true);
    setIncludeCharMap(false);
  };

  const handleTextChange = (value) => {
    setText(value);
    textToAscii(value);
  };

  const handleReverseChange = (value) => {
    setReverseInput(value);
    asciiToText(value);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Text to ASCII Converter
        </h1>

        <div className="space-y-8">
          {/* Text to ASCII Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Input</label>
              <textarea
                value={text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter text to convert to ASCII"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => {
                    setFormat(e.target.value);
                    textToAscii(text);
                    asciiToText(reverseInput);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="decimal">Decimal</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="binary">Binary</option>
                  <option value="octal">Octal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delimiter</label>
                <select
                  value={delimiter}
                  onChange={(e) => {
                    setDelimiter(e.target.value);
                    textToAscii(text);
                    asciiToText(reverseInput);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="space">Space</option>
                  <option value="comma">Comma</option>
                  <option value="custom">Custom</option>
                </select>
                {delimiter === "custom" && (
                  <input
                    type="text"
                    value={customDelimiter}
                    onChange={(e) => {
                      setCustomDelimiter(e.target.value);
                      textToAscii(text);
                      asciiToText(reverseInput);
                    }}
                    placeholder="Custom delimiter"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => {
                      setCaseSensitive(e.target.checked);
                      textToAscii(text);
                    }}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Case Sensitive</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCharMap}
                    onChange={(e) => {
                      setIncludeCharMap(e.target.checked);
                      textToAscii(text);
                    }}
                    className="mr-2 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Character Map</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII Output
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  value={asciiOutput}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 h-32 resize-y"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => copyToClipboard(asciiOutput)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                  <button
                    onClick={() => downloadOutput(asciiOutput, "ascii-output.txt")}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ASCII to Text Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII Input
              </label>
              <textarea
                value={reverseInput}
                onChange={(e) => handleReverseChange(e.target.value)}
                placeholder={`Enter ASCII codes (${format}, separated by ${getDelimiter().trim()})`}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Output
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  value={reverseOutput}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 h-32 resize-y"
                />
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => copyToClipboard(reverseOutput)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <FaCopy className="mr-2" /> Copy
                  </button>
                  <button
                    onClick={() => downloadOutput(reverseOutput, "text-output.txt")}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" /> Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={reset}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>

          {/* Features Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert text to ASCII (decimal, hex, binary, octal)</li>
              <li>Convert ASCII back to text</li>
              <li>Customizable delimiter (space, comma, or custom)</li>
              <li>Case sensitivity option</li>
              <li>Include character map in output</li>
              <li>Copy to clipboard and download as text file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextToAscii;