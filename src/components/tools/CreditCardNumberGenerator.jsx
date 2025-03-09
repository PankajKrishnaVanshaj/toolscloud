"use client";

import React, { useState, useCallback } from "react";
import { FaCopy, FaTrash, FaDownload, FaHistory, FaUndo, FaDice } from "react-icons/fa";

const CreditCardNumberGenerator = () => {
  const [cardNumbers, setCardNumbers] = useState([]);
  const [count, setCount] = useState(10);
  const [cardType, setCardType] = useState("visa");
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [options, setOptions] = useState({
    separator: " ",         // Space, hyphen, or none
    includeExpiry: false,   // Include expiration date
    includeCVV: false,      // Include CVV
  });

  // Card type prefixes and lengths
  const cardTypes = {
    visa: { prefixes: ["4"], length: 16, cvvLength: 3 },
    mastercard: { prefixes: ["51", "52", "53", "54", "55"], length: 16, cvvLength: 3 },
    amex: { prefixes: ["34", "37"], length: 15, cvvLength: 4 },
    discover: { prefixes: ["6011", "644", "645", "646", "647", "648", "649", "65"], length: 16, cvvLength: 3 },
  };

  // Luhn algorithm to generate valid checksum
  const generateLuhnChecksum = (number) => {
    let sum = 0;
    let isEven = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }

    return (sum * 9) % 10;
  };

  // Generate random expiration date (MM/YY format, future dates)
  const generateExpiryDate = () => {
    const currentYear = new Date().getFullYear() % 100; // Last two digits
    const randomYear = currentYear + Math.floor(Math.random() * 5); // Up to 5 years in future
    const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    return `${randomMonth}/${randomYear}`;
  };

  // Generate random CVV based on card type
  const generateCVV = (cvvLength) => {
    return Array.from({ length: cvvLength }, () => Math.floor(Math.random() * 10)).join("");
  };

  const generateCardNumber = useCallback(() => {
    const { prefixes, length, cvvLength } = cardTypes[cardType];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const remainingLength = length - prefix.length;
    const randomDigits = Array.from({ length: remainingLength - 1 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    const partialNumber = prefix + randomDigits;
    const checksum = generateLuhnChecksum(partialNumber);
    const fullNumber = partialNumber + checksum;

    // Format number with chosen separator
    const formattedNumber = fullNumber.match(/.{1,4}/g).join(options.separator);

    // Add expiry and CVV if selected
    let result = formattedNumber;
    if (options.includeExpiry) result += ` | Exp: ${generateExpiryDate()}`;
    if (options.includeCVV) result += ` | CVV: ${generateCVV(cvvLength)}`;

    return result;
  }, [cardType, options]);

  const generateCardNumbers = () => {
    const newCardNumbers = Array.from({ length: Math.min(count, 1000) }, generateCardNumber);
    setCardNumbers(newCardNumbers);
    setHistory((prev) => [
      ...prev,
      { cards: newCardNumbers, count, cardType, options },
    ].slice(-5));
    setIsCopied(false);
  };

  const copyToClipboard = () => {
    const text = cardNumbers.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const downloadAsText = () => {
    const text = cardNumbers.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `credit-cards-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearCardNumbers = () => {
    setCardNumbers([]);
    setIsCopied(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const restoreFromHistory = (entry) => {
    setCardNumbers(entry.cards);
    setCount(entry.count);
    setCardType(entry.cardType);
    setOptions(entry.options);
    setIsCopied(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Advanced Credit Card Number Generator
        </h1>

        <div className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Cards (1-1000)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Type
              </label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">MasterCard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
              </select>
            </div>
          </div>

          {/* Options Section */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <p className="text-sm font-medium text-gray-700">Customization Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Separator:</label>
                <select
                  value={options.separator}
                  onChange={(e) => handleOptionChange("separator", e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value=" ">Space</option>
                  <option value="-">Hyphen</option>
                  <option value="">None</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeExpiry}
                  onChange={() => handleOptionChange("includeExpiry", !options.includeExpiry)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include Expiry</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeCVV}
                  onChange={() => handleOptionChange("includeCVV", !options.includeCVV)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm text-gray-600">Include CVV</label>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={generateCardNumbers}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
            >
              <FaDice className="mr-2" />
              Generate Cards
            </button>
            {cardNumbers.length > 0 && (
              <>
                <button
                  onClick={copyToClipboard}
                  className={`flex-1 py-2 px-4 rounded-md transition-colors font-medium flex items-center justify-center ${
                    isCopied
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  <FaCopy className="mr-2" />
                  {isCopied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={downloadAsText}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Download
                </button>
                <button
                  onClick={clearCardNumbers}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center"
                >
                  <FaTrash className="mr-2" />
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Generated Output */}
          {cardNumbers.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Generated Credit Card Numbers ({cardNumbers.length}):
              </h2>
              <div className="bg-white p-4 rounded-md border border-gray-200 max-h-96 overflow-auto">
                <ul className="list-decimal list-inside text-gray-800 font-mono text-sm">
                  {cardNumbers.map((number, index) => (
                    <li key={index} className="py-1">{number}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-700 flex items-center">
                <FaHistory className="mr-2" /> Recent Generations (Last 5)
              </h3>
              <ul className="mt-2 text-sm text-gray-600 space-y-2">
                {history.slice().reverse().map((entry, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>
                      {entry.cards.length} {entry.cardType} cards
                    </span>
                    <button
                      onClick={() => restoreFromHistory(entry)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <FaUndo />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p>
              <strong>Note:</strong> These are randomly generated numbers for testing purposes only and are not real credit card numbers. They pass the Luhn algorithm check but should not be used for actual transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCardNumberGenerator;