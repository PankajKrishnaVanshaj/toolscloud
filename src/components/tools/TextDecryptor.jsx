"use client";
import React, { useState } from "react";

const TextDecryptor = () => {
  const [inputText, setInputText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    method: "caesar", // caesar, rot13, base64
    caesarShift: 3,
  });

  // Decryption functions
  const decryptText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to decrypt" };
    }

    let result = "";
    try {
      switch (options.method) {
        case "caesar":
          result = caesarDecrypt(text, options.caesarShift);
          break;
        case "rot13":
          result = rot13Decrypt(text);
          break;
        case "base64":
          result = base64Decrypt(text);
          break;
        default:
          return { error: "Invalid decryption method" };
      }
    } catch (err) {
      return { error: `Decryption failed: ${err.message}` };
    }

    return {
      original: text,
      decrypted: result,
      method: options.method,
    };
  };

  // Caesar Cipher decryption
  const caesarDecrypt = (text, shift) => {
    return text.split("").map(char => {
      if (/[A-Za-z]/.test(char)) {
        const code = char.charCodeAt(0);
        const base = code >= 97 ? 97 : 65; // Lowercase or uppercase
        return String.fromCharCode(((code - base - shift + 26) % 26) + base);
      }
      return char;
    }).join("");
  };

  // ROT13 decryption (special case of Caesar with shift 13)
  const rot13Decrypt = (text) => {
    return caesarDecrypt(text, 13);
  };

  // Base64 decryption
  const base64Decrypt = (text) => {
    return atob(text.trim());
  };

  const handleDecrypt = async () => {
    setError("");
    setDecryptedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = decryptText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setDecryptedText(result.decrypted);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setDecryptedText("");
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
          Text Decryptor
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Decrypt:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-40 resize-y transition-all"
              placeholder={
                options.method === "caesar" ? "e.g., Khoor Zruog (shift 3)" :
                options.method === "rot13" ? "e.g., Uryyb Jbeyq" :
                "e.g., SGVsbG8gV29ybGQ="
              }
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Decryption Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Method:</label>
                <select
                  value={options.method}
                  onChange={(e) => handleOptionChange("method", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              onClick={handleDecrypt}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isLoading ? "Decrypting..." : "Decrypt Text"}
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
        {decryptedText && (
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Decrypted Text
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {decryptedText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(decryptedText)}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all font-semibold"
            >
              Copy Decrypted Text to Clipboard
            </button>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default TextDecryptor;