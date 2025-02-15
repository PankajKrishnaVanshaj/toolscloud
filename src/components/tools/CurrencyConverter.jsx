"use client";

import { useState } from "react";
import { FiRepeat } from "react-icons/fi";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [error, setError] = useState("");

  const exchangeRates = {
    USD: { EUR: 0.85, GBP: 0.75, PKR: 278, INR: 74 },
    EUR: { USD: 1.18, GBP: 0.88, PKR: 320, INR: 87 },
    GBP: { USD: 1.33, EUR: 1.14, PKR: 365, INR: 100 },
    PKR: { USD: 0.0036, EUR: 0.0031, GBP: 0.0027, INR: 0.74 },
    INR: { USD: 0.013, EUR: 0.0115, GBP: 0.01, PKR: 1.36 },
  };

  const validateInput = () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return false;
    }
    setError("");
    return true;
  };

  const convertCurrency = () => {
    if (!validateInput()) return;

    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount);
      return;
    }

    const rate = exchangeRates[fromCurrency][toCurrency];
    if (!rate) {
      setError("Conversion rate not available for the selected currencies.");
      return;
    }

    setConvertedAmount((amount * rate).toFixed(2));
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const clearFields = () => {
    setAmount("");
    setConvertedAmount(null);
    setError("");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">💰 Currency Converter</h2>

      <div className="mb-3">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full focus:outline-primary"
        />
      </div>

      <div className="flex justify-between items-center mb-3">
        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:outline-primary"
        >
          {Object.keys(exchangeRates).map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>

        <button
          onClick={handleSwapCurrencies}
          className="mx-3 bg-gray-200 p-2 rounded-full hover:bg-gray-300 focus:outline-none"
        >
          <FiRepeat size={20} />
        </button>

        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:outline-primary"
        >
          {Object.keys(exchangeRates).map((cur) => (
            <option key={cur} value={cur}>
              {cur}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={convertCurrency}
        className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90"
      >
        Convert
      </button>

      <button
        onClick={clearFields}
        className="ml-3 px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500"
      >
        Clear
      </button>

      {error && <p className="mt-3 text-red-600">{error}</p>}

      {convertedAmount !== null && (
        <p className="mt-3 text-lg font-medium">
          Converted: {convertedAmount} {toCurrency}
        </p>
      )}
    </div>
  );
};

export default CurrencyConverter;
