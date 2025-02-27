"use client";
import React, { useState } from "react";

const TextTranslator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    sourceLang: "en", // Default source language
    targetLang: "es", // Default target language
  });

  // Mock language dictionary (for demo purposes)
  const mockTranslations = {
    en: {
      es: {
        hello: "hola",
        world: "mundo",
        this: "esto",
        is: "es",
        a: "un",
        test: "prueba",
      },
      fr: {
        hello: "bonjour",
        world: "monde",
        this: "ceci",
        is: "est",
        a: "un",
        test: "test",
      },
    },
  };

  // Mock translation function (replace with real API call in production)
  const translateText = (text, sourceLang, targetLang) => {
    if (!text.trim()) {
      return { error: "Please enter some text to translate" };
    }

    // Split text into words and translate each (simplified)
    const words = text.toLowerCase().split(/\s+/);
    const translations = mockTranslations[sourceLang]?.[targetLang];

    if (!translations) {
      return { error: "Translation not available for this language pair" };
    }

    const translatedWords = words.map(word => translations[word] || word);
    let result = translatedWords.join(" ");

    // Capitalize first letter for better readability
    result = result.charAt(0).toUpperCase() + result.slice(1);

    return {
      original: text,
      translated: result,
      sourceLang,
      targetLang,
    };
  };

  const handleTranslate = async () => {
    setError("");
    setTranslatedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      const result = translateText(inputText, options.sourceLang, options.targetLang);

      if (result.error) {
        setError(result.error);
        return;
      }

      setTranslatedText(result.translated);
    } catch (err) {
      setError("An error occurred while translating the text");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setInputText("");
    setTranslatedText("");
    setError("");
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  // Simple language options (expandable with real API)
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Text Translator
        </h1>

        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Enter Text to Translate:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-y transition-all"
              placeholder="e.g., Hello World"
              maxLength={5000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/5000 characters
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Translation Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Source Language:</label>
                <select
                  value={options.sourceLang}
                  onChange={(e) => handleOptionChange("sourceLang", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Target Language:</label>
                <select
                  value={options.targetLang}
                  onChange={(e) => handleOptionChange("targetLang", e.target.value)}
                  className="w-full p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleTranslate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Translating..." : "Translate Text"}
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
        {translatedText && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Translated Text ({options.sourceLang} → {options.targetLang})
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap">
              {translatedText}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(translatedText)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              Copy Translated Text to Clipboard
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default TextTranslator;