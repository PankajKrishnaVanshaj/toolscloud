"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload, FaCopy } from "react-icons/fa";

const BinaryToRunLengthEncoding = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [rleOutput, setRleOutput] = useState("");
  const [decodedBinary, setDecodedBinary] = useState("");
  const [separator, setSeparator] = useState(" "); // Default separator
  const [error, setError] = useState("");
  const [compressionRatio, setCompressionRatio] = useState(null);
  const [format, setFormat] = useState("count-bit"); // New: RLE format option
  const [history, setHistory] = useState([]);

  // Validate binary input
  const validateBinary = (binary) => /^[01]+$/.test(binary);

  // Encode binary to RLE with customizable format
  const encodeRLE = useCallback(
    (binary) => {
      if (!binary) return "";
      let result = "";
      let count = 1;
      let current = binary[0];

      for (let i = 1; i < binary.length; i++) {
        if (binary[i] === current) {
          count++;
        } else {
          result +=
            format === "count-bit"
              ? `${count}${current}${separator}`
              : `${current}${count}${separator}`;
          count = 1;
          current = binary[i];
        }
      }
      result += format === "count-bit" ? `${count}${current}` : `${current}${count}`;
      return result;
    },
    [separator, format]
  );

  // Decode RLE to binary with customizable format
  const decodeRLE = useCallback(
    (rle) => {
      if (!rle) return "";
      const parts = rle.split(separator).filter((part) => part);
      let result = "";

      for (const part of parts) {
        const match =
          format === "count-bit"
            ? part.match(/^(\d+)([0-1])$/)
            : part.match(/^([0-1])(\d+)$/);
        if (!match) {
          setError(`Invalid RLE format in part: ${part}`);
          return "";
        }
        const count = parseInt(format === "count-bit" ? match[1] : match[2]);
        const bit = format === "count-bit" ? match[2] : match[1];
        result += bit.repeat(count);
      }
      return result;
    },
    [separator, format]
  );

  // Calculate compression ratio
  const calculateCompressionRatio = (binary, rle) => {
    if (!binary || !rle) return null;
    const binaryLength = binary.length;
    const rleLength = rle.length;
    return ((binaryLength - rleLength) / binaryLength * 100).toFixed(2);
  };

  // Add to history
  const addToHistory = (binary, rle) => {
    setHistory((prev) => [
      { binary, rle, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9), // Keep last 10 entries
    ]);
  };

  // Handle binary input
  const handleBinaryInput = useCallback(
    (value) => {
      setBinaryInput(value);
      setError("");
      setRleOutput("");
      setDecodedBinary("");
      setCompressionRatio(null);

      if (value) {
        if (validateBinary(value)) {
          const rle = encodeRLE(value);
          setRleOutput(rle);
          setDecodedBinary(decodeRLE(rle));
          setCompressionRatio(calculateCompressionRatio(value, rle));
          addToHistory(value, rle);
        } else {
          setError("Invalid binary input: Use only 0s and 1s");
        }
      }
    },
    [encodeRLE, decodeRLE]
  );

  // Handle RLE input
  const handleRleInput = useCallback(
    (value) => {
      setRleOutput(value);
      setError("");
      setBinaryInput("");
      setDecodedBinary("");
      setCompressionRatio(null);

      if (value) {
        const decoded = decodeRLE(value);
        if (decoded) {
          setDecodedBinary(decoded);
          setBinaryInput(decoded);
          setCompressionRatio(calculateCompressionRatio(decoded, value));
          addToHistory(decoded, value);
        }
      }
    },
    [decodeRLE]
  );

  // Reset all fields
  const reset = () => {
    setBinaryInput("");
    setRleOutput("");
    setDecodedBinary("");
    setSeparator(" ");
    setFormat("count-bit");
    setError("");
    setCompressionRatio(null);
    setHistory([]);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Download as text file
  const downloadResults = () => {
    const content = `Binary: ${binaryInput}\nRLE: ${rleOutput}\nDecoded: ${decodedBinary}\nCompression Ratio: ${compressionRatio}%`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rle-conversion-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to Run-Length Encoding Converter
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Binary Input
            </label>
            <input
              type="text"
              value={binaryInput}
              onChange={(e) => handleBinaryInput(e.target.value)}
              placeholder="e.g., 00001111"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RLE Output
            </label>
            <input
              type="text"
              value={rleOutput}
              onChange={(e) => handleRleInput(e.target.value)}
              placeholder="e.g., 40 41 or 04 14"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              maxLength={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RLE Format
            </label>
            <select
              value={format}
              onChange={(e) => {
                setFormat(e.target.value);
                if (binaryInput) handleBinaryInput(binaryInput);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="count-bit">Count-Bit (e.g., 40 41)</option>
              <option value="bit-count">Bit-Count (e.g., 04 14)</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        {(binaryInput || rleOutput) && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Results</h2>
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Original Binary:</span>{" "}
                {binaryInput || "N/A"}{" "}
                <button
                  onClick={() => copyToClipboard(binaryInput)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <FaCopy />
                </button>
              </p>
              <p>
                <span className="font-medium">RLE Encoded:</span> {rleOutput || "N/A"}{" "}
                <button
                  onClick={() => copyToClipboard(rleOutput)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <FaCopy />
                </button>
              </p>
              <p>
                <span className="font-medium">Decoded Binary:</span>{" "}
                {decodedBinary || "N/A"}{" "}
                <button
                  onClick={() => copyToClipboard(decodedBinary)}
                  className="ml-2 text-blue-500 hover:text-blue-700"
                >
                  <FaCopy />
                </button>
              </p>
              {compressionRatio && (
                <p>
                  <span className="font-medium">Compression Ratio:</span>{" "}
                  {compressionRatio}%{" "}
                  {compressionRatio > 0 ? "(space saved)" : "(space increased)"}
                </p>
              )}
              <div>
                <p className="font-medium">Visualization:</p>
                <div className="font-mono text-xs break-all p-2 bg-white rounded shadow-inner">
                  <p>Binary: {binaryInput}</p>
                  <p>RLE: {rleOutput}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Section */}
        {error && (
          <div className="p-4 bg-red-50 rounded-lg mb-6 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">History</h2>
            <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
              {history.map((entry, index) => (
                <li
                  key={index}
                  className="p-2 bg-white rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setBinaryInput(entry.binary);
                    setRleOutput(entry.rle);
                    handleBinaryInput(entry.binary);
                  }}
                >
                  <span className="font-medium">{entry.timestamp}</span> - Binary:{" "}
                  {entry.binary.slice(0, 20)}
                  {entry.binary.length > 20 ? "..." : ""} | RLE: {entry.rle.slice(0, 20)}
                  {entry.rle.length > 20 ? "..." : ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
          <button
            onClick={downloadResults}
            disabled={!binaryInput && !rleOutput}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
        </div>

        {/* Features & Usage */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Encode binary to RLE and decode RLE to binary</li>
            <li>Customizable separator and RLE format (Count-Bit or Bit-Count)</li>
            <li>Compression ratio calculation</li>
            <li>History tracking (click to reuse)</li>
            <li>Copy to clipboard and download results</li>
            <li>Example: 00001111 → 40 41 (Count-Bit) or 04 14 (Bit-Count)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BinaryToRunLengthEncoding;