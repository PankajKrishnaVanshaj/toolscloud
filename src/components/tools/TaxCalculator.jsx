"use client";

import { useState } from "react";

const TaxCalculator = () => {
  const [formData, setFormData] = useState({
    income: "",
    bonuses: "",
    investmentIncome: "",
    taxRate: "",
    stateTaxRate: "",
    deductions: "",
    taxCredits: "",
  });

  const [results, setResults] = useState({
    totalTax: null,
    netIncome: null,
    effectiveTaxRate: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTax = () => {
    const {
      income,
      bonuses,
      investmentIncome,
      taxRate,
      stateTaxRate,
      deductions,
      taxCredits,
    } = formData;

    const grossIncome =
      parseFloat(income || 0) +
      parseFloat(bonuses || 0) +
      parseFloat(investmentIncome || 0);
    const taxableIncome = Math.max(
      grossIncome - parseFloat(deductions || 0),
      0
    );

    const federalTax = (
      taxableIncome *
      (parseFloat(taxRate || 0) / 100)
    ).toFixed(2);
    const stateTax = (
      taxableIncome *
      (parseFloat(stateTaxRate || 0) / 100)
    ).toFixed(2);
    const totalTax = Math.max(
      parseFloat(federalTax) +
        parseFloat(stateTax) -
        parseFloat(taxCredits || 0),
      0
    );

    setResults({
      totalTax: totalTax.toFixed(2),
      netIncome: (taxableIncome - totalTax).toFixed(2),
      effectiveTaxRate: ((totalTax / grossIncome) * 100).toFixed(2),
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
      <h2 className="text-2xl font-semibold mb-4">
        🧾 Advanced Tax Calculator
      </h2>

      {[
        "income",
        "bonuses",
        "investmentIncome",
        "deductions",
        "taxCredits",
      ].map((name) => (
        <input
          key={name}
          type="number"
          placeholder={
            name.charAt(0).toUpperCase() +
            name.slice(1).replace(/([A-Z])/g, " $1")
          }
          name={name}
          value={formData[name] || ""}
          onChange={handleInputChange}
          className="border rounded-lg px-3 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ))}

      <input
        type="number"
        placeholder="Federal Tax Rate (%)"
        name="taxRate"
        value={formData.taxRate || ""}
        onChange={handleInputChange}
        className="border rounded-lg px-3 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <input
        type="number"
        placeholder="State Tax Rate (%) (Optional)"
        name="stateTaxRate"
        value={formData.stateTaxRate || ""}
        onChange={handleInputChange}
        className="border rounded-lg px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <button
        onClick={calculateTax}
        className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition"
      >
        Calculate Tax
      </button>

      {results.totalTax !== null && (
        <div className="mt-5 text-left">
          <p className="text-lg font-medium">Total Tax: ${results.totalTax}</p>
          <p>Net Income After Tax: ${results.netIncome}</p>
          <p>Effective Tax Rate: {results.effectiveTaxRate}%</p>
        </div>
      )}
    </div>
  );
};

export default TaxCalculator;
