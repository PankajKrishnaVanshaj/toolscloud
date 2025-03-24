"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaDownload, FaSync, FaPlus, FaTrash } from "react-icons/fa";

const CashFlowCalculator = () => {
  const [incomes, setIncomes] = useState([{ name: "", amount: 0, frequency: "monthly" }]);
  const [expenses, setExpenses] = useState([{ name: "", amount: 0, frequency: "monthly" }]);
  const [netCashFlow, setNetCashFlow] = useState({ monthly: 0, annual: 0 });
  const [currency, setCurrency] = useState("USD");
  const [timeFrame, setTimeFrame] = useState("monthly");

  // Calculate cash flow
  const calculateCashFlow = useCallback(() => {
    const calculateTotal = (items) =>
      items.reduce((sum, item) => {
        const amount = Number(item.amount) || 0;
        return sum + (item.frequency === "monthly" ? amount : amount / 12);
      }, 0);

    const totalIncomeMonthly = calculateTotal(incomes);
    const totalExpensesMonthly = calculateTotal(expenses);
    const monthlyNet = totalIncomeMonthly - totalExpensesMonthly;
    setNetCashFlow({
      monthly: monthlyNet,
      annual: monthlyNet * 12,
    });
  }, [incomes, expenses]);

  useEffect(() => {
    calculateCashFlow();
  }, [incomes, expenses, calculateCashFlow]);

  // Handle input changes
  const handleChange = (type, index, field, value) => {
    const setter = type === "incomes" ? setIncomes : setExpenses;
    setter((prev) => {
      const newItems = [...prev];
      newItems[index][field] = value;
      return newItems;
    });
  };

  // Add/remove items
  const addItem = (type) => {
    const setter = type === "incomes" ? setIncomes : setExpenses;
    setter((prev) => [...prev, { name: "", amount: 0, frequency: "monthly" }]);
  };

  const removeItem = (type, index) => {
    const setter = type === "incomes" ? setIncomes : setExpenses;
    const items = type === "incomes" ? incomes : expenses;
    if (items.length > 1) {
      setter(items.filter((_, i) => i !== index));
    }
  };

  // Reset everything
  const reset = () => {
    setIncomes([{ name: "", amount: 0, frequency: "monthly" }]);
    setExpenses([{ name: "", amount: 0, frequency: "monthly" }]);
    setCurrency("USD");
    setTimeFrame("monthly");
  };

  // Download as CSV
  const downloadCSV = () => {
    const headers = ["Type,Name,Amount,Frequency"];
    const incomeRows = incomes.map((i) =>
      `Income,"${i.name}",${i.amount},${i.frequency}`
    );
    const expenseRows = expenses.map((e) =>
      `Expense,"${e.name}",${e.amount},${e.frequency}`
    );
    const csvContent = [
      headers,
      ...incomeRows,
      ...expenseRows,
      [],
      `Net Cash Flow (${timeFrame}),,${
        timeFrame === "monthly" ? netCashFlow.monthly : netCashFlow.annual
      },`,
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cash-flow-${Date.now()}.csv`;
    link.click();
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Cash Flow Calculator
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Frame
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        {/* Income and Expenses */}
        <div className="grid grid-cols-1 lg        lg:grid-cols-2 gap-6">
          {/* Income Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-green-700">Income</h2>
            {incomes.map((income, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Source"
                  value={income.name}
                  onChange={(e) => handleChange("incomes", index, "name", e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={income.amount}
                  onChange={(e) => handleChange("incomes", index, "amount", e.target.value)}
                  className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                  min="0"
                />
                <select
                  value={income.frequency}
                  onChange={(e) => handleChange("incomes", index, "frequency", e.target.value)}
                  className="w-28 p-2 border rounded-md focus:ring-2 focus:ring-green-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
                {incomes.length > 1 && (
                  <button
                    onClick={() => removeItem("incomes", index)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addItem("incomes")}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <FaPlus /> Add Income
            </button>
          </div>

          {/* Expenses Section */}
          <div>
            <h2 className="text-lg font-semibold mb-3 text-red-700">Expenses</h2>
            {expenses.map((expense, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Description"
                  value={expense.name}
                  onChange={(e) => handleChange("expenses", index, "name", e.target.value)}
                  className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={expense.amount}
                  onChange={(e) => handleChange("expenses", index, "amount", e.target.value)}
                  className="w-24 p-2 border rounded-md focus:ring-2 focus:ring-red-500"
                  min="0"
                />
                <select
                  value={expense.frequency}
                  onChange={(e) => handleChange("expenses", index, "frequency", e.target.value)}
                  className="w-28 p-2 border rounded-md focus:ring-2 focus:ring-red-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
                {expenses.length > 1 && (
                  <button
                    onClick={() => removeItem("expenses", index)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addItem("expenses")}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <FaPlus /> Add Expense
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg text-center">
          <h2 className="text-lg font-semibold mb-2">Cash Flow Summary</h2>
          <p>
            Total Income:{" "}
            <span className="font-medium text-green-600">
              {formatCurrency(
                timeFrame === "monthly"
                  ? incomes.reduce((sum, item) => {
                      const amount = Number(item.amount) || 0;
                      return sum + (item.frequency === "monthly" ? amount : amount / 12);
                    }, 0)
                  : incomes.reduce((sum, item) => {
                      const amount = Number(item.amount) || 0;
                      return sum + (item.frequency === "annual" ? amount : amount * 12);
                    }, 0)
              )}
            </span>
          </p>
          <p>
            Total Expenses:{" "}
            <span className="font-medium text-red-600">
              {formatCurrency(
                timeFrame === "monthly"
                  ? expenses.reduce((sum, item) => {
                      const amount = Number(item.amount) || 0;
                      return sum + (item.frequency === "monthly" ? amount : amount / 12);
                    }, 0)
                  : expenses.reduce((sum, item) => {
                      const amount = Number(item.amount) || 0;
                      return sum + (item.frequency === "annual" ? amount : amount * 12);
                    }, 0)
              )}
            </span>
          </p>
          <p className="mt-2">
            Net Cash Flow:{" "}
            <span
              className={`font-bold ${
                (timeFrame === "monthly" ? netCashFlow.monthly : netCashFlow.annual) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(
                timeFrame === "monthly" ? netCashFlow.monthly : netCashFlow.annual
              )}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadCSV}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            <FaDownload className="mr-2" /> Download CSV
          </button>
          <button
            onClick={reset}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Reset
          </button>
        </div>

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Track multiple income and expense sources</li>
            <li>Monthly or annual frequency selection</li>
            <li>Multiple currency support</li>
            <li>Real-time cash flow calculation</li>
            <li>Download results as CSV</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CashFlowCalculator;