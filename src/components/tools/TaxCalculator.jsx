"use client";

import { useState } from "react";

const TaxCalculator = () => {
  const [income, setIncome] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [tax, setTax] = useState(null);

  const calculateTax = () => {
    if (!income || !taxRate) {
      setTax(null);
      return;
    }
    setTax(((income * taxRate) / 100).toFixed(2));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-xl font-semibold mb-4">🧾 Tax Calculator</h2>
      <input type="number" placeholder="Annual Income" value={income} onChange={(e) => setIncome(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <input type="number" placeholder="Tax Rate (%)" value={taxRate} onChange={(e) => setTaxRate(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full mb-2" />
      <button onClick={calculateTax} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
        Calculate Tax
      </button>
      {tax && <p className="mt-3 text-lg font-medium">Estimated Tax: ${tax}</p>}
    </div>
  );
};

export default TaxCalculator;
