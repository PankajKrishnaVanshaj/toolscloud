"use client";

import React, { useState, useCallback } from "react";
import {
  FaCopy,
  FaTrash,
  FaDownload,
  FaHistory,
  FaUndo,
  FaLanguage,
} from "react-icons/fa";

const TextTranslator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    sourceLang: "en",
    targetLang: "es",
    autoDetect: true,         // Auto-detect source language
    preserveFormatting: true, // Preserve line breaks and spacing
    formality: "default",     // Formal/informal tone (API-dependent)
  });

  // Expanded mock language dictionary (for demo purposes)
  const mockTranslations = {
    en: {
      es: {
        hello: "hola",
        world: "mundo",
        this: "esto",
        is: "es",
        a: "un",
        test: "prueba",
        good: "bueno",
        morning: "mañana",
      },
      fr: {
        hello: "bonjour",
        world: "monde",
        this: "ceci",
        is: "est",
        a: "un",
        test: "test",
        good: "bon",
        morning: "matin",
      },
      de: {
        hello: "hallo",
        world: "welt",
        this: "dies",
        is: "ist",
        a: "ein",
        test: "test",
        good: "gut",
        morning: "morgen",
      },
    },
    es: {
      en: {
        hola: "hello",
        mundo: "world",
        esto: "this",
        es: "is",
        un: "a",
        prueba: "test",
        bueno: "good",
        mañana: "morning",
      },
    },
  };

  // Mock translation function (replace with real API in production, e.g., Google Translate API)
  const translateText = (text, sourceLang, targetLang) => {
    if (!text.trim()) {
      return { error: "Please enter some text to translate" };
    }

    let effectiveSourceLang = sourceLang;
    if (options.autoDetect) {
      // Simple mock auto-detection (in reality, use language detection API)
      effectiveSourceLang = text.includes("hola") ? "es" : "en";
    }

    const translations = mockTranslations[effectiveSourceLang]?.[targetLang];
    if (!translations) {
      return { error: `Translation not available from ${effectiveSourceLang} to ${targetLang}` };
    }

    let result = text;
    if (options.preserveFormatting) {
      const lines = text.split("\n");
      result = lines.map(line => {
        const words = line.split(/\s+/).filter(w => w.length > 0);
        const translatedWords = words.map(word => {
          const cleanWord = word.toLowerCase().replace(/[^a-záéíóúñ]/gi, "");
          const translation = translations[cleanWord] || word;
          return word[0] === word[0].toUpperCase() ? translation.charAt(0).toUpperCase() + translation.slice(1) : translation;
        });
        return translatedWords.join(" ");
      }).join("\n");
    } else {
      const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
      const translatedWords = words.map(word => translations[word] || word);
      result = translatedWords.join(" ");
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }

    return {
      original: text,
      translated: result,
      sourceLang: effectiveSourceLang,
      targetLang,
      changes: [`Translated from ${effectiveSourceLang} to ${targetLang}`],
    };
  };

  const handleTranslate = useCallback(async () => {
    setError("");
    setTranslatedText("");
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      const result = translateText(inputText, options.sourceLang, options.targetLang);

      if (result.error) {
        setError(result.error);
      } else {
        setTranslatedText(result.translated);
        setHistory(prev => [...prev, { input: inputText, output: result.translated, options: { ...options, sourceLang: result.sourceLang } }].slice(-5));
      }
    } catch (err) {
      setError("An error occurred while translating the text");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, options]);

  const reset = () => {
    setInputText("");
    setTranslatedText("");
    setError("");
    setOptions({
      sourceLang: "en",
      targetLang: "es",
      autoDetect: true,
      preserveFormatting: true,
      formality: "default",
    });
  };

  const handleOptionChange = (option, value) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  const exportTranslatedText = () => {
    const content = `Original Text (${options.sourceLang}):\n${inputText}\n\nTranslated Text (${options.targetLang}):\n${translatedText}\n\nDetails:\nTranslated from ${options.autoDetect ? "auto-detected" : options.sourceLang} to ${options.targetLang}`;
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `translated_text_${options.sourceLang}_to_${options.targetLang}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Expanded language options (for demo; expand with real API)
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
          Advanced Text Translator
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
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 resize-y transition-all"
              placeholder="e.g., Hello World\nThis is a test."
              maxLength={10000}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {inputText.length}/10000 characters
            </div>
          </div>

          {/* Options */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Translation Options:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Source Language:</label>
                <select
                  value={options.sourceLang}
                  onChange={(e) => handleOptionChange("sourceLang", e.target.value)}
                  disabled={options.autoDetect}
                  className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${options.autoDetect ? "opacity-50" : ""}`}
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
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Formality:</label>
                <select
                  value={options.formality}
                  onChange={(e) => handleOptionChange("formality", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="formal">Formal</option>
                  <option value="informal">Informal</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.autoDetect}
                    onChange={() => handleOptionChange("autoDetect", !options.autoDetect)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Auto-Detect Source Language</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={options.preserveFormatting}
                    onChange={() => handleOptionChange("preserveFormatting", !options.preserveFormatting)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Preserve Formatting</span>
                </label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={handleTranslate}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition-all ${
                isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <FaLanguage className="inline mr-2" />
              {isLoading ? "Translating..." : "Translate Text"}
            </button>
            <button
              onClick={reset}
              disabled={isLoading}
              className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
            >
              <FaTrash className="inline mr-2" />
              Reset
            </button>
            {translatedText && (
              <button
                onClick={exportTranslatedText}
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
        {translatedText && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 text-center">
              Translated Text ({translateText(inputText, options.sourceLang, options.targetLang).sourceLang} → {options.targetLang})
            </h2>
            <p className="mt-3 text-lg text-gray-700 break-words whitespace-pre-wrap max-h-64 overflow-auto">
              {translatedText}
            </p>
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Details:</p>
              <ul className="list-disc list-inside mt-2">
                {translateText(inputText, options.sourceLang, options.targetLang).changes.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
                {options.autoDetect && <li>Auto-detected source language</li>}
                {options.preserveFormatting && <li>Preserved original formatting</li>}
                {options.formality !== "default" && <li>Applied {options.formality} tone</li>}
              </ul>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(translatedText)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold"
            >
              <FaCopy className="inline mr-2" />
              Copy Translated Text
            </button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Translations (Last 5)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    "{entry.output.slice(0, 30)}{entry.output.length > 30 ? "..." : ""}" ({entry.options.sourceLang} → {entry.options.targetLang})
                  </span>
                  <button
                    onClick={() => {
                      setInputText(entry.input);
                      setTranslatedText(entry.output);
                      setOptions(entry.options);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features Info */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Translate between multiple languages</li>
            <li>Auto-detect source language</li>
            <li>Preserve formatting and adjust formality</li>
            <li>Export translations and track history</li>
            <li>Supports up to 10000 characters</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TextTranslator;