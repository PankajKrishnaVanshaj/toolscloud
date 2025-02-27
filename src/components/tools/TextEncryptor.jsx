"use client";
import React, { useState } from "react";

const TextEncryptor = () => {
  const [inputText, setInputText] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    method: "caesar", // caesar, rot13, base64
    caesarShift: 3,
  });

  // Encryption functions
  const encryptText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to encrypt" };
    }

    let result = "";
    try {
      switch (options.method) {
        case "caesar":
          result = caesarEncrypt(text, options.caesarShift);
          break;
        case "rot13":
          result = rot13Encrypt(text);
          break;
        case "base64":
          result = base64Encrypt(text);
          break;
        default:
          return { error: "Invalid encryption method" };
      }
    } catch (err) {
      return { error: `Encryption failed: ${err.message}` };
    }

    return {
      original: text,
      encrypted: result,
      method: options.method,
    };
  };

  // Caesar Cipher encryption
  const caesarEncrypt = (text, shift) => {
    return text.split("").map(char => {
      if (/[A-Za-z]/.test(char)) {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65; // Lowercase or uppercase
        return String.fromCharCode(((code - base + shift) % 26) + base);
      }
      return char;
    }).join("");
  };

  // ROT13 encryption (special case of Caesar with shift 13)
  const rot13Encrypt = (text) => {
    return caesarEncrypt(text, 13);
  };

  // Base64 encryption
  const base64Encrypt = (text) => {
    return btoa(text.trim());
  };

  const handleEncrypt = async () => {
    setError("");
    setEncryptedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = encryptText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setEncryptedText(result.encrypted);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setEncryptedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({
      ...prev,
      [option]: typeof value === "number" ? Math.max(1, Math.min(25, value)) : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Encryptor
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Encrypt:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Encryption Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Method:</label>
                <select
                  value={options.method}
                  onChange={(e) => handleOptionChange("method", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="caesar">Caesar Cipher</option>
                  <option value="rot13">ROT13</option>
                  <option value="base64">Base64</option>
                </select>
              </div>
              {options.method === "caesar" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Shift (1-25):</label>
                  <input
                    type="number"
                    value={options.caesarShift}
                    onChange={(e) => handleOptionChange("caesarShift", parseInt(e.target.value) || 1)}
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    max="25"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleEncrypt}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isLoading ? "Encrypting..." : "Encrypt Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Output Display */}
        {encryptedText && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Encrypted Text
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {encryptedText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(encryptedText)}
              className="mt-4 w-full py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all font-semibold"
            >
              Copy Encrypted Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextEncryptor;