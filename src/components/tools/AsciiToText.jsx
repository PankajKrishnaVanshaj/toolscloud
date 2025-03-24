"use client";
import React, { useState, useCallback } from "react";
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";

const AsciiToText = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("asciiToText");
  const [format, setFormat] = useState("decimal");
  const [separator, setSeparator] = useState(" ");
  const [error, setError] = useState("");
  const [caseOption, setCaseOption] = useState("none"); // none, upper, lower
  const [isProcessing, setIsProcessing] = useState(false);

  // Conversion Functions
  const asciiToText = useCallback(
    (inputStr) => {
      setError("");
      const values = inputStr.trim().split(separator).filter(Boolean);

      if (values.length === 0) {
        setError("No input provided");
        return "";
      }

      try {
        const chars = values.map((value) => {
          let num;
          switch (format) {
            case "decimal":
              num = parseInt(value, 10);
              break;
            case "hex":
              num = parseInt(value, 16);
              break;
            case "binary":
              num = parseInt(value, 2);
              break;
            default:
              throw new Error("Invalid format");
          }
          if (isNaN(num) || num < 0 || num > 255) {
            throw new Error(`Invalid ${format} value: ${value}`);
          }
          return String.fromCharCode(num);
        });
        let result = chars.join("");
        switch (caseOption) {
          case "upper":
            return result.toUpperCase();
          case "lower":
            return result.toLowerCase();
          default:
            return result;
        }
      } catch (err) {
        setError(err.message);
        return "";
      }
    },
    [separator, format, caseOption]
  );

  const textToAscii = useCallback(
    (text) => {
      setError("");
      if (!text) {
        setError("No input provided");
        return "";
      }

      let processedText = text;
      switch (caseOption) {
        case "upper":
          processedText = text.toUpperCase();
          break;
        case "lower":
          processedText = text.toLowerCase();
          break;
      }

      const values = processedText.split("").map((char) => {
        const code = char.charCodeAt(0);
        switch (format) {
          case "decimal":
            return code;
          case "hex":
            return code.toString(16).toUpperCase().padStart(2, "0");
          case "binary":
            return code.toString(2).padStart(8, "0");
          default:
            return code;
        }
      });
      return values.join(separator);
    },
    [separator, format, caseOption]
  );

  // Handle Conversion
  const handleConvert = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      if (mode === "asciiToText") {
        setOutput(asciiToText(input));
      } else {
        setOutput(textToAscii(input));
      }
      setIsProcessing(false);
    }, 100); // Small delay to show processing
  }, [mode, input, asciiToText, textToAscii]);

  // File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setInput(event.target.result);
        handleConvert();
      };
      reader.readAsText(file);
    }
  };

  // Download Output
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ascii_${mode === "asciiToText" ? "text" : format}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to Clipboard
  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    alert("Output copied to clipboard!");
  };

  // Reset
  const handleReset = () => {
    setInput("");
    setOutput("");
    setMode("asciiToText");
    setFormat("decimal");
    setSeparator(" ");
    setCaseOption("none");
    setError("");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          ASCII to Text Converter
        </h1>

        <div className="space-y-6">
          {/* Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conversion Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="asciiToText">ASCII to Text</option>
                <option value="textToAscii">Text to ASCII</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === "asciiToText" ? "Input Format" : "Output Format"}
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="decimal">Decimal</option>
                <option value="hex">Hexadecimal</option>
                <option value="binary">Binary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Separator
              </label>
              <input
                type="text"
                value={separator}
                onChange={(e) => setSeparator(e.target.value || " ")}
                placeholder="e.g., space, comma"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Case
              </label>
              <select
                value={caseOption}
                onChange={(e) => setCaseOption(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">Original</option>
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
              </select>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {mode === "asciiToText" ? "ASCII Input" : "Text Input"}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "asciiToText"
                  ? `Enter ${format} ASCII codes (e.g., 72${separator}101${separator}108${separator}108${separator}111)`
                  : "Enter text (e.g., Hello)"
              }
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 resize-y"
            />
            <label className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".txt"
                className="hidden"
              />
              Upload Text File
            </label>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              Convert
            </button>
            <button
              onClick={handleCopy}
              disabled={!output || isProcessing}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaCopy className="mr-2" /> Copy
            </button>
            <button
              onClick={handleDownload}
              disabled={!output || isProcessing}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download
            </button>
            <button
              onClick={handleReset}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Output</label>
            <textarea
              value={output}
              readOnly
              className="w-full p-3 border rounded-md bg-gray-50 h-32 resize-y"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 rounded-md text-red-700 border border-red-200">
              <p>{error}</p>
            </div>
          )}

          {/* Features */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert between ASCII codes and text</li>
              <li>Supports decimal, hex, and binary formats</li>
              <li>Customizable separator and case conversion</li>
              <li>File upload for bulk conversion</li>
              <li>Copy to clipboard and download as text file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsciiToText;