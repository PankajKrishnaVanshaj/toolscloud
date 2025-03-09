"use client";
import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

const TextEncryptor = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    mode: "encrypt",         // encrypt, decrypt
    method: "caesar",        // caesar, rot13, base64, aes
    caesarShift: 3,
    aesKey: "",              // AES key (16, 24, or 32 chars)
    outputCase: "original",  // original, lower, upper
  });

  // Encryption/Decryption Functions
  const processText = async (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to process" };
    }

    let result = "";
    const isEncrypt = options.mode === "encrypt";

    try {
      switch (options.method) {
        case "caesar":
          result = isEncrypt
            ? caesarEncrypt(text, options.caesarShift)
            : caesarDecrypt(text, options.caesarShift);
          break;
        case "rot13":
          result = rot13Process(text); // ROT13 is its own inverse
          break;
        case "base64":
          result = isEncrypt ? base64Encrypt(text) : base64Decrypt(text);
          break;
        case "aes":
          if (!options.aesKey || ![16, 24, 32].includes(options.aesKey.length)) {
            return { error: "AES requires a key of 16, 24, or 32 characters" };
          }
          result = await aesProcess(text, options.aesKey, isEncrypt);
          break;
        default:
          return { error: "Invalid method" };
      }

      // Apply output case
      switch (options.outputCase) {
        case "lower":
          result = result.toLowerCase();
          break;
        case "upper":
          result = result.toUpperCase();
          break;
        default:
          break;
      }

      return {
        original: text,
        processed: result,
        method: options.method,
        mode: options.mode,
      };
    } catch (err) {
      return { error: `Processing failed: ${err.message}` };
    }
  };

  const caesarEncrypt = (text, shift) => {
    return text.split("").map(char => {
      if (/[A-Za-z]/.test(char)) {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65;
        return String.fromCharCode(((code - base + shift) % 26) + base);
      }
      return char;
    }).join("");
  };

  const caesarDecrypt = (text, shift) => {
    return caesarEncrypt(text, 26 - (shift % 26));
  };

  const rot13Process = (text) => {
    return caesarEncrypt(text, 13);
  };

  const base64Encrypt = (text) => btoa(text.trim());
  const base64Decrypt = (text) => atob(text.trim());

  const aesProcess = async (text, key, encrypt) => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const keyData = encoder.encode(key);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-CBC" },
      false,
      encrypt ? ["encrypt"] : ["decrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const data = encoder.encode(text);

    if (encrypt) {
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        data
      );
      const combined = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
      return btoa(String.fromCharCode(...combined));
    } else {
      const combined = Uint8Array.from(atob(text), c => c.charCodeAt(0));
      const iv = combined.slice(0, 16);
      const encryptedData = combined.slice(16);
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        encryptedData
      );
      return decoder.decode(decrypted);
    }
  };

  const handleProcess = useCallback(async () => {
    setError("");
    setOutputText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = await processText(inputText);

      if (result.error) {
        setError(result.error);
      } else {
        setOutputText(result.processed);
        setHistory(prev => [...prev, { input: inputText, output: result.processed, options: { ...options } }].slice(-5));
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setOutputText("");
    setError("");
    setOptions({
      mode: "encrypt",
      method: "caesar",
      caesarShift: 3,
      aesKey: "",
      outputCase: "original",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, Math.min(25, value)) : value,
    }));
  };

  const exportResult = () => {
    const content = `Input Text: ${inputText}\nMethod: ${options.method}\nMode: ${options.mode}${options.method === "caesar" ? `\nShift: ${options.caesarShift}` : ""}${options.method === "aes" ? `\nKey: ${options.aesKey}` : ""}\nOutput Case: ${options.outputCase}\n\nResult:\n${outputText}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${options.mode}_${options.method}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8 text-center text-gray-900">
          Advanced Text Encryptor
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to {options.mode === "encrypt" ? "Encrypt" : "Decrypt"}:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 sm:h-40 resize-y transition-all"
              placeholder={`e.g., ${options.mode === "encrypt" ? "Hello World" : "Khoor Zruog"}`}
              maxLength={10000}
            />
            <div className="text-right text-xs sm:text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mode:</label>
                <select
                  value={options.mode}
                  onChange={(e) => handleOptionChange("mode", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="encrypt">Encrypt</option>
                  <option value="decrypt">Decrypt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Method:</label>
                <select
                  value={options.method}
                  onChange={(e) => handleOptionChange("method", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="caesar">Caesar Cipher</option>
                  <option value="rot13">ROT13</option>
                  <option value="base64">Base64</option>
                  <option value="aes">AES-CBC</option>
                </select>
              </div>
              {options.method === "caesar" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Shift (1-25):</label>
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
              {options.method === "aes" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">AES Key (16/24/32 chars):</label>
                  <input
                    type="text"
                    value={options.aesKey}
                    onChange={(e) => handleOptionChange("aesKey", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., mysecretkey12345"
                    maxLength={32}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Output Case:</label>
                <select
                  value={options.outputCase}
                  onChange={(e) => handleOptionChange("outputCase", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="original">Original</option>
                  <option value="lower">Lowercase</option>
                  <option value="upper">Uppercase</option>
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleProcess}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {options.mode === "encrypt" ? <FaLock className="inline mr-2" /> : <FaUnlock className="inline mr-2" />}
              {isLoading ? "Processing..." : options.mode === "encrypt" ? "Encrypt" : "Decrypt"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {outputText && (
              <button
                onClick={exportResult}
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
        {outputText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              {options.mode === "encrypt" ? "Encrypted" : "Decrypted"} Text ({options.method})
            </h2>
            <p className="mt-3 text-base sm:text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-auto">
              {outputText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(outputText)}
              className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy {options.mode === "encrypt" ? "Encrypted" : "Decrypted"} Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Operations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.options.mode} ({entry.options.method}): "{entry.output.slice(0, 20)}..."
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setOutputText(entry.output);
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
            <li>Encrypt/Decrypt with Caesar, ROT13, Base64, or AES-CBC</li>
            <li>Customizable Caesar shift and AES key</li>
            <li>Output case formatting (original, lower, upper)</li>
            <li>Export results and history tracking</li>
            <li>Responsive design for all devices</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextEncryptor;