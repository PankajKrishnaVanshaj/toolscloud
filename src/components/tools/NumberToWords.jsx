"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaPlus } from "react-icons/fa";

function NumberToWords() {
  // State management
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [format, setFormat] = useState("standard");
  const [currency, setCurrency] = useState("USD");
  const [separator, setSeparator] = useState(" ");
  const [caseStyle, setCaseStyle] = useState("lowercase");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  // Word mappings for different languages
  const WORD_MAPPINGS = {
    en: {
      units: ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"],
      teens: ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"],
      tens: ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"],
      thousands: ["", "thousand", "million", "billion", "trillion"],
      currency: { singular: "dollar", plural: "dollars", centSingular: "cent", centPlural: "cents" },
      ordinals: ["", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth"],
    },
    es: {
      units: ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"],
      teens: ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"],
      tens: ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"],
      thousands: ["", "mil", "millón", "mil millones", "billón"],
      currency: { singular: "euro", plural: "euros", centSingular: "céntimo", centPlural: "céntimos" },
      ordinals: ["", "primero", "segundo", "tercero", "cuarto", "quinto", "sexto", "séptimo", "octavo", "noveno"],
    },
    fr: {
      units: ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"],
      teens: ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"],
      tens: ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"],
      thousands: ["", "mille", "million", "milliard"],
      currency: { singular: "euro", plural: "euros", centSingular: "centime", centPlural: "centimes" },
      ordinals: ["", "premier", "deuxième", "troisième", "quatrième", "cinquième", "sixième", "septième", "huitième", "neuvième"],
    },
  };

  // Currency mappings
  const CURRENCY_MAPPINGS = {
    USD: { en: { singular: "dollar", plural: "dollars", centSingular: "cent", centPlural: "cents" } },
    EUR: {
      es: { singular: "euro", plural: "euros", centSingular: "céntimo", centPlural: "céntimos" },
      fr: { singular: "euro", plural: "euros", centSingular: "centime", centPlural: "centimes" },
    },
    GBP: { en: { singular: "pound", plural: "pounds", centSingular: "penny", centPlural: "pence" } },
  };

  // Conversion logic
  const convertToWords = useCallback(
    (numberInput, lang, fmt, curr) => {
      if (!numberInput || isNaN(numberInput)) return "";
      if (numberInput === "0") return lang === "en" ? "zero" : lang === "es" ? "cero" : "zéro";

      const words = WORD_MAPPINGS[lang];
      const num = parseFloat(numberInput);
      const isNegative = num < 0;
      let result = [];
      let numStr = Math.abs(parseInt(num)).toString();
      const chunks = [];

      // Split number into 3-digit chunks
      while (numStr.length > 0) {
        chunks.unshift(numStr.slice(-3));
        numStr = numStr.slice(0, -3);
      }

      // Handle standard and ordinal formats
      if (fmt === "standard" || fmt === "ordinal") {
        for (let i = 0; i < chunks.length; i++) {
          const chunk = parseInt(chunks[i]);
          if (chunk === 0) continue;

          const chunkWords = [];
          const hundreds = Math.floor(chunk / 100);
          const tensUnits = chunk % 100;

          if (hundreds > 0) {
            chunkWords.push(
              words.units[hundreds] +
                (lang === "en" ? " hundred" : lang === "es" ? " cientos" : " cent")
            );
          }

          if (tensUnits > 0) {
            if (tensUnits < 10) {
              chunkWords.push(
                fmt === "ordinal" && i === chunks.length - 1
                  ? words.ordinals[tensUnits]
                  : words.units[tensUnits]
              );
            } else if (tensUnits < 20) {
              chunkWords.push(
                fmt === "ordinal" && i === chunks.length - 1
                  ? words.ordinals[tensUnits - 10]
                  : words.teens[tensUnits - 10]
              );
            } else {
              const tens = Math.floor(tensUnits / 10);
              const units = tensUnits % 10;
              chunkWords.push(
                words.tens[tens] +
                  (units > 0
                    ? (lang === "en" ? "-" : " y ") +
                      (fmt === "ordinal" && i === chunks.length - 1
                        ? words.ordinals[units]
                        : words.units[units])
                    : "")
              );
            }
          }

          if (chunkWords.length > 0 && fmt !== "ordinal") {
            const thousandIndex = chunks.length - 1 - i;
            if (thousandIndex > 0) {
              chunkWords.push(words.thousands[thousandIndex]);
            }
          }
          result.push(chunkWords.join(" "));
        }
      }

      // Handle currency format
      if (fmt === "currency") {
        const currWords = CURRENCY_MAPPINGS[curr]?.[lang] || words.currency;
        const whole = Math.floor(Math.abs(num));
        const cents = Math.round((Math.abs(num) - whole) * 100);
        const wholeWords = convertToWords(whole.toString(), lang, "standard", curr);
        const centsWords = convertToWords(cents.toString(), lang, "standard", curr);

        result.push(
          wholeWords +
            " " +
            (whole === 1 ? currWords.singular : currWords.plural) +
            (cents > 0
              ? " and " +
                centsWords +
                " " +
                (cents === 1 ? currWords.centSingular : currWords.centPlural)
              : "")
        );
      }

      let finalResult = result.join(lang === "en" ? ", " : " ").replace(/,\s*$/, "");
      if (isNegative) {
        finalResult =
          (lang === "en" ? "negative " : lang === "es" ? "menos " : "moins ") +
          finalResult;
      }

      // Apply case style
      if (caseStyle === "uppercase") {
        finalResult = finalResult.toUpperCase();
      } else if (caseStyle === "titlecase") {
        finalResult = finalResult
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      } else {
        finalResult = finalResult.toLowerCase();
      }

      // Apply separator
      finalResult = finalResult.replace(/\s+/g, separator);

      return finalResult || (lang === "en" ? "zero" : lang === "es" ? "cero" : "zéro");
    },
    [caseStyle, separator]
  );

  // Handle conversion
  const handleConvert = () => {
    if (!input.trim()) {
      setError("Please enter a number");
      setOutput("");
      return;
    }

    const num = parseFloat(input);
    if (isNaN(num) || num > 999999999999 || num < -999999999999) {
      setError("Number must be between -999,999,999,999 and 999,999,999,999");
      setOutput("");
      return;
    }

    setError("");
    const words = convertToWords(input, language, format, currency);
    setOutput(words);
    setHistory((prev) => [
      ...prev,
      { input, language, format, currency, caseStyle, separator, output: words },
    ].slice(-10));
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      setIsCopied(true);
      setShowCopyAlert(true);
      setTimeout(() => {
        setShowCopyAlert(false);
        setIsCopied(false);
      }, 2000);
    }).catch((err) => {
      setError(`Copy failed: ${err.message}`);
    });
  };

  // Handle download as text file
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `number-to-words-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clear form
  const clearForm = () => {
    setInput("");
    setLanguage("en");
    setFormat("standard");
    setCurrency("USD");
    setSeparator(" ");
    setCaseStyle("lowercase");
    setOutput("");
    setError("");
    setIsCopied(false);
    setShowCopyAlert(false);
  };

  // Restore from history
  const restoreFromHistory = (entry) => {
    setInput(entry.input);
    setLanguage(entry.language);
    setFormat(entry.format);
    setCurrency(entry.currency);
    setSeparator(entry.separator);
    setCaseStyle(entry.caseStyle);
    setOutput(entry.output);
    setError("");
  };

  // Render UI
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full">
        {/* Copy alert */}
        {showCopyAlert && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-in">
            Words copied to clipboard!
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Number to Words Converter
          </h1>
          <button
            onClick={clearForm}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <FaTrash className="mr-1" /> Clear
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Input field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Number
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a number (e.g., 123.45)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Language selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>

        {/* Format selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard (e.g., one hundred twenty-three)</option>
            <option value="currency">Currency (e.g., one hundred twenty-three dollars)</option>
            <option value="ordinal">Ordinal (e.g., one hundred twenty-third)</option>
          </select>
        </div>

        {/* Currency selector (conditional) */}
        {format === "currency" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD (Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (Pound)</option>
            </select>
          </div>
        )}

        {/* Separator selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Word Separator
          </label>
          <select
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value=" ">Space (e.g., one hundred)</option>
            <option value="-">Hyphen (e.g., one-hundred)</option>
            <option value=",">Comma (e.g., one,hundred)</option>
            <option value="_">Underscore (e.g., one_hundred)</option>
          </select>
        </div>

        {/* Case style selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Case Style
          </label>
          <select
            value={caseStyle}
            onChange={(e) => setCaseStyle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="lowercase">Lowercase (e.g., one hundred)</option>
            <option value="uppercase">Uppercase (e.g., ONE HUNDRED)</option>
            <option value="titlecase">Title Case (e.g., One Hundred)</option>
          </select>
        </div>

        {/* Convert button */}
        <div className="mb-6">
          <button
            onClick={handleConvert}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Convert to Words
          </button>
        </div>

        {/* Output display */}
        {output && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Result
            </label>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-800 text-sm max-h-48 overflow-auto">
              {output}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleCopy}
                className={`flex-1 py-2 px-4 rounded-md text-white transition-colors ${
                  isCopied
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } flex items-center justify-center`}
              >
                <FaCopy className="mr-2" /> {isCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaDownload className="mr-2" /> Download (.txt)
              </button>
            </div>
          </div>
        )}

        {/* History section */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <FaHistory className="mr-2" /> Recent Conversions (Last 10)
            </h3>
            <ul className="mt-2 text-sm text-gray-600 space-y-2">
              {history.slice().reverse().map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span>
                    {entry.input} → {entry.output.slice(0, 20)}... ({entry.language}, {entry.format})
                  </span>
                  <button
                    onClick={() => restoreFromHistory(entry)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    aria-label="Restore conversion"
                  >
                    <FaUndo />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features section */}
        <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
          <h3 className="font-semibold text-blue-700">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm">
            <li>Convert numbers to words in English, Spanish, and French</li>
            <li>Support for standard, currency, and ordinal formats</li>
            <li>Handle positive/negative numbers up to trillions with decimals</li>
            <li>Customize output with currency, separators, and case styles</li>
            <li>Copy, download, and restore from recent conversions</li>
          </ul>
        </div>

        {/* Inline styles */}
        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in;
          }
        `}</style>
      </div>
    </div>
  );
}

export default NumberToWords;