"use client";
import { useState, useCallback } from "react";
import { FaCalculator, FaSync } from "react-icons/fa";

const TaxCalculator = () => {
  const [formData, setFormData] = useState({
    income: "",
    bonuses: "",
    investmentIncome: "",
    federalTaxRate: "",
    stateTaxRate: "",
    deductions: "",
    taxCredits: "",
    filingStatus: "single", // New field
    dependents: "", // New field
    retirementContributions: "", // New field
  });

  const [results, setResults] = useState({
    federalTax: null,
    stateTax: null,
    totalTax: null,
    netIncome: null,
    effectiveTaxRate: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTax = useCallback(() => {
    const {
      income,
      bonuses,
      investmentIncome,
      federalTaxRate,
      stateTaxRate,
      deductions,
      taxCredits,
      filingStatus,
      dependents,
      retirementContributions,
    } = formData;

    // Parse inputs
    const grossIncome =
      parseFloat(income || 0) +
      parseFloat(bonuses || 0) +
      parseFloat(investmentIncome || 0);
    const retirement = parseFloat(retirementContributions || 0);
    const deductionAmount = parseFloat(deductions || 0) + parseFloat(dependents || 0) * 2000; // $2000 per dependent
    const taxableIncome = Math.max(grossIncome - deductionAmount - retirement, 0);

    // Federal tax with basic progressive rate simulation
    let federalTax = 0;
    const fedRate = parseFloat(federalTaxRate || 0) / 100;
    if (filingStatus === "single") {
      federalTax = taxableIncome * fedRate;
    } else if (filingStatus === "married") {
      federalTax = taxableIncome * (fedRate * 0.9); // 10% reduction for married
    } else if (filingStatus === "head") {
      federalTax = taxableIncome * (fedRate * 0.95); // 5% reduction for head of household
    }

    const stateTax = taxableIncome * (parseFloat(stateTaxRate || 0) / 100);
    const totalTax = Math.max(federalTax + stateTax - parseFloat(taxCredits || 0), 0);

    setResults({
      federalTax: federalTax.toFixed(2),
      stateTax: stateTax.toFixed(2),
      totalTax: totalTax.toFixed(2),
      netIncome: (grossIncome - totalTax).toFixed(2),
      effectiveTaxRate: grossIncome > 0 ? ((totalTax / grossIncome) * 100).toFixed(2) : 0,
    });
  }, [formData]);

  const resetForm = () => {
    setFormData({
      income: "",
      bonuses: "",
      investmentIncome: "",
      federalTaxRate: "",
      stateTaxRate: "",
      deductions: "",
      taxCredits: "",
      filingStatus: "single",
      dependents: "",
      retirementContributions: "",
    });
    setResults({
      federalTax: null,
      stateTax: null,
      totalTax: null,
      netIncome: null,
      effectiveTaxRate: null,
    });
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
          <FaCalculator className="mr-2" /> Advanced Tax Calculator
        </h2>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "income", label: "Annual Income ($)" },
            { name: "bonuses", label: "Bonuses ($)" },
            { name: "investmentIncome", label: "Investment Income ($)" },
            { name: "deductions", label: "Deductions ($)" },
            { name: "taxCredits", label: "Tax Credits ($)" },
            { name: "retirementContributions", label: "Retirement Contributions ($)" },
            { name: "dependents", label: "Number of Dependents" },
            { name: "federalTaxRate", label: "Federal Tax Rate (%)" },
            { name: "stateTaxRate", label: "State Tax Rate (%)" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                type="number"
                name={name}
                value={formData[name] || ""}
                onChange={handleInputChange}
                placeholder={label}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                min="0"
                step={name.includes("Rate") ? "0.1" : "1"}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filing Status
            </label>
            <select
              name="filingStatus"
              value={formData.filingStatus}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="head">Head of Household</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            onClick={calculateTax}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <FaCalculator className="mr-2" /> Calculate Tax
          </button>
          <button
            onClick={resetForm}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Results */}
        {results.totalTax !== null && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tax Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
              <p>Federal Tax: ${results.federalTax}</p>
              <p>State Tax: ${results.stateTax}</p>
              <p className="font-medium">Total Tax: ${results.totalTax}</p>
              <p>Net Income After Tax: ${results.netIncome}</p>
              <p>Effective Tax Rate: {results.effectiveTaxRate}%</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Calculate federal and state taxes</li>
            <li>Support for bonuses and investment income</li>
            <li>Filing status adjustments</li>
            <li>Dependent deductions ($2000 each)</li>
            <li>Retirement contribution deductions</li>
          </ul>
        </div>

        {/* Notes */}
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-700 text-sm">
            <strong>Note:</strong> This is a simplified calculator. Actual tax calculations may involve progressive tax brackets and additional rules.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;