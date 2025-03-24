"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaCopy, FaSync, FaFileUpload } from "react-icons/fa";

const TextToBinary = () => {
  const [inputText, setInputText] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("textToBinary");
  const [encoding, setEncoding] = useState("8bit");
  const [separator, setSeparator] = useState("space");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const fileInputRef = useRef(null);

  // Text to Binary conversion
  const textToBinary = useCallback(
    (text) => {
      try {
        if (!text) {
          setOutput("");
          setError("");
          return;
        }

        const bits = encoding === "8bit" ? 8 : 7;
        const sep = separator === "space" ? " " : separator === "comma" ? "," : "-";
        const binary = text
          .split("")
          .map((char) => {
            const binaryChar = char.charCodeAt(0).toString(2);
            return "0".repeat(bits - binaryChar.length) + binaryChar;
          })
          .join(sep);

        setOutput(binary);
        setError("");
      } catch (err) {
        setError("Error converting text to binary");
        setOutput("");
      }
    },
    [encoding, separator]
  );

  // Binary to Text conversion
  const binaryToText = useCallback(
    (binary) => {
      try {
        if (!binary) {
          setOutput("");
          setError("");
          return;
        }

        const sep = separator === "space" ? /\s+/ : separator === "comma" ? /,\s*/ : /-\s*/;
        const binaryArray = binary.trim().split(sep);
        const text = binaryArray
          .map((bin) => {
            if (!/^[01]+$/.test(bin)) throw new Error("Invalid binary format");
            return String.fromCharCode(parseInt(bin, 2));
          })
          .join("");

        setOutput(text);
        setError("");
      } catch (err) {
        setError("Error converting binary to text: " + err.message);
        setOutput("");
      }
    },
    [separator]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);
    mode === "textToBinary" ? textToBinary(value) : binaryToText(value);
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setInputText(text);
      mode === "textToBinary" ? textToBinary(text) : binaryToText(text);
    };
    reader.onerror = () => setError("Error reading file");
    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      handleFileUpload(file);
    } else {
      setError("Please drop a valid text file");
    }
  };

  // Toggle conversion mode
  const toggleMode = () => {
    setMode((prev) => (prev === "textToBinary" ? "binaryToText" : "textToBinary"));
    setInputText("");
    setOutput("");
    setError("");
  };

  // Download output as file
  const downloadOutput = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "textToBinary" ? "binary.txt" : "text.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  // Reset all fields
  const reset = () => {
    setInputText("");
    setOutput("");
    setMode("textToBinary");
    setEncoding("8bit");
    setSeparator("space");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full relative">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 text-center">
          Advanced Text ↔ Binary Converter
        </h1>

        {/* Copy Alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in">
            Copied to clipboard!
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <button
              onClick={toggleMode}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Switch to {mode === "textToBinary" ? "Binary → Text" : "Text → Binary"}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Encoding</label>
            <select
              value={encoding}
              onChange={(e) => setEncoding(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="8bit">8-bit</option>
              <option value="7bit">7-bit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Separator</label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="space">Space</option>
              <option value="comma">Comma</option>
              <option value="dash">Dash</option>
            </select>
          </div>
        </div>

        {/* Input Section */}
        <div
          className={`mb-6 p-4 border-2 rounded-lg ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">
            {mode === "textToBinary" ? "Enter Text:" : "Enter Binary:"}
          </label>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            rows="6"
            placeholder={
              mode === "textToBinary"
                ? "Type your text here or drag a .txt file..."
                : `Enter binary numbers (${separator}-separated)...`
            }
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-500">
              Drag and drop a text file or{" "}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-500 hover:underline"
              >
                upload
              </button>
            </p>
            <input
              type="file"
              accept=".txt"
              ref={fileInputRef}
              onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Output:</label>
          <div className="relative">
            <textarea
              value={output}
              readOnly
              className="w-full p-2 border rounded-md bg-gray-50 text-gray-600 min-h-[150px] resize-y"
              placeholder="Result will appear here..."
            />
            {output && (
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={downloadOutput}
                  className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors"
                  title="Download as text file"
                >
                  <FaDownload />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4 p-2 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Convert text to binary and vice versa</li>
            <li>Support for 7-bit and 8-bit encoding</li>
            <li>Customizable separators (space, comma, dash)</li>
            <li>Drag-and-drop and file upload support</li>
            <li>Copy to clipboard and download options</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextToBinary;