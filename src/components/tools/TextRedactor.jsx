"use client";
import React, { useState } from "react";

const TextRedactor = () => {
  const [inputText, setInputText] = useState("");
  const [redactedText, setRedactedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    redactionChar: "*",        // Character or string to replace with
    redactWords: "",           // Comma-separated list of words/phrases to redact
    redactPattern: "",         // Custom regex pattern to redact
    caseSensitive: false,      // Case sensitivity for word matching
    redactNumbers: false,      // Redact all numbers
    redactEmails: false,       // Redact email addresses
    preserveLength: true,      // Match redaction length to original
  });

  // Redact text based on options
  const redactText = (text) => {
    if (!text.trim()) {
      return { error: "Please enter some text to redact" };
    }

    let result = text;
    const changes = [];

    // Redact specific words/phrases
    if (options.redactWords) {
      const words = options.redactWords.split(",").map(w => w.trim()).filter(w => w);
      if (words.length > 0) {
        const pattern = new RegExp(`\\b(${words.join("|")})\\b`, options.caseSensitive ? "g" : "gi");
        result = result.replace(pattern, match => {
          changes.push(`Redacted word: "${match}"`);
          return options.preserveLength ? options.redactionChar.repeat(match.length) : options.redactionChar;
        });
      }
    }

    // Redact numbers
    if (options.redactNumbers) {
      result = result.replace(/\d+/g, match => {
        changes.push(`Redacted number: "${match}"`);
        return options.preserveLength ? options.redactionChar.repeat(match.length) : options.redactionChar;
      });
    }

    // Redact email addresses
    if (options.redactEmails) {
      result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, match => {
        changes.push(`Redacted email: "${match}"`);
        return options.preserveLength ? options.redactionChar.repeat(match.length) : options.redactionChar;
      });
    }

    // Redact using custom regex
    if (options.redactPattern) {
      try {
        const regex = new RegExp(options.redactPattern, options.caseSensitive ? "g" : "gi");
        result = result.replace(regex, match => {
          changes.push(`Redacted custom pattern match: "${match}"`);
          return options.preserveLength ? options.redactionChar.repeat(match.length) : options.redactionChar;
        });
      } catch (err) {
        return { error: "Invalid custom regex pattern" };
      }
    }

    return {
      original: text,
      redacted: result,
      changes: changes.length > 0 ? changes : ["No redactions applied"],
    };
  };

  const handleRedact = async () => {
    setError("");
    setRedactedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing
      const result = redactText(inputText);

      if (result.error) {
        setError(result.error);
        return;
      }

      setRedactedText(result.redacted);
    } catch (err) {
      setError("An error occurred while redacting the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setRedactedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Redactor
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Redact:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-40 resize-y transition-all"
              placeholder="e.g., John Doe, email: john.doe@example.com, phone: 123-456-7890"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Redaction Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Redaction Character:</label>
                <input
                  type="text"
                  value={options.redactionChar}
                  onChange={(e) => handleOptionChange("redactionChar", e.target.value || "*")}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  maxLength="10"
                  placeholder="*"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Redact Words (comma-separated):</label>
                <input
                  type="text"
                  value={options.redactWords}
                  onChange={(e) => handleOptionChange("redactWords", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., John, Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custom Regex:</label>
                <input
                  type="text"
                  value={options.redactPattern}
                  onChange={(e) => handleOptionChange("redactPattern", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., \d{3}"
                />
              </div>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.caseSensitive}
                  onChange={() => handleOptionChange("caseSensitive", !options.caseSensitive)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Case Sensitive</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.redactNumbers}
                  onChange={() => handleOptionChange("redactNumbers", !options.redactNumbers)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Redact Numbers</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.redactEmails}
                  onChange={() => handleOptionChange("redactEmails", !options.redactEmails)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Redact Emails</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={options.preserveLength}
                  onChange={() => handleOptionChange("preserveLength", !options.preserveLength)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span>Preserve Length</span>
              </label>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleRedact}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isLoading ? "Redacting..." : "Redact Text"}
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
        {redactedText && (
          <div className="mt-8 p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Redacted Text
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {redactedText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Changes Applied:</p>
              <ul className="list-disc list-inside mt-2">
                {redactText(inputText).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(redactedText)}
              className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold"
            >
              Copy Redacted Text to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextRedactor;