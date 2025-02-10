"use client";

import { useState } from "react";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);

  const exchangeRates = {
    USD: { EUR: 0.85, GBP: 0.75, PKR: 278 },
    EUR: { USD: 1.18, GBP: 0.88, PKR: 320 },
    GBP: { USD: 1.33, EUR: 1.14, PKR: 365 },
    PKR: { USD: 0.0036, EUR: 0.0031, GBP: 0.0027 },
  };

  const convertCurrency = () => {
    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount);
      return;
    }
    const rate = exchangeRates[fromCurrency][toCurrency];
    setConvertedAmount((amount * rate).toFixed(2));
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
          className="border rounded-lg px-3 py-2 w-full"
        />
      </div>
      <div className="flex justify-between mb-3">
        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="border rounded-lg px-3 py-2">
          {Object.keys(exchangeRates).map((cur) => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>
        <span className="mx-3">➡️</span>
        <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="border rounded-lg px-3 py-2">
          {Object.keys(exchangeRates).map((cur) => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>
      </div>
      <button onClick={convertCurrency} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Convert
      </button>
      {convertedAmount !== null && <p className="mt-3 text-lg font-medium">Converted: {convertedAmount} {toCurrency}</p>}
    </div>
  );
};

export default CurrencyConverter;
