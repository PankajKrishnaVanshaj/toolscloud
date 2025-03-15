"use client";
import React, { useState, useCallback, useRef } from "react";
import { FaDownload, FaSync, FaUpload, FaCopy } from "react-icons/fa";

const ASCII85ToBinary = () => {
  const [ascii85Input, setAscii85Input] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [error, setError] = useState("");
  const [showBinaryAs, setShowBinaryAs] = useState("bits"); // bits, hex, bytes
  const [isProcessing, setIsProcessing] = useState(false);
  const [wrapLength, setWrapLength] = useState(32); // For binary formatting
  const fileInputRef = useRef(null);

  // ASCII85 decoding function
  const decodeASCII85 = useCallback((input) => {
    const cleanInput = input.replace(/<~|~>/g, "").trim();
    if (!cleanInput.match(/^[!-u]*$/)) {
      throw new Error("Invalid ASCII85 input: Only characters ! to u are allowed");
    }

    let binary = "";
    let tuple = 0;
    let count = 0;

    for (let i = 0; i < cleanInput.length; i++) {
      const charCode = cleanInput.charCodeAt(i) - 33;
      tuple = tuple * 85 + charCode;
      count++;

      if (count === 5 || i === cleanInput.length - 1) {
        if (count < 5) {
          while (count < 5) {
            tuple = tuple * 85 + 84;
            count++;
          }
        }

        const bytes = [
          (tuple >> 24) & 0xff,
          (tuple >> 16) & 0xff,
          (tuple >> 8) & 0xff,
          tuple & 0xff,
        ];

        const byteCount = Math.min(4, Math.ceil((i + 1) / 5) * 4 - (5 - count));
        for (let j = 0; j < byteCount; j++) {
          binary += bytes[j].toString(2).padStart(8, "0");
        }

        tuple = 0;
        count = 0;
      }
    }
    return binary;
  }, []);

  // ASCII85 encoding function
  const encodeASCII85 = useCallback((binary) => {
    const bytes = [];
    for (let i = 0; i < binary.length; i += 8) {
      bytes.push(parseInt(binary.slice(i, i + 8), 2));
    }

    let result = "";
    for (let i = 0; i < bytes.length; i += 4) {
      let tuple = 0;
      const chunk = bytes.slice(i, i + 4);
      for (let j = 0; j < 4; j++) {
        tuple = (tuple << 8) + (chunk[j] || 0);
      }

      if (tuple === 0 && chunk.length === 4) {
        result += "z";
      } else {
        let encoded = "";
        for (let k = 0; k < 5; k++) {
          encoded = String.fromCharCode((tuple % 85) + 33) + encoded;
          tuple = Math.floor(tuple / 85);
        }
        result += encoded.slice(0, chunk.length + 1);
      }
    }
    return `<~${result}~>`;
  }, []);

  // Decode handler
  const handleDecode = useCallback(() => {
    setError("");
    setBinaryOutput("");
    setDecodedText("");
    setIsProcessing(true);

    try {
      const binary = decodeASCII85(ascii85Input);
      setBinaryOutput(binary);

      let text = "";
      for (let i = 0; i < binary.length; i += 8) {
        const byte = parseInt(binary.slice(i, i + 8), 2);
        text += String.fromCharCode(byte);
      }
      setDecodedText(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [ascii85Input, decodeASCII85]);

  // Encode handler
  const handleEncode = useCallback(() => {
    setError("");
    setIsProcessing(true);
    try {
      const binary = binaryOutput || decodeASCII85(ascii85Input);
      const encoded = encodeASCII85(binary);
      setAscii85Input(encoded);
    } catch (err) {
      setError("Error encoding to ASCII85: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [ascii85Input, binaryOutput, decodeASCII85, encodeASCII85]);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAscii85Input(event.target.result);
        handleDecode();
      };
      reader.readAsText(file);
    }
  };

  // Download binary file
  const downloadBinary = () => {
    if (!binaryOutput) return;
    const bytes = [];
    for (let i = 0; i < binaryOutput.length; i += 8) {
      bytes.push(parseInt(binaryOutput.slice(i, i + 8), 2));
    }
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `binary_output_${Date.now()}.bin`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Format binary output
  const formatBinaryOutput = () => {
    if (!binaryOutput) return "";
    let formatted = "";
    switch (showBinaryAs) {
      case "bits":
        formatted = binaryOutput.match(new RegExp(`.{1,${wrapLength}}`, "g"))?.join(" ") || binaryOutput;
        break;
      case "hex":
        for (let i = 0; i < binaryOutput.length; i += 8) {
          const byte = parseInt(binaryOutput.slice(i, i + 8), 2);
          formatted += byte.toString(16).padStart(2, "0") + " ";
        }
        break;
      case "bytes":
        for (let i = 0; i < binaryOutput.length; i += 8) {
          const byte = parseInt(binaryOutput.slice(i, i + 8), 2);
          formatted += byte + " ";
        }
        break;
      default:
        formatted = binaryOutput;
    }
    return formatted.trim();
  };

  // Reset everything
  const reset = () => {
    setAscii85Input("");
    setBinaryOutput("");
    setDecodedText("");
    setError("");
    setShowBinaryAs("bits");
    setWrapLength(32);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          ASCII85 to Binary Converter
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ASCII85 Input
              </label>
              <textarea
                value={ascii85Input}
                onChange={(e) => setAscii85Input(e.target.value)}
                placeholder="e.g., <~9jqo^~> or 9jqo^"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 resize-y font-mono text-sm"
                disabled={isProcessing}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDecode}
                disabled={!ascii85Input || isProcessing}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> Decode
              </button>
              <button
                onClick={handleEncode}
                disabled={!binaryOutput || isProcessing}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                <FaSync className="mr-2" /> Encode
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt"
                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Output Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Show Binary As
              </label>
              <select
                value={showBinaryAs}
                onChange={(e) => setShowBinaryAs(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="bits">Binary Bits</option>
                <option value="hex">Hexadecimal</option>
                <option value="bytes">Decimal Bytes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wrap Length ({wrapLength} bits)
              </label>
              <input
                type="range"
                min="8"
                max="64"
                step="8"
                value={wrapLength}
                onChange={(e) => setWrapLength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                disabled={showBinaryAs !== "bits"}
              />
            </div>
          </div>

          {/* Results Section */}
          {(binaryOutput || decodedText) && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Results</h2>
              <div className="space-y-4">
                {binaryOutput && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium text-gray-700">Binary Output:</p>
                      <button
                        onClick={() => copyToClipboard(formatBinaryOutput())}
                        className="p-1 text-gray-500 hover:text-blue-500"
                      >
                        <FaCopy />
                      </button>
                    </div>
                    <pre className="font-mono text-sm bg-white p-2 rounded border break-all">
                      {formatBinaryOutput()}
                    </pre>
                  </div>
                )}
                {decodedText && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium text-gray-700">Decoded Text:</p>
                      <button
                        onClick={() => copyToClipboard(decodedText)}
                        className="p-1 text-gray-500 hover:text-blue-500"
                      >
                        <FaCopy />
                      </button>
                    </div>
                    <p className="text-sm bg-white p-2 rounded border">{decodedText}</p>
                  </div>
                )}
                <button
                  onClick={downloadBinary}
                  disabled={!binaryOutput || isProcessing}
                  className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <FaDownload className="mr-2" /> Download Binary
                </button>
              </div>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center">
            <button
              onClick={reset}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>

          {/* Features & Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Decode ASCII85 to binary and text</li>
              <li>Encode binary to ASCII85</li>
              <li>Upload ASCII85 from text files</li>
              <li>Download binary as .bin file</li>
              <li>View binary as bits, hex, or bytes with adjustable wrap length</li>
              <li>Copy results to clipboard</li>
            </ul>
            <p className="text-blue-600 text-sm mt-2">
              Example: <code>&lt;~9jqo^~&gt;</code> decodes to "Hello"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASCII85ToBinary;