"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync } from "react-icons/fa";

const RunLengthEncodingToBinary = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("encode"); // 'encode' or 'decode'
  const [binaryOutput, setBinaryOutput] = useState("");
  const [rleOutput, setRleOutput] = useState("");
  const [error, setError] = useState("");
  const [separator, setSeparator] = useState(",");
  const [maxRun, setMaxRun] = useState(255);
  const [caseSensitive, setCaseSensitive] = useState(false); // For text encoding
  const [format, setFormat] = useState("binary"); // 'binary' or 'text'

  // Encode binary or text to RLE
  const encodeToRLE = useCallback(
    (data) => {
      if (format === "binary" && !data.match(/^[01]+$/)) {
        setError("Input must be a binary string (0s and 1s only)");
        return null;
      }

      let result = [];
      let count = 1;
      let current = data[0];

      for (let i = 1; i < data.length; i++) {
        if (
          data[i] === current &&
          count < maxRun &&
          (format === "binary" || (caseSensitive ? true : data[i].toLowerCase() === current.toLowerCase()))
        ) {
          count++;
        } else {
          result.push(format === "binary" ? `${count}${current}` : `${count}${current}`);
          current = data[i];
          count = 1;
        }
      }
      result.push(format === "binary" ? `${count}${current}` : `${count}${current}`);

      return result.join(separator);
    },
    [format, maxRun, separator, caseSensitive]
  );

  // Decode RLE to binary or text
  const decodeFromRLE = useCallback(
    (rle) => {
      const pairs = rle.split(separator);
      let output = "";

      for (const pair of pairs) {
        const match = pair.match(/^(\d+)(.)$/);
        if (!match) {
          setError(`Invalid RLE format at: ${pair}`);
          return null;
        }
        const count = parseInt(match[1]);
        const char = match[2];
        if (count > maxRun) {
          setError(`Run length ${count} exceeds maximum of ${maxRun}`);
          return null;
        }
        if (format === "binary" && !char.match(/[01]/)) {
          setError(`Invalid binary character: ${char}`);
          return null;
        }
        output += char.repeat(count);
      }

      return output;
    },
    [format, maxRun, separator]
  );

  // Handle conversion
  const handleConvert = useCallback(() => {
    setError("");
    setBinaryOutput("");
    setRleOutput("");

    if (!input.trim()) {
      setError("Please enter a value");
      return;
    }

    if (mode === "encode") {
      const rle = encodeToRLE(input);
      if (rle) {
        setRleOutput(rle);
        setBinaryOutput(input);
      }
    } else {
      const decoded = decodeFromRLE(input);
      if (decoded) {
        setBinaryOutput(decoded);
        setRleOutput(input);
      }
    }
  }, [input, mode, encodeToRLE, decodeFromRLE]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Download as text file
  const downloadResult = () => {
    const content = `Input: ${input}\nMode: ${mode}\nBinary: ${binaryOutput}\nRLE: ${rleOutput}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rle-conversion-${Date.now()}.txt`;
    link.click();
  };

  // Sample inputs
  const handleSample = () => {
    setInput(
      format === "binary"
        ? mode === "encode"
          ? "0000111100001111"
          : `40${separator}41${separator}40${separator}41`
        : mode === "encode"
        ? "aaabbbcc"
        : `3a${separator}3b${separator}2c`
    );
    setError("");
  };

  // Reset
  const reset = () => {
    setInput("");
    setMode("encode");
    setBinaryOutput("");
    setRleOutput("");
    setError("");
    setSeparator(",");
    setMaxRun(255);
    setCaseSensitive(false);
    setFormat("binary");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full ">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Run-Length Encoding Converter
        </h1>

        <div className="grid gap-6">
          {/* Mode and Format Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("encode")}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    mode === "encode"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                  } transition-colors`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setMode("decode")}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    mode === "decode"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-blue-100"
                  } transition-colors`}
                >
                  Decode
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="binary">Binary (0s and 1s)</option>
                <option value="text">Text (Any characters)</option>
              </select>
            </div>
          </div>

          {/* Input and Settings */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {mode === "encode"
                  ? format === "binary"
                    ? "Binary Input"
                    : "Text Input"
                  : "RLE Input"}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  format === "binary"
                    ? mode === "encode"
                      ? "e.g., 0000111100001111"
                      : `e.g., 40${separator}41${separator}40${separator}41`
                    : mode === "encode"
                    ? "e.g., aaabbbcc"
                    : `e.g., 3a${separator}3b${separator}2c`
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 font-mono resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Separator
                </label>
                <input
                  type="text"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value.slice(0, 1))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Run Length
                </label>
                <input
                  type="number"
                  value={maxRun}
                  onChange={(e) =>
                    setMaxRun(Math.min(999, Math.max(1, parseInt(e.target.value) || 255)))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={1}
                  max={999}
                />
              </div>
              {format === "text" && (
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                      className="mr-2 accent-blue-500"
                    />
                    <span className="text-sm text-gray-700">Case Sensitive</span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleConvert}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Convert
              </button>
              <button
                onClick={handleSample}
                className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Sample
              </button>
              <button
                onClick={reset}
                className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
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
          {(binaryOutput || rleOutput) && (
            <div className="p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold mb-4">Results</h2>
              <div className="grid gap-4 text-sm font-mono">
                {binaryOutput && (
                  <div>
                    <p className="font-medium">{format === "binary" ? "Binary" : "Text"}:</p>
                    <p className="break-all">{binaryOutput}</p>
                    <p className="text-gray-500">
                      Length: {binaryOutput.length}{" "}
                      {format === "binary" ? "bits" : "characters"}
                    </p>
                    {format === "binary" && (
                      <p className="text-gray-500">Decimal: {parseInt(binaryOutput, 2)}</p>
                    )}
                    <button
                      onClick={() => copyToClipboard(binaryOutput)}
                      className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
                    >
                      <FaCopy className="mr-2" /> Copy
                    </button>
                  </div>
                )}
                {rleOutput && (
                  <div>
                    <p className="font-medium">RLE:</p>
                    <p className="break-all">{rleOutput}</p>
                    <p className="text-gray-500">
                      Pairs: {rleOutput.split(separator).length}
                    </p>
                    <button
                      onClick={() => copyToClipboard(rleOutput)}
                      className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
                    >
                      <FaCopy className="mr-2" /> Copy
                    </button>
                  </div>
                )}
                {mode === "encode" && binaryOutput && rleOutput && (
                  <div>
                    <p className="font-medium">Compression Ratio:</p>
                    <p>
                      {((rleOutput.length / binaryOutput.length) * 100).toFixed(2)}% (
                      {rleOutput.length} / {binaryOutput.length} chars)
                    </p>
                  </div>
                )}
                <button
                  onClick={downloadResult}
                  className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download Results
                </button>
              </div>
            </div>
          )}

          {/* Features & Usage */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Encode/decode binary or text to/from RLE</li>
              <li>Custom separator and max run length</li>
              <li>Case sensitivity option for text</li>
              <li>Copy results to clipboard</li>
              <li>Download results as text file</li>
              <li>Shows length, decimal (binary), and compression ratio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunLengthEncodingToBinary;