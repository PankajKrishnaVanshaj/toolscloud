"use client";
import React, { useState, useCallback } from "react";
import { FaCopy, FaDownload, FaSync, FaUpload } from "react-icons/fa";

const BinaryToASCII85 = () => {
  const [binaryInput, setBinaryInput] = useState("");
  const [ascii85Output, setAscii85Output] = useState("");
  const [ascii85Input, setAscii85Input] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [error, setError] = useState("");
  const [formatOptions, setFormatOptions] = useState({
    wrapLength: 76,
    spaceAfterColon: true,
    binarySpacing: "space", // Options: 'space', 'none', 'comma'
    prefix: "<~", // Custom prefix
    suffix: "~>", // Custom suffix
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Binary to ASCII85 conversion
  const binaryToAscii85 = useCallback((binary) => {
    const cleanBinary = binary.replace(/[\s,]+/g, "");
    if (!/^[01]+$/.test(cleanBinary)) {
      throw new Error("Invalid binary input: must contain only 0s and 1s");
    }

    const bytes = [];
    for (let i = 0; i < cleanBinary.length; i += 8) {
      const byte = cleanBinary.slice(i, i + 8).padEnd(8, "0");
      bytes.push(parseInt(byte, 2));
    }

    let result = "";
    for (let i = 0; i < bytes.length; i += 4) {
      const chunk = bytes.slice(i, i + 4);
      while (chunk.length < 4) chunk.push(0);

      let num = (chunk[0] << 24) + (chunk[1] << 16) + (chunk[2] << 8) + chunk[3];
      if (num === 0 && chunk.length === 4) {
        result += "z";
      } else {
        const chars = [];
        for (let j = 0; j < 5; j++) {
          chars.unshift(String.fromCharCode((num % 85) + 33));
          num = Math.floor(num / 85);
        }
        result += chars.join("").slice(0, chunk.length + 1);
      }
    }

    if (formatOptions.wrapLength > 0) {
      const wrapped = result
        .match(new RegExp(`.{1,${formatOptions.wrapLength}}`, "g"))
        .join("\n");
      return `${formatOptions.prefix}${formatOptions.spaceAfterColon ? " " : ""}${wrapped}${
        formatOptions.spaceAfterColon ? " " : ""
      }${formatOptions.suffix}`;
    }
    return `${formatOptions.prefix}${formatOptions.spaceAfterColon ? " " : ""}${result}${
      formatOptions.spaceAfterColon ? " " : ""
    }${formatOptions.suffix}`;
  }, [formatOptions]);

  // ASCII85 to Binary conversion
  const ascii85ToBinary = useCallback((ascii85) => {
    const cleanAscii85 = ascii85.replace(
      new RegExp(`${formatOptions.prefix}\\s*|\\s*${formatOptions.suffix}|[\\n\\r\\s]`, "g"),
      ""
    );
    if (!/^[!-u|z]+$/.test(cleanAscii85)) {
      throw new Error("Invalid ASCII85 input: must contain only characters ! to u or z");
    }

    let bytes = [];
    for (let i = 0; i < cleanAscii85.length; ) {
      if (cleanAscii85[i] === "z") {
        bytes.push(0, 0, 0, 0);
        i++;
      } else {
        const chunk = cleanAscii85.slice(i, i + 5);
        let num = 0;
        for (let j = 0; j < 5; j++) {
          num = num * 85 + (chunk[j] ? chunk.charCodeAt(j) - 33 : 84);
        }
        bytes.push((num >>> 24) & 255, (num >>> 16) & 255, (num >>> 8) & 255, num & 255);
        i += chunk.length < 5 ? chunk.length + 1 : 5;
      }
    }

    const lastGroupLength = cleanAscii85.slice(-5).replace(/z/g, "").length || 5;
    bytes = bytes.slice(0, bytes.length - (4 - lastGroupLength));

    return bytes
      .map((byte) => byte.toString(2).padStart(8, "0"))
      .join(
        formatOptions.binarySpacing === "space"
          ? " "
          : formatOptions.binarySpacing === "comma"
          ? ", "
          : ""
      );
  }, [formatOptions]);

  const handleBinaryConvert = () => {
    setError("");
    setAscii85Output("");
    setIsProcessing(true);
    try {
      const result = binaryToAscii85(binaryInput);
      setAscii85Output(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAscii85Convert = () => {
    setError("");
    setBinaryOutput("");
    setIsProcessing(true);
    try {
      const result = ascii85ToBinary(ascii85Input);
      setBinaryOutput(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const binary = Array.from(new Uint8Array(event.target.result))
        .map((byte) => byte.toString(2).padStart(8, "0"))
        .join("");
      setBinaryInput(binary);
      handleBinaryConvert();
    };
    reader.readAsArrayBuffer(file);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadText = (text, filename) => {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const reset = () => {
    setBinaryInput("");
    setAscii85Output("");
    setAscii85Input("");
    setBinaryOutput("");
    setError("");
    setFormatOptions({
      wrapLength: 76,
      spaceAfterColon: true,
      binarySpacing: "space",
      prefix: "<~",
      suffix: "~>",
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Binary to ASCII85 Converter
        </h1>

        <div className="space-y-8">
          {/* Binary to ASCII85 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Input
              </label>
              <textarea
                value={binaryInput}
                onChange={(e) => setBinaryInput(e.target.value)}
                placeholder="e.g., 01001000 01100101 01101100 01101100 01101111"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
                disabled={isProcessing}
              />
              <input
                type="file"
                onChange={handleFileUpload}
                className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isProcessing}
              />
            </div>
            <button
              onClick={handleBinaryConvert}
              disabled={isProcessing || !binaryInput}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaUpload className="mr-2" />
              )}
              Convert to ASCII85
            </button>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII85 Output
              </label>
              <textarea
                value={ascii85Output}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-32 resize-y"
              />
              {ascii85Output && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => copyToClipboard(ascii85Output)}
                    className="p-1 text-gray-600 hover:text-blue-600"
                    title="Copy to Clipboard"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={() => downloadText(ascii85Output, "ascii85.txt")}
                    className="p-1 text-gray-600 hover:text-blue-600"
                    title="Download"
                  >
                    <FaDownload />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ASCII85 to Binary */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII85 Input
              </label>
              <textarea
                value={ascii85Input}
                onChange={(e) => setAscii85Input(e.target.value)}
                placeholder="e.g., <~87cURD]j~>"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
                disabled={isProcessing}
              />
            </div>
            <button
              onClick={handleAscii85Convert}
              disabled={isProcessing || !ascii85Input}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : (
                <FaUpload className="mr-2" />
              )}
              Convert to Binary
            </button>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Binary Output
              </label>
              <textarea
                value={binaryOutput}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 h-32 resize-y"
              />
              {binaryOutput && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => copyToClipboard(binaryOutput)}
                    className="p-1 text-gray-600 hover:text-blue-600"
                    title="Copy to Clipboard"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={() => downloadText(binaryOutput, "binary.txt")}
                    className="p-1 text-gray-600 hover:text-blue-600"
                    title="Download"
                  >
                    <FaDownload />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Format Options */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Format Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wrap Length
                </label>
                <input
                  type="number"
                  value={formatOptions.wrapLength}
                  onChange={(e) =>
                    setFormatOptions({
                      ...formatOptions,
                      wrapLength: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">(0 for no wrap)</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Binary Spacing
                </label>
                <select
                  value={formatOptions.binarySpacing}
                  onChange={(e) =>
                    setFormatOptions({ ...formatOptions, binarySpacing: e.target.value })
                  }
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="space">Space</option>
                  <option value="comma">Comma</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                <input
                  type="text"
                  value={formatOptions.prefix}
                  onChange={(e) =>
                    setFormatOptions({ ...formatOptions, prefix: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                <input
                  type="text"
                  value={formatOptions.suffix}
                  onChange={(e) =>
                    setFormatOptions({ ...formatOptions, suffix: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formatOptions.spaceAfterColon}
                    onChange={(e) =>
                      setFormatOptions({
                        ...formatOptions,
                        spaceAfterColon: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  Space around delimiters
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Usage */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Usage</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Convert binary to ASCII85 and vice versa</li>
              <li>Supports file upload for binary input</li>
              <li>Customizable wrap length, delimiters, and binary spacing</li>
              <li>Copy output to clipboard or download as text file</li>
              <li>Example: "01001000 01100101 01101100 01101100 01101111" → "&lt;~87cURD]j~&gt;"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryToASCII85;