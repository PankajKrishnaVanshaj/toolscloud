"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload, FaSync } from "react-icons/fa";

const BudgetPlanner = () => {
  const [income, setIncome] = useState([{ source: "", amount: 0, recurring: false }]);
  const [expenses, setExpenses] = useState([{ category: "", amount: 0, recurring: false }]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, remaining: 0 });
  const [currency, setCurrency] = useState("$");
  const [customCategories, setCustomCategories] = useState([]);

  const defaultCategories = [
    "Housing",
    "Transportation",
    "Food",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Insurance",
    "Debt",
    "Savings",
    "Miscellaneous",
  ];

  // Calculate totals
  useEffect(() => {
    const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const remaining = totalIncome - totalExpenses;

    setTotals({
      income: totalIncome,
      expenses: totalExpenses,
      remaining: remaining,
    });
  }, [income, expenses]);

  // Add new income/expense
  const addIncome = () => setIncome([...income, { source: "", amount: 0, recurring: false }]);
  const addExpense = () =>
    setExpenses([...expenses, { category: "", amount: 0, recurring: false }]);

  // Update income/expense
  const updateIncome = useCallback((index, field, value) => {
    const newIncome = [...income];
    newIncome[index][field] =
      field === "amount" ? Number(value) : field === "recurring" ? !newIncome[index].recurring : value;
    setIncome(newIncome);
  }, [income]);

  const updateExpense = useCallback((index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] =
      field === "amount" ? Number(value) : field === "recurring" ? !newExpenses[index].recurring : value;
    setExpenses(newExpenses);
  }, [expenses]);

  // Remove income/expense
  const removeIncome = (index) => setIncome(income.filter((_, i) => i !== index));
  const removeExpense = (index) => setExpenses(expenses.filter((_, i) => i !== index));

  // Add custom category
  const addCustomCategory = (category) => {
    if (category && !defaultCategories.includes(category) && !customCategories.includes(category)) {
      setCustomCategories([...customCategories, category]);
    }
  };

  // Download budget as CSV
  const downloadBudget = () => {
    const csvContent = [
      "Type,Source/Category,Amount,Recurring",
      ...income.map((item) => `Income,${item.source},${item.amount},${item.recurring}`),
      ...expenses.map((item) => `Expense,${item.category},${item.amount},${item.recurring}`),
      `,,Total Income,${totals.income}`,
      `,,Total Expenses,${totals.expenses}`,
      `,,Remaining,${totals.remaining}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `budget-${Date.now()}.csv`;
    link.click();
  };

  // Reset everything
  const reset = () => {
    setIncome([{ source: "", amount: 0, recurring: false }]);
    setExpenses([{ category: "", amount: 0, recurring: false }]);
    setTotals({ income: 0, expenses: 0, remaining: 0 });
    setCustomCategories([]);
    setCurrency("$");
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Budget Planner
        </h1>

        {/* Settings */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="¥">¥ (JPY)</option>
              </select>
            </div>
            <button
              onClick={reset}
              className="mt-4 sm:mt-0 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
          </div>
        </div>

        {/* Income Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Income</h2>
          {income.map((item, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2 items-center">
              <input
                type="text"
                value={item.source}
                onChange={(e) => updateIncome(index, "source", e.target.value)}
                placeholder="Income Source"
                className="col-span-5 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={item.amount}
                onChange={(e) => updateIncome(index, "amount", e.target.value)}
                placeholder="Amount"
                className="col-span-3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <label className="col-span-2 flex items-center">
                <input
                  type="checkbox"
                  checked={item.recurring}
                  onChange={() => updateIncome(index, "recurring")}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-600">Recurring</span>
              </label>
              {income.length > 1 && (
                <button
                  onClick={() => removeIncome(index)}
                  className="col-span-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addIncome}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" /> Add Income Source
          </button>
        </div>

        {/* Expenses Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-700">Expenses</h2>
          {expenses.map((item, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 mb-2 items-center">
              <select
                value={item.category}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "custom") {
                    const newCat = prompt("Enter custom category:");
                    if (newCat) addCustomCategory(newCat);
                  } else {
                    updateExpense(index, "category", value);
                  }
                }}
                className="col-span-5 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {customCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} (Custom)
                  </option>
                ))}
                <option value="custom">+ Add Custom Category</option>
              </select>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => updateExpense(index, "amount", e.target.value)}
                placeholder="Amount"
                className="col-span-3 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <label className="col-span-2 flex items-center">
                <input
                  type="checkbox"
                  checked={item.recurring}
                  onChange={() => updateExpense(index, "recurring")}
                  className="mr-2 accent-blue-500"
                />
                <span className="text-sm text-gray-600">Recurring</span>
              </label>
              {expenses.length > 1 && (
                <button
                  onClick={() => removeExpense(index)}
                  className="col-span-2 p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addExpense}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaPlus className="mr-2" /> Add Expense
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">Budget Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <p>
              Total Income:{" "}
              <span className="font-bold text-green-600">
                {currency}
                {totals.income.toLocaleString()}
              </span>
            </p>
            <p>
              Total Expenses:{" "}
              <span className="font-bold text-red-600">
                {currency}
                {totals.expenses.toLocaleString()}
              </span>
            </p>
            <p>
              Remaining:{" "}
              <span
                className={`font-bold ${
                  totals.remaining >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {currency}
                {totals.remaining.toLocaleString()}
              </span>
            </p>
          </div>
          <button
            onClick={downloadBudget}
            className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download Budget (CSV)
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Track multiple income sources and expenses</li>
            <li>Customizable categories</li>
            <li>Recurring income/expense toggle</li>
            <li>Currency selection</li>
            <li>Download budget as CSV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BudgetPlanner;