"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaSync, FaDownload } from "react-icons/fa";

const UnicodeToBinary = () => {
  const [inputText, setInputText] = useState("");
  const [bitLength, setBitLength] = useState(8);
  const [separator, setSeparator] = useState("space");
  const [outputFormat, setOutputFormat] = useState("binary");
  const [caseSensitivity, setCaseSensitivity] = useState(false); // New: Hex case option
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Conversion functions
  const convertToBinary = (text, bits) => {
    return Array.from(text).map((char) => {
      const code = char.charCodeAt(0);
      return code.toString(2).padStart(bits, "0");
    });
  };

  const convertToHex = (text) => {
    return Array.from(text).map((char) => {
      const hex = char.charCodeAt(0).toString(16).padStart(2, "0");
      return caseSensitivity ? hex.toUpperCase() : hex.toLowerCase();
    });
  };

  const convertToDecimal = (text) => {
    return Array.from(text).map((char) => char.charCodeAt(0).toString(10));
  };

  const formatOutput = (array) => {
    switch (separator) {
      case "space":
        return array.join(" ");
      case "comma":
        return array.join(", ");
      case "none":
        return array.join("");
      default:
        return array.join(" ");
    }
  };

  // Handle conversion
  const handleConvert = useCallback(() => {
    setError("");
    setResult(null);

    if (!inputText.trim()) {
      setError("Please enter some text to convert");
      return;
    }

    try {
      let converted;
      switch (outputFormat) {
        case "binary":
          converted = convertToBinary(inputText, bitLength);
          break;
        case "hex":
          converted = convertToHex(inputText);
          break;
        case "decimal":
          converted = convertToDecimal(inputText);
          break;
        default:
          converted = convertToBinary(inputText, bitLength);
      }

      const formattedOutput = formatOutput(converted);

      setResult({
        characters: Array.from(inputText),
        converted: converted,
        formatted: formattedOutput,
      });
    } catch (err) {
      setError(`Conversion failed: ${err.message}`);
    }
  }, [inputText, bitLength, separator, outputFormat, caseSensitivity]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Download as text file
  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([result.formatted], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted-${outputFormat}-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Reset all fields
  const reset = () => {
    setInputText("");
    setBitLength(8);
    setSeparator("space");
    setOutputFormat("binary");
    setCaseSensitivity(false);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Unicode Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Text
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to convert (e.g., Hello World)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bit Length (Binary)
                </label>
                <select
                  value={bitLength}
                  onChange={(e) => setBitLength(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={outputFormat !== "binary"}
                >
                  <option value={8}>8-bit</option>
                  <option value={16}>16-bit</option>
                  <option value={32}>32-bit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Separator
                </label>
                <select
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="space">Space</option>
                  <option value="comma">Comma</option>
                  <option value="none">None</option>
                  <option value="dash">Dash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="binary">Binary</option>
                  <option value="hex">Hexadecimal</option>
                  <option value="decimal">Decimal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hex Case
                </label>
                <select
                  value={caseSensitivity ? "upper" : "lower"}
                  onChange={(e) => setCaseSensitivity(e.target.value === "upper")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={outputFormat !== "hex"}
                >
                  <option value="upper">Uppercase</option>
                  <option value="lower">Lowercase</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConvert}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Convert
              </button>
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Conversion Results</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Formatted Output:</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <p className="break-all flex-1 font-mono">{result.formatted}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(result.formatted)}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                      >
                        <FaCopy className="mr-1" /> Copy
                      </button>
                      <button
                        onClick={downloadResult}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
                      >
                        <FaDownload className="mr-1" /> Download
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-2">Character Breakdown:</p>
                  <div className="grid gap-2 max-h-64 overflow-y-auto">
                    {result.characters.map((char, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-white rounded shadow-sm"
                      >
                        <span className="w-12 text-center font-bold">"{char}"</span>
                        <span className="flex-1 font-mono">{result.converted[index]}</span>
                        <span className="text-gray-500 text-xs">
                          (U+{char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert to Binary (8/16/32-bit), Hex, or Decimal</li>
              <li>Custom separators: Space, Comma, None, Dash</li>
              <li>Hex case option (Uppercase/Lowercase)</li>
              <li>Copy to clipboard or download as text file</li>
              <li>Detailed character breakdown with Unicode points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnicodeToBinary;