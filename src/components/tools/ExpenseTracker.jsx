"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FaPlus, FaTrash, FaDownload, FaSync, FaChartPie } from "react-icons/fa";
import { CSVLink } from "react-csv"; // For exporting to CSV

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showChart, setShowChart] = useState(false);

  const categories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Bills",
    "Shopping",
    "Other",
  ];

  // Load expenses from localStorage on mount
  useEffect(() => {
    const storedExpenses = localStorage.getItem("expenses");
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
  }, []);

  // Save expenses to localStorage when updated
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Add expense
  const addExpense = useCallback(
    (e) => {
      e.preventDefault();
      if (!description || !amount || amount <= 0) return;

      const newExpense = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        category,
        date: new Date().toLocaleDateString(),
      };

      setExpenses((prev) => [newExpense, ...prev]);
      setDescription("");
      setAmount("");
      setCategory("Food");
    },
    [description, amount, category]
  );

  // Delete expense
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
  };

  // Clear all expenses
  const clearAll = () => {
    setExpenses([]);
    setFilterCategory("All");
    setSortBy("date");
    setSortOrder("desc");
    setSearchTerm("");
  };

  // Filter, search, and sort expenses
  const getFilteredExpenses = useCallback(() => {
    let filtered = expenses;

    // Filter by category
    if (filterCategory !== "All") {
      filtered = filtered.filter((expense) => expense.category === filterCategory);
    }

    // Search by description
    if (searchTerm) {
      filtered = filtered.filter((expense) =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date);
      } else if (sortBy === "amount") {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      }
      return 0;
    });

    return filtered;
  }, [expenses, filterCategory, searchTerm, sortBy, sortOrder]);

  const filteredExpenses = getFilteredExpenses();
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Category breakdown for chart
  const categoryBreakdown = categories.map((cat) => ({
    category: cat,
    total: expenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0),
  }));

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Expense Tracker
        </h1>

        {/* Add Expense Form */}
        <form onSubmit={addExpense} className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <FaPlus className="mr-2" /> Add
              </button>
            </div>
          </div>
        </form>

        {/* Filters and Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Search description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split("-");
                setSortBy(by);
                setSortOrder(order);
              }}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={clearAll}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Clear All
            </button>
            <CSVLink
              data={filteredExpenses}
              filename={`expenses-${Date.now()}.csv`}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Export
            </CSVLink>
          </div>
        </div>

        {/* Total and Chart Toggle */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-medium">
            Total: <span className="text-green-600">${totalAmount.toFixed(2)}</span>
          </p>
          <button
            onClick={() => setShowChart(!showChart)}
            className="py-1 px-3 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center"
          >
            <FaChartPie className="mr-2" /> {showChart ? "Hide" : "Show"} Chart
          </button>
        </div>

        {/* Category Breakdown Chart */}
        {showChart && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Category Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryBreakdown.map(({ category, total }) => (
                <div key={category} className="flex items-center">
                  <span className="w-24 text-sm text-gray-600">{category}:</span>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${
                          total > 0 ? (total / totalAmount) * 100 : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses List */}
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-100">
                    <td className="px-4 py-2">{expense.date}</td>
                    <td className="px-4 py-2">{expense.description}</td>
                    <td className="px-4 py-2">{expense.category}</td>
                    <td className="px-4 py-2">${expense.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-800 flex items-center"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">No expenses recorded yet.</p>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Add and delete expenses</li>
            <li>Filter by category and search by description</li>
            <li>Sort by date or amount</li>
            <li>Visual category breakdown</li>
            <li>Export to CSV</li>
            <li>Persistent storage with localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;